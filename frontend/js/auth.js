function getApiUrl() {
  const { protocol, hostname, port, origin } = window.location

  if (protocol === 'file:') return 'http://localhost:5555/api'
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && port !== '5555') {
    return 'http://localhost:5555/api'
  }
  return `${origin}/api`
}

const API_URL = getApiUrl()

const registerForm = document.getElementById('registerForm')
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const name = document.getElementById('name').value
    const username = document.getElementById('username').value
    const email = document.getElementById('email').value.trim()
    const password = document.getElementById('password').value

    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, username, email: email || undefined, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        document.getElementById('errorMsg').textContent = data.message || 'Registration failed'
        return
      }

      document.getElementById('successMsg').textContent = 'Registered! Redirecting to login...'
      setTimeout(() => window.location.href = 'index.html', 1500)

    } catch (err) {
      document.getElementById('errorMsg').textContent = 'Could not connect to server'
    }
  })
}

const loginForm = document.getElementById('loginForm')
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const identifier = document.getElementById('identifier').value.trim()
    const password = document.getElementById('password').value

    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: identifier.includes('@') ? identifier : undefined,
          username: identifier.includes('@') ? undefined : identifier,
          password,
        })
      })

      const data = await res.json()

      if (!res.ok) {
        document.getElementById('errorMsg').textContent = data.message || 'Login failed'
        return
      }

      localStorage.setItem('token', data.token)

      window.location.href = 'products.html'

    } catch (err) {
      document.getElementById('errorMsg').textContent = 'Could not connect to server'
    }
  })
}