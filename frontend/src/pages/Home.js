// Commit on 2026-02-05
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BlurText from '../components/BlurText';
import styles from './Home.module.css';
import faqStyles from './Faq.module.css';
import headerStyles from '../components/Header.module.css';
import AgniDailyModal from '../components/AgniDailyModal';

const blogPosts = [
  {
    id: 1,
    title: 'Morning Routines to Balance Your Doshas',
    excerpt:
      'Start your day aligned with your constitution. Simple rituals to ground Vata, cool Pitta, and energize Kapha.',
    image: "/images/about-hero.png",
  },
  {
    id: 2,
    title: 'Seasonal Eating: What to Favor Now',
    excerpt:
      'Ayurveda adapts with the seasons. Discover foods that harmonize your body with nature’s cycles.',
    image: "/images/services-hero.png",
  },
  {
    id: 3,
    title: 'The Basics of Prakriti and Vikriti',
    excerpt:
      'Learn the difference between your innate constitution and current imbalances—and why both matter.',
    image: "/images/home-hero.png",
  },
];

const HOME_FAQS = [
  {
    q: 'How does the dosha quiz work?',
    a: 'It asks about your traits and habits to estimate your constitution (Prakriti) and current balance (Vikriti).'
  },
  {
    q: 'Can I change my diet plan later?',
    a: 'Yes. You can retake the quiz or update inputs anytime, and we’ll adjust recommendations—seasonally, too.'
  },
  {
    q: 'Is this medical advice?',
    a: 'No. It’s wellness guidance based on Ayurveda. For medical concerns, consult a qualified professional.'
  }
];

const Home = () => {
  const [openTeaser, setOpenTeaser] = useState({});
  const [agniOpen, setAgniOpen] = useState(false);
  const toggleTeaser = (idx) => setOpenTeaser((o) => ({ ...o, [idx]: !o[idx] }));
  return (
    <div className={styles.home}>
  {/* Daily reminder moved to Dashboard */}
      {/* Hero Section - Two Column */}
      <section
        className={`${styles.heroTwoCol} ${styles.patternBase} reveal`}
        data-reveal="fade-up"
        style={{ backgroundImage: "url('/images/background-pattern.png')" }}
      >
  <div className={`${styles.heroImageWrap} ${styles.noShadow}`} style={{ overflow: 'visible' }}>
          <div className={styles.heroLogoWrap} aria-hidden="false">
            <span className={styles.heroring} />
            <img src="/images/logo.png" alt="AyurVarta logo" className={`${headerStyles.logoImg} ${styles.heroLogoImg}`} />
          </div>
        </div>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            <BlurText text="Elevate Your Health with Ancient Wisdom" />
          </h1>
          <p className={styles.heroBody}>
            We blend the timeless science of Ayurveda with modern technology to create personalized wellness
            plans that restore your natural balance.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/services" className={`${styles.ctaButton} ${styles.ctaPrimary}`}>View Our Services</Link>
          </div>
        </div>
      </section>

      {/* Dosha Quiz Prompt */}
      <section
        className={`${styles.quizPrompt} ${styles.patternBase} reveal`}
        data-reveal="fade-up"
        style={{ backgroundImage: "url('/images/background-pattern-2.png')" }}
      >
        <div className={styles.sectionHeaderCenter}>
          <h2 className={styles.sectionTitle}><BlurText text="Find Your Balance: Discover Your Dosha" /></h2>
          <p className={styles.subhead}>
            Our intelligent assessment helps you understand your unique mind-body constitution (Prakriti) and
            current imbalances (Vikriti) in just a few minutes.
          </p>
        </div>
        <div className={styles.doshaIcons}>
          <div className={styles.doshaIconCard}>
            <img src="/images/vitta.png" alt="Vata icon" />
            <span>Vata</span>
          </div>
          <div className={styles.doshaIconCard}>
            <img src="/images/pitta.png" alt="Pitta icon" />
            <span>Pitta</span>
          </div>
          <div className={styles.doshaIconCard}>
            <img src="/images/kapha.png" alt="Kapha icon" />
            <span>Kapha</span>
          </div>
        </div>
        <div className={styles.centerCta}>
          <Link to="/quiz" className={`${styles.ctaButton} ${styles.ctaAccent}`}>Discover Your Dosha!</Link>
        </div>
      </section>

      {/* Featured Ayurvedic Diet & Routine */}
      <section
        className={`${styles.featureSection} ${styles.patternBase} reveal`}
        data-reveal="fade-up"
        style={{ backgroundImage: "url('/images/background-pattern.png')" }}
      >
        <div className={styles.featureList}>
          {/* Ideal Daily Schedule */}
          <article className={styles.featureCard}>
            <div className={styles.featureImageWrap}>
              <img src="/images/shcedule.png" alt="Ideal daily schedule" className={styles.featureImage} />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Ideal Daily Schedule (Dinacharya)</h3>
              <p className={styles.featureBody}>A balanced day supports agni, stabilizes energy, and aligns you with natural rhythms.</p>
              <ul className={styles.featurePoints}>
                <li>Rise early; gentle pranayama and meditation</li>
                <li>Warm breakfast; main meal at midday</li>
                <li>Light, early dinner; calming evening wind-down</li>
              </ul>
              <div className={styles.featureCta}>
                <Link to="/diet-plan" className={`${styles.dietbuttaon} ${styles.dietbutton2}`}>View Diet Plan</Link>
              </div>
            </div>
          </article>

          {/* Ideal Foods Overview (image right) */}
          <article className={styles.featureCard}>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Ideal Foods for Balance</h3>
              <p className={styles.featureBody}>Favor cooling, grounding, and nourishing foods tailored to your dosha.</p>
              <ul className={styles.featurePoints}>
                <li>Grains: rice, oats; Dal: mung</li>
                <li>Vegetables: greens, zucchini, cucumber</li>
                <li>Herbs/Spices: coriander, fennel, mint</li>
              </ul>
              <div className={styles.featureCta}>
                <Link to="/diet-plan" className={`${styles.ctaButton} ${styles.ctaPrimary}`}>View Diet Plan</Link>
              </div>
            </div>
            <div className={styles.featureImageWrap}>
              <img src="/images/suggestion.png" alt="Ideal foods" className={styles.featureImage} />
            </div>
          </article>
        </div>
      </section>

      {/* Trust & Authority */}
      <section
        className={`${styles.trust} ${styles.patternBase} reveal`}
        data-reveal="fade-up"
        style={{ backgroundImage: "url('/images/background-pattern.png')" }}
      >
  <h2 className={styles.sectionTitle}><BlurText text="Rooted in Tradition, Powered by Innovation" /></h2>
        <div className={styles.trustGrid}>
          <div className={styles.trustCard}>
            <img src="/images/authentic-ayurveda.png" alt="Authentic Ayurveda icon" />
            <h3>Authentic Ayurveda</h3>
            <p>
              We honor classical Ayurvedic wisdom with integrity—no shortcuts, just practices that stand the test of time.
            </p>
          </div>
          <div className={styles.trustCard}>
            <img src="/images/consultation-icon.png" alt="Expert Practitioners icon" />
            <h3>Expert Practitioners</h3>
            <p>
              Our network of certified Vaidyas offers guidance you can trust, tailored to your body and lifestyle.
            </p>
          </div>
          <div className={styles.trustCard}>
            <img src="/images/programs-icon.png" alt="AI-Powered Personalization icon" />
            <h3>AI-Powered Personalization</h3>
            <p>
              Advanced insights analyze your quiz results to craft truly individualized plans—food, lifestyle, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        className={`${styles.testimonials} ${styles.patternBase} reveal`}
        data-reveal="fade-up"
        style={{ backgroundImage: "url('/images/background-pattern-2.png')" }}
      >
  <h2 className={styles.sectionTitle}><BlurText text="A Community of Wellness" /></h2>
        <div className={styles.testimonialGrid}>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialHeader}>
              <img src="/images/thin-silhouette.png" alt="User avatar" />
              <div>
                <strong>Priya S.</strong>
                <div className={styles.location}>Delhi</div>
              </div>
            </div>
            <p>
              “The personalized diet plan was a game-changer for my energy levels. I finally feel understood.”
            </p>
          </div>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialHeader}>
              <img src="/images/medium-silhouette.png" alt="User avatar" />
              <div>
                <strong>Rahul M.</strong>
                <div className={styles.location}>Bengaluru</div>
              </div>
            </div>
            <p>
              “Beautiful design, clear guidance, and results I can feel. The dosha quiz nailed my needs.”
            </p>
          </div>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialHeader}>
              <img src="/images/big-silhouette.png" alt="User avatar" />
              <div>
                <strong>Ananya K.</strong>
                <div className={styles.location}>Pune</div>
              </div>
            </div>
            <p>
              “The daily tips and seasonal advice keep me on track without overwhelm. Love the experience.”
            </p>
          </div>
        </div>
      </section>

      {/* Services Introduction */}
      <section
        className={`${styles.servicesIntro} ${styles.patternBase} reveal`}
        data-reveal="fade-up"
        style={{ backgroundImage: "url('/images/background-pattern.png')" }}
      >
  <h2 className={styles.sectionTitle}><BlurText text="Your Journey to Harmony" /></h2>
        <div className={styles.serviceCards}>
          <div className={styles.serviceCard}>
            <img src="/images/consultation-icon.png" alt="Personalized Consultations" />
            <h3>Personalized Consultations</h3>
            <p>One-on-one sessions with experienced practitioners to decode your constitution and needs.</p>
            <Link to="/services" className={`${styles.ctaLink}`}>Book Now</Link>
          </div>
          <div className={styles.serviceCard}>
            <img src="/images/video-consult.png" alt="Video Consultation" />
            <h3>Video Consultation</h3>
            <p>Meet your practitioner online via secure, real-time video powered by Agora.</p>
            <Link to="/video" className={`${styles.ctaLink}`}>Start Video →</Link>
          </div>
          <div className={styles.serviceCard}>
            <img src="/images/programs-icon.png" alt="Wellness Programs" />
            <h3>Wellness Programs</h3>
            <p>Follow structured, seasonal programs designed for steady, sustainable transformation.</p>
            <Link to="/services" className={`${styles.ctaLink}`}>Learn More</Link>
          </div>
          <div className={styles.serviceCard}>
            <img src="/images/support-icon.png" alt="Herbal Remedies" />
            <h3>Herbal Remedies</h3>
            <p>Curated botanicals aligned with your dosha to nourish and balance from within.</p>
            <Link to="/services" className={`${styles.ctaLink}`}>Shop Remedies</Link>
          </div>
        </div>
      </section>

      {/* Blog Teaser */}
      <section
        className={`${styles.blogTeaser} ${styles.patternBase} reveal`}
        data-reveal="fade-up"
        style={{ backgroundImage: "url('/images/background-pattern-2.png')" }}
      >
        <div className={styles.blogHeader}>
          <h2 className={styles.sectionTitle}><BlurText text="From Our Journal" /></h2>
          <Link to="/blog" className={`${styles.ctaButton} ${styles.ctaGhost}`}>Read More on Our Blog</Link>
        </div>
        <div className={styles.blogGrid}>
          {blogPosts.slice(0, 3).map((post) => (
            <article key={post.id} className={styles.blogCard}>
              <div className={styles.blogImageWrap}>
                <img src={post.image} alt={post.title} />
              </div>
              <div className={styles.blogContent}>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ Teaser - styled like FAQ page rows */}
      <section
        className={`${styles.servicesIntro} ${styles.patternBase} reveal`}
        data-reveal="fade-up"
        style={{ backgroundImage: "url('/images/background-pattern.png')" }}
      >
        <h2 className={styles.sectionTitle}><BlurText text="Quick FAQs" /></h2>
        <div className={faqStyles.list} style={{ maxWidth: 900, margin: '0 auto' }}>
          {HOME_FAQS.map((item, idx) => {
            const odd = idx % 2 === 0; // 0,2 => odd style
            const isOpen = !!openTeaser[idx];
            return (
              <div key={idx} className={`${faqStyles.item} ${odd ? faqStyles.odd : faqStyles.even}`}>
                <div className={faqStyles.header} onClick={() => toggleTeaser(idx)}>
                  <div className={faqStyles.q}>{item.q}</div>
                  <button className={faqStyles.toggleBtn} aria-label="Toggle answer" aria-expanded={isOpen}>
                    {isOpen ? '−' : '+'}
                  </button>
                </div>
                <div className={!isOpen ? faqStyles.collapsed : ''}>
                  <div className={faqStyles.answer}>{item.a}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className={styles.centerCta} style={{ marginTop: 18 }}>
          <Link to="/faq" className={`${styles.ctaButton} ${styles.ctaGhost}`}>View All FAQs</Link>
        </div>
      </section>
  <AgniDailyModal open={agniOpen} onClose={() => setAgniOpen(false)} />
    </div>
  );
}

export default Home;