// Commit on 2026-02-03
import { getAccessToken } from '../firebase/auth';

const BASE = (
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  'http://localhost:8000'
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

export function fetchDietPlan(payload) {
  return apiRequest('/generate-diet-plan', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function startDietPlanGeneration(dietRequest) {
  return apiRequest('/diet-jobs/start', {
    method: 'POST',
    body: JSON.stringify({ dietRequest }),
  });
}

export function getDietJobStatus(jobId) {
  return apiRequest(`/diet-jobs/${jobId}`, { method: 'GET' });
}

export function getLatestDietJob() {
  return apiRequest('/diet-jobs/latest', { method: 'GET' });
}

export function createDietLog(payload) {
  return apiRequest('/diet-logs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getDietLogs(limit = 30) {
  return apiRequest(`/diet-logs?limit=${limit}`, { method: 'GET' });
}

export function deleteDietLog(logId) {
  return apiRequest(`/diet-logs/${logId}`, {