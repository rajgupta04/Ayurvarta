// Commit on 2026-03-09
import React, { useMemo, useRef, useState } from 'react';
import styles from './Chatbot.module.css';

let GenAI;
try {
  // Lazy require to avoid issues if package not installed yet during import graph
  // eslint-disable-next-line global-require
  GenAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (e) {
  GenAI = null;
}

const SUGGESTIONS = [
  'What is my Dosha?',
  'Suggest an Ayurvedic diet',
  'Daily routine for Vata',
  'Foods to avoid for Pitta',
  'Lifestyle tips for Kapha',
  'What is Prakriti vs Vikriti?'
];

const systemPreamble = `You are an Ayurveda assistant. Provide clear, friendly guidance rooted in classical Ayurveda.
Avoid medical claims; suggest consulting a qualified practitioner for serious concerns.
When asked for diet tips, tailor to doshas when possible and prefer general principles if dosha unknown.`;

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Namaste! I can help with doshas, personalized diet tips, and Ayurvedic routines. How can I assist you today?' }
  ]);
  const listRef = useRef(null);

  const client = useMemo(() => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!GenAI || !apiKey) return null;
    try { return new GenAI(apiKey); } catch { return null; }
  }, []);

  const send = async (text) => {
    if (!text || busy) return;
    const userText = text.trim();
    setMessages((m) => [...m, { role: 'user', text: userText }]);
    setInput('');
    setBusy(true);
    try {
      let reply = 'I could not reach the model. Please check your API key.';
      if (client) {
        const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `${systemPreamble}\nUser: ${userText}`;
        const result = await model.generateContent(prompt);
        const r = await result.response;
        reply = (r && r.text) ? r.text() : 'Sorry, I could not formulate a response.';
      }
      setMessages((m) => [...m, { role: 'bot', text: reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'bot', text: 'There was an error generating a response.' }]);
    } finally {
      setBusy(false);
      // Scroll to bottom
      setTimeout(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
      }, 30);
    }
  };

  return (
    <div className={styles.chatbotRoot}>
      <div className={styles.launcher}>
        {!open && (
          <button className={styles.bubbleLabel} onClick={() => setOpen(true)} aria-label="Open chatbot">
            Chat with me
          </button>
        )}
        <button
          className={styles.bubbleBtn}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close chatbot' : 'Open chatbot'}
        >
          <img src="/images/logo.png" alt="AyurVarta" className={styles.bubbleLogo} />
        </button>
      </div>

      {open && (
  <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.miniLogoWrap}>
                <span className={styles.miniLogoRing} />
                <img src="/images/logo.png" alt="AyurVarta" className={styles.miniLogoImg} />
              </span>
              <div className={styles.title}>AyurVarta Chat</div>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close chatbot">×</button>
          </div>

          <div className={styles.suggestions}>
            {SUGGESTIONS.map((s, idx) => (
              <button key={idx} className={styles.chip} onClick={() => send(s)}>{s}</button>
            ))}
          </div>

          <div className={styles.messages} ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.msg} ${m.role === 'user' ? styles.user : styles.bot}`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className={styles.inputRow}>
            <input
              className={styles.input}
              placeholder="Ask about doshas, diet, routines..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send(input);
              }}
            />
            <button className={styles.sendBtn} onClick={() => send(input)} disabled={busy || !input.trim()}>
              Send
            </button>
          </div>

          {!process.env.REACT_APP_GEMINI_API_KEY && (
            <div className={styles.notice}>
              Set REACT_APP_GEMINI_API_KEY in your environment to enable AI responses.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

