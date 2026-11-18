/**
 * AyurVarta AI Service
 * Powered by Groq API using model: openai/gpt-oss-120b
 */

const STORAGE_KEY_API_KEY = 'ayurvarta_groq_api_key';
const STORAGE_KEY_MODEL = 'ayurvarta_groq_model';
export const DEFAULT_MODEL = 'openai/gpt-oss-120b';

/**
 * Get active Groq API key from environment variable or localStorage
 */
export function getGroqApiKey() {
  const envKey = process.env.REACT_APP_GROQ_API_KEY;
  if (envKey && envKey.trim() && !envKey.includes('your_groq_api_key_here')) {
    return envKey.trim();
  }
  try {
    const local = localStorage.getItem(STORAGE_KEY_API_KEY);
    if (local && local.trim()) return local.trim();
  } catch (e) {
    // Ignore storage errors
  }
  return '';
}

/**
 * Set Groq API key in localStorage (for instant UI testing without restarting dev server)
 */
export function setGroqApiKey(key) {
  try {
    if (key && key.trim()) {
      localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_API_KEY);
    }
  } catch (e) {
    console.error('Failed to save API key to localStorage', e);
  }
}

/**
 * Get configured model name
 */
export function getGroqModel() {
  const envModel = process.env.REACT_APP_GROQ_MODEL;
  if (envModel && envModel.trim()) return envModel.trim();
  try {
    const local = localStorage.getItem(STORAGE_KEY_MODEL);
    if (local && local.trim()) return local.trim();
  } catch (e) {}
  return DEFAULT_MODEL;
}

/**
 * Set custom model
 */
export function setGroqModel(model) {
  try {
    if (model && model.trim()) {
      localStorage.setItem(STORAGE_KEY_MODEL, model.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_MODEL);
    }
  } catch (e) {}
}

/**
 * Check if Groq API key is present
 */
export function isAiConfigured() {
  return Boolean(getGroqApiKey());
}

/**
 * Call Groq Chat Completions API
 */
export async function sendChatToGroq({ messages = [], systemPrompt = '', temperature = 0.7, max_tokens = 1024 }) {
  const apiKey = getGroqApiKey();
  const model = getGroqModel();

  if (!apiKey) {
    throw new Error('GROQ_API_KEY_MISSING');
  }

  const formattedMessages = [];
  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt });
  }

  messages.forEach((msg) => {
    formattedMessages.push({
      role: msg.role === 'bot' || msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.text || msg.content || '',
    });
  });

  const requestBody = {
    model: model,
    messages: formattedMessages,
    temperature: temperature,
    max_tokens: max_tokens,
  };

  // Try dev server proxy first to prevent browser CORS, then direct Groq API
  const endpoints = ['/api/groq/openai/v1/chat/completions', 'https://api.groq.com/openai/v1/chat/completions'];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errDetails = '';
        try {
          const errJson = await response.json();
          errDetails = errJson?.error?.message || response.statusText;
        } catch {
          errDetails = await response.text();
        }

        if (response.status === 401) {
          throw new Error('Invalid Groq API Key. Please verify your secret key in .env or the key manager.');
        } else if (response.status === 404) {
          throw new Error(`Model "${model}" not found on Groq. Please verify model name or permissions.`);
        } else if (response.status === 429) {
          throw new Error('Groq API rate limit reached. Please wait a moment and try again.');
        } else {
          throw new Error(`Groq API Error (${response.status}): ${errDetails}`);
        }
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Received empty response from Groq API.');
      }
      return content;
    } catch (err) {
      lastError = err;
      // If error is an explicit 401, 404, or 429, don't retry with next endpoint
      if (err.message.startsWith('Invalid Groq API Key') || err.message.includes('not found on Groq')) {
        throw err;
      }
      // If it's a proxy 404 (e.g. static build without setupProxy), proceed to direct endpoint
      continue;
    }
  }

  throw lastError || new Error('Failed to connect to Groq API. Check your internet connection.');
}

/**
 * Ayurvedic advice generator using Groq & user assessment history
 */
export async function generatePersonalizedAdvice(userContext) {
  const systemPrompt = `You are AyurVarta, an expert Ayurvedic clinical AI assistant.
Follow classical principles of Charaka Samhita and Sushruta Samhita.
Tone: Warm, encouraging, scientifically grounded, and concise.
Avoid unverified medical claims; focus on holistic dietary, lifestyle (Dinacharya), and seasonal (Ritucharya) balance.
Format your output with clean markdown headings and bullet points.`;

  const userPrompt = `Here is the user's Ayurvedic assessment and health profile in JSON format:
${JSON.stringify(userContext, null, 2)}

Please provide a personalized Ayurvedic health brief with:
1. **Constitutional Summary**: Insights into their current Prakriti, Vikriti dosha status, and Agni state.
2. **Top 3 Actionable Recommendations for Today**: Practical lifestyle or meal adjustments.
3. **Dietary Guidelines**: Foods, tastes (Shad-Rasa), and herbs to favor vs reduce.
4. **Assessment Timing**: When to retake Prakriti or Vikriti assessments.`;

  return sendChatToGroq({
    systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    temperature: 0.6,
    max_tokens: 1200,
  });
}
