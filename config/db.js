const mongoose = require('mongoose');
const { URL } = require('url');

const connectDB = async (rawURI) => {
  // Allow full URI via an argument, environment variable, or fallback
  const raw = rawURI || process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_db';

  let mongoURI = raw;
  let dbName = null;
  let collectionName = null;

  try {
    // Use WHATWG URL parser to extract pathname if present
    const parsed = new URL(raw.startsWith('mongodb://') ? raw : `mongodb://${raw}`);
    if (parsed.pathname && parsed.pathname !== '/') {
      // pathname may be like '/inventory_db' or '/inventory_db/products'
      const parts = parsed.pathname.replace(/^\//, '').split('/').filter(Boolean);
      if (parts.length >= 1) dbName = parts[0];
      if (parts.length >= 2) collectionName = parts[1];
      // Rebuild a mongoURI without the pathname so mongoose.connect can accept it and we set dbName explicitly
      parsed.pathname = '/';
      mongoURI = parsed.toString().replace(/^mongodb:\/\//, 'mongodb://');
    }
  } catch (e) {
    // If URL parsing fails, fall back to raw string and assume db name will be provided later
    mongoURI = raw;
  }

  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: dbName || 'inventory_db'
    });

    const actualDb = mongoose.connection.db;
    console.log('✅ MongoDB connected successfully');
    console.log('📁 Database:', actualDb.databaseName);
    console.log('🔗 Connected URI:', mongoURI);
    if (collectionName) console.log('📚 Requested collection:', collectionName);

    // Verify 'products' collection exists; create it if missing (no-op if already exists)
    const collections = await actualDb.listCollections().toArray();
    const names = collections.map(c => c.name);
    if (!names.includes('products')) {
      console.log("'products' collection not found — creating empty collection 'products'.");
      await actualDb.createCollection('products');
      console.log("'products' collection created.");
    } else {
      console.log("'products' collection exists.");
    }

  } catch (err) {
    console.error('❌ MongoDB connection error:', err && err.message ? err.message : err);
    process.exit(1);
  }
};

module.exports = connectDB;
