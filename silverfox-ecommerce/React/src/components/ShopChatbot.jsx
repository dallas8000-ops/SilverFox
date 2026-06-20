import React, { useState, useRef, useEffect } from 'react';

export default function ShopChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello — I'm the SilverFox style assistant. Ask about sizing, shipping from Kampala, or men's categories." },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async (text) => {
    const msg = text.trim();
    if (!msg || sending) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: msg }]);
    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: messages.slice(-6) }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: 'assistant', text: data.reply || 'How can I help with your order?' }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: 'Connection issue — email info@silverfox.com for help.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="sf-chat-toggle"
        aria-label="Open style assistant"
      >
        {open ? '×' : '💬'}
      </button>
      {open && (
        <div className="sf-chat-panel">
          <div className="sf-chat-header">SilverFox Assistant</div>
          <div className="sf-chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`sf-chat-bubble sf-chat-${m.role}`}>{m.text}</div>
            ))}
            <div ref={bottomRef} />
          </div>
          <form
            className="sf-chat-input-row"
            onSubmit={(e) => { e.preventDefault(); send(input); }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sizes, shipping..."
              disabled={sending}
            />
            <button type="submit" className="sf-filter-btn" disabled={sending}>Send</button>
          </form>
        </div>
      )}
    </>
  );
}
