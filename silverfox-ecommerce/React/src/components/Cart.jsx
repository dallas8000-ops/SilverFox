import React, { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { productImageUrl } from '../utils/productImageUrl';

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [provider, setProvider] = useState('MTN');
  const [phone, setPhone] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paying, setPaying] = useState(false);

  const totalsByCurrency = useMemo(() => {
    return cart.reduce((acc, item) => {
      const curr = item.currency || 'EUR';
      const line = (Number(item.price) || 0) * (Number(item.quantity) || 0);
      acc[curr] = (acc[curr] || 0) + line;
      return acc;
    }, {});
  }, [cart]);

  const checkoutCurrency = useMemo(() => {
    const currencies = Object.keys(totalsByCurrency);
    return currencies.length === 1 ? currencies[0] : null;
  }, [totalsByCurrency]);

  const checkoutAmount = checkoutCurrency ? totalsByCurrency[checkoutCurrency] : 0;

  const handleInitiatePayment = async () => {
    setPaymentStatus(null);
    if (cart.length === 0) {
      setPaymentStatus({ type: 'error', text: 'Cart is empty.' });
      return;
    }
    if (!checkoutCurrency) {
      setPaymentStatus({ type: 'error', text: 'Use one currency in cart before initiating payment.' });
      return;
    }
    if (!phone.trim()) {
      setPaymentStatus({ type: 'error', text: 'Enter customer phone number.' });
      return;
    }
    setPaying(true);
    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          amount: Number(checkoutAmount.toFixed(2)),
          currency: checkoutCurrency,
          phone: phone.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Payment initiation failed.');
      }
      setPaymentStatus({
        type: 'success',
        text: `${provider} request created (${data.reference || 'pending reference'}).`,
      });
    } catch (err) {
      setPaymentStatus({ type: 'error', text: err.message || 'Payment request failed.' });
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="container py-5 min-vh-100">
      <h2 className="mb-4 text-center">Shopping Cart</h2>
      {cart.length === 0 ? (
        <div className="text-center">Your cart is empty.</div>
      ) : (
        <>
          <div className="alert alert-warning" role="alert">
            Demo mode: mobile-money payment flow is integration-ready, but provider finalization (MTN/Airtel/M-Pesa API keys, webhooks, and confirmation callbacks) is pending.
          </div>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Product</th>
                <th>Size</th>
                <th>Quantity</th>
                <th>Currency</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {item.image ? (
                        <img src={productImageUrl(item.image)} alt={item.name} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 6 }} />
                      ) : null}
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td>{item.size}</td>
                  <td>{item.quantity}</td>
                  <td>{item.currency}</td>
                  <td>{(item.price * item.quantity).toLocaleString()} {item.currency}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => removeFromCart(idx)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-end mb-3">
            <button className="btn btn-secondary" onClick={clearCart}>Clear Cart</button>
          </div>
          <div className="card p-3">
            <h5 className="mb-3">Mobile Money Checkout</h5>
            <div className="mb-2 small text-muted">
              Total: {checkoutCurrency ? `${Number(checkoutAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${checkoutCurrency}` : 'Mixed currencies in cart'}
            </div>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <select className="form-select" style={{ maxWidth: 180 }} value={provider} onChange={(e) => setProvider(e.target.value)}>
                <option value="MTN">MTN</option>
                <option value="AIRTEL">Airtel</option>
                <option value="MPESA">M-Pesa</option>
              </select>
              <input
                className="form-control"
                style={{ maxWidth: 240 }}
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleInitiatePayment} disabled={paying || !checkoutCurrency}>
                {paying ? 'Sending...' : `Pay with ${provider === 'MPESA' ? 'M-Pesa' : provider}`}
              </button>
            </div>
            {paymentStatus && (
              <div className={`mt-2 ${paymentStatus.type === 'success' ? 'text-success' : 'text-danger'}`}>
                {paymentStatus.text}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
