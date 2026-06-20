import React, { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setStatus({ type: 'success', text: 'Message received — our team will reply soon.' });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '640px' }}>
      <h2 className="sf-section-title mb-2">Contact</h2>
      <p className="text-center text-muted mb-4">Questions about sizing, shipping, or a custom order? We ship from Kampala worldwide.</p>
      {status && (
        <div className={`alert alert-${status.type === 'success' ? 'success' : 'danger'}`}>{status.text}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="contact-name">Name</label>
          <input id="contact-name" className="form-control" style={{ borderRadius: 0 }} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="contact-email">Email</label>
          <input id="contact-email" type="email" className="form-control" style={{ borderRadius: 0 }} required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="contact-subject">Subject</label>
          <input id="contact-subject" className="form-control" style={{ borderRadius: 0 }} required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="contact-message">Message</label>
          <textarea id="contact-message" className="form-control" rows={5} style={{ borderRadius: 0 }} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </div>
        <button type="submit" className="btn sf-btn-gold w-100" disabled={sending}>{sending ? 'Sending...' : 'Send Message'}</button>
      </form>
      <div className="text-center mt-4 text-muted small">
        <p className="mb-1">info@silverfox.com</p>
        <p>Kampala, Uganda · Worldwide shipping</p>
      </div>
    </div>
  );
}
