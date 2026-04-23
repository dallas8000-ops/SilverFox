# 🚀 SilverFox Development Guide
## Professional Code Structure & Best Practices

---

## 📦 TECHNOLOGY STACK

### Frontend
- **Framework:** React 19 (Latest with hooks and suspense)
- **Build Tool:** Vite (Ultra-fast dev server and build)
- **CSS:** Bootstrap 5 + Custom CSS with Flexbox
- **Routing:** React Router v7 (client-side navigation)
- **State Management:** React Context API (Cart management)
- **HTTP Client:** Fetch API (native, no dependencies)

### Backend
- **Runtime:** Node.js (JavaScript server-side)
- **Framework:** Express.js (minimal, flexible)
- **Database:** SQLite3 (file-based, no setup)
- **Authentication:** express-session + bcrypt
- **Validation:** Custom validators module
- **Error Handling:** Centralized middleware

### DevTools
- **Linting:** ESLint with React configuration
- **Version Control:** Git-ready structure
- **Package Manager:** npm

---

## 🏗️ ARCHITECTURE

### Clean Separation of Concerns

```
Frontend (React)          Backend (Express)
    ↓                           ↓
 UI/UX           ←→  REST API Endpoints
Components              ↓
  ↓                  Business Logic
State             ↓
Management       Data Validation
  ↓                  ↓
Context API     Middleware/Error Handling
  ↓                  ↓
HTTP Requests    SQLite Database
```

### MVC Pattern (Backend)

```
Routes (index.js)
    ↓
Controllers (API endpoints)
    ↓
Middleware (validation, auth)
    ↓
Database (SQLite)
```

### Component Structure (Frontend)

```
App (Root)
    ├── Layout (Navigation, Footer)
    ├── Home
    ├── About
    ├── Catalog
    │   └── ProductCard (Flexbox)
    ├── Cart
    ├── Inventory (Admin)
    └── CartContext (Global State)
```

---

## 📋 VALIDATION STRATEGY

### Frontend Validation
- **Real-time:** As user types
- **On Blur:** When field loses focus
- **On Submit:** Before sending to server
- **User Feedback:** Error messages below inputs

### Backend Validation
- **Request Validation:** Check all inputs
- **Business Logic:** Verify business rules
- **Data Integrity:** Prevent invalid data in DB
- **Error Response:** Return detailed error info

### Validator Functions (`validators.js`)
```javascript
validateProduct()           // Product CRUD
validateUserRegistration()  // Admin signup
validateUserLogin()         // Admin login
validateCartItem()          // Shopping cart
validateCheckout()          // Order processing
```

---

## 🔌 REST API DESIGN

### HTTP Methods
- `GET` - Retrieve data (safe, idempotent)
- `POST` - Create new resource
- `PUT` - Update existing resource
- `DELETE` - Remove resource

### Response Format
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success message",
  "data": {...},
  "timestamp": "2026-04-23T10:30:00Z"
}
```

### Error Handling
```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "message": "Validation failed",
    "details": ["Field X is required"],
    "timestamp": "2026-04-23T10:30:00Z"
  }
}
```

---

## 🎨 UI COMPONENTS

### Product Card (Flexbox Layout)
```jsx
<div className="product-card">
  <img className="product-image" />
  <h5 className="product-name" />
  <p className="product-price" />
  <p className="product-stock" />
  <button className="btn-add-cart" />
</div>
```

**CSS Features:**
- Flexbox column layout
- Fixed width (280px)
- Hover animations
- Gold accent borders (#d4af37)
- Smooth transitions

### Responsive Grid
```css
.product-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  align-items: flex-start;
}
```

### Form Components
```jsx
<input className="form-control" />
<select className="form-select" />
<button className="btn btn-primary" />
```

---

## 🔐 SECURITY BEST PRACTICES

### Password Security
✅ Bcrypt hashing (10 rounds, not MD5/SHA)
✅ Strong password requirements enforced
✅ Session expiration (12 hours)
✅ Secure session cookies

### Input Security
✅ Frontend validation
✅ Backend validation (never trust client)
✅ Input sanitization (remove HTML/scripts)
✅ SQL injection prevention (parameterized queries)
✅ CORS configuration (localhost only for dev)

### Data Protection
✅ No passwords in logs
✅ No sensitive data in URLs
✅ HTTPS ready (add TLS for production)
✅ Session data encrypted

### Authentication Flow
```
User enters credentials
  ↓
Frontend validates format
  ↓
POST to /api/login
  ↓
Backend validates inputs
  ↓
Hash password comparison (bcrypt)
  ↓
Create session (12-hour TTL)
  ↓
Return session cookie
  ↓
Protected routes check session
```

---

## 📊 DATABASE DESIGN

### Normalization
- **Products:** Each product stored once (no duplication)
- **Users:** Admin users with hashed passwords
- **Cart:** Session-based (temporary, auto-cleared)
- **Orders:** Complete transaction history

### Relationships
```
Cart
├── session_id (FK → Session)
└── product_id (FK → Products)

Orders
├── item_id (FK → Products)
└── user_id (FK → Users, optional)
```

### Data Integrity
- PRIMARY KEY constraints
- UNIQUE constraints on usernames
- NOT NULL on critical fields
- Timestamps for auditing

---

## 🧪 ERROR HANDLING

### Error Middleware Stack
```javascript
1. Route Handler (try/catch)
   ↓
2. Async Wrapper (catches promises)
   ↓
3. Error Handler Middleware (final handler)
   ↓
4. Log Error (file + console)
   ↓
5. Send Response (formatted JSON)
```

### Error Logging
- **File:** `backend/error-logs.txt`
- **Format:** JSON with timestamp, context, stack trace
- **Console:** Development debugging
- **Database:** Could be added for production

### User Feedback
- Validation errors: 400 Bad Request
- Auth errors: 401 Unauthorized
- Permission errors: 403 Forbidden
- Not found: 404 Not Found
- Server errors: 500 Internal Server Error

---

## 📈 PERFORMANCE OPTIMIZATION

### Frontend
✅ Vite for ultra-fast HMR (Hot Module Replacement)
✅ React lazy loading for code splitting
✅ Flexbox (GPU-accelerated)
✅ Debouncing search input
✅ Caching API responses

### Backend
✅ Stateless design (scalable)
✅ Indexed database queries
✅ Middleware compression
✅ Connection pooling ready
✅ Async/await (non-blocking I/O)

### Network
✅ Minimal API requests
✅ Batch operations where possible
✅ Caching strategy
✅ CDN-ready structure

---

## 🔄 STATE MANAGEMENT

### React Context (Cart)
```javascript
useCart() {
  return {
    cart,               // Current items
    addToCart(),        // Add product
    updateQuantity(),   // Modify quantity
    removeFromCart(),   // Delete item
    clearCart(),        // Reset
    getTotal(),         // Calculate total
    currentCurrency,    // EUR, USD, etc.
    convertPrice()      // Exchange rate conversion
  }
}
```

### Local Storage (Future Enhancement)
```javascript
// Could persist cart across sessions
localStorage.setItem('silverfox_cart', JSON.stringify(cart))
```

---

## 📚 CODE STYLE

### Naming Conventions
- **Components:** PascalCase (Catalog.jsx)
- **Functions:** camelCase (handleAddToCart)
- **Constants:** UPPER_SNAKE_CASE (API_URL)
- **CSS Classes:** kebab-case (product-card)

### Comments
```javascript
/**
 * JSDoc format for public functions
 * @param {type} name - Description
 * @returns {type} Description
 */

// Inline comments for complex logic
// Use sparingly; code should be self-documenting
```

### Code Organization
- One component per file
- Logical function grouping
- Constants at top of file
- Exports at bottom of file

---

## 🚀 DEPLOYMENT CHECKLIST

Before production deployment:

### Backend
- [ ] Update SESSION_SECRET
- [ ] Update JWT_SECRET
- [ ] Enable HTTPS
- [ ] Update CORS origins
- [ ] Set environment: `NODE_ENV=production`
- [ ] Configure database backup
- [ ] Add rate limiting
- [ ] Enable logging to database
- [ ] Set up monitoring
- [ ] Add security headers

### Frontend
- [ ] Build optimized: `npm run build`
- [ ] Update API base URL
- [ ] Test on production domain
- [ ] Enable gzip compression
- [ ] Cache static assets
- [ ] Use CDN for images
- [ ] Add analytics
- [ ] Test on mobile devices

### Hosting Options
- **Backend:** Heroku, Railway, Render, AWS EC2
- **Frontend:** Vercel, Netlify, GitHub Pages
- **Database:** Cloud SQLite, PostgreSQL, MongoDB Atlas

---

## 🔗 USEFUL RESOURCES

- React Documentation: https://react.dev
- Vite Guide: https://vitejs.dev
- Express.js: https://expressjs.com
- SQLite: https://www.sqlite.org
- Bootstrap: https://getbootstrap.com
- MDN Web Docs: https://developer.mozilla.org

---

## 📞 COMMON ISSUES & SOLUTIONS

| Issue | Solution |
|-------|----------|
| Port 3001 in use | Kill process with `taskkill` |
| Vite won't start | Clear node_modules, reinstall |
| Database locked | Delete db.sqlite, restart |
| CORS errors | Check backend PORT in .env |
| Images not showing | Verify file in public/images |
| Session expires | Check SESSION_SECRET in .env |

---

**SilverFox Development Guide v1.0**
*Professional capstone-level e-commerce platform*
