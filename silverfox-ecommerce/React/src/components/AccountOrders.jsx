import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const fetchOpts = { credentials: 'include' };

export default function AccountOrders() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/account/orders', fetchOpts)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setOrders(d.orders || []);
      })
      .catch((e) => setError(e.message));
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/shop');
  };

  if (loading || !user) {
    return <div className="container py-5 text-center text-muted">Loading account...</div>;
  }

  return (
    <div className="container py-5" style={{ maxWidth: '900px' }}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h2 className="sf-section-title mb-1">My Orders</h2>
          <p className="text-muted small mb-0">{user.displayName || user.email}</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/shop" className="btn btn-outline-secondary btn-sm">Continue Shopping</Link>
          <button type="button" className="btn btn-outline-dark btn-sm" onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {orders.length === 0 && !error && (
        <div className="text-center py-5 text-muted">
          <p>No orders yet.</p>
          <Link to="/shop" className="btn sf-btn-gold">Browse the Shop</Link>
        </div>
      )}

      {orders.length > 0 && (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                let items = [];
                try {
                  items = JSON.parse(o.items_json || '[]');
                } catch { /* ignore */ }
                return (
                  <tr key={o.id}>
                    <td className="fw-semibold">{o.order_reference || `#${o.id}`}</td>
                    <td>{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</td>
                    <td>{o.currency} {Number(o.total || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td><span className="badge text-bg-secondary">{o.status || 'pending'}</span></td>
                    <td className="small text-muted">{items.length} item(s)</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
