// Commit on 2026-03-13
// Commit on 2026-02-12
import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default LoadingSpinner;


// Commit on 2026-02-09 
// Commit on 2026-02-09 
// Commit on 2026-02-09 
// Commit on 2026-02-08 
