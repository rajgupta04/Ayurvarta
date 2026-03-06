// Commit on 2026-03-07
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Services.module.css';
import { mockServices } from '../data/mockServices';

const Services = () => {
  return (
    <div className={styles.services}>
      <section className={styles.hero}>
        <h1>Personalized Ayurvedic Guidance</h1>
        <Link to="/contact" className={styles.ctaButton}>Book a Consultation</Link>
      </section>

      <section className={styles.serviceList}>
        {mockServices.map((service, index) => (
          <div key={index} className={styles.serviceCard}>
            {/* Icon placeholder */}
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <Link to={`/services/${index}`} className={styles.learnMore}>Learn More</Link>
          </div>
        ))}
      </section>

      {/* New: Video Consultation Section */}
      <section className={styles.extraSection} id="video-consultation">
        <div className={styles.extraContent}>
          <div className={styles.textBlock}>
            <h2>Live Video Consultation</h2>
            <p>Connect directly with certified Ayurvedic practitioners via secure HD video. Discuss symptoms, lifestyle, and goals in real time and receive tailored recommendations instantly.</p>
            <ul className={styles.points}>
              <li>High-quality encrypted video sessions</li>
              <li>Real-time chat & follow-up notes</li>
              <li>Session history & exported summaries</li>
            </ul>
            <div className={styles.actionsRow}>
              <Link to="/video" className={styles.ctaButton}>Start a Session</Link>
              <Link to="/dashboard/video" className={styles.secondaryBtn}>Go to Video Hub</Link>
            </div>
          </div>
          <div className={styles.mediaBlock}>
            <img src="/images/video_consultation.png" alt="Video Consultation" className={styles.illustration} />
          </div>
        </div>
      </section>

      {/* New: Image Food Analysis Section */}
      <section className={styles.extraSection} id="food-analysis">
        <div className={styles.extraContent}>
          <div className={styles.mediaBlock}>
            <img src="/images/food_analysis.png" alt="Image Food Analysis" className={styles.illustration} />
          </div>
          <div className={styles.textBlock}>
            <h2>Image-based Food Analysis (Beta)</h2>
            <p>Upload a meal photo and let our intelligent analyzer identify ingredients, estimate macro balance, and assess doshic impact. Get instant suitability scoring for your Prakriti and current Vikriti state.</p>
            <ul className={styles.points}>
              <li>Automatic ingredient detection</li>
              <li>Doshic influence classification</li>
              <li>Smart suggestions & swaps</li>
            </ul>
            <div className={styles.actionsRow}>
              <Link to="/food" className={styles.ctaButton}>Try Food Library</Link>
              <button className={styles.secondaryBtn} disabled>Upload Meal (Coming Soon)</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;

// Commit on 2026-03-06 
