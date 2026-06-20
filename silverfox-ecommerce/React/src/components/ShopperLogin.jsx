import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ShopperLogin() {
  const navigate = useNavigate();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && user) navigate('/account/orders', { replace: true });
  }, [loading, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      navigate('/account/orders');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="container py-5 text-center text-muted">Checking session...</div>;
  }

  return (
    <div className="container py-5" style={{ maxWidth: '420px' }}>
      <h2 className="sf-section-title mb-2">Sign In</h2>
      <p className="text-center text-muted small mb-4">Access your order history and saved details.</p>
      <form onSubmit={handleSubmit} className="p-4" style={{ background: 'var(--sf-cream)', border: '1px solid var(--sf-border)' }}>
        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="shopper-email">Email</label>
          <input id="shopper-email" type="email" className="form-control" style={{ borderRadius: 0 }} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="shopper-pass">Password</label>
          <input id="shopper-pass" type="password" className="form-control" style={{ borderRadius: 0 }} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        {error && <div className="alert alert-danger py-2 small">{error}</div>}
        <button type="submit" className="btn sf-btn-gold w-100">Sign In</button>
      </form>
      <p className="text-center mt-3 small">
        No account? <Link to="/signup">Create one</Link> · <Link to="/shop">Back to shop</Link>
      </p>
    </div>
  );
}
