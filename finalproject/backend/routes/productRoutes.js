// Import Express - needed to access the Router factory function
const express = require('express')

// Create a Router instance
// keeping route definitions modular and out of the main server.js file
const router = express.Router()

// Import CRUD controller functions from productController.js
// Each function handles exactly one operation and is mapped to a route + HTTP method below
const {
  getProducts,    // GET    - fetch all products/services for the authenticated user
  getProductById, // GET    - fetch one product/service by ID (owned by authenticated user)
  createProduct,  // POST   - create a new product/service
  updateProduct,  // PUT    - update an existing product/service by ID
  deleteProduct,  // DELETE - remove a product/service by ID
} = require('../controllers/productController')

// Import the `protect` middleware from authMiddleware.js
// `protect` runs before the controller and validates JWT auth.
const { protect } = require('../middleware/authMiddleware')

// ---- Routes for /api/products --------------------------
// GET  /api/products     -> protect first, then getProducts
// POST /api/products     -> protect first, then createProduct
router.route('/').get(protect, getProducts).post(protect, createProduct)

// ---- Routes for /api/products/:id ----------------------
// GET    /api/products/:id -> protect first, then getProductById
// PUT    /api/products/:id -> protect first, then updateProduct
// DELETE /api/products/:id -> protect first, then deleteProduct
router.route('/:id').get(protect, getProductById).put(protect, updateProduct).delete(protect, deleteProduct)

// Export this router so server.js can mount it:
// app.use('/api/products', require('./routes/productRoutes'))
module.exports = router
