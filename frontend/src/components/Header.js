// Commit on 2026-03-08
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOutUser } from '../firebase/auth';
import styles from './Header.module.css';
const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser, userDocument } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.leftGroup}>
        <Link to="/" className={styles.logoWrap} aria-label="Home">
          <span className={styles.logoRing} />
          <img src="/images/logo.png" alt="Ayurved Gemini" className={styles.logoImg} />
        </Link>
        <span className={styles.brand}>AyurVarta</span>
      </div>

      <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
        <Link to="/" className={styles.navLink}>Home</Link>
        <Link to="/about" className={styles.navLink}>About</Link>
        <Link to="/quiz" className={styles.navLink}>Dosha</Link>
        <Link to="/diet-plan" className={styles.navLink}>Diet</Link>
  <Link to="/services" className={styles.navLink}>Services</Link>
  <Link to="/faq" className={styles.navLink}>FAQ</Link>
      </nav>
      <div className={styles.rightGroup}>
        {pathname.startsWith('/dashboard') ? (
          <Link to="/" className={styles.dashBtn}>Home</Link>
        ) : (
          <Link to="/dashboard" className={styles.dashBtn}>Your Dashboard</Link>
        )}
        
        {currentUser ? (
          <div className={styles.userMenu}>
            <span className={styles.userInfo}>
              {userDocument?.displayName || currentUser.email}
              {userDocument?.role && (
                <span className={styles.userRole}>({userDocument.role})</span>
              )}
            </span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/auth" className={styles.loginBtn}>Login</Link>
        )}
        
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.active : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
};
