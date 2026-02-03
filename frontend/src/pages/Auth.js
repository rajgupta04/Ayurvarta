// Commit on 2026-03-13
// Commit on 2026-02-05
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  createAuthUserWithEmailAndPassword, 
  signInAuthUserWithEmailAndPassword,
  resetPassword,
  signInWithGoogleIdToken,
} from '../firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import styles from './Auth.module.css';

const Auth = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [role, setRole] = useState('Dietitian');
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const googleButtonRef = useRef(null);
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!googleClientId) return;

    const ensureGoogleScript = () => new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Failed to load Google script.')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google script.'));
      document.head.appendChild(script);
    });

    let mounted = true;

    const initGoogle = async () => {
      try {
        await ensureGoogleScript();
        if (!mounted || !googleButtonRef.current || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (!response?.credential) {
              setErrors({ auth: 'Google login failed. Please try again.' });
              return;
            }

            setIsLoading(true);
            setErrors({});
            try {
              await signInWithGoogleIdToken(response.credential, role);
            } catch (error) {
              setErrors({ auth: error.message || 'Google sign-in failed.' });
            } finally {
              setIsLoading(false);
            }
          },
        });

        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 260,
        });
        setGoogleReady(true);
      } catch (error) {
        setGoogleReady(false);
        setErrors((prev) => ({ ...prev, auth: prev.auth || error.message }));
      }
    };

    initGoogle();

    return () => {
      mounted = false;
    };
  }, [googleClientId, role]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (mode === 'signup' && !form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = e.email || 'Enter a valid email';
    if (!form.password.trim()) e.password = 'Password is required';
    if (form.password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      if (mode === 'signup') {
        await createAuthUserWithEmailAndPassword(
          form.email, 
          form.password, 
          form.name,
          role
        );
      } else {
        await signInAuthUserWithEmailAndPassword(form.email, form.password);
      }
      // Navigation will happen automatically via AuthContext
    } catch (error) {
      console.error('Authentication error:', error);

      const status = error?.status;
      let errorMessage = error?.message || 'An error occurred. Please try again.';

      if (status === 409) errorMessage = 'Email is already registered. Try logging in instead.';
      if (status === 401) errorMessage = 'Invalid email or password.';
      if (status === 400 && mode === 'signup') errorMessage = error.message || 'Please check your signup details.';

      setErrors({ auth: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!form.email) {
      setErrors({ email: 'Enter your email to reset password' });
      return;
    }
    
    setIsLoading(true);
    try {
      await resetPassword(form.email);
      setResetEmailSent(true);
      setErrors({});
    } catch (error) {
      console.error('Password reset error:', error);
      setErrors({ auth: 'Failed to send reset email. Please check your email address.' });
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignIn = () => {
    if (!googleClientId) {
      setErrors({ auth: 'Google sign-in is disabled. Set REACT_APP_GOOGLE_CLIENT_ID.' });
      return;
    }

    if (!window.google?.accounts?.id) {
      setErrors({ auth: 'Google sign-in is still loading. Please wait a moment.' });
      return;
    }

    window.google.accounts.id.prompt();
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.wrap}>
        <div className={styles.panel}>
          <h2 className={styles.title}>Welcome</h2>
          <p className={styles.sub}>Login to your account or create a new one.</p>

          <div className={styles.seg} role="tablist" aria-label="Role selector">
            <button
              type="button"
              className={`${styles.segBtn} ${role === 'Dietitian' ? styles.active : ''}`}
              onClick={() => setRole('Dietitian')}
              role="tab"
              aria-selected={role==='Dietitian'}
            >
              Dietitian
            </button>
            <button
              type="button"
              className={`${styles.segBtn} ${role === 'Practitioner' ? styles.active : ''}`}
              onClick={() => setRole('Practitioner')}
              role="tab"
              aria-selected={role==='Practitioner'}
            >
              Practitioner
            </button>
          </div>

          <div className={styles.seg} role="tablist" aria-label="Auth mode">
            <button className={`${styles.segBtn} ${mode === 'login' ? styles.active : ''}`} onClick={() => setMode('login')} role="tab" aria-selected={mode==='login'}>
              Login
            </button>
            <button className={`${styles.segBtn} ${mode === 'signup' ? styles.active : ''}`} onClick={() => setMode('signup')} role="tab" aria-selected={mode==='signup'}>
              Sign Up
            </button>
          </div>

                    <form className={styles.form} onSubmit={handleSubmit}>
            {errors.auth && <div className={styles.error}>{errors.auth}</div>}
            
            {resetEmailSent && (
              <div className={styles.success}>
                Password reset email sent! Check your inbox.
              </div>
            )}
            
            {mode === 'signup' && (
              <div className={styles.row}>
                <label className={styles.label} htmlFor="name">Full Name</label>
                <input 
                  id="name" 
                  name="name" 
                  className={styles.input} 
                  value={form.name} 
                  onChange={onChange}
                  disabled={isLoading}
                />
                {errors.name && <div className={styles.error}>{errors.name}</div>}
              </div>
            )}
            <div className={styles.row}>
              <label className={styles.label} htmlFor="email">Email</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                className={styles.input} 
                value={form.email} 
                onChange={onChange}
                disabled={isLoading}
              />
              {errors.email && <div className={styles.error}>{errors.email}</div>}
            </div>
            <div className={styles.row}>
              <label className={styles.label} htmlFor="password">Password</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                className={styles.input} 
                value={form.password} 
                onChange={onChange}
                disabled={isLoading}
              />
              {errors.password && <div className={styles.error}>{errors.password}</div>}
            </div>
            <div className={styles.actions}>
              <button 
                type="submit" 
                className={styles.primary}
                disabled={isLoading}
              >
                {isLoading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Create Account')}
              </button>
              
              {mode === 'login' && (
                <button 
                  type="button" 
                  className={styles.resetBtn}
                  onClick={handlePasswordReset}
                  disabled={isLoading}
                >
                  Forgot Password?
                </button>
              )}
              
              <div className={styles.hint}>We'll add Google sign-in soon.</div>
            </div>
          </form>
        </div>

        <aside className={styles.aside}>
          <h3>Quick Access</h3>
          <p className={styles.sub}>Use a social account to continue.</p>
          <div className={styles.providers}>
            <div ref={googleButtonRef}></div>
            <button className={styles.provider} onClick={googleSignIn} disabled={isLoading || !googleReady}>Continue with Google</button>
            <button className={styles.provider} disabled>Continue with Apple (soon)</button>
          </div>
        </aside>
      