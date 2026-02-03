// Commit on 2026-02-05
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Assessment.module.css';

export default function Assessment() {
  const nav = useNavigate();
  return (
    <section className={styles.page} data-reveal>
      <h1 className={styles.title}>Assessment</h1>
      <p className={styles.subtitle}>Pick one assessment or take the combined flow (Prakriti → Vikriti → Agni).</p>

      <div className={styles.grid}>
        <div
          className={styles.card}
          style={{ backgroundImage: "url('/images/authentic-ayurveda.png')" }}
          onClick={() => nav('/assessment/prakriti')}
          aria-label="Prakriti assessment card"
        >
          <div className={styles.cardContent}>
            <h3>Prakriti</h3>
            <p>Your innate constitution. Stable baseline traits.</p>
          </div>
        </div>
        <div
          className={styles.card}
          style={{ backgroundImage: "url('/images/services-hero.png')" }}
          onClick={() => nav('/assessment/vikriti')}
          aria-label="Vikriti assessment card"
        >
          <div className={styles.cardContent}>
            <h3>Vikriti</h3>
            <p>Your current imbalance. What needs balancing right now.</p>
          </div>
        </div>
        <div
          className={styles.card}
          style={{ backgroundImage: "url('/images/home-hero.png')" }}
          onClick={() => nav('/assessment/agni')}
          aria-label="Agni assessment card"
        >
          <div className={styles.cardContent}>
            <h3>Agni</h3>
            <p>Digestive fire status. Guides meal type and timing.</p>
          </div>
        </div>
        <div
          className={styles.card}
          style={{ backgroundImage: "url('/images/background-pattern.png')" }}
          onClick={() => nav('/assessment/combined')}
          aria-label="Combined assessments card"
        >
          <div className={styles.cardContent}>
            <h3>Combine All Three</h3>
            <p>Complete flow: Prakriti → Vikriti → Agni with simple stepper.</p>
          </div>
        </div>
      </div