// Commit on 2026-03-12
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Assessment.module.css';
import { AGNI_QUESTIONS, toTriCardOptions } from '../data/assessment';
import TriCardQuestion from '../components/TriCardQuestion';
import quizStyles from './Quiz.module.css';
import { saveAssessmentResult } from '../utils/assessmentStorage';

export default function AgniAssessment() {
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0);
  const nav = useNavigate();
  const onChange = (id, val) => setAnswers(a => ({ ...a, [id]: val }));

  return (
    <section className={styles.page} data-reveal>
      <h1 className={styles.title}>Agni Assessment</h1>
      <p className={styles.subtitle}>Evaluate digestive fire to tailor diet and routine.</p>
      <div className={quizStyles.quiz}>
        <div className={quizStyles.quizCard}>
          {(() => {
          const q = AGNI_QUESTIONS[idx];
          const options = toTriCardOptions(q.options);
          return (
            <>
              <p className={quizStyles.progressIndicator}>QUESTION {idx + 1} OF {AGNI_QUESTIONS.length}</p>
              <h2>{q.q}</h2>
              <div className={quizStyles.questionContent}>
                <TriCardQuestion
                  options={options}
                  selected={answers[q.id]}
                  onSelect={(val) => onChange(q.id, val)}
                  hideImages={true}
                />
              </div>
              <div className={quizStyles.navigation}>
                {idx > 0 && (
                  <button className={quizStyles.navButton} onClick={() => setIdx(i=>i-1)}>Back</button>
                )}
                {idx < AGNI_QUESTIONS.length - 1 ? (
                  <button className={quizStyles.navButton} disabled={!answers[q.id]} onClick={() => setIdx(i=>i+1)}>Continue</button>
                ) : (
                  <button
                    className={quizStyles.navButton}
                    disabled={!answers[q.id]}
                    onClick={() => {
                      const counts = { Vishama: 0, Tikshna: 0, Manda: 0 };
                      AGNI_QUESTIONS.forEach(qq => {
                        const opt = answers[qq.id];
                        if (!opt) return;
                        const pos = qq.options.indexOf(opt);
                        if (pos === 0) counts.Vishama += 1;
                        if (pos === 1) counts.Tikshna += 1;
                        if (pos === 2) counts.Manda += 1;
                      });
                      // eslint-disable-next-line no-console
                      console.log('[Agni] Scores:', counts);
                      const params = new URLSearchParams({ vi: counts.Vishama, ti: counts.Tikshna, ma: counts.Manda });
                      saveAssessmentResult('agni', { scores: counts });
                      nav(`/assessment/agni/result?${params.toString()}`);
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

// Commit on 2026-02-15 
// Commit on 2026-02-15 
// Commit on 2026-02-13 
// Commit on 2026-02-13 
// Commit on 2026-02-13 
