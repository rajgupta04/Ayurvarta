// Commit on 2026-03-10
import React from 'react';
import styles from './About.module.css';
import { mockTeamMembers } from '../data/mockTeamMembers';

const About = () => {
  return (
    <div className={styles.about}>
      <section
        className={styles.hero}
        style={{ backgroundImage: "url('/images/about-hero.png')" }}
      >
        <h1>About Us</h1>
        <p>Our Philosophy: Ancient Wisdom for Modern Living.</p>
      </section>

      <section className={styles.tradition}>
        <h2>Rooted in Tradition</h2>
        <div className={styles.traditionContent}>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed doeiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laborisnisi ut aliquip ex ea commodo consequat.</p>
        </div>
      </section>

      <section className={styles.vision}>
        <h2>Our Vision</h2>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit essecillum dolore eu fugiat nulla pariatur.</p>
      </section>

      <section className={styles.team}>
        <h2>Our Vaidyas</h2>
        <div className={styles.teamMembers}>
          {mockTeamMembers.map((member, index) => (
            <div key={index} className={styles.teamMember}>
              <img src={`/images/${member.image}`} alt={member.name} />
              <h3>{member.name}</h3>
              <p>{member.title}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};