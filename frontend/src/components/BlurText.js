// Commit on 2026-02-12
import React, { useEffect, useState } from 'react';
import styles from './BlurText.module.css';

const BlurText = ({ text, className = '' }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <span className={`${styles.blurText} ${show ? styles.show : ''} ${className}`}>
      {text.split('').map((ch, i) => (
        <span key={i} style={{ animationDelay: `${i * 0.03}s` }}>
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </span>
  );
};

e