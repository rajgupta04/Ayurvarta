// Commit on 2026-03-10
import React, { useState } from 'react';
import styles from './Assessment.module.css';
import { PRAKRITI_QUESTIONS, VIKRITI_QUESTIONS, AGNI_QUESTIONS } from '../data/assessment';

const steps = [
  { key: 'prakriti', title: 'Prakriti', questions: PRAKRITI_QUESTIONS },
  { key: 'vikriti', title: 'Vikriti', questions: VIKRITI_QUESTIONS },
  { key: 'agni', title: 'Agni', questions: AGNI_QUESTIONS },
];

export default function AssessmentCombined() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ prakriti: {}, vikriti: {}, agni: {} });

  const current = steps[step];
  const onChange = (qid, val) => setAnswers(a => ({ ...a, [current.key]: { ...a[current.key], [qid]: val } }));

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const finish = () => {
    // Placeholder: In future compute results and navigate to summary
    alert('All answers saved. Results computation coming soon.');
  };

  return (
    <section className={styles.page} data-reveal>
      <h1 className={styles.title}>Combined Assessment</h1>
      <p className={styles.subtitle}>Follow the steps: Prakriti → Vikriti → Agni</p>

      <div className={styles.quizWrap}>
        <div className={styles.qCard} style={{marginBottom:12}}>
          <strong>Step {step + 1} of {steps.length}:</strong> {current.title}
        </div>

        {current.questions.map(q => (
          <div key={q.id} className={styles.qCard}>
            <div className={styles.q}>{q.q}</div>
            <div className={styles.options}>
              {q.options.map(opt => (
                <label key={opt} className={styles.optLabel}>
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={answers[current.key][q.id] === opt}
                    onChange={() => onChange(q.id, opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.alt}`} onClick={prev} disabled={step === 0}>Back</button>
          {step < steps.length - 1 ? (
            <button className={styles.btn} onClick={next}>Next</button>
          ) : (
            <button className={styles.btn} onClick={finish}>Finish</button>
          )}
        </div>
      </div>
    </section>
  );
}

// Commit on 2026-02-14 
// Commit on 2026-02-14 
