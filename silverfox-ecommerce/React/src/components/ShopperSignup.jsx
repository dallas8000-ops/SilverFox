import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ShopperSignup() {
  const navigate = useNavigate();
  const { user, loading, signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && user) navigate('/account/orders', { replace: true });
  }, [loading, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      await signup({ email, password, name });
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
      <h2 className="sf-section-title mb-2">Create Account</h2>
      <p className="text-center text-muted small mb-4">Track orders and checkout faster next time.</p>
      <form onSubmit={handleSubmit} className="p-4" style={{ background: 'var(--sf-cream)', border: '1px solid var(--sf-border)' }}>
        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="signup-name">Full name</label>
          <input id="signup-name" className="form-control" style={{ borderRadius: 0 }} value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="signup-email">Email</label>
          <input id="signup-email" type="email" className="form-control" style={{ borderRadius: 0 }} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="signup-pass">Password</label>
          <input id="signup-pass" type="password" className="form-control" style={{ borderRadius: 0 }} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
        </div>
        {error && <div className="alert alert-danger py-2 small">{error}</div>}
        <button type="submit" className="btn sf-btn-gold w-100">Create Account</button>
      </form>
      <p className="text-center mt-3 small">
        Already have an account? <Link to="/login">Sign in</Link> · <Link to="/shop">Back to shop</Link>
      </p>
    </div>
  );
}
