// Commit on 2026-02-16
const AUTH_STORAGE_KEY = 'ayurvarta_auth_session';
const AUTH_EVENT_NAME = 'ayurvarta-auth-changed';

const API_BASE = (
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  'http://localhost:8000'
).replace(/\/$/, '');

const parseMaybeJson = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const readSession = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeSession = (session) => {
  if (!session) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }
  window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME));
};

const getAuthHeader = () => {
  const token = readSession()?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const payload = await parseMaybeJson(response);
  if (!response.ok) {
    const message = payload?.detail || payload?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
};

const toCurrentUser = (user) => {
  if (!user) return null;
  return {
    uid: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    provider: user.provider,
  };
};

export const getAccessToken = () => readSession()?.token || null;

export const onAuthStateChangedListener = (callback) => {
  const emit = () => callback(toCurrentUser(readSession()?.user));
  emit();

  const handler = () => emit();
  window.addEventListener(AUTH_EVENT_NAME, handler);

  return () => {
    window.removeEventListener(AUTH_EVENT_NAME, handler);
  };
};

export const createAuthUserWithEmailAndPassword = async (email, password, displayName, role) => {
  if (!email || !password) return null;

  const data = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName, role }),
  });

  writeSession({ token: data.token, user: data.user });
  return toCurrentUser(data.user);
};

export const signInAuthUserWithEmailAndPassword = async (email, password) => {
  if (!email || !password) return null;

  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  writeSession({ token: data.token, user: data.user });
  return toCurrentUser(data.user);
};

export const signInWithGoogleIdToken = async (idToken, role = 'Dietitian') => {
  const data = await request('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken, role }),
  });

  writeSession({ token: data.token, user: data.user });
  return toCurrentUser(data.user);
};

export const signOutUser = async () => {
  const token = getAccessToken();
  if (token) {
    try {
      await request('/auth/logout', {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
        },
      });
    } catch {
      // Clear session even if backend logout fails.
    }
  }

  writeSession(null);
};

export const resetPassword = async (email) => {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const createUserDocumentFromAuth = async () => null;

export const getUserDocument = async () => {
  const session = readSession();
  if (!session?.token) return null;

  try {
    const data = await request('/auth/me', {
      method: 'GET',
      headers: {
        ...getAuthHeader(),
      },
    });

    const nextSession = { token: session.token, user: data.user };
    writeSession(nextSession);
    return data.user;
  } catch {
    writeSession(null);
    return null;
  }
};

export default {
  onAuthStateChangedListener,
  createAuthUserWithEmailAndPassword,
  signInAuthUserWithEmailAndPassword,
  signInWithGoogleIdToken,
  signOutUser,
  resetPassword,
  getUserDocumen