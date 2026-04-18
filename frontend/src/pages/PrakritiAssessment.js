// Commit on 2026-02-11
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Assessment.module.css';
import { PRAKRITI_QUESTIONS, toTriCardOptions } from '../data/assessment';
import TriCardQuestion from '../components/TriCardQuestion';
import quizStyles from './Quiz.module.css';
import { saveAssessmentResult } from '../utils/assessmentStorage';

export default function PrakritiAssessment() {
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0);
  const nav = useNavigate();
  const onChange = (id, val) => setAnswers(a => ({ ...a, [id]: val }));

  return (
    <section className={styles.page} data-reveal>
      <h1 className={styles.title}>Prakriti Assessment</h1>
      <p className={styles.subtitle}>Discover your inherent constitution (Vata, Pitta, Kapha blend).</p>
      <div className={quizStyles.quiz}>
        <div className={quizStyles.quizCard}>
          {(() => {
          const q = PRAKRITI_QUESTIONS[idx];
          const options = toTriCardOptions(q.options, q.id);
          return (
            <>
              <p className={quizStyles.progressIndicator}>
                QUESTION {idx + 1} OF {PRAKRITI_QUESTIONS.length}
              </p>
              <h2>{q.q}</h2>
              <div className={quizStyles.questionContent}>
                <TriCardQuestion
                  options={options}
                  selected={answers[q.id]}
                  onSelect={(val) => onChange(q.id, val)}
                  circular={idx >= 1} /* questions 2-7 (index 1 onward) */
                />
              </div>
              <div className={quizStyles.navigation}>
                {idx > 0 && (
                  <button className={quizStyles.navButton} onClick={() => setIdx(i=>i-1)}>Back</button>
                )}
                {idx < PRAKRITI_QUESTIONS.length - 1 ? (
                  <button className={quizStyles.navButton} disabled={!answers[q.id]} onClick={() => setIdx(i=>i+1)}>Continue</button>
                ) : (
          <button
                    className={quizStyles.navButton}
                    disabled={!answers[q.id]}
                    onClick={() => {
                      const counts = { Vata: 0, Pitta: 0, Kapha: 0 };
                      PRAKRITI_QUESTIONS.forEach(qq => {
                        const opt = answers[qq.id];
                        if (!opt) return;
                        const pos = qq.options.indexOf(opt);
                        if (pos === 0) counts.Vata += 1;
                        if (pos === 1) counts.Pitta += 1;
                        if (pos === 2) counts.Kapha += 1;
                      });
            // eslint-disable-next-line no-console
            console.log('[Prakriti] Scores:', counts);
                      const params = new URLSearchParams({ v: counts.Vata, p: counts.Pitta, k: counts.Kapha });
                      saveAssessmentResult('prakriti', { scores: counts });
                      nav(`/assessment/prakriti/result?${params.toString()}`);
                    }}
                  >
                    See Result
                  </button>
                )}
              </div>
            </>
          );
        })()}
        </div>
      </div>
    </section>
  );
}