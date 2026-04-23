# 🧩 SilverFox Component Reference
## React Component Guide & Architecture

---

## 📐 COMPONENT HIERARCHY

```
<App>
  ├── <NavBar>
  │   ├── Logo
  │   ├── Navigation Links
  │   └── Cart Icon
  ├── <Layout>
  │   └── <Routes>
  │       ├── <Home>
  │       ├── <About>
  │       ├── <Catalog>
  │       │   ├── <ProductGrid>
  │       │   │   └── <ProductCard> (multiple)
  │       │   ├── <ProductModal>
  │       │   ├── <FilterSidebar>
  │       │   └── <SortOptions>
  │       ├── <Cart>
  │       │   ├── <CartItemsList>
  │       │   ├── <CartSummary>
  │       │   └── <CheckoutForm>
  │       └── <Inventory> (admin only)
  │           ├── <LoginForm>
  │           ├── <ProductList>
  │           ├── <ProductForm>
  │           └── <ProductActions>
  └── <CartProvider>
      └── CartContext (global state)
```

---

## 📦 CONTEXT API

### CartContext.jsx

**Location:** `React/src/context/CartContext.jsx`

**Purpose:** Global shopping cart state management

**Provider Wrapper:**
```jsx
import { CartProvider } from './context/CartContext'

<CartProvider>
  <App />
</CartProvider>
```

**Hook Usage:**
```jsx
import { useCart } from '../context/CartContext'

function MyComponent() {
  const { 
    cart, 
    addToCart, 
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    currentCurrency,
    convertPrice
  } = useCart()
  
  return (
    // Component JSX
  )
}
```

**State Structure:**
```javascript
{
  cart: [
    {
      product: {id, name, price, image, ...},
      quantity: 2,
      itemId: "unique-id"
    }
  ],
  currentCurrency: "USD",
  exchangeRates: {EUR, USD, GBP, ...}
}
```

**Available Methods:**

#### `addToCart(product, quantity)`
Adds product to cart or increases quantity if exists
```jsx
const { addToCart } = useCart()
addToCart({id: 1, name: "Suit", price: 299.99}, 2)
```

#### `removeFromCart(productId)`
Removes product completely from cart
```jsx
const { removeFromCart } = useCart()
removeFromCart(1)
```

#### `updateQuantity(productId, newQuantity)`
Updates quantity of existing cart item
```jsx
const { updateQuantity } = useCart()
updateQuantity(1, 3)
```

#### `clearCart()`
Empties entire cart
```jsx
const { clearCart } = useCart()
clearCart()
```

#### `getTotalPrice()`
Returns cart total in current currency
```jsx
const { getTotalPrice } = useCart()
const total = getTotalPrice() // Returns number
```

#### `convertPrice(eurPrice, targetCurrency)`
Converts EUR price to target currency
```jsx
const { convertPrice } = useCart()
const usdPrice = convertPrice(299.99, "USD") // Returns 329.99
```

---

## 🎨 COMPONENT REFERENCE

### App.jsx - Main Application

**Location:** `React/src/App.jsx`

**Responsibilities:**
- Main routing setup
- Layout wrapper
- Navigation bar
- Route definitions

**Routes:**
```
/              → Home page
/about         → About page
/catalog       → Product catalog
/cart          → Shopping cart
/inventory     → Admin panel (→ requires login)
/admin         → Redirect to /inventory
```

**Key Features:**
```jsx
<BrowserRouter>
  <CartProvider>
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/inventory" element={<Inventory />} />
      </Routes>
    </Layout>
  </CartProvider>
</BrowserRouter>
```

---

### Catalog.jsx - Product Display

**Location:** `React/src/components/Catalog.jsx`

**Responsibilities:**
- Display products in flexbox grid
- Search and filter functionality
- Sorting options
- Product detail modal
- Add to cart integration

**Key Props:** None (uses CartContext)

**State:**
```javascript
{
  products: [],           // All products from API
  filteredProducts: [],   // After filtering
  selectedProduct: null,  // For modal
  filters: {
    category: "",
    priceMin: 0,
    priceMax: 9999,
    searchTerm: ""
  },
  sortBy: "name"         // price, name, newest
}
```

**Component Features:**

**1. Product Grid (Flexbox)**
```jsx
<div className="product-grid">
  {filteredProducts.map(product => (
    <ProductCard 
      key={product.id} 
      product={product}
      onAddToCart={handleAddToCart}
      onViewDetails={handleViewDetails}
    />
  ))}
</div>
```

**2. Filter Sidebar**
```jsx
<div className="filters">
  <input type="search" placeholder="Search products..." />
  <select>
    <option value="">All Categories</option>
    <option value="Suits">Suits</option>
    <option value="Shoes">Shoes</option>
  </select>
  <input type="range" min="0" max="999" />
</div>
```

**3. Product Modal**
```jsx
{selectedProduct && (
  <ProductModal
    product={selectedProduct}
    onClose={handleCloseModal}
    onAddToCart={handleAddToCart}
  />
)}
```

**CSS Grid Layout:**
```css
.product-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  align-items: flex-start;
}

.product-card {
  width: 280px;
  height: 400px;
  border: 1px solid #d4af37;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.product-card:hover {
  box-shadow: 0 8px 16px rgba(212, 175, 55, 0.3);
  transform: translateY(-4px);
}
```

---

### Cart.jsx - Shopping Cart

**Location:** `React/src/components/Cart.jsx`

**Responsibilities:**
- Display cart items
- Manage item quantities
- Remove items
- Calculate totals
- Handle checkout
- Multi-currency support

**Key Features:**

**1. Cart Items Table**
```jsx
<table className="cart-table">
  <thead>
    <tr>
      <th>Product</th>
      <th>Price</th>
      <th>Quantity</th>
      <th>Subtotal</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {cart.map(item => (
      <CartRow 
        key={item.itemId}
        item={item}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />
    ))}
  </tbody>
</table>
```

**2. Cart Summary**
```jsx
<div className="cart-summary">
  <p>Subtotal: {subtotal.toFixed(2)} {currency}</p>
  <p>Tax (10%): {tax.toFixed(2)} {currency}</p>
  <p>Shipping: {shipping} {currency}</p>
  <hr />
  <h3>Total: {total.toFixed(2)} {currency}</h3>
</div>
```

**3. Currency Selector**
```jsx
<select onChange={(e) => setCurrency(e.target.value)}>
  <option value="EUR">EUR (€)</option>
  <option value="USD">USD ($)</option>
  <option value="GBP">GBP (£)</option>
  <option value="UGX">UGX (Shs)</option>
  <option value="KES">KES (Ksh)</option>
</select>
```

**4. Checkout Form**
```jsx
<form onSubmit={handleCheckout}>
  <input name="fullName" required />
  <input name="email" type="email" required />
  <input name="phone" required />
  <input name="address" required />
  <input name="city" required />
  <input name="state" required />
  <input name="zipCode" required />
  <select name="country" required>...</select>
  
  <fieldset>
    <legend>Payment Method</legend>
    <label>
      <input type="radio" name="payment" value="card" />
      Credit Card (Stripe/Paystack)
    </label>
    <label>
      <input type="radio" name="payment" value="mobilemoney" />
      Mobile Money (MTN/AIRTEL/MPESA)
    </label>
  </fieldset>
  
  <button type="submit">Place Order</button>
</form>
```

---

### Inventory.jsx - Admin Panel

**Location:** `React/src/components/Inventory.jsx`

**Responsibilities:**
- Admin authentication
- Product management (CRUD)
- Product form
- Admin dashboard
- Image upload

**Access Control:**
```jsx
// Checks if user is authenticated admin
const isAdmin = useContext(AuthContext)?.isAdmin
if (!isAdmin) {
  return <LoginForm onSuccess={handleLoginSuccess} />
}
```

**Key Features:**

**1. Login Form**
```jsx
<form onSubmit={handleLogin}>
  <input name="username" required />
  <input name="password" type="password" required />
  <button type="submit">Login</button>
</form>
```

**2. Product List Table**
```jsx
<table className="product-table">
  <thead>
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Price</th>
      <th>Stock</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {products.map(product => (
      <tr key={product.id}>
        <td>{product.id}</td>
        <td>{product.name}</td>
        <td>${product.price}</td>
        <td>{product.stock}</td>
        <td>
          <button onClick={() => editProduct(product)}>Edit</button>
          <button onClick={() => deleteProduct(product.id)}>Delete</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

**3. Product Form (Create/Edit)**
```jsx
<form onSubmit={isEditing ? handleUpdate : handleCreate}>
  <input name="name" defaultValue={editingProduct?.name} required />
  <input name="price" type="number" step="0.01" required />
  <input name="stock" type="number" required />
  <input name="category" required />
  <textarea name="description" />
  
  <div className="image-upload">
    <input type="file" name="image" accept="image/*" />
    <button type="button" onClick={handleUploadImage}>
      Upload Image
    </button>
  </div>
  
  <button type="submit">
    {isEditing ? "Update Product" : "Add Product"}
  </button>
</form>
```

---

## 🎯 REUSABLE COMPONENT PATTERNS

### ProductCard Component

**Usage:**
```jsx
import ProductCard from '../components/ProductCard'

<ProductCard
  product={product}
  onAddToCart={handleAddToCart}
  onViewDetails={handleViewDetails}
  currency="USD"
/>
```

**Props Interface:**
```javascript
{
  product: {
    id: number,
    name: string,
    price: number,
    image: string,
    stock: number,
    rating?: number
  },
  onAddToCart: (product, quantity) => void,
  onViewDetails: (product) => void,
  currency?: string // default "USD"
}
```

**Component Implementation:**
```jsx
export function ProductCard({ product, onAddToCart, onViewDetails, currency = "USD" }) {
  const [quantity, setQuantity] = useState(1)
  
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h5>{product.name}</h5>
      <p className="price">${product.price}</p>
      <p className="stock">
        {product.stock > 0 ? "In Stock" : "Out of Stock"}
      </p>
      <div className="actions">
        <input 
          type="number" 
          min="1" 
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
        />
        <button onClick={() => onAddToCart(product, quantity)}>
          Add to Cart
        </button>
      </div>
    </div>
  )
}
```

---

### Modal Component

**Usage:**
```jsx
import Modal from '../components/Modal'

<Modal isOpen={showModal} onClose={handleClose} title="Product Details">
  <ProductDetails product={selectedProduct} />
</Modal>
```

**Props Interface:**
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  title: string,
  children: ReactNode,
  size?: 'small' | 'medium' | 'large' // default 'medium'
}
```

---

## 🔗 UTILITY FUNCTIONS

### productImageUrl.js

**Location:** `React/src/utils/productImageUrl.js`

**Purpose:** Centralized image URL resolution

**Usage:**
```jsx
import { getProductImageUrl } from '../utils/productImageUrl'

const imageUrl = getProductImageUrl('navy-suit-001.jpg')
// Returns: '/images/navy-suit-001.jpg'
```

**Function:**
```javascript
export function getProductImageUrl(imagePath) {
  if (!imagePath) return '/placeholder.png'
  
  // If absolute URL, return as-is
  if (imagePath.startsWith('http')) return imagePath
  
  // If already has /images/ prefix, return as-is
  if (imagePath.startsWith('/images/')) return imagePath
  
  // Otherwise, add /images/ prefix
  return `/images/${imagePath}`
}
```

---

## 🎨 STYLING SYSTEM

### CSS Architecture

**File Structure:**
```
React/src/
├── App.css          # App-level styles
├── index.css        # Global styles
└── components/
    ├── Catalog.css  # Component-specific styles
    ├── Cart.css
    └── Inventory.css
```

### Global Styles (index.css)

```css
/* Color Palette */
:root {
  --primary-gold: #d4af37;
  --dark-bg: #1a1a1a;
  --text-light: #e0e0e0;
  --text-dark: #333;
  --border-color: #333;
  --hover-gold: #e6c547;
}

/* Typography */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--dark-bg);
  color: var(--text-light);
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  color: var(--primary-gold);
  font-weight: 600;
}

/* Flexbox Utilities */
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

/* Grid Utilities */
.grid-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}
```

### Component Styles (App.css)

```css
/* Navigation Bar */
.navbar {
  background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
  border-bottom: 2px solid var(--primary-gold);
  padding: 1rem 2rem;
}

.navbar-brand {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--primary-gold);
  text-decoration: none;
}

.nav-link {
  color: var(--text-light);
  text-decoration: none;
  margin: 0 1.5rem;
  transition: color 0.3s ease;
}

.nav-link:hover,
.nav-link.active {
  color: var(--primary-gold);
  border-bottom: 2px solid var(--primary-gold);
}

/* Product Cards */
.product-card {
  background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
  border: 1px solid var(--primary-gold);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(212, 175, 55, 0.2);
  border-color: var(--hover-gold);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.product-price {
  font-size: 1.5rem;
  color: var(--primary-gold);
  font-weight: bold;
}

/* Forms */
.form-control,
.form-select {
  background-color: #2a2a2a;
  border: 1px solid var(--border-color);
  color: var(--text-light);
  padding: 0.75rem;
  border-radius: 4px;
  transition: border-color 0.3s;
}

.form-control:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-gold);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: var(--primary-gold);
  color: var(--text-dark);
}

.btn-primary:hover {
  background-color: var(--hover-gold);
  transform: scale(1.05);
}

.btn-secondary {
  background-color: var(--border-color);
  color: var(--text-light);
  border: 1px solid var(--primary-gold);
}

.btn-secondary:hover {
  background-color: var(--primary-gold);
  color: var(--text-dark);
}

/* Responsive */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
  }
  
  .nav-link {
    margin: 0.5rem 0;
  }
  
  .product-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
```

---

## 📖 BEST PRACTICES

### Component Organization
```
Component.jsx (logic)
Component.css (styles)
Component.test.js (tests - for future)
```

### Naming Conventions
- Components: PascalCase (`ProductCard.jsx`)
- Functions: camelCase (`handleAddToCart`)
- CSS Classes: kebab-case (`.product-card`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Performance Tips
1. **Memoization:**
   ```jsx
   const ProductCard = React.memo(({ product }) => {...})
   ```

2. **Lazy Loading:**
   ```jsx
   const Catalog = React.lazy(() => import('./Catalog'))
   ```

3. **useCallback for Handlers:**
   ```jsx
   const handleClick = useCallback(() => {...}, [dependencies])
   ```

### State Management
- Use Context for global state (cart)
- Use useState for component state (form inputs)
- Use useReducer for complex state (if needed)

---

## 🔧 EXTENDING COMPONENTS

### Adding a New Component

**1. Create file:** `React/src/components/NewComponent.jsx`

**2. Template:**
```jsx
import { useState } from 'react'
import './NewComponent.css'

export default function NewComponent({ prop1, prop2 }) {
  const [state, setState] = useState(null)
  
  return (
    <div className="new-component">
      {/* JSX here */}
    </div>
  )
}
```

**3. Add route in App.jsx:**
```jsx
import NewComponent from './components/NewComponent'

<Route path="/new" element={<NewComponent />} />
```

**4. Add navigation link in NavBar:**
```jsx
<Link to="/new" className="nav-link">New</Link>
```

---

**SilverFox Component Reference v1.0**
*Professional React component architecture guide*
