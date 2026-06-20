import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const fetchOpts = { credentials: 'include' };
const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'cancelled'];

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const statusRes = await fetch('/api/admin/status', fetchOpts);
      const status = await statusRes.json();
      if (!status.admin) {
        navigate('/staff/login', { replace: true });
        return;
      }
      const res = await fetch('/api/staff/dashboard', fetchOpts);
      if (!res.ok) throw new Error('Failed to load dashboard');
      setData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const updateOrderStatus = async (id, status) => {
    const res = await fetch(`/api/staff/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      ...fetchOpts,
      body: JSON.stringify({ status }),
    });
    if (res.ok) load();
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', ...fetchOpts });
    navigate('/staff/login');
  };

  if (loading) return <div className="container py-5 text-center">Loading dashboard...</div>;
  if (error) return <div className="container py-5 text-danger text-center">{error}</div>;
  if (!data) return null;

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h2 className="sf-section-title mb-0">Staff Dashboard</h2>
        <div className="d-flex gap-2 flex-wrap">
          <Link to="/staff/inventory" className="btn sf-filter-btn">Manage Inventory</Link>
          <button type="button" className="btn sf-filter-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="p-3 text-center" style={{ background: 'var(--sf-cream)', border: '1px solid var(--sf-border)' }}>
            <div className="fs-4 fw-bold">{data.stats.pendingOrders}</div>
            <div className="small text-muted">Pending Orders</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 text-center" style={{ background: 'var(--sf-cream)', border: '1px solid var(--sf-border)' }}>
            <div className="fs-4 fw-bold">{data.stats.totalOrders}</div>
            <div className="small text-muted">Total Orders</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 text-center" style={{ background: 'var(--sf-cream)', border: '1px solid var(--sf-border)' }}>
            <div className="fs-4 fw-bold">{data.stats.lowStockCount}</div>
            <div className="small text-muted">Low Stock</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 text-center" style={{ background: 'var(--sf-cream)', border: '1px solid var(--sf-border)' }}>
            <div className="fs-4 fw-bold">{data.stats.recentInquiries}</div>
            <div className="small text-muted">New Inquiries</div>
          </div>
        </div>
      </div>

      <section className="mb-5">
        <h3 className="sf-display fw-bold h5 mb-3">Recent Orders</h3>
        {data.orders.length === 0 ? (
          <p className="text-muted">No orders yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-bordered align-middle">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o.id}>
                    <td><code>{o.order_reference || `#${o.id}`}</code></td>
                    <td>{o.customer_name}<br /><small className="text-muted">{o.customer_email}</small></td>
                    <td>{o.currency} {Number(o.total).toFixed(2)}</td>
                    <td>{o.payment_method}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        style={{ minWidth: '110px', borderRadius: 0 }}
                        value={o.status || 'pending'}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      >
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="small text-muted">{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="row g-4">
        <div className="col-md-6">
          <h3 className="sf-display fw-bold h5 mb-3">Low Stock</h3>
          {data.lowStock.length === 0 ? (
            <p className="text-muted small">All products adequately stocked.</p>
          ) : (
            <ul className="list-group list-group-flush">
              {data.lowStock.map((p) => (
                <li key={p.id} className="list-group-item d-flex justify-content-between px-0">
                  <span>{p.name}</span>
                  <span className="badge bg-warning text-dark">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="col-md-6">
          <h3 className="sf-display fw-bold h5 mb-3">Recent Inquiries</h3>
          {data.inquiries.length === 0 ? (
            <p className="text-muted small">No contact messages yet.</p>
          ) : (
            <ul className="list-group list-group-flush">
              {data.inquiries.map((q) => (
                <li key={q.id} className="list-group-item px-0">
                  <strong>{q.subject || 'Inquiry'}</strong> — {q.name}<br />
                  <small className="text-muted">{q.email} · {q.created_at ? new Date(q.created_at).toLocaleDateString() : ''}</small>
                  <p className="small mb-0 mt-1">{q.message?.slice(0, 120)}{q.message?.length > 120 ? '…' : ''}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
