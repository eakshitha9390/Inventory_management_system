const mongoose = require('mongoose');
const Product = require('../models/Product');

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get product by id
exports.getProductById = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, item_number, price, quantity, stock, maxStock, buyerCount } = req.body;
    
    // Type conversion and validation
    const numPrice = parseFloat(price);
    const numQuantity = parseInt(quantity);
    
    // Validate input types
    if (isNaN(numPrice)) {
      return res.status(400).json({ message: 'Price must be a valid number' });
    }
    if (isNaN(numQuantity)) {
      return res.status(400).json({ message: 'Quantity must be a valid number' });
    }
    
    // Check duplicates on item_number
    const exist = await Product.findOne({ item_number });
    if (exist) return res.status(400).json({ message: 'Item number already exists' });

    const product = new Product({ 
      name, 
      item_number, 
      price: numPrice, 
      quantity: numQuantity,
      stock: stock || 0,
      maxStock: maxStock || 50,
      buyerCount: buyerCount || 0
    });
    
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
  const { name, item_number, price, quantity, stock, maxStock, buyerCount } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Type conversion and validation for updated fields
    if (price !== undefined) {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice)) {
        return res.status(400).json({ message: 'Price must be a valid number' });
      }
      product.price = numPrice;
    }
    
    if (quantity !== undefined) {
      const numQuantity = parseInt(quantity);
      if (isNaN(numQuantity)) {
        return res.status(400).json({ message: 'Quantity must be a valid number' });
      }
      product.quantity = numQuantity;
    }

    if (stock !== undefined) {
      const numStock = parseInt(stock);
      if (isNaN(numStock)) {
        return res.status(400).json({ message: 'Stock must be a valid number' });
      }
      product.stock = numStock;
    }

    if (maxStock !== undefined) {
      const numMaxStock = parseInt(maxStock);
      if (isNaN(numMaxStock)) {
        return res.status(400).json({ message: 'Max stock must be a valid number' });
      }
      product.maxStock = numMaxStock;
    }

    if (buyerCount !== undefined) {
      const numBuyerCount = parseInt(buyerCount);
      if (isNaN(numBuyerCount)) {
        return res.status(400).json({ message: 'Buyer count must be a valid number' });
      }
      product.buyerCount = numBuyerCount;
    }

    // If item_number changed, ensure uniqueness
    if (item_number && item_number !== product.item_number) {
      const exist = await Product.findOne({ item_number });
      if (exist) return res.status(400).json({ message: 'Item number already exists' });
      product.item_number = item_number;
    }

    if (name !== undefined) product.name = name;

    await product.save();
    res.json(product);
  } catch (err) {
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update stock
exports.updateStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const numQuantity = parseInt(quantity);

    if (isNaN(numQuantity)) {
      return res.status(400).json({ message: 'Quantity must be a valid number' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { stock: numQuantity } },
      { new: true }
    );

    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Generate alert messages
    let alert = '';
    if (product.stock === 0) {
      alert = `🚨 CRITICAL: ${product.name} is OUT OF STOCK! Shopkeeper action required: Purchase and restock immediately!`;
    } else if (product.stock <= 5) {
      alert = `⚠️ WARNING: ${product.name} is LOW STOCK (${product.stock} units). Consider restocking soon.`;
    } else if (product.stock >= product.maxStock) {
      alert = `✅ FULL STOCK: ${product.name} is fully stocked (${product.stock}/${product.maxStock} units)`;
    }

    res.json({
      success: true,
      product,
      alert: alert || `Stock updated successfully. Current stock: ${product.stock}/${product.maxStock}`
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get stock alerts for all products
exports.getStockAlerts = async (req, res) => {
  try {
    const outOfStock = await Product.find({ stock: 0 });
    const lowStock = await Product.find({ stock: { $gt: 0, $lte: 5 } });
    const fullStock = await Product.find({ stock: { $gte: Product.schema.path('maxStock').options.default || 50 } });

    const alerts = {
      outOfStock: outOfStock.map(p => ({
        id: p._id,
        name: p.name,
        itemNumber: p.item_number,
        currentStock: p.stock,
        message: `🚨 CRITICAL: ${p.name} (${p.item_number}) is OUT OF STOCK! Shopkeeper: Purchase and place more stock immediately!`
      })),
      lowStock: lowStock.map(p => ({
        id: p._id,
        name: p.name,
        itemNumber: p.item_number,
        currentStock: p.stock,
        maxStock: p.maxStock,
        message: `⚠️ WARNING: ${p.name} (${p.item_number}) is LOW STOCK (${p.stock}/${p.maxStock} units). Please consider restocking.`
      })),
      fullStock: fullStock.map(p => ({
        id: p._id,
        name: p.name,
        itemNumber: p.item_number,
        currentStock: p.stock,
        maxStock: p.maxStock,
        message: `✅ FULL: ${p.name} (${p.item_number}) is fully stocked (${p.stock}/${p.maxStock} units)`
      })),
      summary: {
        totalOutOfStock: outOfStock.length,
        totalLowStock: lowStock.length,
        totalFullStock: fullStock.length
      }
    };

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
