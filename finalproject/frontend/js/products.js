function getApiUrl() {
  const { protocol, hostname, port, origin } = window.location

  if (protocol === 'file:') {
    return 'http://localhost:5555/api'
  }

  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1'
  if (isLocalHost && port !== '5555') {
    return 'http://localhost:5555/api'
  }

  return `${origin}/api`
}

const API_URL = getApiUrl()

const token = localStorage.getItem('token')
let editingProductId = null

if (!token) {
  window.location.href = 'index.html'
  throw new Error('No token')
}

function authHeader() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token')
  window.location.href = 'index.html'
})

document.getElementById('cancelEditBtn').addEventListener('click', resetForm)

document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const payload = {
    name: document.getElementById('name').value.trim(),
    description: document.getElementById('description').value.trim(),
    price: Number(document.getElementById('price').value),
    category: document.getElementById('category').value.trim(),
    status: document.getElementById('status').value,
  }

  const isEditing = Boolean(editingProductId)
  const endpoint = isEditing ? `${API_URL}/products/${editingProductId}` : `${API_URL}/products`
  const method = isEditing ? 'PUT' : 'POST'

  try {
    const res = await fetch(endpoint, {
      method,
      headers: authHeader(),
      credentials: 'include',
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) {
      showMessage(data.message || 'Save failed', 'error')
      return
    }

    showMessage(isEditing ? 'Product updated' : 'Product created', 'success')
    resetForm()
    await loadProducts()
  } catch (error) {
    showMessage('Error saving product', 'error')
  }
})

function showMessage(message, type) {
  const container = document.getElementById('messageContainer')
  container.innerHTML = `<div class="message ${type}">${message}</div>`

  setTimeout(() => {
    container.innerHTML = ''
  }, 5000)
}

async function loadProducts() {
  try {
    const res = await fetch(`${API_URL}/products`, {
      method: 'GET',
      headers: authHeader(),
      credentials: 'include',
    })

    if (!res.ok) {
      showMessage('Failed to load products', 'error')
      return
    }

    const products = await res.json()
    renderProducts(products)
  } catch (error) {
    console.error(error)
    showMessage('Error loading products', 'error')
  }
}

function renderProducts(products) {
  const container = document.getElementById('productsList')

  if (products.length === 0) {
    container.innerHTML = '<div class="empty">No products available</div>'
    return
  }

  container.innerHTML = products.map(product => `
    <div class="product-card">
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div class="product-meta">
        <div>Price: $${Number(product.price).toFixed(2)}</div>
        <div>Category: ${product.category}</div>
        <div>Status: ${product.status}</div>
      </div>
      <div class="card-actions">
        <button onclick="prefillForEdit('${product._id}')">Edit</button>
        <button class="btn-danger" onclick="deleteProductHandler('${product._id}')">Delete</button>
      </div>
    </div>
  `).join('')
}

async function prefillForEdit(productId) {
  try {
    const res = await fetch(`${API_URL}/products/${productId}`, {
      method: 'GET',
      headers: authHeader(),
      credentials: 'include',
    })
    const product = await res.json()
    if (!res.ok) {
      showMessage(product.message || 'Unable to load product', 'error')
      return
    }

    editingProductId = product._id
    document.getElementById('formTitle').textContent = 'Edit Product/Service'
    document.getElementById('saveBtn').textContent = 'Update'
    document.getElementById('cancelEditBtn').style.display = 'inline-block'
    document.getElementById('name').value = product.name
    document.getElementById('description').value = product.description
    document.getElementById('price').value = product.price
    document.getElementById('category').value = product.category
    document.getElementById('status').value = product.status || 'active'
  } catch (error) {
    showMessage('Unable to load product for editing', 'error')
  }
}

async function deleteProductHandler(productId) {
  const confirmDelete = window.confirm('Delete this product/service?')
  if (!confirmDelete) return

  try {
    const res = await fetch(`${API_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: authHeader(),
      credentials: 'include',
    })
    const data = await res.json()
    if (!res.ok) {
      showMessage(data.message || 'Delete failed', 'error')
      return
    }

    showMessage('Product deleted', 'success')
    await loadProducts()
  } catch (error) {
    showMessage('Error deleting product', 'error')
  }
}

function resetForm() {
  editingProductId = null
  document.getElementById('formTitle').textContent = 'Create Product/Service'
  document.getElementById('saveBtn').textContent = 'Save'
  document.getElementById('cancelEditBtn').style.display = 'none'
  document.getElementById('productForm').reset()
  document.getElementById('status').value = 'active'
}

window.prefillForEdit = prefillForEdit
window.deleteProductHandler = deleteProductHandler



document.addEventListener('DOMContentLoaded', () => {
  loadProducts()
})
