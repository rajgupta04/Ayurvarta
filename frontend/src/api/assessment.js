import { getAccessToken } from '../firebase/auth';

const BASE = (
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  'https://babayogi.vercel.app'
).replace(/\/$/, '');

const apiRequest = async (path, options = {}) => {
  const token = getAccessToken();
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const message = payload?.detail || payload?.message || `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

export function saveAssessmentToDb(type, payload) {
  return apiRequest('/assessments', {
    method: 'POST',
    body: JSON.stringify({
      type,
      scores: payload?.scores || {},
      schema: payload?.schema || null,
      disease: payload?.disease || null,
      capturedAt: payload?.ts || new Date().toISOString(),
    }),
  });
}

export function getLatestAssessments() {
  return apiRequest('/assessments/latest', { method: 'GET' });
}
