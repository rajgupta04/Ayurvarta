// Commit on 2026-03-11
import React from 'react';
import styles from './Assessment.module.css';

export default function ResultPage({ title, chips = [], note, nextHref, nextText }) {
  return (
    <section className={styles.page} data-reveal>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.resultCard}>
        <div className={styles.resultTitle}>Your Result</div>
        <div className={styles.scoreRow}>
          {chips.map((c) => (
            <span className={styles.chip} key={c.label}>{c.label}: {c.value}</span>
          ))}
        </div>
        {note && <p className={styles.note}>{note}</p>}
        {nextHref && (
          <div className={styles.actions}>
            <a href={nextHref} className={`${styles.btn} ${styles.alt}`}>{nextText || 'Continue →'}</a>
          </div>
        )}
      </div