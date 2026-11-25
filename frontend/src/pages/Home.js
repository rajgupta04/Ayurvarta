// Commit on 2026-02-05
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Home as HomeIcon, Volume2, VolumeX } from 'lucide-react';
import BlurText from '../components/BlurText';
import FoggyGlassOverlay from '../components/FoggyGlassOverlay';
import LiquidGlassTitle, { LotusEmblem } from '../components/LiquidGlassTitle';
import styles from './Home.module.css';
import faqStyles from './Faq.module.css';
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
  const [videoReady, setVideoReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [userMuted, setUserMuted] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const audioBtnRef = useRef(null);
  const exploreRef = useRef(null);

  const toggleTeaser = (idx) => setOpenTeaser((o) => ({ ...o, [idx]: !o[idx] }));
  const scrollToExplore = () => {
    exploreRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (mq) {
      setPrefersReducedMotion(mq.matches);
    }
    if (videoRef.current && videoRef.current.readyState >= 3) {
      setVideoReady(true);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    audio.volume = 0.35;
    let active = true;

    const tryPlayMusic = async () => {
      if (!active || userMuted || !audioRef.current) return false;
      try {
        await audioRef.current.play();
        if (active) setMusicPlaying(true);
        return true;
      } catch {
        // Browser blocked unmuted autoplay until first user gesture
        if (active) setMusicPlaying(false);
        return false;
      }
    };

    tryPlayMusic();

    const unlockAudio = async (event) => {
      if (audioBtnRef.current?.contains(event.target)) return;
      const started = await tryPlayMusic();
      if (started) {
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      }
    };

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });

    return () => {
      active = false;
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      audio.pause();
    };
  }, [userMuted]);

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setUserMuted(true);
      setMusicPlaying(false);
      return;
    }

    setUserMuted(false);
    try {
      await audio.play();
      setMusicPlaying(true);
    } catch {
      setMusicPlaying(false);
    }
  };

  return (
    <div className={styles.home}>
      {/* Full-bleed Ambient Video & Music Hero */}
      <section className={styles.heroVideoSection} aria-label="AyurVarta ambient showcase">
        <img
          src="/bg/bgPoster.webp"
          alt=""
          className={styles.heroPoster}
          fetchPriority="high"
          decoding="async"
        />

        {!prefersReducedMotion && (
          <video
            ref={videoRef}
            className={`${styles.heroVideo} ${videoReady ? styles.heroVideoVisible : ''}`}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/bg/bgPoster.webp"
            onCanPlay={() => setVideoReady(true)}
            onLoadedData={() => setVideoReady(true)}
            aria-hidden="true"
          >
            <source src="/bg/bgVideo.mp4" type="video/mp4" />
          </video>
        )}

        <FoggyGlassOverlay
          videoRef={videoRef}
          posterSrc="/bg/bgPoster.webp"
          reducedMotion={prefersReducedMotion}
        />

        <div className={styles.heroVignette} aria-hidden="true" />

        {/* Top-Left Brand Mark */}
        <Link to="/" className={styles.topLeftBrand} aria-label="AyurVarta Home">
          <LotusEmblem size={30} className={styles.topBrandLotus} />
          <span className={styles.topBrandName}>AyurVarta</span>
        </Link>

        {/* Top-Right Glass Pill Navigation */}
        <nav className={styles.topGlassNav} aria-label="Primary navigation">
          <button
            type="button"
            className={styles.glassNavHomeActive}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Home"
          >
            <HomeIcon size={16} strokeWidth={2.2} />
          </button>
          <Link to="/about" className={styles.glassNavLink}>About</Link>
          <Link to="/services" className={styles.glassNavLink}>Explore</Link>
          <Link to="/faq" className={styles.glassNavLink}>Contact</Link>
        </nav>

        {/* Center Liquid Glass Hero Title, Divider, Subtitle & CTA */}
        <LiquidGlassTitle onExplore={scrollToExplore} />

        {/* Bottom-Center Scroll Mouse Indicator */}
        <button
          type="button"
          className={styles.scrollCueBtn}
          onClick={scrollToExplore}
          aria-label="Scroll to discover your dosha"
        >
          <span className={styles.mouseOutline}>
            <span className={styles.mouseWheel} />
          </span>
          <ChevronDown size={16} strokeWidth={1.9} className={styles.scrollChevron} />
        </button>

        <audio ref={audioRef} loop preload="metadata">
          <source src="/music/BgMusic.mp3" type="audio/mpeg" />
        </audio>

        <button
          ref={audioBtnRef}
          type="button"
          className={styles.audioToggle}
          onClick={toggleMusic}
          aria-pressed={musicPlaying}
          aria-label={musicPlaying ? 'Mute ambient background music' : 'Play ambient background music'}
        >
          {musicPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span>{musicPlaying ? 'Sound On' : 'Play Sound'}</span>
        </button>
      </section>

      {/* Dosha Quiz Prompt */}
      <section
        id="explore"
        ref={exploreRef}
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