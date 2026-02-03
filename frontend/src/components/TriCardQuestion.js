// Commit on 2026-03-05
import React from 'react';
import styles from './TriCardQuestion.module.css';
import quizStyles from '../pages/Quiz.module.css';

// props: title, options: [{label, value, image}], selected, onSelect, circular, hideImages
export default function TriCardQuestion({ title, options, selected, onSelect, circular, hideImages }) {
  return (
    <div className={styles.wrap}>
      {title && <h2 className={styles.title}>{title}</h2>}
  <div className={quizStyles.bodyTypeOptions}>
        {options.map((opt) => (
          <div
            key={opt.value}
    className={`${quizStyles.bodyTypeCard} ${selected === opt.value ? quizStyles.selected : ''}`}
            onClick={() => onSelect(opt.value)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(opt.value)}
          >
  {!hideImages && <img src={opt.image} alt={opt.label} className={circular ? styles.circleImg : undefined} />}
    <h4 className={styles.cardTitle}>{opt.label}</h4>
          </div>
        ))}
      <