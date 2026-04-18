// Commit on 2026-03-07
import React, { useState } from 'react';
import styles from './Faq.module.css';

const DEFAULT_FAQS = [
  {
    q: 'What is Ayurveda and how does it work?',
    a: 'Ayurveda is a holistic health system from India. It focuses on balancing mind, body, and spirit through personalized routines, diet, herbs, and lifestyle.'
  },
  {
    q: 'What are Doshas (Vata, Pitta, Kapha)?',
    a: 'Doshas are the three functional energies in Ayurveda. Everyone has a unique mix. Imbalances can be supported by diet and lifestyle choices tailored to your dosha.'
  },
  {
    q: 'How do I find my Dosha?',
    a: 'Take our Dosha quiz to understand your Prakriti (constitution) and Vikriti (current state). The results guide your personalized plan.'
  },
  {
    q: 'Is this medical advice?',
    a: 'We provide general wellness guidance based on Ayurvedic principles. For medical questions, please consult a qualified healthcare professional.'
  }
];

const Faq = () => {
  const [open, setOpen] = useState({});

  const toggle = (idx) => setOpen((o) => ({ ...o, [idx]: !o[idx] }));

  return (
    <div className={styles.faqPage}>
      <h1 className={styles.title}>Frequently Asked Questions</h1>
      <p className={styles.sub}>Find quick answers below. For more details, explore the full list.</p>

      <div className={styles.list}>
        {DEFAULT_FAQS.map((item, idx) => {
          const odd = idx % 2 === 0; // 0-based: 0,2 => odd style
          return (
            <div key={idx} className={`${styles.item} ${odd ? styles.odd : styles.even}`}>
              <div className={styles.header} onClick={() => toggle(idx)}>
                <div className={styles.q}>{item.q}</div>
                <button className={styles.toggleBtn} aria-label="Toggle answer">
                  {open[idx] ? '−' : '+'}
                </button>
              </div>
              <div className={!open[idx] ? styles.collapsed : ''}>
                <div className={styles.answer}>{item.a}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Faq;
