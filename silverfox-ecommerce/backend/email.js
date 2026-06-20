/**
 * Optional SMTP email (Gmail-compatible). Skips silently when not configured.
 */
const nodemailer = require('nodemailer');

let transporter = null;

function isEmailConfigured() {
  return Boolean(
    process.env.EMAIL_HOST_USER &&
    process.env.EMAIL_HOST_PASSWORD &&
    process.env.CONTACT_RECIPIENT_EMAIL
  );
}

function getTransporter() {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_USE_TLS === 'false',
      auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD,
      },
    });
  }
  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  const tx = getTransporter();
  if (!tx) {
    console.log('[email] SMTP not configured — skipping:', subject);
    return { sent: false, reason: 'not_configured' };
  }
  const from = process.env.EMAIL_FROM || process.env.EMAIL_HOST_USER;
  try {
    await tx.sendMail({ from, to, subject, text, html: html || text });
    return { sent: true };
  } catch (err) {
    console.error('[email] send failed:', err.message);
    return { sent: false, reason: err.message };
  }
}

async function notifyContactInquiry({ name, email, subject, message }) {
  const to = process.env.CONTACT_RECIPIENT_EMAIL;
  return sendMail({
    to,
    subject: `[SilverFox Contact] ${subject || 'New inquiry'} — ${name}`,
    text: `From: ${name} <${email}>\nSubject: ${subject || '(none)'}\n\n${message}`,
  });
}

async function notifyNewOrder(order) {
  const to = process.env.ORDER_ALERT_EMAIL || process.env.CONTACT_RECIPIENT_EMAIL;
  if (!to) return { sent: false, reason: 'no_recipient' };
  const lines = [
    `Order: ${order.orderReference}`,
    `Customer: ${order.name} <${order.email}>`,
    `Phone: ${order.phone}`,
    `Country: ${order.country}`,
    `Address: ${order.address}`,
    `Payment: ${order.paymentMethod}`,
    `Total: ${order.currency} ${order.total}`,
    `Notes: ${order.notes || '(none)'}`,
    `Items: ${order.itemsJson || '(see admin)'}`,
  ];
  return sendMail({
    to,
    subject: `[SilverFox Order] ${order.orderReference} — ${order.name}`,
    text: lines.join('\n'),
  });
}

module.exports = { sendMail, notifyContactInquiry, notifyNewOrder, isEmailConfigured };
