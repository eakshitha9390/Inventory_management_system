const mongoose = require('mongoose');

const validatePrice = (value) => {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error('Price must be a valid number');
  }
  if (value < 0) {
    throw new Error('Price cannot be negative');
  }
  // Round to 2 decimal places
  return Math.round(value * 100) / 100;
};

const validateQuantity = (value) => {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error('Quantity must be a valid number');
  }
  if (value < 0) {
    throw new Error('Quantity cannot be negative');
  }
  // Ensure it’s a whole number
  return Math.floor(value);
};

// ===== Product Schema =====
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [1, 'Product name cannot be empty'],
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    item_number: {
      type: String,
      required: [true, 'Item number is required'],
      trim: true,
      unique: true,
      minlength: [1, 'Item number cannot be empty'],
      maxlength: [50, 'Item number cannot exceed 50 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      max: [999999.99, 'Price cannot exceed $999,999.99'],
      set: validatePrice,
      get: (value) => Math.round(value * 100) / 100, // Round to 2 decimals
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      max: [999999, 'Quantity cannot exceed 999,999'],
      set: validateQuantity,
      get: (value) => Math.floor(value),
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      max: [999999, 'Stock cannot exceed 999,999'],
      set: validateQuantity,
      get: (value) => Math.floor(value),
      default: 0,
    },
    maxStock: {
      type: Number,
      required: [true, 'Max stock is required'],
      min: [1, 'Max stock must be at least 1'],
      max: [999999, 'Max stock cannot exceed 999,999'],
      set: validateQuantity,
      get: (value) => Math.floor(value),
      default: 50,
    },
    buyerCount: {
      type: Number,
      min: [0, 'Buyer count cannot be negative'],
      max: [999999, 'Buyer count cannot exceed 999,999'],
      set: validateQuantity,
      get: (value) => Math.floor(value),
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true, // Cannot be changed after creation
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
  }
);

// ===== Virtual field: total inventory value =====
ProductSchema.virtual('totalValue').get(function () {
  return Math.round(this.price * this.quantity * 100) / 100;
});

// ===== Indexes for performance =====
ProductSchema.index({ sku: 1 });
ProductSchema.index({ name: 'text' });

// ===== Export Model =====
module.exports = mongoose.model('Product', ProductSchema);
