import React from 'react';

export default function Terms() {
  return (
    <div className="container py-5" style={{ maxWidth: '760px' }}>
      <h2 className="sf-section-title mb-4">Terms of Service</h2>
      <div style={{ color: 'var(--sf-text-muted)', lineHeight: 1.8 }}>
        <p><strong>SilverFox</strong> provides premium men's fashion online. By placing an order you agree to these terms.</p>
        <h5 className="sf-display fw-bold mt-4 mb-2" style={{ color: 'var(--sf-slate)' }}>Orders &amp; Payment</h5>
        <p>Orders are confirmed after staff verify payment. We accept mobile money (MTN, Airtel, M-Pesa) and bank transfer instructions provided at checkout. Payment must be completed before dispatch.</p>
        <h5 className="sf-display fw-bold mt-4 mb-2" style={{ color: 'var(--sf-slate)' }}>Shipping</h5>
        <p>We ship from Kampala, Uganda to customers worldwide. Delivery times vary by destination. Shipping costs are quoted at checkout where applicable.</p>
        <h5 className="sf-display fw-bold mt-4 mb-2" style={{ color: 'var(--sf-slate)' }}>Returns</h5>
        <p>Unworn items in original condition may be returned within 14 days of delivery. Contact us before returning any item.</p>
        <h5 className="sf-display fw-bold mt-4 mb-2" style={{ color: 'var(--sf-slate)' }}>Contact</h5>
        <p>Questions: info@silverfox.com</p>
      </div>
    </div>
  );
}
