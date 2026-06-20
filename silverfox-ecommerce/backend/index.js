// --- SilverFox E-Commerce Backend ---
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('node:path');
const { db, initSchema } = require('./database');
const multer = require('multer');
const fs = require('node:fs');
const bcrypt = require('bcrypt');
const { PRODUCT_IMAGES_DIR } = require('./paths');
const { notifyContactInquiry, notifyNewOrder } = require('./email');

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

const defaultCorsOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
const extraCorsOrigins = (process.env.CORS_ORIGINS || process.env.RAILWAY_PUBLIC_DOMAIN || '')
  .split(/[,\s]+/)
  .filter(Boolean)
  .flatMap((host) => (host.startsWith('http') ? [host] : [`https://${host}`, `http://${host}`]));
const corsOrigins = [...new Set([...defaultCorsOrigins, ...extraCorsOrigins])];

// Middleware setup
const corsOptions = {
  origin: corsOrigins,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 12,
  },
}));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'silverfox' });
});

app.get('/health/', (_req, res) => {
  res.json({ status: 'ok', service: 'silverfox' });
});

// Product images: single canonical folder (see ./paths.js).
app.use('/images', express.static(PRODUCT_IMAGES_DIR));

// Do not serve the whole repo tree — that exposed legacy HTML (catalog-pro.html) and source files.

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

const loginAttempts = new Map();
function loginRateLimit(req, res, next) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  let entry = loginAttempts.get(ip) || { count: 0, reset: now };
  if (now - entry.reset > 15 * 60 * 1000) entry = { count: 0, reset: now };
  if (entry.count >= 10) {
    return res.status(429).json({ error: 'Too many login attempts. Try again in 15 minutes.' });
  }
  entry.count += 1;
  loginAttempts.set(ip, entry);
  next();
}

// --- Admin Login Route ---
app.post('/api/login', loginRateLimit, (req, res) => {
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
// --- Admin Registration Route (disabled in production unless ALLOW_ADMIN_REGISTER=true) ---
app.post('/api/register-admin', async (req, res) => {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_ADMIN_REGISTER !== 'true') {
    return res.status(403).json({ error: 'Admin registration is disabled in production.' });
  }
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

// --- Logout (staff or shopper) ---
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

function shopperPayload(req) {
  if (!req.session?.userId) return null;
  return {
    id: req.session.userId,
    email: req.session.userEmail,
    displayName: req.session.displayName,
  };
}

function mergeGuestCartIntoUser(req, userId, done) {
  const guestKey = req.sessionID;
  const userKey = `user:${userId}`;
  if (!guestKey || guestKey === userKey) return done();
  db.all('SELECT * FROM cart WHERE session = ?', [guestKey], (err, rows) => {
    if (err || !rows?.length) return done();
    let pending = rows.length;
    const finish = () => {
      pending -= 1;
      if (pending <= 0) {
        db.run('DELETE FROM cart WHERE session = ?', [guestKey], () => done());
      }
    };
    rows.forEach((row) => {
      db.get(
        'SELECT id FROM cart WHERE session = ? AND product_id = ? AND size = ? AND currency = ?',
        [userKey, row.product_id, row.size, row.currency],
        (err2, existing) => {
          if (existing) {
            db.run('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [row.quantity, existing.id], finish);
          } else {
            db.run(
              'INSERT INTO cart (session, product_id, size, quantity, currency, price) VALUES (?, ?, ?, ?, ?, ?)',
              [userKey, row.product_id, row.size, row.quantity, row.currency, row.price],
              finish
            );
          }
        }
      );
    });
  });
}

// --- Shopper signup / login (Kistie-style accounts) ---
app.post('/api/signup', loginRateLimit, async (req, res) => {
  const { email, password, name } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (username, password, role, email, display_name) VALUES (?, ?, ?, ?, ?)',
      [normalizedEmail, hash, 'shopper', normalizedEmail, name || ''],
      function (err) {
        if (err) {
          if (String(err.message).includes('UNIQUE')) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        const userId = this.lastID;
        req.session.regenerate((regenErr) => {
          if (regenErr) return res.status(500).json({ error: 'Session error' });
          req.session.userId = userId;
          req.session.userEmail = normalizedEmail;
          req.session.displayName = name || '';
          mergeGuestCartIntoUser(req, userId, () => {
            req.session.save((saveErr) => {
              if (saveErr) return res.status(500).json({ error: 'Session save failed' });
              res.json({ success: true, user: { id: userId, email: normalizedEmail, displayName: name || '' } });
            });
          });
        });
      }
    );
  } catch (e) {
    console.error('Shopper signup failed:', e.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/shopper/login', loginRateLimit, (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  db.get(
    'SELECT * FROM users WHERE (email = ? OR username = ?) AND role = ? LIMIT 1',
    [normalizedEmail, normalizedEmail, 'shopper'],
    async (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      try {
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });
        req.session.regenerate((regenErr) => {
          if (regenErr) return res.status(500).json({ error: 'Session error' });
          req.session.userId = user.id;
          req.session.userEmail = user.email || user.username;
          req.session.displayName = user.display_name || '';
          mergeGuestCartIntoUser(req, user.id, () => {
            req.session.save((saveErr) => {
              if (saveErr) return res.status(500).json({ error: 'Session save failed' });
              res.json({
                success: true,
                user: {
                  id: user.id,
                  email: user.email || user.username,
                  displayName: user.display_name || '',
                },
              });
            });
          });
        });
      } catch (e) {
        console.error('Shopper login failed:', e.message);
        res.status(500).json({ error: 'Server error' });
      }
    }
  );
});

app.get('/api/account/me', (req, res) => {
  res.json({ user: shopperPayload(req) });
});

app.get('/api/account/orders', (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Sign in required.' });
  }
  db.all(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [req.session.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ orders: rows || [] });
    }
  );
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
// --- Image Upload Endpoint ---
// POST /api/products/upload-image
app.post('/api/products/upload-image', requireAdmin, upload.single('image'), (req, res) => {
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
app.post('/api/products', requireAdmin, (req, res) => {
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

initSchema(db, () => {
  ensureDefaultAdmin();
});

function ensureDefaultAdmin() {
  const username = process.env.DEFAULT_ADMIN_USER || 'admin';
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';
  bcrypt.hash(password, 10, (hashErr, hash) => {
    if (hashErr) {
      console.error('Failed to hash default admin password:', hashErr.message);
      return;
    }
    db.get('SELECT id FROM users WHERE username = ?', [username], (selErr, row) => {
      if (selErr) {
        console.error('Failed to check admin user:', selErr.message);
        return;
      }
      if (row) {
        db.run('UPDATE users SET password = ?, role = ? WHERE username = ?', [hash, 'admin', username], (updErr) => {
          if (updErr) console.error('Failed to update admin user:', updErr.message);
          else console.log(`Admin user "${username}" is ready.`);
        });
      } else {
        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, 'admin'], (insErr) => {
          if (insErr) console.error('Failed to create admin user:', insErr.message);
          else console.log(`Admin user "${username}" created (password: ${password}).`);
        });
      }
    });
  });
}


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
function getSessionId(req) {
  if (req.session?.userId) return `user:${req.session.userId}`;
  return req.query.session || req.headers['x-session-id'] || req.sessionID || 'guest';
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

// --- Contact ---
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  db.run(
    'INSERT INTO contact_inquiries (name, email, subject, message) VALUES (?, ?, ?, ?)',
    [name, email, subject || '', message],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      notifyContactInquiry({ name, email, subject, message }).catch(() => {});
      res.json({ success: true, id: this.lastID });
    }
  );
});

// --- AI shopping assistant (rule-based; optional OpenAI if configured) ---
function buildChatReply(message) {
  const m = String(message || '').toLowerCase();
  if (m.includes('ship') || m.includes('delivery') || m.includes('kampala')) {
    return 'We ship from Kampala, Uganda to customers worldwide. Delivery times depend on your country — contact us for a quote on large orders.';
  }
  if (m.includes('size') || m.includes('fit')) {
    return 'Use the Size guide button in product quick-view, or tell me your usual jacket size (EU 48–56) or shirt size (S–XXL). EU sizing is shown by default.';
  }
  if (m.includes('suit') || m.includes('blazer')) {
    return 'Browse Suits & Blazers for tailored two-piece suits, blazers, and formal wear. EU chest sizes 48–56 are most common.';
  }
  if (m.includes('pay') || m.includes('mtn') || m.includes('mobile')) {
    return 'Checkout supports MTN Mobile Money, Airtel Money, M-Pesa, and bank transfer. Staff confirm payment before dispatch.';
  }
  if (m.includes('return')) {
    return 'Unworn items in original condition may be returned within 14 days. Email info@silverfox.com before sending anything back.';
  }
  return 'SilverFox offers premium men\'s fashion — suits, shirts, trousers, shoes, and accessories. Browse /shop or ask about sizing, shipping, or payments.';
}

app.post('/api/chat', async (req, res) => {
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'Message required.' });

  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are SilverFox, a helpful assistant for a premium men\'s fashion store shipping from Kampala worldwide. Be concise and professional.' },
            { role: 'user', content: message },
          ],
          max_tokens: 300,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) return res.json({ reply, source: 'openai' });
      }
    } catch (e) {
      console.warn('OpenAI chat failed:', e.message);
    }
  }

  res.json({ reply: buildChatReply(message), source: 'rules' });
});

// --- Size recommendation ---
app.post('/api/size-recommend', (req, res) => {
  const { category, sizeSystem } = req.body || {};
  const cat = String(category || '').toLowerCase();
  const system = String(sizeSystem || 'EU').toUpperCase();

  let recommended = 'M';
  let message = 'Based on average fit, we suggest this size — adjust if you prefer a slimmer or relaxed fit.';

  if (cat.includes('suit') || cat.includes('blazer') || cat.includes('outerwear')) {
    recommended = system === 'EU' ? '50' : '40R';
    message = 'For tailored jackets, EU 50 / US 40R fits most gentlemen ( chest ~100 cm ).';
  } else if (cat.includes('shoe')) {
    recommended = system === 'EU' ? '43' : '10';
    message = 'EU 43 / US 10 is our most common shoe size.';
  } else if (cat.includes('trouser') || cat.includes('chino')) {
    recommended = system === 'EU' ? '50' : '34';
    message = 'EU 50 / waist 34 is a popular trouser size.';
  } else if (cat.includes('accessories')) {
    recommended = 'One Size';
    message = 'This accessory is one size fits most.';
  } else {
    recommended = system === 'EU' ? '52' : 'L';
    message = 'EU 52 / US L is a safe starting point for shirts and knitwear.';
  }

  res.json({ recommended, message, sizeSystem: system });
});

// --- Checkout (order capture) ---
app.post('/api/checkout', (req, res) => {
  const {
    name, email, phone, country, address, paymentMethod, notes, currency, items, total,
  } = req.body || {};

  if (!name || !email || !phone || !country || !address) {
    return res.status(400).json({ error: 'Name, email, phone, country, and address are required.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }

  const orderReference = `SF-${Date.now().toString(36).toUpperCase()}`;
  const session = getSessionId(req);
  const orderTotal = Number(total) || items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0);
  const curr = String(currency || 'EUR').toUpperCase();

  const userId = req.session?.userId || null;

  db.run(
    `INSERT INTO orders (session, user_id, total, currency, status, customer_name, customer_email, customer_phone, country, address, payment_method, notes, items_json, order_reference)
     VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [session, userId, orderTotal, curr, name, email, phone, country, address, paymentMethod || 'MTN', notes || '', JSON.stringify(items), orderReference],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      notifyNewOrder({
        orderReference,
        name,
        email,
        phone,
        country,
        address,
        paymentMethod: paymentMethod || 'MTN',
        notes,
        currency: curr,
        total: orderTotal,
        itemsJson: JSON.stringify(items),
      }).catch(() => {});
      res.json({
        success: true,
        orderId: this.lastID,
        orderReference,
        total: orderTotal,
        currency: curr,
        message: 'Order received. Complete payment and our team will confirm dispatch from Kampala.',
      });
    }
  );
});

// --- Staff dashboard (Kistie-style operations) ---
const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD || 5);

app.get('/api/staff/dashboard', requireAdmin, (_req, res) => {
  const stats = { pendingOrders: 0, totalOrders: 0, lowStockCount: 0, recentInquiries: 0 };
  db.get("SELECT COUNT(*) AS c FROM orders WHERE status = 'pending'", [], (e1, pendingRow) => {
    if (e1) return res.status(500).json({ error: e1.message });
    stats.pendingOrders = pendingRow?.c || 0;
    db.get('SELECT COUNT(*) AS c FROM orders', [], (e2, totalRow) => {
      if (e2) return res.status(500).json({ error: e2.message });
      stats.totalOrders = totalRow?.c || 0;
      db.get(`SELECT COUNT(*) AS c FROM products WHERE stock <= ?`, [LOW_STOCK_THRESHOLD], (e3, lowRow) => {
        if (e3) return res.status(500).json({ error: e3.message });
        stats.lowStockCount = lowRow?.c || 0;
        db.get('SELECT COUNT(*) AS c FROM contact_inquiries', [], (e4, inqRow) => {
          if (e4) return res.status(500).json({ error: e4.message });
          stats.recentInquiries = inqRow?.c || 0;
          db.all(
            'SELECT * FROM orders ORDER BY created_at DESC LIMIT 20',
            [],
            (e5, orders) => {
              if (e5) return res.status(500).json({ error: e5.message });
              db.all(
                `SELECT id, name, stock FROM products WHERE stock <= ? ORDER BY stock ASC LIMIT 10`,
                [LOW_STOCK_THRESHOLD],
                (e6, lowStock) => {
                  if (e6) return res.status(500).json({ error: e6.message });
                  db.all(
                    'SELECT * FROM contact_inquiries ORDER BY created_at DESC LIMIT 10',
                    [],
                    (e7, inquiries) => {
                      if (e7) return res.status(500).json({ error: e7.message });
                      res.json({ stats, orders: orders || [], lowStock: lowStock || [], inquiries: inquiries || [] });
                    }
                  );
                }
              );
            }
          );
        });
      });
    });
  });
});

app.patch('/api/staff/orders/:id', requireAdmin, (req, res) => {
  const { status } = req.body || {};
  const allowed = ['pending', 'paid', 'shipped', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Use pending, paid, shipped, or cancelled.' });
  }
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, id: Number(req.params.id), status });
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

// --- Frontend (React SPA) ---
const REACT_DIST = path.join(__dirname, '..', 'React', 'dist');
const FRONTEND_DEV = process.env.FRONTEND_URL || 'http://localhost:5173';

// Legacy static catalog from the old Kistie-style site — send users to the React app.
const legacyPaths = ['/catalog-pro.html', '/React/public/catalog-pro.html'];
legacyPaths.forEach((legacyPath) => {
  app.get(legacyPath, (_req, res) => res.redirect(302, '/shop'));
});

if (fs.existsSync(path.join(REACT_DIST, 'index.html'))) {
  app.use(express.static(REACT_DIST));
  app.get(/^\/(?!api|images|uploads).*/, (_req, res) => {
    res.sendFile(path.join(REACT_DIST, 'index.html'));
  });
} else {
  app.get(/^\/(?!api|images|uploads).*/, (_req, res) => {
    res.redirect(302, FRONTEND_DEV);
  });
}

const listenPort = process.env.NODE_ENV === 'test' ? 0 : PORT;
const server = app.listen(listenPort, () => {
  const addr = server.address();
  const actualPort = typeof addr === 'object' && addr ? addr.port : listenPort;
  console.log(`SilverFox backend running on http://localhost:${actualPort}`);
  if (fs.existsSync(path.join(REACT_DIST, 'index.html'))) {
    console.log(`Storefront: http://localhost:${actualPort} (production build)`);
  } else if (process.env.NODE_ENV !== 'test') {
    console.log(`Storefront: ${FRONTEND_DEV} (run "npm run dev" — backend is API only until you build)`);
  }
});

module.exports = { app, server, db };
