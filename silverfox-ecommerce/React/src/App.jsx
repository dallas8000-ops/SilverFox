

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';



import Catalog from './components/Catalog';
import Inventory from './components/Inventory';
import { CartProvider } from './context/CartContext';
import Cart from './components/Cart';
function Home() {
  return (
    <div className="container py-4">
      <header className="mb-4">
        <div className="text-center">
          <h1 className="display-4 fw-bold mb-3" style={{color:'#2c3e50'}}>SilverFox</h1>
          <p className="lead text-muted mb-3">Premium Style for the Distinguished Gentleman</p>
        </div>
      </header>
      <section className="hero text-center mb-5">
        <div className="mx-auto" style={{maxWidth:'700px',padding:'40px',backgroundColor:'#f8f9fa',borderRadius:'12px'}}>
          <h2 className="fw-bold mb-3">Elevate Your Wardrobe</h2>
          <p className="mb-4 text-muted">Curated collections of fine clothing, premium shoes, and sophisticated accessories designed for the modern gentleman.</p>
          <Link to="/catalog" className="btn btn-dark btn-lg px-5">Explore Collections</Link>
        </div>
      </section>
      <section className="row text-center mb-5">
        <div className="col-md-4 mb-3">
          <div className="p-4 bg-light rounded shadow-sm h-100">
            <h3 className="h5 fw-bold">Luxury Selection</h3>
            <p>Handpicked designer clothing, premium footwear, and fine accessories for discerning tastes.</p>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="p-4 bg-light rounded shadow-sm h-100">
            <h3 className="h5 fw-bold">Global Shipping</h3>
            <p>Fast and secure delivery to major destinations worldwide. International express available.</p>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="p-4 bg-light rounded shadow-sm h-100">
            <h3 className="h5 fw-bold">Secure Checkout</h3>
            <p>Multiple payment options including credit cards and secure digital wallets.</p>
          </div>
        </div>
      </section>
      <section className="contact-section text-center" style={{backgroundColor:'#f8f9fa',padding:'40px',borderRadius:'12px'}}>
        <h2 className="mb-4">Get in Touch</h2>
        <div className="mb-3"><strong>Brand:</strong> SilverFox</div>
        <div className="mb-3"><strong>Tagline:</strong> Premium Style for the Distinguished Gentleman</div>
        <div className="mb-3"><strong>Email:</strong> <a href="mailto:info@silverfox.com" className="text-decoration-none">info@silverfox.com</a></div>
        <div className="mb-3"><strong>Phone:</strong> <a href="tel:+1234567890" className="text-decoration-none">+1 (234) 567-890</a></div>
        <div className="mt-4">
          <span className="me-3">📍 Premium Shopping Experience</span>
          <span>🌍 Worldwide Delivery</span>
        </div>
      </section>
    </div>
  );
}

function About() {
  return (
    <div className="container py-5" style={{maxWidth:'800px'}}>
      <h2 className="mb-4 text-center" style={{color:'#2c3e50'}}>About SilverFox</h2>
      <p className="lead text-center mb-4">
        <strong>SilverFox</strong> is an exclusive e-commerce platform dedicated to providing distinguished gentlemen with premium fashion, luxury footwear, and sophisticated accessories that reflect timeless elegance and contemporary style.
      </p>
      <div className="mb-4">
        <h4 className="fw-bold" style={{color:'#2c3e50'}}>Our Philosophy</h4>
        <p>
          We believe that true style transcends trends. SilverFox curates a refined selection of premium clothing, designer shoes, and fine accessories for the gentleman who values quality, sophistication, and understated elegance. Every product reflects our commitment to excellence and timeless appeal.
        </p>
      </div>
      <div className="mb-4">
        <h4 className="fw-bold" style={{color:'#2c3e50'}}>What We Offer</h4>
        <ul className="list-unstyled">
          <li>✓ Premium Designer Clothing</li>
          <li>✓ Luxury Footwear & Shoes</li>
          <li>✓ Sophisticated Accessories</li>
          <li>✓ Exclusive Limited Editions</li>
          <li>✓ International Shipping</li>
          <li>✓ Secure & Convenient Shopping</li>
        </ul>
      </div>
      <div className="mb-4">
        <h4 className="fw-bold" style={{color:'#2c3e50'}}>Contact Information</h4>
        <ul className="list-unstyled mb-0">
          <li><strong>Brand:</strong> SilverFox</li>
          <li><strong>Tagline:</strong> Premium Style for the Distinguished Gentleman</li>
          <li><strong>Email:</strong> <a href="mailto:info@silverfox.com" className="text-decoration-none">info@silverfox.com</a></li>
          <li><strong>Phone:</strong> <a href="tel:+1234567890" className="text-decoration-none">+1 (234) 567-890</a></li>
        </ul>
      </div>
      <div className="text-center mt-5">
        <p className="text-muted">Quality Over Quantity. Style Over Trends. SilverFox Over Everything.</p>
      </div>
    </div>
  );
}


function Layout({ children }) {
  return (
    <>
      {/* Bootstrap Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 py-3">
        <div className="container justify-content-center">
          <div className="w-100 d-flex flex-column align-items-center">
            <Link className="navbar-brand fw-bold text-center mb-2" to="/" style={{fontSize:'2.2rem', letterSpacing: '0.06em', lineHeight: 1, color: '#d4af37'}}>SilverFox</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
              <ul className="navbar-nav d-flex flex-row justify-content-center align-items-center gap-3" style={{fontSize:'1.05rem', fontWeight:500}}>
                <li className="nav-item"><Link className="nav-link px-3" to="/">Home</Link></li>
                <li className="nav-item"><Link className="nav-link px-3" to="/about">About</Link></li>
                <li className="nav-item"><Link className="nav-link px-3" to="/catalog">Catalog</Link></li>
                <li className="nav-item"><Link className="nav-link px-3" to="/inventory">Inventory</Link></li>
                <li className="nav-item"><Link className="nav-link px-3" to="/cart">Cart</Link></li>
                <li className="nav-item"><Link className="nav-link px-3" to="/inventory">Admin</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow-1">
        {children}
      </main>
      {/* Footer */}
      <footer className="bg-dark text-light text-center py-4 mt-5">
        <div style={{color:'#d4af37',fontWeight:'bold'}}>SilverFox &copy; {new Date().getFullYear()}</div>
        <div className="text-muted mt-2">Premium Style for the Distinguished Gentleman</div>
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
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/admin" element={<Navigate to="/inventory" replace />} />
          </Routes>
        </Layout>
      </Router>
    </CartProvider>
  );
}

export default App;
