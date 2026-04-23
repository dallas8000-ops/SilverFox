// src/components/Catalog.jsx

import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { productImageUrl } from '../utils/productImageUrl';


const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [brokenImageIds, setBrokenImageIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currency, setCurrency] = useState('EUR');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [sizeSystem, setSizeSystem] = useState('US');
  const [fxRates, setFxRates] = useState({ EUR: 1, USD: 1.08, UGX: 4300, KES: 140 });
  const { addToCart } = useCart();

  // Helper to reset modal state
  const resetModalState = () => {
    setSelectedSize('');
    setQuantity(1);
    setCurrency('EUR');
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Always use relative URL so Vite proxy works
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
        const ratesRes = await fetch('/api/exchange-rates');
        if (ratesRes.ok) {
          const ratesData = await ratesRes.json();
          if (ratesData?.rates?.EUR && ratesData?.rates?.USD && ratesData?.rates?.UGX && ratesData?.rates?.KES) {
            setFxRates({
              EUR: Number(ratesData.rates.EUR),
              USD: Number(ratesData.rates.USD),
              UGX: Number(ratesData.rates.UGX),
              KES: Number(ratesData.rates.KES),
            });
          }
        }
      } catch {
        setError('Could not load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="text-center py-5">Loading products...</div>;
  if (error) return <div className="text-center py-5 text-danger">{error}</div>;

  // Helper: parse comma-separated size string into array of trimmed strings
  const parseSizes = (str) => {
    if (!str || typeof str !== 'string') return [];
    return str.split(',').map(s => s.trim()).filter(Boolean);
  };

  // Only show products with a valid image (non-empty string, not null/undefined)
  const validProducts = products.filter(
    p => {
      if (brokenImageIds.includes(p.id)) return false;
      if (!p.image || typeof p.image !== 'string') return false;
      const trimmed = p.image.trim();
      // Exclude if image is empty, null, undefined, or just whitespace
      if (!trimmed) return false;
      // Optionally: Exclude if image is a placeholder or broken reference
      // (e.g., 'undefined', 'null', 'broken.jpg')
      if (["undefined","null","broken.jpg","broken.png"].includes(trimmed.toLowerCase())) return false;
      return true;
    }
  ).slice().sort((a, b) => {
    let valA, valB;
    if (sortBy === 'price') {
      valA = Number(a.price) || 0;
      valB = Number(b.price) || 0;
    } else {
      valA = (a.name || '').toLowerCase();
      valB = (b.name || '').toLowerCase();
    }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
  const selectedBasePrice = Number(selectedProduct?.price || 0);
  const selectedRate = Number(fxRates[currency] || 1);
  const selectedUnitPrice = selectedBasePrice * selectedRate;
  const selectedTotalPrice = selectedUnitPrice * quantity;

  return (
    <div className="container py-5 min-vh-100" style={{background: '#f8f9fa'}}>
      <h2 className="mb-4 text-center">Catalog</h2>
      <div className="d-flex justify-content-end align-items-center gap-2 mb-4 flex-wrap">
        <span className="mb-0 fw-semibold">Sort by:</span>
        <select
          id="catalog-sort"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{padding:'0.3rem 0.8rem',borderRadius:'6px',border:'1px solid #ccc'}}
        >
          <option value="name">Name</option>
          <option value="price">Price</option>
        </select>
        <button
          onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
          style={{padding:'0.3rem 0.8rem',borderRadius:'6px',border:'1px solid #ccc',background:'#f8f9fa',cursor:'pointer',minWidth:'4.5rem'}}
          title="Toggle sort direction"
        >
          {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>
      </div>
      <div className="row g-4 justify-content-center">
        {validProducts.length === 0 ? (
          <div className="text-center">No products available.</div>
        ) : (
          validProducts.map(product => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex align-items-stretch" key={product.id}>
              <button
                type="button"
                className="card h-100 shadow rounded-4 w-100 text-start"
                style={{cursor:'pointer'}}
                onClick={() => { resetModalState(); setSelectedProduct(product); }}
              >
                <img
                  src={productImageUrl(product.image)}
                  className="card-img-top mx-auto d-block"
                  alt={product.name}
                  style={{objectFit:'cover',height:'220px',maxWidth:'100%'}}
                  onError={() => {
                    setBrokenImageIds((prev) => (prev.includes(product.id) ? prev : [...prev, product.id]));
                  }}
                />
                <div className="card-body d-flex flex-column align-items-center">
                  <h5 className="card-title text-center">{product.name}</h5>
                  <p className="card-text fw-bold mb-2">
                    {product.price === undefined || product.price === null ? 'No price' : `€${Number(product.price).toFixed(2)}`}
                  </p>
                  <span className="btn btn-primary mt-auto w-100 disabled" aria-hidden="true">View Details</span>
                </div>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div
          style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.5)',zIndex:1050,display:'flex',alignItems:'center',justifyContent:'center'}}
          onClick={() => { setSelectedProduct(null); resetModalState(); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
              setSelectedProduct(null);
              resetModalState();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close product details"
        >
          <div
            style={{background:'#fff',borderRadius:'1rem',maxWidth:'500px',width:'90%',padding:'2rem',position:'relative'}}
            role="dialog"
            aria-modal="true"
            aria-label={selectedProduct.name}
          >
            <button onClick={() => { setSelectedProduct(null); resetModalState(); }} style={{position:'absolute',top:'1rem',right:'1rem',background:'none',border:'none',fontSize:'1.5rem',cursor:'pointer'}} aria-label="Close">&times;</button>
            <img src={productImageUrl(selectedProduct.image)} alt={selectedProduct.name} style={{width:'100%',maxHeight:'250px',objectFit:'contain',marginBottom:'1rem'}} />
            <h4>{selectedProduct.name}</h4>
            {selectedProduct.category && (
              <span style={{display:'inline-block',background:'#e9ecef',borderRadius:'4px',padding:'0.15rem 0.6rem',fontSize:'0.85em',marginBottom:'0.5rem',color:'#555'}}>{selectedProduct.category}</span>
            )}
            {selectedProduct.description && (
              <p style={{fontSize:'0.9em',color:'#555',margin:'0.5rem 0 0.75rem'}}>{selectedProduct.description}</p>
            )}
            <div style={{margin:'1rem 0',fontSize:'1.05em',color:'#444'}}>
              <strong>Summary:</strong><br/>
              Size: {selectedSize || <span style={{color:'#c00'}}>Not selected</span>}, Quantity: {quantity}, Currency: {currency}<br/>
              Total: {currency} {selectedTotalPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div style={{margin:'1rem 0'}}>
              <label htmlFor="currency-select" className="mb-1">Currency:</label>
              <select
                id="currency-select"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                style={{marginLeft:'0.5rem',padding:'0.3rem 1rem',borderRadius:'6px',border:'1px solid #ccc'}}
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="UGX">UGX</option>
                <option value="KES">KES</option>
              </select>
            </div>
            <p className="fw-bold">
              <span>{currency} </span>
              {selectedTotalPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <div style={{margin:'1rem 0'}}>
              <div className="mb-2 d-flex align-items-center gap-2">
                <span className="fw-semibold">Select Size:</span>
                {(selectedProduct.size_us || selectedProduct.size_eu) && (
                  <span style={{display:'inline-flex',borderRadius:'6px',overflow:'hidden',border:'1px solid #ccc'}}>
                    {selectedProduct.size_us && (
                      <button
                        onClick={() => { setSizeSystem('US'); setSelectedSize(''); }}
                        style={{padding:'0.2rem 0.7rem',border:'none',background:sizeSystem==='US'?'#007bff':'#f8f9fa',color:sizeSystem==='US'?'#fff':'#444',fontWeight:'bold',cursor:'pointer',fontSize:'0.85em'}}
                      >US</button>
                    )}
                    {selectedProduct.size_eu && (
                      <button
                        onClick={() => { setSizeSystem('EU'); setSelectedSize(''); }}
                        style={{padding:'0.2rem 0.7rem',border:'none',background:sizeSystem==='EU'?'#007bff':'#f8f9fa',color:sizeSystem==='EU'?'#fff':'#444',fontWeight:'bold',cursor:'pointer',fontSize:'0.85em'}}
                      >EU</button>
                    )}
                  </span>
                )}
              </div>
              {(() => {
                const sizeStr = sizeSystem === 'EU' ? selectedProduct.size_eu : selectedProduct.size_us;
                const sizes = parseSizes(sizeStr);
                const fallback = ['XS','S','M','L','XL','XXL'];
                const displaySizes = sizes.length > 0 ? sizes : fallback;
                return displaySizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      margin:'0 0.25rem 0.5rem 0',
                      padding:'0.5rem 1.2rem',
                      borderRadius:'6px',
                      border:selectedSize===size?'2px solid #007bff':'1px solid #ccc',
                      background:selectedSize===size?'#007bff':'#f8f9fa',
                      color:selectedSize===size?'#fff':'#222',
                      fontWeight:'bold',
                      cursor:'pointer',
                      outline:'none'
                    }}
                    aria-pressed={selectedSize===size}
                  >
                    {size}
                  </button>
                ));
              })()}
              {!selectedSize && <div style={{color:'#c00',fontSize:'0.95em',marginTop:'0.5rem'}}>Please select a size.</div>}
            </div>
            <div style={{margin:'1rem 0'}}>
              <div className="mb-2">Quantity:</div>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                style={{padding:'0.4rem 1rem',fontSize:'1.2rem',marginRight:'0.5rem',borderRadius:'6px',border:'1px solid #ccc',background:'#f8f9fa',cursor:'pointer'}}
                aria-label="Decrease quantity"
              >-</button>
              <input
                type="number"
                min={1}
                max={10}
                value={quantity}
                onChange={e => {
                  let val = Number.parseInt(e.target.value, 10);
                  if (Number.isNaN(val)) val = 1;
                  setQuantity(Math.max(1, Math.min(10, val)));
                }}
                style={{width:'3rem',textAlign:'center',fontSize:'1.1rem',marginRight:'0.5rem',borderRadius:'6px',border:'1px solid #ccc'}}
              />
              <button
                onClick={() => setQuantity(q => Math.min(10, q + 1))}
                style={{padding:'0.4rem 1rem',fontSize:'1.2rem',borderRadius:'6px',border:'1px solid #ccc',background:'#f8f9fa',cursor:'pointer'}}
                aria-label="Increase quantity"
              >+</button>
            </div>
            <div style={{display:'flex',gap:'1rem',marginTop:'1.5rem'}}>
              <button
                className="btn btn-success"
                style={{flex:1,background:'#28a745',border:'none',color:'#fff',fontWeight:'bold',padding:'0.7rem 0'}}
                disabled={!selectedSize}
                onClick={() => {
                  if (!selectedProduct || !selectedSize) return;
                  addToCart({
                    id: selectedProduct.id,
                    name: selectedProduct.name,
                    image: selectedProduct.image,
                    price: Number(selectedUnitPrice.toFixed(2)),
                    size: selectedSize,
                    quantity: quantity,
                    currency: currency,
                  });
                  setSelectedProduct(null);
                  resetModalState();
                }}
              >Add to Cart</button>
              <button
                className="btn btn-primary"
                style={{flex:1,background:'#007bff',border:'none',color:'#fff',fontWeight:'bold',padding:'0.7rem 0'}}
                disabled={!selectedSize}
                onClick={() => {
                  if (!selectedProduct || !selectedSize) return;
                  addToCart({
                    id: selectedProduct.id,
                    name: selectedProduct.name,
                    image: selectedProduct.image,
                    price: Number(selectedUnitPrice.toFixed(2)),
                    size: selectedSize,
                    quantity: quantity,
                    currency: currency,
                  });
                  // Optionally, redirect to cart page here if desired
                  setSelectedProduct(null);
                  resetModalState();
                }}
              >Checkout</button>
            </div>
            {/* Cart message removed, now handled by persistent cart context */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
