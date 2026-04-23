# 🦊 SilverFox E-Commerce Platform
## Premium Style for the Distinguished Gentleman

Welcome to **SilverFox** - A professional, capstone-level e-commerce platform built with modern web technologies.

---

## 📋 PROJECT OVERVIEW

**SilverFox** is a full-stack e-commerce application specializing in premium clothing, luxury footwear, and sophisticated accessories for the discerning gentleman.

### ✨ Key Features
- ✅ Modern React 19 frontend with Vite
- ✅ Express.js REST API backend
- ✅ SQLite database with auto-schema creation
- ✅ Comprehensive data validation (frontend & backend)
- ✅ Secure authentication & session management
- ✅ Professional Bootstrap responsive UI
- ✅ Flexbox-based product card layout
- ✅ Multi-currency support (EUR, USD, GBP, UGX, KES)
- ✅ Complete CRUD operations
- ✅ Error handling & logging middleware
- ✅ Full API documentation

---

## 🚀 QUICK START

### Prerequisites
- Node.js 16+ installed
- npm package manager
- Windows PowerShell or terminal

### Step 1: Navigate to Project
```powershell
cd C:\SilverFox
```

### Step 2: Install All Dependencies
```powershell
cd backend
npm install

cd ..\React
npm install

cd ..
```

### Step 3: Start Backend Server (Terminal 1)
```powershell
cd C:\SilverFox\backend
npm start
```
✅ Backend runs at `http://localhost:3001`

### Step 4: Start Frontend Dev Server (Terminal 2)
```powershell
cd C:\SilverFox\React
npm run dev
```
✅ Frontend runs at `http://localhost:5173`

### Step 5: Access Application
- **Frontend:** http://localhost:5173
- **API Base:** http://localhost:3001/api

---

## 👨‍💼 ADMIN SETUP

### Create First Admin Account

**Option 1: PowerShell**
```powershell
$body = @{
  username = "admin"
  password = "Admin@1234"
} | ConvertTo-Json

curl -X POST "http://localhost:3001/api/register-admin" `
  -H "Content-Type: application/json" `
  -d $body
```

**Option 2: Postman**
1. Create POST request to `http://localhost:3001/api/register-admin`
2. Body (JSON):
```json
{
  "username": "admin",
  "password": "Admin@1234"
}
```
3. Send request

### Login to Admin Dashboard
1. Go to http://localhost:5173
2. Click "Inventory" or "Admin" in navigation
3. Enter your credentials
4. Manage products, inventory, and orders

---

## 📁 PROJECT STRUCTURE

```
SilverFox/
├── backend/                           # Express.js API Server
│   ├── index.js                      # Main server & REST endpoints
│   ├── validators.js                 # Data validation logic
│   ├── errorHandler.js               # Error handling middleware
│   ├── package.json                  # Backend dependencies
│   ├── paths.js                      # File path configuration
│   ├── products.js                   # Fallback product data
│   ├── .env                          # Environment variables (PORT=3001)
│   ├── db.sqlite                     # SQLite database (auto-created)
│   ├── migrations/                   # Database migrations
│   ├── uploads/                      # User-uploaded files
│   └── error-logs.txt               # Error log file
│
├── React/                            # Vite + React 19 Frontend
│   ├── src/
│   │   ├── App.jsx                  # Main app component
│   │   ├── App.css                  # Professional styling with flexbox
│   │   ├── main.jsx                 # Entry point
│   │   ├── index.css                # Global styles
│   │   ├── components/              # React components
│   │   │   ├── Catalog.jsx          # Product catalog with search/sort
│   │   │   ├── Cart.jsx             # Shopping cart & checkout
│   │   │   └── Inventory.jsx        # Admin inventory management
│   │   ├── context/
│   │   │   └── CartContext.jsx      # Global cart state (React Context)
│   │   ├── utils/
│   │   │   └── productImageUrl.js   # Image URL utilities
│   │   └── assets/                  # Images & static files
│   ├── public/
│   │   ├── images/                  # Product images (empty - ready for uploads)
│   │   └── index.html               # Entry HTML
│   ├── package.json                 # Frontend dependencies
│   ├── vite.config.js               # Vite configuration
│   ├── eslint.config.js             # ESLint configuration
│   └── README.md                    # Frontend documentation
│
├── package.json                      # Root workspace configuration
└── SILVERFOX_README.md              # This file
```

---

## 🔌 API DOCUMENTATION

### Base URL
`http://localhost:3001/api`

### Public Endpoints

#### Get All Products
```
GET /api/products
Response: { success: true, data: [...], message: "Products retrieved" }
```

#### Get Single Product
```
GET /api/products/:id
```

#### Currency Exchange Rates
```
GET /api/exchange-rates
Response: Rates for EUR, USD, GBP, UGX, KES
```

#### Cart Operations
```
GET    /api/cart                      # Get cart items
POST   /api/cart                      # Add to cart
PUT    /api/cart/:productId           # Update quantity
DELETE /api/cart/:productId           # Remove from cart
```

#### Checkout
```
POST /api/checkout
Body: {
  items: [{ productId, quantity }],
  total: number,
  currency: string,
  email: string
}
```

### Admin Endpoints (Require Authentication)

#### Authentication
```
POST   /api/register-admin            # Create admin account
POST   /api/login                     # Admin login (returns session)
POST   /api/logout                    # Logout
GET    /api/admin/status              # Check login status
```

#### Product Management
```
POST   /api/products                  # Create product
PUT    /api/products/:id              # Update product
DELETE /api/products/:id              # Delete product
POST   /api/products/upload-image     # Upload product image
```

---

## 📊 DATABASE SCHEMA

### Auto-Created Tables (SQLite)

**Products Table**
```sql
id (PRIMARY KEY)
name (TEXT, UNIQUE)
price (REAL)
stock (INTEGER)
category (TEXT)
description (TEXT)
image (TEXT)
created_at (TIMESTAMP)
```

**Users Table**
```sql
id (PRIMARY KEY)
username (TEXT, UNIQUE)
password (TEXT)
role (TEXT)
created_at (TIMESTAMP)
```

**Cart Table**
```sql
id (PRIMARY KEY)
session_id (TEXT)
product_id (INTEGER)
quantity (INTEGER)
```

**Orders Table**
```sql
id (PRIMARY KEY)
total (REAL)
currency (TEXT)
items (JSON)
status (TEXT)
created_at (TIMESTAMP)
```

---

## 🎨 UI FEATURES

### Bootstrap Integration
- Responsive grid system
- Professional navbar with branding
- Modal dialogs for product details
- Alert & notification components
- Form controls with validation styling

### Flexbox Layout
- Product grid with centered flex cards
- Responsive product card layout (280px width)
- Flexible navigation menu
- Cart item table with flex alignment
- Gold accent color (#d4af37) for premium feel

### Form Validation
- Frontend: Real-time input validation
- Backend: Comprehensive validation middleware
- Error messages display below form fields
- Success/error alerts for user feedback

---

## 🔒 SECURITY FEATURES

✅ **Password Security**
- Bcrypt hashing (10 rounds)
- Strong password requirements
- Session expiration (12 hours)

✅ **Input Validation**
- Frontend validation on forms
- Backend validation on all endpoints
- XSS protection (input sanitization)
- SQL injection prevention (parameterized queries)

✅ **Authentication**
- Session-based authentication
- Admin authorization checks
- Protected admin endpoints

---

## 🛠️ ENVIRONMENT CONFIGURATION

**Backend `.env` File** (`C:\SilverFox\backend\.env`)
```
PORT=3001
DB_PATH=./db.sqlite
SESSION_SECRET=silverfox_session_secret_key_change_in_production
JWT_SECRET=silverfox_jwt_secret_key_change_in_production
```

**For Production:**
- Update SESSION_SECRET with strong random value
- Update JWT_SECRET with strong random value
- Change PORT if needed
- Update CORS origins to your domain

---

## 📸 ADDING PRODUCT IMAGES

1. **Place Images in:**
   ```
   C:\SilverFox\React\public\images\
   ```

2. **Supported Formats:**
   - JPG, JPEG, PNG, GIF, WebP
   - Recommended size: 500x500px or larger

3. **Create Products:**
   - Go to Inventory admin panel
   - Login with your credentials
   - Enter image filename (e.g., `shirt.jpg`)
   - API auto-resolves to `/images/shirt.jpg`

4. **Image Naming Tips:**
   - Use descriptive names: `navy-business-shirt.jpg`
   - Avoid special characters
   - Keep under 100 characters

---

## 🧪 TESTING THE API

### Test with PowerShell

**Get all products:**
```powershell
curl -X GET "http://localhost:3001/api/products"
```

**Create admin:**
```powershell
curl -X POST "http://localhost:3001/api/register-admin" `
  -H "Content-Type: application/json" `
  -d '{"username":"admin","password":"Admin@1234"}'
```

**Get exchange rates:**
```powershell
curl -X GET "http://localhost:3001/api/exchange-rates"
```

---

## 🐛 TROUBLESHOOTING

### Port Already in Use
```powershell
# Find process on port 3001
netstat -ano | findstr :3001
# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Database Issues
```powershell
# Delete database to reset
Remove-Item C:\SilverFox\backend\db.sqlite
# Restart server to recreate
npm start
```

### CORS Errors
- Ensure backend is running on `http://localhost:3001`
- Clear browser cache and cookies
- Check `.env` PORT matches code (should be 3001)

### React App Won't Load
```powershell
cd C:\SilverFox\React
npm install
npm run dev -- --host
```

---

## 📝 NEXT STEPS

1. ✅ Install dependencies
2. ✅ Create admin account
3. ✅ Add product images to `React/public/images/`
4. ✅ Create products via Inventory admin panel
5. ✅ Test Catalog, Cart, and Checkout
6. ✅ Integrate payment gateway (optional)
7. ✅ Deploy to production

---

## 📚 DOCUMENTATION FILES

- **This File:** Project overview and quick start
- `backend/README.md` - Backend API documentation
- `React/README.md` - Frontend documentation
- `backend/validators.js` - Validation functions with comments
- `backend/errorHandler.js` - Error handling middleware

---

## 🎓 CAPSTONE PROJECT GUIDELINES

This project meets professional capstone requirements:

✅ **React & Node.js** - Full MERN-like stack
✅ **Data Validation** - Comprehensive validators for all inputs
✅ **REST API** - Complete CRUD operations with proper HTTP methods
✅ **JavaScript/ES6** - Modern async/await, arrow functions, destructuring
✅ **Bootstrap** - Professional responsive design
✅ **Flexbox Cards** - Modern product card layout
✅ **Error Handling** - Middleware, logging, user feedback
✅ **Authentication** - Secure login system
✅ **Database** - SQLite with relational schema
✅ **Code Comments** - Professional documentation throughout
✅ **Best Practices** - Modular code, separation of concerns

---

## 📞 SUPPORT

For issues or questions:
- Check error messages in browser console
- Review backend logs in `error-logs.txt`
- Verify all ports are available (3001, 5173)
- Ensure Node.js is installed: `node --version`

---

## 📜 LICENSE

MIT License - See LICENSE file

---

**SilverFox E-Commerce Platform v1.0.0**
*Premium Style for the Distinguished Gentleman*

🦊 Built with React, Node.js, Express, and SQLite
