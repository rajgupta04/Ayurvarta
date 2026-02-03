// Commit on 2026-02-08
import React, { useState } from 'react';
import styles from './AgniDailyModal.module.css';
import { saveAssessmentResult } from '../utils/assessmentStorage';

const QUESTIONS = [
  {
    id: 'q1',
    q: 'How is your appetite today?',
    opts: [
      { key: 'Sama', label: 'Normal & steady (Sama)' },
      { key: 'Vishama', label: 'Variable (Vishama)' },
      { key: 'Tikshna', label: 'Excessive, very strong (Tikshna)' },
      { key: 'Manda', label: 'Weak, no real hunger (Manda)' },
    ],
  },
  {
    id: 'q2',
    q: 'How do you feel after your last meal?',
    opts: [
      { key: 'Sama', label: 'Light & satisfied (Sama)' },
      { key: 'Vishama', label: 'Bloated / irregular (Vishama)' },
      { key: 'Tikshna', label: 'Burning / hungry again (Tikshna)' },
      { key: 'Manda', label: 'Heavy / sluggish (Manda)' },
    ],
  },
  {
    id: 'q3',
    q: 'How was your bowel movement today?',
    opts: [
      { key: 'Sama', label: 'Regular, easy (Sama)' },
      { key: 'Vishama', label: 'Irregular / unpredictable (Vishama)' },
      { key: 'Tikshna', label: 'Loose / burning (Tikshna)' },
      { key: 'Manda', label: 'Slow / heavy / sticky (Manda)' },
    ],
  },
];

export default function AgniDailyModal({ open, onClose }) {
  const [answers, setAnswers] = useState({});
  if (!open) return null;

  const submit = () => {
    const counts = { Sama: 0, Vishama: 0, Tikshna: 0, Manda: 0 };
    QUESTIONS.forEach(q => {
      const v = answers[q.id];
      if (v && counts[v] !== undefined) counts[v] += 1;
    });
    // eslint-disable-next-line no-console
    console.log('[Agni Daily] Scores:', counts);
    saveAssessmentResult('agni', { scores: counts, type: 'daily' });
  alert('Your daily Agni has been submitted.');
  onClose?.();
  };

  const allAnswered = QUESTIONS.every(q => !!answers[q.id]);

  return (
    <div className={styles.backdrop} role="dialog" aria-modal>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>Daily Agni Check-in</h3>
          <button className={styles.closeBtn} onClick={onClose}>Close</button>
        </div>
        <div className={styles.body}>
          <div className={styles.cards}>
            {QUESTIONS.map(q => (
              <div key={q.id} className={styles.qCard}>
                <div className={styles.qTitle}>{q.q}</div>
                <div className={styles.options}>
                  {q.opts.map(o => {
                    const selected = answers[q.id] === o.key;
                    return (
                      <label key={o.key} className={`${styles.opt} ${selected ? styles.selected : ''}`}
                        onClick={() => setAnswers(a => ({ ...a, [q.id]: o.key }))}
                      >
                        <input type="radio" name={q.id} checked={selected} readOnly />
                        <span>{o.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.secondary}`} onClick={onClose}>Cancel</button>
          <button className={styles.btn} disabled={!allAnswered} onClick={submit}>Save Check-in</button>
        </div>
      <