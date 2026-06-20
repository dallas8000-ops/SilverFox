import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const fetchOpts = { credentials: 'include' };

export default function StaffLogin() {
  const navigate = useNavigate();
  const [loginUser, setLoginUser] = useState('admin');
  const [loginPass, setLoginPass] = useState('');
  const [loginErr, setLoginErr] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/admin/status', fetchOpts)
      .then((r) => r.json())
      .then((d) => {
        if (d.admin) navigate('/staff/dashboard', { replace: true });
      })
      .finally(() => setChecking(false));
  }, [navigate]);

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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoginErr(data.error || 'Invalid credentials. Use admin / admin.');
        return;
      }
      navigate('/staff/dashboard');
    } catch {
      setLoginErr('Could not reach server — is the backend running?');
    }
  };

  if (checking) {
    return <div className="container py-5 text-center text-muted">Checking session...</div>;
  }

  return (
    <div className="container py-5" style={{ maxWidth: '420px' }}>
      <h2 className="sf-section-title mb-2">Staff Login</h2>
      <p className="text-center text-muted small mb-4">Username: <strong>admin</strong> · Password: <strong>admin</strong></p>
      <form onSubmit={handleLogin} className="p-4" style={{ background: 'var(--sf-cream)', border: '1px solid var(--sf-border)' }}>
        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="staff-user">Username</label>
          <input id="staff-user" className="form-control" style={{ borderRadius: 0 }} value={loginUser} onChange={(e) => setLoginUser(e.target.value)} required autoComplete="username" />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="staff-pass">Password</label>
          <input id="staff-pass" type="password" className="form-control" style={{ borderRadius: 0 }} value={loginPass} onChange={(e) => setLoginPass(e.target.value)} required autoComplete="current-password" />
        </div>
        {loginErr && <div className="alert alert-danger py-2 small">{loginErr}</div>}
        <button type="submit" className="btn sf-btn-gold w-100">Sign In</button>
      </form>
      <p className="text-center mt-3 small"><Link to="/shop">← Back to shop</Link></p>
    </div>
  );
}
