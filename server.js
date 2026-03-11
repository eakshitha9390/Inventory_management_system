// Import dependencies
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Import routes
const productRoutes = require('./routes/products');

// Routes
app.use('/api/products', productRoutes);

// Test route (optional)
app.get('/', (req, res) => {
  res.send('Inventory Management Backend Running Successfully 🚀');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
