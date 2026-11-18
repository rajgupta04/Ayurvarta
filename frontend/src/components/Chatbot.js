import React, { useRef, useState, useEffect } from 'react';
import styles from './Chatbot.module.css';
import {
  sendChatToGroq,
  getGroqApiKey,
  setGroqApiKey,
  getGroqModel,
  isAiConfigured,
  DEFAULT_MODEL
} from '../api/aiService';

const SUGGESTIONS = [
  'What is my Dosha?',
  'Suggest an Ayurvedic diet',
  'Daily routine for Vata',
  'Foods to avoid for Pitta',
  'Lifestyle tips for Kapha',
  'What is Prakriti vs Vikriti?',
];

const systemPreamble = `You are AyurVarta, an intelligent, empathetic Ayurvedic wellness assistant.
Provide clear, friendly guidance deeply rooted in classical Ayurvedic traditions (Charaka Samhita and Ashtanga Hridaya).
Keep answers concise, actionable, and structured with bullet points where appropriate.
Avoid diagnostic medical claims; advise consulting a certified Ayurvedic doctor (Vaidya) for severe symptoms.
Tailor recommendations to Doshas (Vata, Pitta, Kapha) and Agni (digestive fire).`;

function getHeuristicResponse(query) {
  const q = query.toLowerCase();
  if (q.includes('dosha') || q.includes('prakriti') || q.includes('vikriti')) {
    return `In Ayurveda, **Prakriti** is your constitutional baseline decided at conception (Vata, Pitta, or Kapha), while **Vikriti** is your current state of imbalance.\n\n• **Vata**: Governed by Air & Ether (dry, light, cold).\n• **Pitta**: Governed by Fire & Water (hot, sharp, oily).\n• **Kapha**: Governed by Earth & Water (heavy, slow, cool).\n\nTake the **Dosha Quiz** in the navigation bar to assess your exact balance!`;
  }
  if (q.includes('diet') || q.includes('food') || q.includes('eat')) {
    return `General Ayurvedic Diet Wisdom:\n\n1. **Eat seasonally (Ritucharya)**: Warm, cooked foods in winter; cooling, sweet fruits in summer.\n2. **Honor your Agni**: Eat your largest meal at noon when digestive fire peaks with the sun.\n3. **Include the 6 tastes (Shad-Rasa)**: Sweet, Sour, Salty, Pungent, Bitter, and Astringent in daily meals.\n\nVisit the **Diet Plan** page to generate a comprehensive daily chart!`;
  }
  if (q.includes('vata')) {
    return `🌿 **Balancing Vata Dosha**:\n\n• **Qualities**: Dry, light, cold, mobile.\n• **Foods to Favor**: Warm, grounding soups, cooked whole grains (rice, oats), ghee, sweet root vegetables.\n• **Foods to Avoid**: Raw salads, cold drinks, dry crackers.\n• **Routine**: Consistent sleep schedule, warm oil massage (Abhyanga), gentle yoga.`;
  }
  if (q.includes('pitta')) {
    return `🔥 **Balancing Pitta Dosha**:\n\n• **Qualities**: Hot, sharp, intense, oily.\n• **Foods to Favor**: Cooling foods, sweet juicy fruits, cucumbers, coconut water, coriander, mint, ghee.\n• **Foods to Avoid**: Excess chilies, fermented sour foods, alcohol, deep-fried snacks.\n• **Routine**: Avoid mid-day sun, practice calming Sheetali pranayama, rest near water or greenery.`;
  }
  if (q.includes('kapha')) {
    return `💧 **Balancing Kapha Dosha**:\n\n• **Qualities**: Heavy, slow, cool, unctuous.\n• **Foods to Favor**: Warm, light, astringent and pungent foods like ginger, legumes, steamed greens, honey (unheated).\n• **Foods to Avoid**: Dairy, sweets, iced drinks, heavy fried foods.\n• **Routine**: Vigorous morning exercise, wake before 6 AM, dry body brushing (Garshana).`;
  }
  return `Namaste! Ayurveda views wellness as a harmonious balance of body, mind, and nature. I can help guide you with:\n\n• Determining or balancing your **Prakriti** & **Vikriti**\n• Tailoring foods according to your **Agni** (digestive strength)\n• Daily lifestyle practices (**Dinacharya**)\n\nFeel free to ask a specific question, or paste your Groq API key to unlock deep clinical AI reasoning!`;
}

// Simple text formatter for bullet points and bold
function FormattedText({ text }) {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div className={styles.msgContent}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} style={{ height: '6px' }} />;

        // Bullet point
        if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const content = trimmed.replace(/^([•*-]|\d+\.)\s*/, '');
          return (
            <div key={idx} style={{ display: 'flex', gap: '6px', margin: '2px 0 2px 4px' }}>
              <span style={{ color: 'var(--secondary-orange)', fontWeight: 'bold' }}>•</span>
              <span>{renderBold(content)}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
        if (numMatch) {
          return (
            <div key={idx} style={{ display: 'flex', gap: '6px', margin: '2px 0 2px 4px' }}>
              <span style={{ color: 'var(--primary-green)', fontWeight: 'bold', fontSize: '12px' }}>{numMatch[1]}.</span>
              <span>{renderBold(numMatch[2])}</span>
            </div>
          );
        }

        return <p key={idx}>{renderBold(line)}</p>;
      })}
    </div>
  );
}

function renderBold(str) {
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [hasKey, setHasKey] = useState(isAiConfigured());
  const currentModel = getGroqModel();

  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Namaste! I am AyurVarta, your Ayurvedic AI assistant powered by Groq (`' + DEFAULT_MODEL + '`). Ask me anything about your doshas, diet, or wellness routines!',
    },
  ]);

  const listRef = useRef(null);

  useEffect(() => {
    setHasKey(isAiConfigured());
    const existing = getGroqApiKey();
    if (existing) setKeyInput(existing);
  }, [open]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, busy]);

  const handleSaveKey = () => {
    setGroqApiKey(keyInput.trim());
    setHasKey(Boolean(keyInput.trim()));
    setShowSettings(false);
  };

  const handleClearKey = () => {
    setGroqApiKey('');
    setKeyInput('');
    setHasKey(false);
  };

  const send = async (text) => {
    if (!text || busy) return;
    const userText = text.trim();
    if (!userText) return;

    const newMessages = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setInput('');
    setBusy(true);

    try {
      if (hasKey || isAiConfigured()) {
        const reply = await sendChatToGroq({
          messages: newMessages,
          systemPrompt: systemPreamble,
        });
        setMessages((m) => [...m, { role: 'bot', text: reply }]);
      } else {
        // Fallback with intelligent Ayurveda answers + notice to paste Groq key
        const heuristic = getHeuristicResponse(userText);
        setMessages((m) => [
          ...m,
          {
            role: 'bot',
            text: heuristic,
          },
        ]);
      }
    } catch (err) {
      console.error('Groq chat error:', err);
      let errorMsg = err.message || 'Error connecting to AI service.';
      if (err.message === 'GROQ_API_KEY_MISSING') {
        errorMsg = 'Please paste your Groq API Key in frontend/.env (REACT_APP_GROQ_API_KEY) or open settings ⚙️ above.';
      }
      setMessages((m) => [...m, { role: 'bot', text: `⚠️ ${errorMsg}` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.chatbotRoot}>
      <div className={styles.launcher}>
        {!open && (
          <button className={styles.bubbleLabel} onClick={() => setOpen(true)} aria-label="Open chatbot">
            Chat with AyurVarta
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
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.miniLogoWrap}>
                <span className={styles.miniLogoRing} />
                <img src="/images/logo.png" alt="AyurVarta" className={styles.miniLogoImg} />
              </span>
              <div className={styles.titleArea}>
                <div className={styles.title}>
                  AyurVarta AI
                  <span className={styles.modelBadge}>{currentModel.replace('openai/', '')}</span>
                </div>
              </div>
            </div>

            <div className={styles.headerRight}>
              <button
                className={styles.iconBtn}
                title="Groq API Key Settings"
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Settings"
              >
                ⚙️
              </button>
              <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close chatbot">
                ×
              </button>
            </div>
          </div>

          {/* Quick Settings Drawer for Groq API Key */}
          {showSettings && (
            <div className={styles.settingsDrawer}>
              <div className={styles.settingsTitle}>
                <span>Groq API Key Setup</span>
                <span style={{ fontSize: '11px', color: hasKey ? '#27ae60' : '#e67e22' }}>
                  {hasKey ? '● Key Active' : '○ Key Missing'}
                </span>
              </div>
              <p className={styles.settingsHelp}>
                Using Groq with model <code>{currentModel}</code>. You can paste your key in <code>frontend/.env</code>{' '}
                or directly below for instant testing.
              </p>
              <input
                type="password"
                placeholder="gsk_..."
                className={styles.keyInput}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
              />
              <div className={styles.settingsActions}>
                {hasKey && (
                  <button className={styles.clearKeyBtn} onClick={handleClearKey}>
                    Remove Key
                  </button>
                )}
                <button className={styles.saveKeyBtn} onClick={handleSaveKey}>
                  Save Key
                </button>
              </div>
            </div>
          )}

          {/* Prompt Suggestions */}
          <div className={styles.suggestions}>
            {SUGGESTIONS.map((s, idx) => (
              <button key={idx} className={styles.chip} onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>

          {/* Message History */}
          <div className={styles.messages} ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.msg} ${m.role === 'user' ? styles.user : styles.bot}`}>
                <FormattedText text={m.text} />
              </div>
            ))}
            {busy && (
              <div className={`${styles.msg} ${styles.bot}`}>
                <div className={styles.typingIndicator}>
                  <div className={styles.dot} />
                  <div className={styles.dot} />
                  <div className={styles.dot} />
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className={styles.inputRow}>
            <input
              className={styles.input}
              placeholder="Ask about your dosha, agni, recipes..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send(input);
              }}
              disabled={busy}
            />
            <button
              className={styles.sendBtn}
              onClick={() => send(input)}
              disabled={busy || !input.trim()}
            >
              Send
            </button>
          </div>

          {/* Key Status Banner */}
          {!hasKey && (
            <div className={styles.notice}>
              <span>Groq key not detected in <code>.env</code>.</span>
              <button className={styles.noticeLink} onClick={() => setShowSettings(true)}>
                Paste Key ⚙️
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;
