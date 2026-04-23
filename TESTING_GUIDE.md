# 🧪 SilverFox Testing Guide
## Complete Testing Procedures & Quality Assurance

---

## 📋 TESTING OVERVIEW

### Test Types Covered
1. **Manual Testing** - User interactions
2. **API Testing** - Endpoint validation
3. **Component Testing** - React component behavior
4. **Database Testing** - Data persistence
5. **Integration Testing** - End-to-end workflows
6. **Performance Testing** - Load and responsiveness

### Testing Tools
- **Browser DevTools** (F12) - Console, Network, Storage
- **REST Client** (Postman, curl, fetch)
- **Network Tab** - Monitor API calls
- **Console** - JavaScript errors and logging

---

## 🔍 MANUAL TESTING PROCEDURES

### Test Suite 1: Navigation & Layout

**Test Cases:**

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| T1.1 | Homepage loads | Open http://localhost:5173 | Page loads with SilverFox logo and nav |
| T1.2 | Navigation links | Click each nav link | Correct page loads |
| T1.3 | Mobile responsive | Resize browser to <768px | Menu collapses to hamburger |
| T1.4 | Dark theme | Load page | Gold accents (#d4af37) visible on dark bg |
| T1.5 | Logo clickable | Click SilverFox logo | Navigate to homepage |

**Checklist:**
- [ ] All navigation links functional
- [ ] Active link highlighted
- [ ] Mobile menu toggle works
- [ ] No broken images
- [ ] Page loads in <3 seconds

---

### Test Suite 2: Product Catalog

**Test Cases:**

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| T2.1 | Display products | Click "Catalog" | Products shown in flexbox grid |
| T2.2 | Product cards | Observe cards | Name, price, image, "Add to Cart" visible |
| T2.3 | Product details | Click product | Modal with full details opens |
| T2.4 | Price display | Check prices | Shows in selected currency |
| T2.5 | Stock status | Check stock | "In Stock" / "Out of Stock" displayed |
| T2.6 | Search filter | Type in search | Products filtered by name |
| T2.7 | Category filter | Select category | Only matching products shown |
| T2.8 | Sort options | Sort by price | Products reorder correctly |

**Test Data:**
```json
{
  "id": 1,
  "name": "Classic Navy Suit",
  "price": 299.99,
  "stock": 15,
  "category": "Suits",
  "image": "navy-suit-001.jpg"
}
```

**Checklist:**
- [ ] Grid layout displays correctly
- [ ] No broken product images
- [ ] Prices show correct decimals (99.99)
- [ ] Filters work independently
- [ ] Sort order changes on selection

---

### Test Suite 3: Shopping Cart

**Test Cases:**

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| T3.1 | Add to cart | Click "Add to Cart" | Item appears in cart count |
| T3.2 | Cart count | Add multiple items | Count increases correctly |
| T3.3 | View cart | Click Cart icon | Shopping cart page loads |
| T3.4 | Cart items list | Check items | All added items displayed |
| T3.5 | Item quantity | Modify quantity | Cart updates, total recalculates |
| T3.6 | Remove item | Click remove | Item deleted from cart |
| T3.7 | Clear cart | Click "Clear Cart" | All items removed |
| T3.8 | Cart persists | Refresh page | Cart items still there |
| T3.9 | Total calculation | Add items | Subtotal, tax, total correct |
| T3.10 | Currency change | Switch currency | Prices convert using rates |

**Checklist:**
- [ ] Cart count badge updates
- [ ] Quantities can be edited
- [ ] Remove button works
- [ ] Total calculation accurate
- [ ] Cart survives page refresh

---

### Test Suite 4: Checkout Process

**Test Cases:**

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| T4.1 | Checkout flow | Click Checkout | Shipping form loads |
| T4.2 | Form validation | Leave blank fields | Error messages appear |
| T4.3 | Email validation | Enter invalid email | Error message shown |
| T4.4 | Phone validation | Enter invalid phone | Error message shown |
| T4.5 | Address fields | Fill all required | Submit button enabled |
| T4.6 | Payment method | Select payment | Options shown (card, mobile money) |
| T4.7 | Order summary | Before submit | Total, items, shipping shown |
| T4.8 | Submit order | Click "Place Order" | Confirmation page or modal |
| T4.9 | Order confirmation | Check confirmation | Order ID, total, ETA shown |

**Sample Shipping Data:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+256701234567",
  "address": "123 Main Street",
  "city": "Kampala",
  "state": "Central",
  "zipCode": "00100",
  "country": "Uganda"
}
```

**Checklist:**
- [ ] All form fields validate
- [ ] Error messages clear
- [ ] Submit only enabled when valid
- [ ] Order created in database
- [ ] Confirmation message shown

---

### Test Suite 5: Admin Inventory Panel

**Test Cases:**

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| T5.1 | Access inventory | Click "Inventory" | Admin login form appears |
| T5.2 | Login form | Enter credentials | Submit button visible |
| T5.3 | Invalid login | Wrong password | Error message shown |
| T5.4 | Valid login | Correct credentials | Inventory dashboard loads |
| T5.5 | Product list | View products | All products listed |
| T5.6 | Create product | Fill form, click Add | New product appears in list |
| T5.7 | Edit product | Click edit, change price | Product updates in list |
| T5.8 | Delete product | Click delete, confirm | Product removed from list |
| T5.9 | Image upload | Select image, upload | Image displays on product card |
| T5.10 | Stock management | Update stock | Stock value changes |

**Admin Credentials (Test):**
```
Username: admin
Password: AdminPass123!
```

**Checklist:**
- [ ] Login required for access
- [ ] Create product works
- [ ] Edit updates all fields
- [ ] Delete removes product
- [ ] Image upload shows thumbnail
- [ ] Stock updates in catalog

---

## 🌐 API ENDPOINT TESTING

### Test Tools

**Using curl:**
```bash
curl -X GET http://localhost:3001/api/products
curl -X POST http://localhost:3001/api/products -H "Content-Type: application/json" -d '{"name":"Test","price":99.99,"stock":10,"image":"test.jpg","category":"Test"}'
```

**Using Browser DevTools:**
```javascript
// Console
fetch('/api/products').then(r => r.json()).then(d => console.log(d))
```

**Using Postman:**
1. Create collection "SilverFox"
2. Add folder "Products"
3. Add requests for each endpoint

---

### API Test Suite 1: Products Endpoints

**Test: GET /api/products**
```
Method: GET
URL: http://localhost:3001/api/products
Expected Status: 200
Expected Response: 
{
  "success": true,
  "data": [array of products],
  "pagination": {...}
}
```

**Test: POST /api/products**
```
Method: POST
URL: http://localhost:3001/api/products
Headers: Content-Type: application/json
Body:
{
  "name": "Oxford Loafers",
  "price": 199.99,
  "stock": 20,
  "image": "oxford.jpg",
  "category": "Shoes",
  "description": "Premium loafers"
}
Expected Status: 201
Expected Response:
{
  "success": true,
  "message": "Product created successfully",
  "data": {id: 1, name: "Oxford Loafers", ...}
}
```

**Test: PUT /api/products/:id**
```
Method: PUT
URL: http://localhost:3001/api/products/1
Headers: Content-Type: application/json
Body:
{
  "price": 179.99,
  "stock": 15
}
Expected Status: 200
Expected Response:
{
  "success": true,
  "message": "Product updated successfully"
}
```

**Test: DELETE /api/products/:id**
```
Method: DELETE
URL: http://localhost:3001/api/products/1
Expected Status: 200
Expected Response:
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### API Test Suite 2: Cart Endpoints

**Test: GET /api/cart**
```
Expected Status: 200
Response should include cart items array
```

**Test: POST /api/cart**
```
Method: POST
Body:
{
  "productId": 1,
  "quantity": 2,
  "size": "M",
  "color": "Navy"
}
Expected Status: 201
```

**Test: DELETE /api/cart/:itemId**
```
Method: DELETE
Expected Status: 200
```

---

### API Test Suite 3: Authentication Endpoints

**Test: POST /api/register-admin**
```
Method: POST
Body:
{
  "username": "newadmin",
  "email": "admin@silverfox.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
Expected Status: 201
```

**Test: POST /api/login**
```
Method: POST
Body:
{
  "username": "newadmin",
  "password": "SecurePass123!"
}
Expected Status: 200
Sets session cookie
```

---

### API Test Suite 4: Utility Endpoints

**Test: GET /api/exchange-rates**
```
Expected Status: 200
Response contains:
{
  "rates": {
    "EUR": 1.0,
    "USD": 1.10,
    "GBP": 0.92,
    "UGX": 4050,
    "KES": 143.50
  }
}
```

**Test: GET /api/health**
```
Expected Status: 200
Response:
{
  "success": true,
  "status": "healthy",
  "database": "connected"
}
```

---

## 🔗 INTEGRATION TESTING

### Test Scenario 1: Complete Purchase Flow

**Objective:** Verify end-to-end purchase workflow

**Steps:**
1. Start fresh: Delete cart (localStorage clear)
2. Navigate to Catalog
3. Add product to cart (verify count increases)
4. Click Cart
5. Verify item in cart
6. Fill checkout form with valid data
7. Select payment method
8. Place order
9. Verify confirmation page
10. Check database for order record

**Verification Points:**
- Cart updates correctly
- Form validation works
- Order created in DB
- Confirmation shown
- Cart clears after purchase

---

### Test Scenario 2: Admin Product Management

**Objective:** Verify admin can manage products

**Steps:**
1. Open Inventory
2. Login with admin credentials
3. View product list
4. Create new product
5. Verify product appears in catalog
6. Edit product price
7. Verify price updated in catalog
8. Delete product
9. Verify removed from catalog

**Verification Points:**
- Admin login required
- Product CRUD works
- Changes reflect in catalog
- Database updates

---

### Test Scenario 3: Multi-Currency Conversion

**Objective:** Verify exchange rate conversion

**Steps:**
1. Add products to cart
2. Note USD price
3. Switch to EUR in cart
4. Verify price converted
5. Switch to GBP
6. Verify conversion correct
7. Switch to UGX
8. Verify conversion correct

**Expected Conversions (Base: EUR):**
- EUR to USD: multiply by 1.10
- EUR to GBP: multiply by 0.92
- EUR to UGX: multiply by 4050
- EUR to KES: multiply by 143.50

---

## 📊 DATABASE TESTING

### Test Procedure 1: Data Persistence

**Steps:**
1. Create product via API
2. Restart backend server
3. Query products
4. Verify product still exists

**Expected:** Product persists in database

---

### Test Procedure 2: Transaction Integrity

**Steps:**
1. Add product to cart
2. Create order
3. Check order table for entries
4. Verify cart is cleared

**Expected:** Order saved, cart clears

---

### Test Procedure 3: Data Validation

**Steps:**
1. Try to create product with missing name
2. Try to create with negative price
3. Try to create with special characters in name

**Expected:** All fail with validation errors

---

## ⚡ PERFORMANCE TESTING

### Response Time Benchmarks

| Endpoint | Expected | Acceptable |
|----------|----------|-----------|
| GET /api/products | <100ms | <500ms |
| POST /api/products | <200ms | <1000ms |
| GET /api/cart | <50ms | <200ms |
| POST /api/checkout | <500ms | <2000ms |

### Load Testing

**Simple load test:**
```javascript
// In browser console
for(let i=0; i<100; i++) {
  fetch('/api/products');
}
```

**Expected:** No errors, consistent response times

---

## 🐛 DEBUGGING CHECKLIST

### Browser DevTools (F12)

**Console Tab:**
- [ ] No JavaScript errors (red X)
- [ ] No 404 errors for assets
- [ ] No CORS warnings

**Network Tab:**
- [ ] All API calls return 200/201
- [ ] No failed requests
- [ ] Response times reasonable
- [ ] Request headers include authorization if needed

**Storage Tab:**
- [ ] Session cookies present
- [ ] Cart stored in appropriate place
- [ ] No sensitive data visible

**Sources Tab:**
- [ ] Can set breakpoints
- [ ] Variables visible in debugger
- [ ] Call stack shows function hierarchy

---

### Backend Debugging

**Terminal Output:**
```
✓ Check for startup errors
✓ Verify "Server running on port 3001"
✓ Verify "Database initialized"
✓ Check for unhandled rejections
```

**Log File:**
```bash
# Check error logs
type backend\error-logs.txt
```

**Database Verification:**
```bash
# List all tables
sqlite3 backend/db.sqlite ".tables"

# Check products
sqlite3 backend/db.sqlite "SELECT * FROM products;"

# Check users
sqlite3 backend/db.sqlite "SELECT id, username FROM users;"
```

---

## ✅ PRE-DEPLOYMENT CHECKLIST

Before pushing to production:

### Code Quality
- [ ] No console.log statements left
- [ ] No commented-out code
- [ ] All functions have comments
- [ ] ESLint passes without warnings
- [ ] No hardcoded secrets/passwords

### Security
- [ ] Passwords hashed with bcrypt
- [ ] Session secrets changed
- [ ] CORS restricted appropriately
- [ ] Input validation on all endpoints
- [ ] No sensitive data in responses

### Performance
- [ ] Images optimized
- [ ] Minified CSS/JS
- [ ] Database indexes created
- [ ] Response times < 1 second
- [ ] No memory leaks

### Functionality
- [ ] All CRUD operations work
- [ ] Error handling comprehensive
- [ ] Validation prevents bad data
- [ ] Responsive on mobile
- [ ] Works in Chrome, Firefox, Safari

### Documentation
- [ ] README complete
- [ ] API documentation current
- [ ] Code comments explain logic
- [ ] Environment variables documented
- [ ] Deployment steps clear

---

## 🧪 REGRESSION TEST SUITE

Run these tests before each release:

**Essential Tests:**
1. [ ] Homepage loads
2. [ ] Catalog displays products
3. [ ] Add to cart works
4. [ ] Checkout form validates
5. [ ] Admin login required
6. [ ] Products can be created
7. [ ] Products can be updated
8. [ ] Products can be deleted
9. [ ] Cart persists on refresh
10. [ ] API returns valid JSON

**Time to Complete:** ~15 minutes

---

## 📝 TEST REPORT TEMPLATE

```
Test Run: [Date & Time]
Tester: [Name]
Build: [Version]
Environment: [Development/Staging/Production]

Results:
- Total Tests: XX
- Passed: XX
- Failed: XX
- Blocked: XX

Failures:
1. [Feature] - [Issue Description]
   - Expected: [behavior]
   - Actual: [behavior]
   - Steps to reproduce: [steps]

Performance Metrics:
- Page Load: [X]ms
- API Response: [X]ms
- Database Query: [X]ms

Browser/Device:
- OS: [Windows 11]
- Browser: [Chrome 120]
- Screen: [1920x1080]

Sign-off: [Tester Name] - [Pass/Fail]
```

---

**SilverFox Testing Guide v1.0**
*Comprehensive QA procedures for professional development*
