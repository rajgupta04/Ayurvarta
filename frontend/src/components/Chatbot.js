import React, { useRef, useState } from 'react';
import styles from './Chatbot.module.css';
import { isGroqConfigured, sendAyurvedaChat } from '../api/ai';

const SUGGESTIONS = [
  'What is my Dosha?',
  'Suggest an Ayurvedic diet',
  'Daily routine for Vata',
  'Foods to avoid for Pitta',
  'Lifestyle tips for Kapha',
  'What is Prakriti vs Vikriti?'
];

const systemPreamble = `You are an Ayurveda assistant powered by AyurVarta. Provide clear, friendly guidance rooted in classical Ayurveda.
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

  const send = async (text) => {
    if (!text || busy) return;
    const userText = text.trim();
    const nextHistory = [...messages, { role: 'user', text: userText }];
    setMessages(nextHistory);
    setInput('');
    setBusy(true);
    try {
      const reply = await sendAyurvedaChat({
        systemPrompt: systemPreamble,
        messages: nextHistory,
      });
      setMessages((m) => [...m, { role: 'bot', text: reply }]);
    } catch (err) {
      const msg = err?.message === 'GROQ_API_KEY_MISSING'
        ? 'I could not reach Groq. Please set REACT_APP_GROQ_API_KEY or sign in to use the backend AI proxy.'
        : 'There was an error generating a response from Groq.';
      setMessages((m) => [...m, { role: 'bot', text: msg }]);
    } finally {
      setBusy(false);
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
              <div className={styles.title}>AyurVarta Chat (Groq)</div>
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

          {!isGroqConfigured() && (
            <div className={styles.notice}>
              Set REACT_APP_GROQ_API_KEY in your environment to enable local Groq AI responses.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;
