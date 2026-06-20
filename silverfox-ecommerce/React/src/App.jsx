import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';

import Shop from './components/Shop';
import StaffLogin from './components/StaffLogin';
import StaffDashboard from './components/StaffDashboard';
import Contact from './components/Contact';
import Terms from './components/Terms';
import Checkout from './components/Checkout';
import { CartProvider } from './context/CartContext';
import Cart from './components/Cart';

function LegacyRedirect({ to = '/shop' }) {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
}

function About() {
  return (
    <div className="container py-5" style={{ maxWidth: '760px' }}>
      <h2 className="sf-section-title mb-4">About SilverFox</h2>
      <p className="lead text-center mb-5" style={{ color: 'var(--sf-text-muted)', lineHeight: 1.8 }}>
        SilverFox is a premier men's fashion boutique — shipping from Kampala to gentlemen worldwide.
        Suits, shirts, trousers, shoes, outerwear, and accessories curated for quality, fit, and timeless style.
      </p>
      <div className="mb-5">
        <h4 className="sf-display fw-bold mb-3" style={{ color: 'var(--sf-slate)' }}>Our Philosophy</h4>
        <p style={{ lineHeight: 1.8, color: 'var(--sf-text-muted)' }}>
          True style is built on fundamentals. We select pieces that fit well, wear beautifully,
          and transition from the boardroom to the weekend — the complete modern gentleman's wardrobe.
        </p>
      </div>
      <ul className="list-unstyled" style={{ color: 'var(--sf-text-muted)' }}>
        <li className="mb-2">✓ Suits, Blazers &amp; Formal Wear</li>
        <li className="mb-2">✓ Dress &amp; Casual Shirts</li>
        <li className="mb-2">✓ Trousers, Chinos &amp; Knitwear</li>
        <li className="mb-2">✓ Outerwear, Shoes &amp; Accessories</li>
        <li className="mb-2">✓ Worldwide shipping from Kampala</li>
      </ul>
    </div>
  );
}

function Layout({ children }) {
  return (
    <>
      <div className="sf-announcement">
        Shipped from Kampala · Worldwide delivery · Premium men's fashion
      </div>
      <nav className="navbar navbar-expand-lg navbar-dark sf-navbar mb-0">
        <div className="container">
          <Link className="navbar-brand sf-brand" to="/shop">SilverFox</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
              <li className="nav-item"><Link className="nav-link sf-nav-link px-3" to="/shop">Shop</Link></li>
              <li className="nav-item"><Link className="nav-link sf-nav-link px-3" to="/about">About</Link></li>
              <li className="nav-item"><Link className="nav-link sf-nav-link px-3" to="/contact">Contact</Link></li>
              <li className="nav-item"><Link className="nav-link sf-nav-link px-3" to="/cart">Cart</Link></li>
              <li className="nav-item"><Link className="nav-link sf-nav-link px-3" to="/admin">Admin</Link></li>
            </ul>
          </div>
        </div>
      </nav>
      <main className="flex-grow-1">{children}</main>
      <footer className="sf-footer">
        <div className="container">
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="sf-footer-brand mb-2">SilverFox</div>
              <p style={{ fontSize: '0.875rem' }}>Premium men's fashion · Kampala · Worldwide</p>
            </div>
            <div className="col-md-4">
              <h6 className="text-uppercase mb-3" style={{ letterSpacing: '0.1em', fontSize: '0.75rem', color: 'var(--sf-gold)' }}>Shop</h6>
              <div className="d-flex flex-column gap-1">
                <Link to="/shop">All Products</Link>
                <Link to="/shop?category=Suits%20%26%20Blazers">Suits</Link>
                <Link to="/shop?category=Shoes">Shoes</Link>
                <Link to="/shop?category=Accessories">Accessories</Link>
              </div>
            </div>
            <div className="col-md-4">
              <h6 className="text-uppercase mb-3" style={{ letterSpacing: '0.1em', fontSize: '0.75rem', color: 'var(--sf-gold)' }}>Info</h6>
              <div className="d-flex flex-column gap-1">
                <Link to="/contact">Contact</Link>
                <Link to="/terms">Terms of Service</Link>
                <Link to="/admin">Admin</Link>
                <a href="mailto:info@silverfox.com">info@silverfox.com</a>
              </div>
            </div>
          </div>
          <div className="text-center pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem' }}>
            SilverFox &copy; {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/shop" replace />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/catalog" element={<LegacyRedirect />} />
            <Route path="/inventory" element={<LegacyRedirect />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/inventory" element={<Inventory />} />
            <Route path="/admin" element={<Navigate to="/staff/login" replace />} />
          </Routes>
        </Layout>
      </Router>
    </CartProvider>
  );
}

export default App;
