// Commit on 2026-02-07
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Assessment.module.css';
import { VIKRITI_QUESTIONS } from '../data/assessment';
import quizStyles from './Quiz.module.css';
import DiseaseSelector from '../components/DiseaseSelector';
import { saveAssessmentResult } from '../utils/assessmentStorage';

export default function VikritiAssessment() {
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0); // 0 = disease selection, then quiz starts at 1
  const nav = useNavigate();
  const onChange = (id, val) => setAnswers((a) => ({ ...a, [id]: val }));
  const totalSteps = 1 + VIKRITI_QUESTIONS.length;

  return (
    <section className={styles.page} data-reveal>
      <h1 className={styles.title}>Vikriti Assessment</h1>
      <p className={styles.subtitle}>Understand your current imbalance to guide corrections.</p>
      <div className={quizStyles.quiz}>
        <div className={quizStyles.quizCard}>
          {idx === 0 ? (
            <>
              <p className={quizStyles.progressIndicator}>STEP 1 OF {totalSteps}</p>
              <h2>Tell us your current condition</h2>
              <div className={quizStyles.questionContent}>
                <DiseaseSelector
                  value={answers.disease || { category: null, disease: null }}
                  onChange={(val) => setAnswers((a) => ({ ...a, disease: val }))}
                />
              </div>
              <div className={quizStyles.navigation}>
                <span />
                <button
                  className={quizStyles.navButton}
                  disabled={!answers?.disease?.disease}
                  onClick={() => setIdx(1)}
                >
                  Continue
                </button>
              </div>
            </>
          ) : (
            (() => {
              const qIndex = idx - 1;
              const q = VIKRITI_QUESTIONS[qIndex];
              const isLast = qIndex === VIKRITI_QUESTIONS.length - 1;
              return (
                <>
                  <p className={quizStyles.progressIndicator}>
                    QUESTION {qIndex + 1} OF {VIKRITI_QUESTIONS.length}
                  </p>
                  <h2>{q.q}</h2>
                  <div className={quizStyles.questionContent}>
                    <div className={quizStyles.radioOptions}>
                      {q.options.map((opt) => (
                        <label
                          key={opt}
                          className={`${quizStyles.radioLabel} ${answers[q.id] === opt ? quizStyles.selected : ''}`}
                          onClick={() => onChange(q.id, opt)}
                        >
                          <span className={quizStyles.radioInput}></span>
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={quizStyles.navigation}>
                    <button className={quizStyles.navButton} onClick={() => setIdx((i) => i - 1)}>
                      Back
                    </button>
                    {!isLast ? (
                      <button
                        className={quizStyles.navButton}
                        disabled={!answers[q.id]}
                        onClick={() => setIdx((i) => i + 1)}
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        className={quizStyles.navButton}
                        disabled={!answers[q.id]}
                        onClick={() => {
                          const counts = { Sama: 0, Vishama: 0, Tikshna: 0, Manda: 0 };
                          VIKRITI_QUESTIONS.forEach((qq) => {
                            const opt = answers[qq.id];
                            if (!opt) return;
                            if (opt.includes('(Sama)')) counts.Sama += 1;
                            else if (opt.includes('(Vishama)')) counts.Vishama += 1;
                            else if (opt.includes('(Tikshna)')) counts.Tikshna += 1;
                            else if (opt.includes('(Manda)')) counts.Manda += 1;
                          });
                          saveAssessmentResult('vikriti', {
                            scores: counts,
                            disease: answers?.disease || null,
                            schema: 'agni-4',
                          });
                          const params = new URLSearchParams({
                            sama: counts.Sama,
                            vishama: counts.Vishama,
                            tikshna: counts.Tikshna,
                            manda: counts.Manda,
                          });
                          nav(`/assessment/vikriti/result?${params.toString()}`);
                        }}
                      >
                        See Result
                      </button>
                    )}
                  </div>
                </>
              );
            })()
          )}
        </div>
      </div>
    </section>
  );
}
