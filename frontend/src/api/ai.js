import { getAccessToken } from '../firebase/auth';

const API_BASE = (
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  ''
).replace(/\/$/, '');

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
export const DEFAULT_GROQ_MODEL = process.env.REACT_APP_GROQ_MODEL || 'llama-3.3-70b-versatile';

export function isGroqConfigured() {
  return Boolean(process.env.REACT_APP_GROQ_API_KEY);
}

/**
 * Call Groq Chat Completions directly (dev/client fallback) or via Core Backend AI proxy.
 */
export async function sendAyurvedaChat({ messages = [], systemPrompt = '', temperature = 0.6, maxTokens = 1024 }) {
  const groqKey = process.env.REACT_APP_GROQ_API_KEY;

  // 1. Prefer server-side backend proxy when authenticated and backend URL is configured
  const token = getAccessToken();
  if (API_BASE && token) {
    try {
      const proxyRes = await fetch(`${API_BASE}/api/v1/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages, systemPrompt, temperature, maxTokens }),
      });
      if (proxyRes.ok) {
        const payload = await proxyRes.json();
        const reply = payload?.data?.reply || payload?.reply;
        if (reply) return reply;
      }
    } catch {
      // Fall through to client-side Groq fallback if configured
    }
  }

  // 2. Direct Groq API call (requires REACT_APP_GROQ_API_KEY)
  if (!groqKey) {
    throw new Error('GROQ_API_KEY_MISSING');
  }

  const formatted = [];
  if (systemPrompt) {
    formatted.push({ role: 'system', content: systemPrompt });
  }
  messages.forEach((m) => {
    formatted.push({
      role: m.role === 'bot' || m.role === 'assistant' ? 'assistant' : 'user',
      content: m.text || m.content || '',
    });
  });

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_GROQ_MODEL,
      messages: formatted,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || 'Sorry, I could not formulate a response.';
}

/**
 * Generate personalized Ayurvedic health brief using Groq.
 */
export async function generateAyurvedaAdvice(userContext, preamble) {
  const prompt = `Here is the user context as JSON:\n\n${JSON.stringify(userContext, null, 2)}\n\nProvide: 1) Current status summary, 2) Top 3 improvements for today, 3) Diet & lifestyle tips (short), 4) When to retake which assessment.`;
  return sendAyurvedaChat({
    systemPrompt: preamble,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
    maxTokens: 1200,
  });
}
