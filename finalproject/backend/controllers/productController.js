const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')

const Product = require('../model/productModel')

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ user: req.user.id })
  res.status(200).json(products)
})

const getProductById = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400)
    throw new Error('Invalid product id')
  }

  const product = await Product.findById(req.params.id)

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  if (product.user.toString() !== req.user.id) {
    res.status(401)
    throw new Error('Not authorized to view this product')
  }

  res.status(200).json(product)
})

const createProduct = asyncHandler(async (req, res) => {
  if (!req.body.name || !req.body.description || req.body.price === undefined || !req.body.category) {
    res.status(400)
    throw new Error("Please add 'name', 'description', 'price', and 'category' fields")
  }

  const product = await Product.create({
    user: req.user.id,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    status: req.body.status || 'active',
  })

  res.status(201).json(product)
})

const updateProduct = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400)
    throw new Error('Invalid product id')
  }

  const product = await Product.findById(req.params.id)

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  // Check authorization - user can only update their own products
  if (product.user.toString() !== req.user.id) {
    res.status(401)
    throw new Error('Not authorized to update this product')
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )

  res.status(200).json(updatedProduct)
})

const deleteProduct = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400)
    throw new Error('Invalid product id')
  }

  const product = await Product.findById(req.params.id)

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  // Check authorization - user can only delete their own products
  if (product.user.toString() !== req.user.id) {
    res.status(401)
    throw new Error('Not authorized to delete this product')
  }

  await Product.findByIdAndDelete(req.params.id)

  res.status(200).json({ message: 'Product deleted' })
})

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
}
