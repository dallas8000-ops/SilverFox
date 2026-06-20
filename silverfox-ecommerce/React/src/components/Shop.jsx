import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productImageUrl } from '../utils/productImageUrl';
import { MENS_CATEGORIES, ALL_CATEGORY_SLUG } from '../data/categories';
import ShopChatbot from './ShopChatbot';

const PRICE_RANGES = [
  { label: 'All prices', min: 0, max: Infinity },
  { label: 'Under €75', min: 0, max: 75 },
  { label: '€75 – €150', min: 75, max: 150 },
  { label: '€150 – €300', min: 150, max: 300 },
  { label: 'Over €300', min: 300, max: Infinity },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [sizeSystem, setSizeSystem] = useState('EU');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRangeIdx, setPriceRangeIdx] = useState(0);
  const [sizeHint, setSizeHint] = useState('');
  const [fxRates, setFxRates] = useState({ EUR: 1, USD: 1.08, UGX: 4300, KES: 140 });
  const { addToCart } = useCart();

  const activeCategory = searchParams.get('category') || ALL_CATEGORY_SLUG;
  const priceRange = PRICE_RANGES[priceRangeIdx];

  const setCategory = (category) => {
    const next = new URLSearchParams(searchParams);
    if (category === ALL_CATEGORY_SLUG) next.delete('category');
    else next.set('category', category);
    setSearchParams(next);
  };

  const resetModalState = () => {
    setSelectedSize('');
    setQuantity(1);
    setCurrency('EUR');
    setSizeHint('');
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        setProducts(await res.json());
        const ratesRes = await fetch('/api/exchange-rates');
        if (ratesRes.ok) {
          const ratesData = await ratesRes.json();
          if (ratesData?.rates) {
            setFxRates({
              EUR: Number(ratesData.rates.EUR || 1),
              USD: Number(ratesData.rates.USD || 1.08),
              UGX: Number(ratesData.rates.UGX || 4300),
              KES: Number(ratesData.rates.KES || 140),
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

  const parseSizes = (str) => {
    if (!str || typeof str !== 'string') return [];
    return str.split(',').map((s) => s.trim()).filter(Boolean);
  };

  const validProducts = products
    .filter((p) => {
      if (brokenImageIds.includes(p.id)) return false;
      if (!p.image || typeof p.image !== 'string') return false;
      const trimmed = p.image.trim();
      if (!trimmed) return false;
      if (['undefined', 'null', 'broken.jpg', 'broken.png'].includes(trimmed.toLowerCase())) return false;
      if (activeCategory !== ALL_CATEGORY_SLUG && p.category !== activeCategory) return false;
      const price = Number(p.price) || 0;
      if (price < priceRange.min || price > priceRange.max) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!(p.name || '').toLowerCase().includes(q) && !(p.category || '').toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .slice()
    .sort((a, b) => {
      const valA = sortBy === 'price' ? Number(a.price) || 0 : (a.name || '').toLowerCase();
      const valB = sortBy === 'price' ? Number(b.price) || 0 : (b.name || '').toLowerCase();
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const selectedBasePrice = Number(selectedProduct?.price || 0);
  const selectedRate = Number(fxRates[currency] || 1);
  const selectedUnitPrice = selectedBasePrice * selectedRate;
  const selectedTotalPrice = selectedUnitPrice * quantity;

  const requestSizeRecommend = async () => {
    if (!selectedProduct) return;
    try {
      const res = await fetch('/api/size-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          category: selectedProduct.category,
          sizeSystem,
        }),
      });
      const data = await res.json();
      if (data.recommended) {
        setSelectedSize(data.recommended);
        setSizeHint(data.message || `Suggested size: ${data.recommended}`);
      }
    } catch {
      setSizeHint('Size guide unavailable — pick the size you usually wear.');
    }
  };

  if (loading) {
    return <div className="text-center py-5" style={{ minHeight: '50vh' }}>Loading shop...</div>;
  }
  if (error) {
    return <div className="text-center py-5 text-danger">{error}</div>;
  }

  return (
    <>
      <div className="sf-catalog-header">
        <div className="container">
          <p className="text-uppercase mb-2" style={{ color: 'var(--sf-gold)', letterSpacing: '0.15em', fontSize: '0.7rem' }}>
            Shipped from Kampala · Worldwide delivery
          </p>
          <h1>Shop</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            Premium men's fashion — suits, shirts, trousers, shoes &amp; accessories
          </p>
        </div>
      </div>

      <div className="sf-catalog-filters">
        <div className="container">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
            <button type="button" className={`sf-filter-btn${activeCategory === ALL_CATEGORY_SLUG ? ' active' : ''}`} onClick={() => setCategory(ALL_CATEGORY_SLUG)}>All</button>
            {MENS_CATEGORIES.map((cat) => (
              <button key={cat.slug} type="button" className={`sf-filter-btn${activeCategory === cat.slug ? ' active' : ''}`} onClick={() => setCategory(cat.slug)}>{cat.name}</button>
            ))}
          </div>
          <div className="d-flex flex-wrap align-items-center gap-3">
            <input type="search" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="form-control form-control-sm" style={{ maxWidth: '200px', borderRadius: 0 }} />
            <select value={priceRangeIdx} onChange={(e) => setPriceRangeIdx(Number(e.target.value))} className="form-select form-select-sm" style={{ width: 'auto', borderRadius: 0 }}>
              {PRICE_RANGES.map((r, i) => <option key={r.label} value={i}>{r.label}</option>)}
            </select>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="form-select form-select-sm" style={{ width: 'auto', borderRadius: 0 }} aria-label="Display currency">
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="UGX">UGX</option>
              <option value="KES">KES</option>
            </select>
            <div className="d-flex align-items-center gap-2 ms-auto">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-select form-select-sm" style={{ width: 'auto', borderRadius: 0 }}>
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select>
              <button type="button" onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))} className="sf-filter-btn">{sortDir === 'asc' ? '↑' : '↓'}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <p className="text-muted small mb-4">{validProducts.length} product{validProducts.length !== 1 ? 's' : ''}</p>
        <div className="row g-4">
          {validProducts.length === 0 ? (
            <div className="col-12 text-center py-5 text-muted">No products match your filters.</div>
          ) : (
            validProducts.map((product) => {
              const displayPrice = (Number(product.price) || 0) * (fxRates[currency] || 1);
              return (
                <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={product.id}>
                  <button type="button" className="sf-product-card w-100 text-start border-0" onClick={() => { resetModalState(); setSelectedProduct(product); }}>
                    <img src={productImageUrl(product.image)} alt={product.name} onError={() => setBrokenImageIds((prev) => prev.includes(product.id) ? prev : [...prev, product.id])} />
                    <div className="sf-product-card-body">
                      {product.category && <div className="sf-product-category">{product.category}</div>}
                      <div className="sf-product-name">{product.name}</div>
                      <div className="sf-product-price">{currency} {displayPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    </div>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedProduct && (
        <div className="sf-modal-overlay" onClick={() => { setSelectedProduct(null); resetModalState(); }} role="button" tabIndex={0} aria-label="Close" onKeyDown={(e) => { if (e.key === 'Escape') { setSelectedProduct(null); resetModalState(); } }}>
          <div className="sf-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => { setSelectedProduct(null); resetModalState(); }} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }} aria-label="Close">&times;</button>
            <img src={productImageUrl(selectedProduct.image)} alt={selectedProduct.name} style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', marginBottom: '1rem', background: 'var(--sf-cream)' }} />
            <h4 className="sf-display fw-bold">{selectedProduct.name}</h4>
            {selectedProduct.category && <span className="sf-product-category d-inline-block mb-2">{selectedProduct.category}</span>}
            {selectedProduct.description && <p style={{ fontSize: '0.9em', color: 'var(--sf-text-muted)' }}>{selectedProduct.description}</p>}
            <p className="fw-bold fs-5">{currency} {selectedTotalPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            <div className="mb-3">
              <span className="fw-semibold small me-2">Size ({sizeSystem}):</span>
              {(selectedProduct.size_us || selectedProduct.size_eu) && (
                <span style={{ display: 'inline-flex', border: '1px solid var(--sf-border)' }}>
                  {selectedProduct.size_us && <button type="button" onClick={() => { setSizeSystem('US'); setSelectedSize(''); }} className={`sf-size-btn${sizeSystem === 'US' ? ' selected' : ''}`} style={{ margin: 0 }}>US</button>}
                  {selectedProduct.size_eu && <button type="button" onClick={() => { setSizeSystem('EU'); setSelectedSize(''); }} className={`sf-size-btn${sizeSystem === 'EU' ? ' selected' : ''}`} style={{ margin: 0 }}>EU</button>}
                </span>
              )}
              <button type="button" className="sf-filter-btn ms-2" onClick={requestSizeRecommend}>Size guide</button>
            </div>
            {(() => {
              const sizes = parseSizes(sizeSystem === 'EU' ? selectedProduct.size_eu : selectedProduct.size_us);
              const display = sizes.length ? sizes : ['S', 'M', 'L', 'XL'];
              return display.map((size) => (
                <button key={size} type="button" onClick={() => setSelectedSize(size)} className={`sf-size-btn${selectedSize === size ? ' selected' : ''}`}>{size}</button>
              ));
            })()}
            {sizeHint && <p className="small text-muted mt-2">{sizeHint}</p>}
            {!selectedSize && <p className="small text-danger">Please select a size.</p>}
            <div className="mt-3 mb-3">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="sf-size-btn">-</button>
              <span className="mx-2">{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => Math.min(10, q + 1))} className="sf-size-btn">+</button>
            </div>
            <div className="d-flex gap-2">
              <button type="button" className="btn sf-btn-gold flex-fill" disabled={!selectedSize} onClick={() => {
                if (!selectedProduct || !selectedSize) return;
                addToCart({ id: selectedProduct.id, name: selectedProduct.name, image: selectedProduct.image, price: Number(selectedUnitPrice.toFixed(2)), size: selectedSize, quantity, currency });
                setSelectedProduct(null); resetModalState();
              }}>Add to Cart</button>
            </div>
          </div>
        </div>
      )}

      <ShopChatbot />
    </>
  );
}
