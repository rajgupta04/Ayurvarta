// Commit on 2026-03-04
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Quiz.module.css';
import pageStyles from './Assessment.module.css';
import { mockQuizQuestions } from '../data/mockQuizQuestions';

const Quiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  const computeDoshaScores = () => {
    const scores = { Vata: 0, Pitta: 0, Kapha: 0 };
    mockQuizQuestions.forEach((q, i) => {
      const ans = answers[i];
      if (!ans) return;
      switch (q.questionType) {
        case 'dosha-selection': {
          if (ans === 'Vata') scores.Vata += 1;
          if (ans === 'Pitta') scores.Pitta += 1;
          if (ans === 'Kapha') scores.Kapha += 1;
          break;
        }
        case 'body-type-ranking': {
          if (ans.includes('Thin')) scores.Vata += 1;
          else if (ans.includes('Medium')) scores.Pitta += 1;
          else if (ans.includes('Big')) scores.Kapha += 1;
          break;
        }
        case 'characteristic-checkbox': {
          const arr = Array.isArray(ans) ? ans : [];
          arr.forEach(t => {
            if (t.startsWith('Creative') || t.startsWith('Anxious')) scores.Vata += 1;
            else if (t.startsWith('Passionate')) scores.Pitta += 1;
            else if (t.startsWith('Calm')) scores.Kapha += 1;
          });
          break;
        }
        case 'radio-select': {
          if (ans.startsWith('Strong')) scores.Pitta += 1;
          else if (ans.startsWith('Irregular')) scores.Vata += 1;
          else if (ans.startsWith('Slow')) scores.Kapha += 1;
          break;
        }
        default:
          break;
      }
    });
    return scores;
  };

  const handleAnswer = (questionType, optionValue) => {
    const currentAnswer = answers[currentQuestionIndex];

    if (questionType === 'characteristic-checkbox') {
      const newAnswer = currentAnswer ? [...currentAnswer] : [];
      const itemIndex = newAnswer.indexOf(optionValue);
      if (itemIndex > -1) {
        newAnswer.splice(itemIndex, 1);
      } else {
        newAnswer.push(optionValue);
      }
      setAnswers(prev => ({ ...prev, [currentQuestionIndex]: newAnswer }));
    } else if (questionType === 'body-type-ranking') {
      setAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionValue }));
    }
    else {
      setAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionValue }));
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < mockQuizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
  const scores = computeDoshaScores();
  // Log final scores to console
  // eslint-disable-next-line no-console
  console.log('[Dosha Quiz] Scores:', scores);
      navigate('/diet-plan');
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const renderQuestion = () => {
    const question = mockQuizQuestions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestionIndex];

    switch (question.questionType) {
      case 'dosha-selection':
        return (
          <div className={styles.doshaOptions}>
            {question.options.map((option, index) => (
              <div 
                key={index} 
                className={`${styles.doshaCard} ${currentAnswer === option.text ? styles.selected : ''}`}
                style={{'--dosha-color': option.color}}
                onClick={() => {
                    handleAnswer(question.questionType, option.text);
                }}
              >
                <img src={`/images/${option.icon}`} alt={option.text} />
                <h3>{option.text}</h3>
              </div>
            ))}
          </div>
        );
      case 'body-type-ranking':
        return (
            <div className={styles.bodyTypeOptions}>
                {question.options.map((option, index) => (
                    <div 
                        key={index} 
                        className={`${styles.bodyTypeCard} ${currentAnswer === option.text ? styles.selected : ''}`}
                        onClick={() => handleAnswer(question.questionType, option.text)}
                    >
                        <img src={`/images/${option.image}`} alt={option.text} />
                        <h4>{option.text}</h4>
                        <p>{option.description}</p>
                    </div>
                ))}
            </div>
        );
    case 'characteristic-checkbox':
        return (
            <div className={styles.characteristicOptions}>
                {question.options.map((option, index) => (
                    <div 
                        key={index} 
                        className={`${styles.characteristicCard} ${currentAnswer?.includes(option.title) ? styles.selected : ''}`}
                        onClick={() => handleAnswer(question.questionType, option.title)}
                    >
                        <h5>{option.title}</h5>
                        <ul>
                            {option.bullets.map((bullet, i) => <li key={i}>{bullet}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        );
    case 'radio-select':
        return (
            <div className={styles.radioOptions}>
                {question.options.map((option, index) => (
                    <div 
                        key={index} 
                        className={`${styles.radioLabel} ${currentAnswer === option.text ? styles.selected : ''}`}
                        onClick={() => handleAnswer(question.questionType, option.text)}
                    >
                        <span className={styles.radioInput}></span>
                        {option.text}
                    </div>
                ))}
            </div>
        );
      default:
        return <div>Question type not supported</div>;
    }
  };

  const currentQuestion = mockQuizQuestions[currentQuestionIndex];

  return (
    <section className={pageStyles.page} data-reveal>
      <h1 className={pageStyles.title}>Dosha Quiz</h1>
      <p className={pageStyles.subtitle}>Find your dominant dosha with a quick, visual quiz.</p>
      <div className={styles.quiz}>
        <div className={styles.quizCard}>
          { currentQuestion.questionType !== 'dosha-selection' && (
              <p className={styles.progressIndicator}>
                QUESTION {currentQuestionIndex + 1} OF {mockQuizQuestions.length}
              </p>
          )}
          <h2>{currentQuestion.questionText}</h2>

          <div className={styles.questionContent}>
              {renderQuestion()}
          </div>

          <div className={styles.navigation}>
            {currentQuestionIndex > 0 && (
              <button onClick={handleBack} className={styles.navButton}>Back</button>
            )}
            <button onClick={handleNext} className={styles.navButton}>
                {currentQuestionIndex === mockQuizQuestions.length - 1 ? 'View My Plan' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}