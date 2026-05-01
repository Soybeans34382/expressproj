const mongoose = require('mongoose')

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    name: {
      type: String,
      required: [true, 'Please add a product name'],
    },

    description: {
      type: String,
      required: [true, 'Please add a description'],
    },

    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: 0,
    },

    category: {
      type: String,
      required: [true, 'Please add a category'],
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    collection: 'product'
  }
)

module.exports = mongoose.model('Product', productSchema)
