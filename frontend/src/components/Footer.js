// Commit on 2026-03-17
// Commit on 2026-02-08
import React from 'react';
import styles from './Footer.module.css';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerColumn}>
          <img src="/images/logo.png" alt="Ayurved Gemini Logo" className={styles.logo} />
          <p>
            Your journey to holistic wellness starts here. Discover the balance of
            mind, body, and spirit with ancient Ayurvedic wisdom tailored for modern life.
          </p>
        </div>

        <div className={styles.footerColumn}>
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/quiz">Dosha</Link></li>
            <li><Link to="/diet-plan">Diet</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h4>Legal</h4>
          <ul>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service">Terms of Service</Link></li>
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h4>Connect With Us</h4>
          <div className={styles.socialIcons}>
            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer">FB</a>
            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer">IG</a>
            <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noreferrer">TW</a>
          </div>

          <h4>Newsletter</h4>
          <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input id="newsletter-email" type="email" placeholder="Your email address" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} AyurVarta. Built by <strong>Gang Glitch</strong>.All Rights Reserved. </p>
      </div>
    </footer>
  );
};

export default Footer;