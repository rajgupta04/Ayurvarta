// Commit on 2026-02-09
import React from 'react';
import styles from './Blog.module.css';

const posts = [
  {
    id: 1,
    title: 'Demystifying Doshas: An Introduction to Vata, Pitta, and Kapha',
    excerpt:
      'Unlock the secrets of your unique mind-body type. This beginner\'s guide explores the fundamental principles of Vata, Pitta, and Kapha, helping you understand your natural constitution.',
    image: '/images/authentic-ayurveda.png',
  },
  {
    id: 2,
    title: 'Seasonal Wisdom: Ayurvedic Eating for Spring Cleansing',
    excerpt:
      'As nature awakens, so should our bodies. Discover seasonal Ayurvedic recipes and practices to gently cleanse and rejuvenate your system this spring.',
    image: '/images/services-hero.png',
  },
  {
    id: 3,
    title: 'Beyond Diet: Incorporating Daily Ayurvedic Rituals (Dinacharya)',
    excerpt:
      'Ayurveda is more than just food; it\'s a lifestyle. Learn about simple yet profound daily routines like oil pulling, self-massage (Abhyanga), and mindful moments that can transform your well-being.',
    image: '/images/about-hero.png',
  },
  // Optional/Future
  {
    id: 4,
    title: 'Herbs for Harmony: Top Ayurvedic Botanicals for Stress Relief',
    excerpt:
      'Feeling overwhelmed? Explore powerful Ayurvedic herbs like Ashwagandha and Brahmi, known for their adaptogenic properties and ability to calm the mind and body naturally.',
    image: '/images/home-hero.png',
  },
];

const Blog = () => {
  return (
    <div className={styles.blogPage}>
      <header className={`${styles.header} reveal`} data-reveal="fade-up">
        <h1 className={styles.title}>From Our Journal</h1>
        <p className={styles.subtitle}>
          Insights and guidance from Ayurveda—doshas, seasons, daily rituals, and a life in balance.
        </p>
      </header>

      <div className={styles.list}>
        {posts.map((post) => (
          <article key={post.id} className={`${styles.card} reveal`} data-reveal="fade-up">
            <div className={styles.imageWrap}>
              <img src={post.image} alt={post.title} />
            </div>
            <div className={styles.content}>
              <h2 className={styles.cardTitle}>{post.title}</h2>
              <p className={styles.excerpt}>{post.excerpt}</p>
              <div className={styles.actions}>
                <button className={styles.readBtn} type="button">Read Article</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Blog;