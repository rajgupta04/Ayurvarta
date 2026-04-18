// Commit on 2026-03-06
const KEY = 'assessmentHistory';

export function getHistory() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { prakriti: [], vikriti: [], agni: [] };
  } catch {
    return { prakriti: [], vikriti: [], agni: [] };
  }
}

export function saveAssessmentResult(type, payload) {
  const hist = getHistory();
  const entry = { ...payload, ts: new Date().toISOString() };
  hist[type] = [entry, ...hist[type]].slice(0, 20);
  try { sessionStorage.setItem(KEY, JSON.stringify(hist)); } catch {}
  return entry;
}

export function clearAssessmentHistory() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}
