// --- SilverFox E-Commerce Backend ---
// Premium Style for the Distinguished Gentleman
// Handles: Products, Cart, Orders, Admin, Authentication

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');
const multer = require('multer');
const fs = require('node:fs');
const bcrypt = require('bcrypt');
const { PRODUCT_IMAGES_DIR } = require('./paths');

const app = express();
const FX_BASE = 'EUR';
const FX_FALLBACK_RATES = { EUR: 1, USD: 1.08, GBP: 0.86, UGX: 4300, KES: 140 };
const FX_SOURCE_URL = 'https://open.er-api.com/v6/latest/EUR';
const FX_REFRESH_MS = 24 * 60 * 60 * 1000; // daily
let fxCache = {
  rates: FX_FALLBACK_RATES,
  fetchedAt: 0,
  source: 'fallback',
};
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH ? path.resolve(__dirname, process.env.DB_PATH) : path.join(__dirname, 'db.sqlite');

// Middleware setup
const corsOptions = {
  origin: [
    'http://127.0.0.1:5500', // static HTML dev server
    'http://localhost:3000', // React dev server or same-origin
    'http://localhost:3001', // Use localhost:3001 for main backend
    'http://127.0.0.1:3001', // Allow 127.0.0.1:3001 for local dev
    'http://localhost:5173', // Vite default dev server
    'http://127.0.0.1:5173', // Allow 127.0.0.1:5173 for local dev
  ],
  credentials: true
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Product images: single canonical folder (see ./paths.js). Register BEFORE root static so
// `/images/*` is never accidentally served from an obsolete secondary images folder.
app.use('/images', express.static(PRODUCT_IMAGES_DIR));

// Serve static files from the project root (one level up from backend)
app.use(express.static(path.join(__dirname, '..')));

/** Resolve a DB image value (filename or images/...) to an absolute file path for unlink */
function resolveProductImageFile(imageValue) {
  if (!imageValue || typeof imageValue !== 'string') return null;
  const trimmed = imageValue.trim();
  if (trimmed.startsWith('/uploads/')) {
    return path.join(__dirname, trimmed.replace(/^\//, ''));
  }
  // Accept `images/foo.jpg`, `/images/foo.jpg`, and URL-encoded names.
  const decoded = (() => {
    try {
      return decodeURIComponent(trimmed);
    } catch {
      return trimmed;
    }
  })();
  const rel = decoded
    .replace(/^\/+/, '')
    .replace(/^images\//i, '');
  return path.join(PRODUCT_IMAGES_DIR, rel);
}

async function getLatestExchangeRates() {
  const now = Date.now();
  if (now - fxCache.fetchedAt < FX_REFRESH_MS) return fxCache;
  try {
    const response = await fetch(FX_SOURCE_URL);
    if (!response.ok) throw new Error(`FX provider error ${response.status}`);
    const payload = await response.json();
    const usd = Number(payload?.rates?.USD);
    const ugx = Number(payload?.rates?.UGX);
    const kes = Number(payload?.rates?.KES);
    if (!Number.isFinite(usd) || usd <= 0) throw new Error('Invalid USD rate');
    if (!Number.isFinite(ugx) || ugx <= 0) throw new Error('Invalid UGX rate');
    if (!Number.isFinite(kes) || kes <= 0) throw new Error('Invalid KES rate');
    fxCache = {
      rates: { EUR: 1, USD: usd, UGX: ugx, KES: kes },
      fetchedAt: now,
      source: 'open.er-api.com',
    };
  } catch (error) {
      console.warn('Exchange rate refresh failed:', error.message);
    // Keep serving with last known rates if provider is unavailable.
    if (!fxCache.fetchedAt) {
      fxCache = {
        rates: FX_FALLBACK_RATES,
        fetchedAt: now,
        source: 'fallback',
      };
    }
  }
  return fxCache;
}

// --- Middleware to Protect Admin Routes ---
function requireAdmin(req, res, next) {
  if (req.session?.isAdmin) return next();
  return res.status(403).json({ error: 'Admin access required' });
}

// --- Admin Login Route ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND role = ? ORDER BY id DESC LIMIT 1', [username, 'admin'], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
      req.session.regenerate((regenErr) => {
        if (regenErr) return res.status(500).json({ error: 'Session error' });
        req.session.isAdmin = true;
        req.session.save((saveErr) => {
          if (saveErr) return res.status(500).json({ error: 'Session save failed' });
          res.json({ success: true });
        });
      });
    } catch (e) {
        console.error('Admin login failed:', e.message);
      res.status(500).json({ error: 'Server error' });
    }
  });
});
// --- Admin Registration Route (for initial setup only, remove or protect in production) ---
app.post('/api/register-admin', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, 'admin'], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Username already exists' });
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true, id: this.lastID });
    });
  } catch (e) {
    console.error('Admin registration failed:', e.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Admin Logout Route ---
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// --- Admin session (for SPA inventory page) ---
app.get('/api/admin/status', (req, res) => {
  res.json({ admin: !!req.session?.isAdmin });
});

app.get('/api/exchange-rates', async (req, res) => {
  const fx = await getLatestExchangeRates();
  res.json({
    base: FX_BASE,
    rates: fx.rates,
    fetchedAt: fx.fetchedAt,
    source: fx.source,
  });
});

// --- Mobile money checkout init (provider-ready, credential-gated) ---
app.post('/api/payments/initiate', (req, res) => {
  const { provider, amount, currency, phone, orderId } = req.body || {};
  const providerKey = String(provider || '').toUpperCase();
  const supported = ['MTN', 'AIRTEL', 'MPESA'];
  if (!supported.includes(providerKey)) {
    return res.status(400).json({ error: 'Unsupported provider. Use MTN, AIRTEL, or MPESA.' });
  }
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number.' });
  }
  const curr = String(currency || '').toUpperCase();
  if (!['EUR', 'USD', 'UGX', 'KES'].includes(curr)) {
    return res.status(400).json({ error: 'Unsupported currency. Use EUR, USD, UGX, or KES.' });
  }
  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({ error: 'Phone number is required for mobile money checkout.' });
  }

  // Credential check: once provider keys are configured, this route can call real APIs.
  const envByProvider = {
    MTN: process.env.MTN_API_KEY,
    AIRTEL: process.env.AIRTEL_API_KEY,
    MPESA: process.env.MPESA_API_KEY,
  };
  if (!envByProvider[providerKey]) {
    return res.status(501).json({
      error: `${providerKey} is not configured yet.`,
      message: `Add ${providerKey}_API_KEY in backend env, then wire provider API call in /api/payments/initiate.`,
      status: 'sandbox_placeholder',
    });
  }

  // Placeholder accepted response for configured environments pending provider-specific payload flow.
  return res.json({
    status: 'pending',
    provider: providerKey,
    amount: Number(numericAmount.toFixed(2)),
    currency: curr,
    phone,
    orderId: orderId || null,
    reference: `${providerKey}-${Date.now()}`,
    message: 'Payment request accepted. Implement provider callback/webhook verification next.',
  });
});

// Set up multer for file uploads
const uploadDir = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });
// Serve uploaded images statically
app.use('/uploads', express.static(uploadDir));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60 * 12, // 12 hours
  },
}));
// --- Image Upload Endpoint ---
// POST /api/products/upload-image
app.post('/api/products/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the file path to be stored in the product
  res.json({ imagePath: `/uploads/${req.file.filename}` });
});

// --- Shipping Quote Endpoint ---
// POST /api/shipping-quote
app.post('/api/shipping-quote', (req, res) => {
  const { destination, weightKg } = req.body;
  if (!destination || !weightKg) {
    return res.status(400).json({ error: 'Missing destination or weight' });
  }

  // Example rates (USD, rough estimates)
  const rates = {
    UK:   [{ max: 1, cost: 60 }, { max: 5, cost: 150 }, { max: 10, cost: 300 }, { max: 1000, cost: 600 }],
    USA:  [{ max: 1, cost: 70 }, { max: 5, cost: 160 }, { max: 10, cost: 320 }, { max: 1000, cost: 650 }],
    Rwanda: [{ max: 1, cost: 20 }, { max: 5, cost: 40 }, { max: 10, cost: 80 }, { max: 1000, cost: 150 }],
    Kenya:  [{ max: 1, cost: 15 }, { max: 5, cost: 30 }, { max: 10, cost: 60 }, { max: 1000, cost: 120 }]
  };

  const destRates = rates[destination];
  if (!destRates) return res.status(400).json({ error: 'Unsupported destination' });

  let shippingCost = destRates.find(r => weightKg <= r.max)?.cost;
  if (!shippingCost) shippingCost = destRates[destRates.length - 1].cost;

  res.json({ destination, weightKg, shippingCost });
});

// --- Create Product Endpoint ---
// POST /api/products
app.post('/api/products', (req, res) => {
  const {
    name,
    image,
    price,
    stock,
    category,
    description,
    size_us,
    size_eu,
  } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Missing name or price' });
  }
  db.run(
    'INSERT INTO products (name, image, price, stock, category, description, size_us, size_eu) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      name,
      image || null,
      price,
      stock || 0,
      category || null,
      description || null,
      size_us || null,
      size_eu || null,
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id: this.lastID,
        name,
        image,
        price,
        stock,
        category,
        description,
        size_us,
        size_eu,
      });
    }
  );
});

// Initialize SQLite DB
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) throw err;
  console.log('Connected to SQLite database.');
});

// Create tables if not exist
const initDb = () => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image TEXT,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 0,
    category TEXT,
    description TEXT,
    size_us TEXT,
    size_eu TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session TEXT NOT NULL,
    product_id INTEGER,
    size TEXT,
    quantity INTEGER,
    currency TEXT,
    price REAL,
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session TEXT NOT NULL,
    total REAL,
    currency TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
};
initDb();

function ensureProductColumns() {
  db.all('PRAGMA table_info(products)', [], (err, rows) => {
    if (err) return;
    const existing = new Set(rows.map((r) => r.name));
    const requiredColumns = [
      { name: 'category', ddl: 'ALTER TABLE products ADD COLUMN category TEXT' },
      { name: 'description', ddl: 'ALTER TABLE products ADD COLUMN description TEXT' },
      { name: 'size_us', ddl: 'ALTER TABLE products ADD COLUMN size_us TEXT' },
      { name: 'size_eu', ddl: 'ALTER TABLE products ADD COLUMN size_eu TEXT' },
    ];
    requiredColumns.forEach((column) => {
      if (!existing.has(column.name)) {
        db.run(column.ddl);
      }
    });
  });
}

ensureProductColumns();


// --- Product Endpoints ---
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Filter out products with missing images
    const filtered = rows.filter(product => {
      if (!product.image) return true; // allow products with no image
      try {
        const imagePath = resolveProductImageFile(product.image);
        return imagePath && fs.existsSync(imagePath);
      } catch {
        return false;
      }
    });
    res.json(filtered);
  });
});

// --- Update Product (admin) ---
app.put('/api/products/:id', requireAdmin, (req, res) => {
  const id = req.params.id;
  const {
    name,
    image,
    price,
    stock,
    category,
    description,
    size_us,
    size_eu,
  } = req.body;
  if (!name || price === undefined || price === null || price === '') {
    return res.status(400).json({ error: 'Missing name or price' });
  }
  const stockVal = stock === undefined || stock === null ? 0 : stock;
  db.run(
    'UPDATE products SET name = ?, image = ?, price = ?, stock = ?, category = ?, description = ?, size_us = ?, size_eu = ? WHERE id = ?',
    [
      name,
      image || null,
      price,
      stockVal,
      category || null,
      description || null,
      size_us || null,
      size_eu || null,
      id,
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Product not found' });
      res.json({ success: true, id: Number(id) });
    }
  );
});

// --- Cart Endpoints ---
// Use a session id from query or header for demo (in production use real sessions/auth)
function getSessionId(req) {
  return req.query.session || req.headers['x-session-id'] || 'guest';
}

// Get cart items
app.get('/api/cart', (req, res) => {
  const session = getSessionId(req);
  db.all('SELECT * FROM cart WHERE session = ?', [session], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add/update cart item
app.post('/api/cart', (req, res) => {
  const session = getSessionId(req);
  const { product_id, size, quantity, currency } = req.body;
  if (!product_id || !quantity) return res.status(400).json({ error: 'Missing product_id or quantity' });
  // Get product price
  db.get('SELECT price FROM products WHERE id = ?', [product_id], async (err, prod) => {
    if (err || !prod) return res.status(404).json({ error: 'Product not found' });
    const requestedCurrency = (currency || 'EUR').toUpperCase();
    if (!['EUR', 'USD', 'UGX', 'KES'].includes(requestedCurrency)) {
      return res.status(400).json({ error: 'Unsupported currency. Use EUR, USD, UGX, or KES.' });
    }
    const fx = await getLatestExchangeRates();
    const eurPrice = Number(prod.price);
    const converted = eurPrice * Number(fx.rates[requestedCurrency] || 1);
    const price = Number(converted.toFixed(2));
    // Upsert logic: if item exists, update quantity
    db.get('SELECT * FROM cart WHERE session = ? AND product_id = ? AND size = ? AND currency = ?', [session, product_id, size, requestedCurrency], (err, row) => {
      if (row) {
        db.run('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [quantity, row.id], function(err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ updated: true });
        });
      } else {
        db.run('INSERT INTO cart (session, product_id, size, quantity, currency, price) VALUES (?, ?, ?, ?, ?, ?)', [session, product_id, size, quantity, requestedCurrency, price], function(err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ added: true, id: this.lastID });
        });
      }
    });
  });
});

// Remove cart item
app.delete('/api/cart/:id', (req, res) => {
  const session = getSessionId(req);
  db.run('DELETE FROM cart WHERE id = ? AND session = ?', [req.params.id, session], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: true });
  });
});

// --- Order Endpoints ---
app.post('/api/orders', (req, res) => {
  const session = getSessionId(req);
  const { currency } = req.body;
  // Calculate total from cart
  db.all('SELECT * FROM cart WHERE session = ?', [session], (err, items) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!items.length) return res.status(400).json({ error: 'Cart is empty' });
    let total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    db.run('INSERT INTO orders (session, total, currency) VALUES (?, ?, ?)', [session, total, currency], function(err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      // Optionally clear cart
      db.run('DELETE FROM cart WHERE session = ?', [session]);
      res.json({ order_id: this.lastID, total });
    });
  });
});

// Delete a product (and its image file) - Admin only
app.delete('/api/products/:id', requireAdmin, (req, res) => {
  const id = req.params.id;
  db.get('SELECT image FROM products WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Product not found' });
    // Delete the image file if it exists
    if (row.image) {
      const imagePath = resolveProductImageFile(row.image);
      if (imagePath && fs.existsSync(imagePath)) {
        fs.unlink(imagePath, () => {});
      }
      db.run('DELETE FROM products WHERE id = ?', [id], function (err2) {
        if (err2) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true });
      });
    } else {
      db.run('DELETE FROM products WHERE id = ?', [id], function (err2) {
        if (err2) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true });
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`SilverFox backend running on http://localhost:${PORT}`);
});
