import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', country: '', address: '', paymentMethod: 'MTN', notes: '',
  });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const totalsByCurrency = useMemo(() => {
    return cart.reduce((acc, item) => {
      const curr = item.currency || 'EUR';
      acc[curr] = (acc[curr] || 0) + (Number(item.price) || 0) * (Number(item.quantity) || 0);
      return acc;
    }, {});
  }, [cart]);

  const currencies = Object.keys(totalsByCurrency);
  const currency = currencies.length === 1 ? currencies[0] : 'EUR';
  const total = totalsByCurrency[currency] || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      setStatus({ type: 'error', text: 'Your cart is empty.' });
      return;
    }
    if (currencies.length > 1) {
      setStatus({ type: 'error', text: 'Use one currency in your cart before checkout.' });
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, currency, items: cart, total }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      clearCart();
      setStatus({
        type: 'success',
        text: `Order ${data.orderReference} received! Complete payment via ${form.paymentMethod}. Our team will confirm and dispatch from Kampala.`,
      });
      setTimeout(() => navigate('/shop'), 4000);
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0 && !status) {
    return (
      <div className="container py-5 text-center">
        <h2 className="sf-section-title">Checkout</h2>
        <p className="text-muted mb-4">Your cart is empty.</p>
        <Link to="/shop" className="btn sf-btn-gold">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: '720px' }}>
      <h2 className="sf-section-title mb-4">Checkout</h2>
      {status && <div className={`alert alert-${status.type === 'success' ? 'success' : 'danger'}`}>{status.text}</div>}
      {status?.type !== 'success' && (
        <>
          <div className="mb-4 p-3" style={{ background: 'var(--sf-cream)', border: '1px solid var(--sf-border)' }}>
            <strong>{cart.length} item(s)</strong> — Total: {currency} {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Full name</label>
                <input className="form-control" style={{ borderRadius: 0 }} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Email</label>
                <input type="email" className="form-control" style={{ borderRadius: 0 }} required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Phone (mobile money)</label>
                <input className="form-control" style={{ borderRadius: 0 }} required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Country</label>
                <input className="form-control" style={{ borderRadius: 0 }} required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Shipping address</label>
                <textarea className="form-control" rows={2} style={{ borderRadius: 0 }} required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Payment method</label>
                <select className="form-select" style={{ borderRadius: 0 }} value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                  <option value="MTN">MTN Mobile Money</option>
                  <option value="AIRTEL">Airtel Money</option>
                  <option value="MPESA">M-Pesa</option>
                  <option value="BANK">Bank transfer</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Order notes (optional)</label>
                <textarea className="form-control" rows={2} style={{ borderRadius: 0 }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <p className="small text-muted mt-3">Payment is confirmed by our team after you complete mobile money or bank transfer. You will receive dispatch details by email.</p>
            <button type="submit" className="btn sf-btn-gold w-100 mt-3" disabled={submitting}>{submitting ? 'Placing order...' : 'Place Order'}</button>
          </form>
        </>
      )}
    </div>
  );
}
