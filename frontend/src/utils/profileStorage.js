// Commit on 2026-02-09
const KEY = 'medicalProfile';

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
}

export function clearProfile() {
  try { localStorage.removeItem(KEY); } catch {}
}

// Commit on 2026-03-08 
