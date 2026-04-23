# 🔌 SilverFox REST API Documentation
## Complete Endpoint Reference

---

## 📍 BASE URL
```
Development: http://localhost:3001
Production: https://silverfox-api.com (to be configured)
```

---

## 🔄 ENDPOINTS OVERVIEW

### Products Management
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `POST /api/products/upload-image` - Upload product image

### Shopping Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update item quantity
- `DELETE /api/cart/:itemId` - Remove from cart
- `POST /api/cart/clear` - Clear entire cart

### Orders & Checkout
- `POST /api/checkout` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/cancel` - Cancel order

### Authentication
- `POST /api/register-admin` - Create admin account
- `POST /api/login` - Admin login
- `POST /api/logout` - Logout
- `GET /api/admin/profile` - Get admin profile

### System
- `GET /api/exchange-rates` - Get current exchange rates
- `GET /api/health` - Health check
- `GET /api/status` - Server status

---

## 📦 PRODUCTS API

### GET /api/products
**Retrieve list of all products with pagination**

**Query Parameters:**
```
page=1          (optional) - Page number, default 1
limit=20        (optional) - Items per page, default 20
category=       (optional) - Filter by category
sortBy=price    (optional) - price, name, newest
order=asc       (optional) - asc or desc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Classic Navy Suit",
      "price": 299.99,
      "currency": "USD",
      "stock": 15,
      "image": "navy-suit-001.jpg",
      "category": "Suits",
      "description": "Premium tailored suit",
      "rating": 4.5,
      "createdAt": "2026-04-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Errors (400):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid query parameters",
    "details": ["sortBy must be one of: price, name, newest"]
  }
}
```

---

### GET /api/products/:id
**Retrieve single product details**

**URL Parameters:**
```
id (required) - Product ID as integer
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Classic Navy Suit",
    "price": 299.99,
    "stock": 15,
    "image": "navy-suit-001.jpg",
    "category": "Suits",
    "description": "Premium tailored suit",
    "sizes": ["S", "M", "L", "XL", "XXL"],
    "colors": ["Navy", "Charcoal", "Black"],
    "rating": 4.5,
    "reviews": 12,
    "createdAt": "2026-04-20T10:00:00Z"
  }
}
```

**Errors:**
- `404 Not Found` - Product doesn't exist
- `400 Bad Request` - Invalid product ID

---

### POST /api/products
**Create new product (admin only)**

**Authentication:** Session required (admin)

**Request Body:**
```json
{
  "name": "Oxford Leather Loafers",
  "price": 199.99,
  "stock": 25,
  "image": "oxford-loafers-001.jpg",
  "category": "Shoes",
  "description": "Handcrafted Italian leather loafers",
  "sizes": ["39", "40", "41", "42", "43", "44", "45"],
  "colors": ["Black", "Brown", "Tan"]
}
```

**Validation Rules:**
- `name`: String, 3-100 chars, required
- `price`: Number, > 0, required
- `stock`: Integer, >= 0, required
- `image`: String, valid image file, required
- `category`: String, 2-50 chars, required
- `description`: String, 10-500 chars, optional

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 46,
    "name": "Oxford Leather Loafers",
    "price": 199.99,
    "stock": 25,
    "image": "oxford-loafers-001.jpg",
    "category": "Shoes"
  }
}
```

**Errors:**
- `400 Bad Request` - Validation failed
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not admin

---

### PUT /api/products/:id
**Update product details (admin only)**

**Authentication:** Session required (admin)

**Request Body:** (same fields as POST, all optional)
```json
{
  "price": 189.99,
  "stock": 20
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": 1,
    "name": "Oxford Leather Loafers",
    "price": 189.99,
    "stock": 20
  }
}
```

---

### DELETE /api/products/:id
**Delete product (admin only)**

**Authentication:** Session required (admin)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 🛒 SHOPPING CART API

### GET /api/cart
**Get user's shopping cart**

**Authentication:** Session required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "itemId": "uuid-123",
        "product": {
          "id": 1,
          "name": "Classic Navy Suit",
          "price": 299.99
        },
        "quantity": 2,
        "subtotal": 599.98
      }
    ],
    "totalItems": 2,
    "totalPrice": 599.98,
    "currency": "USD"
  }
}
```

---

### POST /api/cart
**Add item to cart**

**Authentication:** Session required

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2,
  "size": "M",
  "color": "Navy"
}
```

**Validation:**
- `productId`: Integer, must exist in DB
- `quantity`: Integer, 1-999
- `size`: String, optional, must be valid size
- `color`: String, optional, must be valid color

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "itemId": "uuid-123",
    "quantity": 2,
    "cartTotal": 599.98
  }
}
```

---

### PUT /api/cart/:itemId
**Update cart item quantity**

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cart updated",
  "data": {
    "itemId": "uuid-123",
    "quantity": 3,
    "subtotal": 899.97
  }
}
```

---

### DELETE /api/cart/:itemId
**Remove item from cart**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

---

## 💳 CHECKOUT & ORDERS

### POST /api/checkout
**Create order from cart**

**Authentication:** Session required

**Request Body:**
```json
{
  "shippingAddress": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "United States"
  },
  "paymentMethod": "card",
  "paymentDetails": {
    "method": "stripe",
    "token": "tok_visa_123"
  },
  "currency": "USD",
  "shippingType": "standard"
}
```

**Validation Rules:**
- All shipping address fields required
- Email must be valid format
- Phone must have proper format
- Payment method: "card", "mobilemoney", "bank"

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": 12345,
    "orderNumber": "SFX-2026-001234",
    "totalAmount": 599.98,
    "currency": "USD",
    "status": "pending",
    "estimatedDelivery": "2026-04-30",
    "createdAt": "2026-04-23T10:00:00Z"
  }
}
```

---

### GET /api/orders
**Get user's order history**

**Query Parameters:**
```
status=completed  (optional) - Filter by status
limit=10          (optional) - Items per page
page=1            (optional) - Page number
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "orderId": 12345,
      "orderNumber": "SFX-2026-001234",
      "totalAmount": 599.98,
      "status": "delivered",
      "createdAt": "2026-04-20T10:00:00Z",
      "itemCount": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5
  }
}
```

---

## 🔐 AUTHENTICATION API

### POST /api/register-admin
**Create new admin account**

**Request Body:**
```json
{
  "username": "john.doe",
  "email": "john@silverfox.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Validation Rules:**
- `username`: Alphanumeric, 3-20 chars, unique
- `email`: Valid email format, unique
- `password`: Min 8 chars, uppercase, lowercase, number, special char

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Admin account created successfully",
  "data": {
    "id": 1,
    "username": "john.doe",
    "email": "john@silverfox.com"
  }
}
```

**Errors:**
- `400 Bad Request` - Validation failed
- `409 Conflict` - Username or email already exists

---

### POST /api/login
**Admin login**

**Request Body:**
```json
{
  "username": "john.doe",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "username": "john.doe",
    "email": "john@silverfox.com",
    "sessionId": "session_123_abc"
  }
}
```

**Cookies:** Session cookie set (httpOnly, secure, 12-hour TTL)

**Errors:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing fields

---

### POST /api/logout
**Admin logout**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 💱 UTILITIES

### GET /api/exchange-rates
**Get current exchange rates (base currency: EUR)**

**Query Parameters:**
```
base=EUR          (optional) - Base currency
currencies=USD,GBP (optional) - Target currencies
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "base": "EUR",
    "rates": {
      "EUR": 1.0,
      "USD": 1.10,
      "GBP": 0.92,
      "UGX": 4050.00,
      "KES": 143.50
    },
    "timestamp": "2026-04-23T10:00:00Z",
    "expiresAt": "2026-04-24T10:00:00Z"
  }
}
```

---

### GET /api/health
**Health check endpoint**

**Response (200 OK):**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-04-23T10:00:00Z",
  "uptime": 3600,
  "database": "connected"
}
```

---

## 🔒 AUTHENTICATION SECURITY

### Session-Based Auth
- Credentials sent via secure session cookie
- HttpOnly flag prevents JavaScript access
- Secure flag requires HTTPS in production
- 12-hour session timeout
- CSRF tokens recommended for forms

### Protected Endpoints
The following endpoints require active session:
- All `/api/cart/*` endpoints
- All `/api/checkout` endpoint
- All `/api/products` POST/PUT/DELETE (admin only)
- All `/api/orders/*` endpoints
- All `/api/admin/*` endpoints

**Unauthenticated Response (401):**
```json
{
  "success": false,
  "error": {
    "message": "Authentication required",
    "code": "UNAUTHORIZED"
  }
}
```

---

## ⚠️ ERROR CODES

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 204 | No Content | Success, no data |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Auth required |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate/conflict |
| 422 | Unprocessable | Validation failed |
| 429 | Too Many Requests | Rate limited |
| 500 | Server Error | Internal error |

---

## 📝 RESPONSE FORMAT

All responses follow consistent JSON structure:

**Success:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {...},
  "timestamp": "ISO-8601 timestamp"
}
```

**Error:**
```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "message": "Human-readable error",
    "code": "ERROR_CODE",
    "details": ["Field-specific errors"],
    "timestamp": "ISO-8601 timestamp"
  }
}
```

---

## 🧪 TESTING WITH CURL

### Create Product
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": 99.99,
    "stock": 10,
    "image": "test.jpg",
    "category": "Test"
  }'
```

### Get Products
```bash
curl http://localhost:3001/api/products?limit=5
```

### Add to Cart
```bash
curl -X POST http://localhost:3001/api/cart \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 2
  }'
```

---

**SilverFox API Documentation v1.0**
*Professional REST API for e-commerce platform*
