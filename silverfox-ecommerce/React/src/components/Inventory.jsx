import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productImageUrl } from '../utils/productImageUrl';
import { useCart } from '../context/CartContext';

const fetchOpts = { credentials: 'include' };

const Inventory = () => {
  const [products, setProducts] = useState([]);
  // Removed unused loading state
  const [error, setError] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  // Removed unused adminLoading state
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginErr, setLoginErr] = useState(null);
  const [shippingDestination, setShippingDestination] = useState('UK');
  const [shippingWeight, setShippingWeight] = useState(1);
  const [shippingQuote, setShippingQuote] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingErr, setShippingErr] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState(null);
  const { cart, clearCart } = useCart();

  // Centralized admin status check
  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/admin/status', fetchOpts);
      if (res.ok) {
        const data = await res.json();
        setAdminLoggedIn(!!data.admin);
      } else {
        setAdminLoggedIn(false);
      }
    } catch {
      setAdminLoggedIn(false);
    } finally {
      // adminLoading removed
    }
  };

  // Track if both admin and products have loaded at least once
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    Promise.all([checkAdmin(), fetchProducts()]).then(() => setInitialLoaded(true));
  }, []);

  const fetchProducts = async () => {
    setError(null);
    try {
      const res = await fetch('/api/products', fetchOpts);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch {
      setError('Could not load products.');
    } finally {
      // loading removed
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErr(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        ...fetchOpts,
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });
      if (!res.ok) {
        setLoginErr('Invalid credentials.');
        return;
      }
      setLoginPass('');
      await checkAdmin();
    } catch {
      setLoginErr('Could not reach server.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', ...fetchOpts });
    } catch {
      /* ignore */
    }
    await checkAdmin();
  };

  const handleEdit = (product) => {
    setEditProduct({
      ...product,
      price: product.price ?? 0,
      stock: product.stock ?? 0,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!adminLoggedIn) {
      alert('Please sign in as admin first.');
      return;
    }
    if (!globalThis.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE', ...fetchOpts });
      if (res.status === 403) {
        alert('Admin session expired or forbidden. Sign in again.');
        setAdminLoggedIn(false);
        return;
      }
      if (!res.ok) {
        let detail = 'Delete failed';
        try {
          const body = await res.json();
          if (body?.error) detail = body.error;
        } catch {
          // ignore parse errors
        }
        await fetchProducts();
        alert(`Failed to delete product: ${detail}`);
        return;
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
      fetchProducts();
    } catch {
      alert('Failed to delete product.');
      // Always refresh product list on error
      fetchProducts();
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditProduct(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!adminLoggedIn) {
      alert('Please sign in as admin first.');
      return;
    }
    try {
      const res = await fetch(`/api/products/${editProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        ...fetchOpts,
        body: JSON.stringify({
          name: editProduct.name,
          image: editProduct.image,
          price: Number(editProduct.price),
          stock: Number(editProduct.stock) || 0,
        }),
      });
      if (res.status === 403) {
        alert('Admin session expired or forbidden. Sign in again.');
        setAdminLoggedIn(false);
        return;
      }
      if (!res.ok) throw new Error('Edit failed');
      handleModalClose();
      fetchProducts();
    } catch {
      alert('Failed to update product.');
    }
  };

  const cartItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const cartTotals = cart.reduce((acc, item) => {
    const currency = item.currency || 'EUR';
    const line = (Number(item.price) || 0) * (Number(item.quantity) || 0);
    acc[currency] = (acc[currency] || 0) + line;
    return acc;
  }, {});

  const handleShippingQuote = async () => {
    setShippingErr(null);
    setShippingQuote(null);
    setShippingLoading(true);
    try {
      const res = await fetch('/api/shipping-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: shippingDestination,
          weightKg: Number(shippingWeight),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch shipping quote');
      }
      setShippingQuote(data);
    } catch (err) {
      setShippingErr(err.message || 'Could not fetch shipping quote.');
    } finally {
      setShippingLoading(false);
    }
  };

  const getCheckoutSessionId = () => {
    const key = 'silverfox_checkout_session';
    const existing = globalThis.localStorage.getItem(key);
    if (existing) return existing;
    const created = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    globalThis.localStorage.setItem(key, created);
    return created;
  };

  const handlePlaceOrder = async () => {
    setOrderMessage(null);
    if (cart.length === 0) {
      setOrderMessage({ type: 'error', text: 'Cart is empty. Add products first.' });
      return;
    }
    const currencies = [...new Set(cart.map((item) => item.currency || 'EUR'))];
    if (currencies.length > 1) {
      setOrderMessage({ type: 'error', text: 'Use one currency in cart before placing order.' });
      return;
    }

    const sessionId = getCheckoutSessionId();
    const currency = currencies[0] || 'EUR';
    setPlacingOrder(true);
    try {
      // Clear backend cart for this checkout session to avoid duplicate old rows.
      const existingRes = await fetch(`/api/cart?session=${encodeURIComponent(sessionId)}`);
      const existing = existingRes.ok ? await existingRes.json() : [];
      await Promise.all(
        (Array.isArray(existing) ? existing : []).map((row) =>
          fetch(`/api/cart/${row.id}?session=${encodeURIComponent(sessionId)}`, { method: 'DELETE' })
        )
      );

      // Push current UI cart to backend cart table.
      for (const item of cart) {
        const addRes = await fetch(`/api/cart?session=${encodeURIComponent(sessionId)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: item.id,
            size: item.size || 'M',
            quantity: Number(item.quantity) || 1,
            currency,
          }),
        });
        if (!addRes.ok) {
          const body = await addRes.json().catch(() => ({}));
          throw new Error(body.error || `Failed adding product ${item.name}`);
        }
      }

      // Create the order from backend cart.
      const orderRes = await fetch(`/api/orders?session=${encodeURIComponent(sessionId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency }),
      });
      const orderData = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      clearCart();
      setOrderMessage({
        type: 'success',
        text: `Order placed successfully. Order #${orderData.order_id}`,
      });
    } catch (err) {
      setOrderMessage({
        type: 'error',
        text: err.message || 'Could not place order.',
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div style={{background:'#f8f9fa',minHeight:'100vh',paddingBottom:'3rem',display:'flex',justifyContent:'center',alignItems:'flex-start'}}>
      <div style={{
        background:'#fff',
        maxWidth:'950px',
        width:'100%',
        marginTop:'2.5rem',
        borderRadius:'1.2rem',
        boxShadow:'0 4px 32px rgba(44,62,80,0.10)',
        padding:'2.2rem 2.2rem 2.5rem 2.2rem',
        minHeight:'70vh',
        position:'relative',
      }}>
        <h2 style={{marginBottom:'1.5rem',fontWeight:700,letterSpacing:'0.03em'}}>Inventory Admin</h2>
        <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#eef3ff', borderRadius: '0.75rem', border: '1px solid #d7e3ff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Cart Overview (same page)</div>
              <div style={{ fontSize: '0.95rem' }}>
                Items: <strong>{cartItems}</strong> | Lines: <strong>{cart.length}</strong>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#334' }}>
                {Object.keys(cartTotals).length === 0
                  ? 'No totals yet.'
                  : Object.entries(cartTotals).map(([currency, total]) => `${currency} ${Number(total).toLocaleString()}`).join(' | ')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <Link to="/cart" className="btn btn-success">Checkout</Link>
              <button type="button" className="btn btn-warning" onClick={handlePlaceOrder} disabled={placingOrder || cart.length === 0}>
                {placingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={clearCart} disabled={cart.length === 0}>Clear Cart</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            <strong style={{ fontSize: '0.92rem' }}>Shipping:</strong>
            <select value={shippingDestination} onChange={(e) => setShippingDestination(e.target.value)} style={{ padding: '0.35rem', borderRadius: '0.4rem', border: '1px solid #ccc' }}>
              <option value="UK">UK</option>
              <option value="USA">USA</option>
              <option value="Rwanda">Rwanda</option>
              <option value="Kenya">Kenya</option>
            </select>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={shippingWeight}
              onChange={(e) => setShippingWeight(e.target.value)}
              style={{ width: '90px', padding: '0.35rem', borderRadius: '0.4rem', border: '1px solid #ccc' }}
            />
            <button type="button" className="btn btn-primary btn-sm" onClick={handleShippingQuote} disabled={shippingLoading}>
              {shippingLoading ? 'Calculating...' : 'Get Shipping Quote'}
            </button>
            {shippingQuote && (
              <span style={{ color: '#145', fontWeight: 600 }}>
                {shippingQuote.destination}: ${shippingQuote.shippingCost}
              </span>
            )}
            {shippingErr && <span style={{ color: '#c00' }}>{shippingErr}</span>}
          </div>
          {orderMessage && (
            <div style={{ marginTop: '0.65rem', color: orderMessage.type === 'success' ? '#186a3b' : '#b00020', fontWeight: 600 }}>
              {orderMessage.text}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#f1f3f5', borderRadius: '0.75rem' }}>
          {adminLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, color: '#186' }}>Signed in as admin.</span>
              <button type="button" onClick={handleLogout} style={{ padding: '0.35rem 1rem', borderRadius: '0.5rem', border: 'none', background: '#6c757d', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Sign out</button>
            </div>
          ) : (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '420px' }}>
              <strong style={{ fontSize: '0.95rem' }}>Admin sign-in (required for edit/delete)</strong>
              <input type="text" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} placeholder="Username" required autoComplete="username" style={{ padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid #ccc' }} />
              <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="Password" required autoComplete="current-password" style={{ padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid #ccc' }} />
              {loginErr && <span style={{ color: '#c00', fontSize: '0.9rem' }}>{loginErr}</span>}
              <button type="submit" style={{ padding: '0.45rem 1.2rem', borderRadius: '0.5rem', border: 'none', background: '#007bff', color: '#fff', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}>Sign in</button>
            </form>
          )}
        </div>

        {!initialLoaded ? (
          <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(255,255,255,0.85)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{fontSize:'1.5rem',color:'#007bff',fontWeight:700}}>Loading...</div>
          </div>
        ) : error ? (
          <p style={{color:'red'}}>{error}</p>
        ) : (
          <div style={{width:'100%'}}>
            <div style={{
              display:'grid',
              gridTemplateColumns:'80px 1.5fr 1fr 120px 1fr',
              fontWeight:700,
              background:'#e3e8ee',
              borderRadius:'0.7rem',
              padding:'0.7rem 0.5rem',
              marginBottom:'0.7rem',
              fontSize:'1.05rem',
              letterSpacing:'0.01em',
              textAlign:'center',
            }}>
              <div>ID</div>
              <div>Name</div>
              <div>Price</div>
              <div>Image</div>
              <div>Actions</div>
            </div>
            {adminLoggedIn ? (
              products.filter(product => product.image).map(product => (
                <div key={product.id} style={{
                  display:'grid',
                  gridTemplateColumns:'80px 1.5fr 1fr 120px 1fr',
                  alignItems:'center',
                  background:'#fff',
                  borderRadius:'0.7rem',
                  boxShadow:'0 2px 8px rgba(44,62,80,0.07)',
                  marginBottom:'0.7rem',
                  padding:'0.7rem 0.5rem',
                  fontSize:'1.01rem',
                  textAlign:'center',
                }}>
                  <div>{product.id}</div>
                  <div>{product.name}</div>
                  <div>€{product.price !== undefined && product.price !== null ? Number(product.price).toFixed(2) : '—'}</div>
                  <div>
                    <img
                      src={productImageUrl(product.image)}
                      alt={product.name}
                      style={{width:'60px',height:'60px',objectFit:'cover',borderRadius:'0.5rem',background:'#f8f9fa',border:'1px solid #e3e8ee'}}
                      onError={e => {e.target.onerror=null; e.target.src='/images/placeholder.png';}}
                    />
                  </div>
                  <div style={{display:'flex',justifyContent:'center',gap:'0.7rem'}}>
                    <button type="button" onClick={() => handleEdit(product)} disabled={!adminLoggedIn} title={!adminLoggedIn ? 'Sign in as admin' : ''} style={{padding:'0.35rem 1.2rem',borderRadius:'0.5rem',border:'none',background: adminLoggedIn ? '#007bff' : '#adb5bd',color:'#fff',fontWeight:600,cursor: adminLoggedIn ? 'pointer' : 'not-allowed',boxShadow:'0 1px 4px rgba(0,123,255,0.08)'}}>Edit</button>
                    <button type="button" onClick={() => handleDelete(product.id)} disabled={!adminLoggedIn} title={!adminLoggedIn ? 'Sign in as admin' : ''} style={{padding:'0.35rem 1.2rem',borderRadius:'0.5rem',border:'none',background: adminLoggedIn ? '#c00' : '#adb5bd',color:'#fff',fontWeight:600,cursor: adminLoggedIn ? 'pointer' : 'not-allowed',boxShadow:'0 1px 4px rgba(200,0,0,0.08)'}}>Delete</button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{marginTop:'2rem',textAlign:'center',color:'#c00',fontWeight:'bold',fontSize:'1.2rem'}}>
                Please sign in as admin to view and manage inventory.
              </div>
            )}
          </div>
        )}
        {modalOpen && editProduct && (
          <div id="editProductModal" style={{display:'flex',position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.4)',zIndex:2000,alignItems:'center',justifyContent:'center'}}>
            <div style={{background:'#fff',padding:'2rem 2rem 1rem 2rem',borderRadius:'1rem',maxWidth:'400px',width:'90%',margin:'auto',boxShadow:'0 4px 24px rgba(0,0,0,0.18)',position:'relative'}}>
              <h3>Edit Product</h3>
              <form onSubmit={handleEditSubmit}>
                <input type="text" value={editProduct.name} onChange={e => setEditProduct({...editProduct, name: e.target.value})} placeholder="Product Name" required style={{width:'100%',marginBottom:'1rem'}} />
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Price (EUR)</label>
                <input type="number" step="0.01" min="0" value={editProduct.price} onChange={e => setEditProduct({...editProduct, price: e.target.value})} placeholder="Price" required style={{width:'100%',marginBottom:'1rem'}} />
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Stock</label>
                <input type="number" min="0" value={editProduct.stock} onChange={e => setEditProduct({...editProduct, stock: e.target.value})} placeholder="Stock" required style={{width:'100%',marginBottom:'1rem'}} />
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Image filename</label>
                <input type="text" value={editProduct.image || ''} onChange={e => setEditProduct({...editProduct, image: e.target.value})} placeholder="e.g. photo.jpg" style={{width:'100%',marginBottom:'0.35rem'}} />
                <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '1rem' }}>File must live in <code>React/public/images/</code> (same folder the catalog uses).</p>
                <div style={{display:'flex',justifyContent:'flex-end',gap:'1rem'}}>
                  <button type="button" onClick={handleModalClose} style={{padding:'0.3rem 1.1rem',borderRadius:'0.5rem',border:'none',background:'#888',color:'#fff',fontWeight:600,cursor:'pointer'}}>Cancel</button>
                  <button type="submit" style={{padding:'0.3rem 1.1rem',borderRadius:'0.5rem',border:'none',background:'#007bff',color:'#fff',fontWeight:600,cursor:'pointer'}}>Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
