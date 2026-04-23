
# SilverFox Backend

Express.js REST API for SilverFox e-commerce platform - Premium Style for the Distinguished Gentleman.

## Features
- Product listing and inventory management
- Shopping cart management (add, update, remove)
- Order processing and history
- Multi-currency support (EUR, USD, GBP, UGX, KES)
- Admin authentication and authorization
- Product image management
- Session-based cart persistence

## Quick Start

### Installation
```bash
npm install
```

### Configuration
Create/verify `.env` file:
```
PORT=3001
DB_PATH=./db.sqlite
SESSION_SECRET=silverfox_session_secret_key_change_in_production
JWT_SECRET=silverfox_jwt_secret_key_change_in_production
```

### Start Server
```bash
npm start
# Or with auto-reload:
npm run dev
```
API runs at `http://localhost:3001`

## Database

SQLite auto-creates these tables on startup:
- **products** - Product catalog (id, name, image, price, stock, category, description)
- **users** - Admin accounts (username, password_hash, role)
- **cart** - Shopping cart items (session-based)
- **orders** - Completed orders (id, total, currency, status, timestamp)

Database file: `./db.sqlite` (auto-created)

## Product Images

**Location:** `../React/public/images/`

- Store only filename in database
- API serves: `/images/<filename>`
- Supported formats: JPG, PNG, JPEG, GIF, WebP

## API Documentation

See `../SILVERFOX_SETUP.md` for complete endpoint documentation.

### Key Endpoints
```
GET  /api/products              - List all products
GET  /api/products/:id          - Get product details
GET  /api/exchange-rates        - Get currency rates
POST /api/register-admin        - Create admin account
POST /api/login                 - Admin login
GET  /api/cart                  - Get shopping cart
POST /api/checkout              - Process order
```

## Admin Only Endpoints
All endpoints below require admin authentication:
```
POST   /api/products            - Create product
PUT    /api/products/:id        - Update product
DELETE /api/products/:id        - Delete product
POST   /api/products/upload-image - Upload product image
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Server port |
| DB_PATH | ./db.sqlite | Database file location |
| SESSION_SECRET | - | Session encryption key (⚠️ change in production) |
| JWT_SECRET | - | JWT token secret (⚠️ change in production) |

## Dependencies
- express - Web framework
- sqlite3 - Database
- express-session - Session management
- bcrypt - Password hashing
- cors - Cross-origin requests
- multer - File uploads
- dotenv - Environment variables

## Development

### With Auto-Reload
```bash
npm run dev
```

### Testing Endpoints
Use Postman or curl:
```bash
curl http://localhost:3001/api/products
```

## Folder Structure
- `index.js` - Main server and endpoints
- `paths.js` - File path configuration
- `products.js` - Fallback product data
- `.env` - Environment variables
- `db.sqlite` - SQLite database (auto-created)
- `migrations/` - Database migration files
- `uploads/` - User-uploaded files

## Requirements
- Node.js 16+
- npm or yarn

## Notes
- Database auto-creates on first startup
- CORS enabled for localhost development
- Session TTL: 12 hours
- Passwords hashed with bcrypt (10 rounds)
- No additional migration tools needed

## To Do
- Add authentication
- Integrate payment gateway
- Add admin panel for inventory
