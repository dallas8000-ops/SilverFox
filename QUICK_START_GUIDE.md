# 🚀 QUICK START GUIDE
## Get SilverFox Running in 5 Minutes

---

## ✅ PREREQUISITES

Before starting, ensure you have:
- **Node.js v16+** (check: `node --version`)
- **npm v8+** (check: `npm --version`)
- **Windows 10/11** or Windows Server
- **Administrator rights** (for port access)

---

## 📥 INSTALLATION

### Step 1: Install Dependencies

**Backend:**
```bash
cd C:\SilverFox\backend
npm install
```

**Frontend:**
```bash
cd C:\SilverFox\React
npm install
```

⏱️ **Expected Time:** 3-5 minutes per folder
(Large install due to dependencies)

---

## 🎯 LAUNCHING THE PROJECT

### Option A: Automated Startup (RECOMMENDED)

Double-click the batch file:
```
C:\SilverFox\start-silverfox.bat
```

This will automatically:
1. Open 2 terminal windows
2. Start backend server (port 3001)
3. Start frontend dev server (port 5173)
4. Open http://localhost:5173 in your browser

**Expected output:**
```
Backend Terminal:
  ✓ Database initialized
  ✓ Server running on port 3001

Frontend Terminal:
  VITE v7.2.4 ready in 234 ms
  Local: http://localhost:5173
```

### Option B: Manual Startup

**Terminal 1 - Backend:**
```bash
cd C:\SilverFox\backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd C:\SilverFox\React
npm run dev
```

**Then open your browser:**
```
http://localhost:5173
```

---

## 📋 VERIFICATION CHECKLIST

After startup, verify:

### ✓ Backend is Running
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy"
}
```

### ✓ Frontend is Running
Open http://localhost:5173 in browser
- Should see SilverFox logo
- Navigation bar visible
- No console errors

### ✓ Database Connected
Check backend terminal for:
```
Database initialized at ./db.sqlite
```

### ✓ API Communication
Open browser DevTools (F12):
- Go to Network tab
- Click "Catalog" in navbar
- Should see `GET /api/products` request
- Status should be 200

---

## 🔧 CONFIGURATION

### Backend Settings (.env)

File: `C:\SilverFox\backend\.env`

```env
PORT=3001
DB_PATH=./db.sqlite
SESSION_SECRET=change_this_in_production
JWT_SECRET=change_this_in_production
```

⚠️ **Important:**
- `PORT=3001` must match (critical)
- `SESSION_SECRET` should be random string in production
- Never commit .env to version control

### Frontend Settings (vite.config.js)

File: `C:\SilverFox\React/vite.config.js`

**API Proxy:**
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true
    }
  }
}
```

This routes all `/api/*` requests to backend.

---

## 🧪 QUICK TESTS

### Test 1: List Products

**In Browser Console:**
```javascript
fetch('/api/products')
  .then(r => r.json())
  .then(d => console.log(d))
```

Expected: Array of products (empty initially)

### Test 2: Add Product

**In Browser Console:**
```javascript
fetch('/api/products', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: 'Test Suit',
    price: 299.99,
    stock: 10,
    image: 'test.jpg',
    category: 'Suits'
  })
}).then(r => r.json()).then(d => console.log(d))
```

### Test 3: Test Cart

```javascript
fetch('/api/cart', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    productId: 1,
    quantity: 2
  })
}).then(r => r.json()).then(d => console.log(d))
```

---

## 📱 COMMON ISSUES & FIXES

### ❌ "Port 3001 already in use"

**Solution:**
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill process (replace PID with actual number)
taskkill /PID 1234 /F
```

Then restart backend.

---

### ❌ "Cannot find module"

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -r node_modules package-lock.json
npm install
```

---

### ❌ "CORS error in console"

**Possible causes:**
1. Backend not running on 3001
2. Wrong port in .env
3. Browser security headers

**Solution:**
1. Verify backend running: `curl http://localhost:3001/api/health`
2. Check .env has `PORT=3001`
3. Restart both servers

---

### ❌ "Database locked error"

**Solution:**
```bash
# Delete old database
rm backend/db.sqlite

# Restart backend (will recreate fresh DB)
cd backend && npm start
```

---

### ❌ "Page shows blank or 404"

**Solution:**
1. Check browser console (F12) for errors
2. Verify frontend running: http://localhost:5173
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check backend is responsive: `curl http://localhost:3001/api/products`

---

## 📦 PROJECT STRUCTURE

```
C:\SilverFox/
├── backend/                  # Node.js + Express server
│   ├── index.js             # Main server file with all endpoints
│   ├── validators.js        # Data validation module
│   ├── errorHandler.js      # Error handling middleware
│   ├── package.json         # Backend dependencies
│   ├── .env                 # Configuration
│   ├── db.sqlite            # SQLite database (auto-created)
│   └── node_modules/        # Installed packages
│
├── React/                   # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx          # Main app component with routing
│   │   ├── App.css          # App styling
│   │   ├── index.css        # Global styles
│   │   ├── main.jsx         # React entry point
│   │   ├── components/      # React components
│   │   │   ├── Catalog.jsx  # Products display
│   │   │   ├── Cart.jsx     # Shopping cart
│   │   │   └── Inventory.jsx # Admin panel
│   │   ├── context/
│   │   │   └── CartContext.jsx # Global cart state
│   │   └── utils/
│   │       └── productImageUrl.js # Image path helper
│   ├── public/
│   │   └── images/          # Product images folder
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.js       # Vite configuration
│   └── node_modules/        # Installed packages
│
├── package.json             # Root workspace config
├── SILVERFOX_README.md      # Main documentation
├── DEVELOPMENT_GUIDE.md     # Architecture & best practices
├── API_DOCUMENTATION.md     # Complete API reference
├── QUICK_START_GUIDE.md     # This file
└── start-silverfox.bat      # Startup script
```

---

## 📚 USEFUL COMMANDS

### Backend Commands
```bash
cd C:\SilverFox\backend

# Start server (production mode)
npm start

# Start with auto-reload (development)
npm run dev

# View logs
type error-logs.txt
```

### Frontend Commands
```bash
cd C:\SilverFox\React

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Database Commands
```bash
# Backup database
copy backend\db.sqlite backend\db.backup.sqlite

# Delete database (to reset)
del backend\db.sqlite

# View database contents (requires sqlite3 CLI)
sqlite3 backend/db.sqlite "SELECT * FROM products;"
```

---

## 🎨 TESTING FEATURES

### Create Sample Product

1. Open http://localhost:5173
2. Click "Inventory" (in navbar)
3. You'll see admin panel
4. Fill in product form:
   - Name: "Premium Navy Suit"
   - Price: 299.99
   - Stock: 15
   - Image: "suit.jpg"
   - Category: "Suits"
5. Click "Add Product"

### Add to Cart

1. Click "Catalog" in navbar
2. See products displayed in flexbox grid
3. Click "Add to Cart" button on any product
4. See cart count increase in navbar
5. Click "Cart" to view shopping cart

### Checkout (Test Mode)

1. In Shopping Cart page
2. Select currency (EUR, USD, GBP, UGX, KES)
3. Fill shipping info
4. Select payment method
5. Click "Place Order"

---

## 🔐 SECURITY NOTES

### For Development
Current setup is development-only:
- Session secret is placeholder
- CORS allows localhost only
- No HTTPS (add for production)
- Database in-memory suitable for testing

### For Production
Before deploying:
- [ ] Change SESSION_SECRET in .env
- [ ] Change JWT_SECRET in .env
- [ ] Enable HTTPS/TLS
- [ ] Update CORS origins
- [ ] Add rate limiting
- [ ] Enable logging
- [ ] Use environment-specific configs

---

## 📞 NEED HELP?

### Check Logs
```bash
# Backend logs
type C:\SilverFox\backend\error-logs.txt

# Browser console
Press F12 in browser
Go to Console tab
```

### Common Resources
- React Docs: https://react.dev
- Node/Express: https://nodejs.org
- Vite: https://vitejs.dev
- SQLite: https://www.sqlite.org

### Troubleshooting Steps
1. Stop all servers (Ctrl+C)
2. Check `.env` file settings
3. Delete `node_modules` and `package-lock.json`
4. Run `npm install` again
5. Restart servers
6. Open browser DevTools (F12)
7. Check Console and Network tabs for errors

---

## ✨ NEXT STEPS

After verification:

1. **Add Sample Products:**
   - Create 5-10 test products via admin panel
   - Add sample images to `React/public/images/`

2. **Test Full Workflow:**
   - Browse catalog
   - Add items to cart
   - Complete checkout flow

3. **Review Code:**
   - Check component structure in `React/src/components/`
   - Review API endpoints in `backend/index.js`
   - Understand validation in `backend/validators.js`

4. **Implement Features:**
   - Add product filtering
   - Implement search
   - Add user reviews
   - Enable multi-currency conversion

5. **Prepare for Production:**
   - Run `npm run build` in React folder
   - Test production build locally
   - Configure deployment target
   - Set up environment variables
   - Deploy to hosting platform

---

**SilverFox Quick Start Guide v1.0**
*Get up and running in minutes!*

Last Updated: 2026-04-23
