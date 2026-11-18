import React, { useMemo, useState } from 'react';
import styles from './PersonalAI.module.css';
import { Link } from 'react-router-dom';
import { getHistory } from '../utils/assessmentStorage';
import { loadProfile } from '../utils/profileStorage';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  generatePersonalizedAdvice,
  isAiConfigured,
  getGroqModel,
} from '../api/aiService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

export default function PersonalAI() {
  const history = useMemo(() => getHistory(), []);
  const profile = useMemo(() => loadProfile(), []);
  const [advice, setAdvice] = useState('');
  const [busy, setBusy] = useState(false);
  const [hasKey] = useState(isAiConfigured());
  const currentModel = getGroqModel();

  const latest = {
    prakriti: history.prakriti?.[0]?.scores || null,
    vikriti: history.vikriti?.[0]?.scores || null,
    agni: history.agni?.[0]?.scores || null,
  };

  const doshaBlend = latest.prakriti || { Vata: 0, Pitta: 0, Kapha: 0 };
  const doshaData = {
    labels: ['Vata', 'Pitta', 'Kapha'],
    datasets: [{ data: [doshaBlend.Vata||0, doshaBlend.Pitta||0, doshaBlend.Kapha||0], backgroundColor: ['#7f8c8d', '#e67e22', '#16a085'], borderWidth: 0 }]
  };

  const timeline = (arr) => arr?.slice(0, 8).reverse();
  const vikritiSeries = timeline(history.vikriti || []);
  const lineData = {
    labels: vikritiSeries?.map(v => new Date(v.ts).toLocaleDateString()) || [],
    datasets: [
      { label: 'Sama', data: vikritiSeries?.map(v => v.scores?.Sama||0) || [], borderColor: '#3d5a46', backgroundColor: 'rgba(61,90,70,0.15)', tension: 0.3, fill: true },
      { label: 'Tikshna', data: vikritiSeries?.map(v => v.scores?.Tikshna||0) || [], borderColor: '#e67e22', backgroundColor: 'rgba(230,126,34,0.15)', tension: 0.3, fill: true },
    ]
  };

  const makeAdviceInput = () => ({ profile, latest, historyPreview: {
    prakriti: history.prakriti?.slice(0,5),
    vikriti: history.vikriti?.slice(0,5),
    agni: history.agni?.slice(0,5),
  }});

  const generateAdvice = async () => {
    setBusy(true);
    try {
      const input = makeAdviceInput();
      if (isAiConfigured()) {
        const text = await generatePersonalizedAdvice(input);
        setAdvice(text || 'No advice generated.');
      } else {
        // Fallback: heuristic advice
        const p = profile || {};
        const tips = [];
        if (latest.agni) {
          const weak = latest.agni.Manda > (latest.agni.Tikshna||0) && latest.agni.Manda > (latest.agni.Sama||0);
          if (weak) tips.push('Your Agni seems low (Manda). Prefer warm, light meals and sip ginger-infused water.');
        }
        if (doshaBlend.Vata >= (doshaBlend.Pitta||0) && doshaBlend.Vata >= (doshaBlend.Kapha||0)) tips.push('Vata tendencies noted. Favor warmth, regularity, and grounding foods like cooked grains and soups.');
        if (doshaBlend.Pitta > doshaBlend.Vata && doshaBlend.Pitta > doshaBlend.Kapha) tips.push('Pitta tendencies noted. Favor cooling foods, avoid excessive spice, and schedule calming breaks.');
        if (doshaBlend.Kapha > doshaBlend.Vata && doshaBlend.Kapha > doshaBlend.Pitta) tips.push('Kapha tendencies noted. Favor light, warming meals and get a brisk walk to energize.');
        if (p.sleepDuration && p.sleepDuration < 7) tips.push('Aim for 7–8 hours of sleep tonight to support balance.');
        if (p.hydration) tips.push('Keep steady hydration; warm water between meals supports digestion.');
        setAdvice(`Here’s a concise plan for today (Heuristic Mode):\n\n- ${tips.join('\n- ')}\n\n💡 Tip: Add your Groq API key in frontend/.env to enable deep LLM clinical analysis with ${currentModel}.`);
      }
    } catch (e) {
      console.error('Error generating advice:', e);
      setAdvice(`There was an issue creating advice: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={styles.page} data-reveal>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Your Personal AI</h1>
          <div className={styles.subtitle}>
            Clinical guidance powered by Groq (<code>{currentModel}</code>)
          </div>
        </div>
        <Link className={styles.backLink} to="/dashboard">← Back to Dashboard</Link>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Current Snapshot</h3>
          <div className={styles.kpis}>
            <div className={styles.kpi}><span>{(doshaBlend.Vata||0)}</span><small>Vata</small></div>
            <div className={styles.kpi}><span>{(doshaBlend.Pitta||0)}</span><small>Pitta</small></div>
            <div className={styles.kpi}><span>{(doshaBlend.Kapha||0)}</span><small>Kapha</small></div>
          </div>
          <div style={{ maxWidth: 380, marginTop: 6 }}>
            <Doughnut data={doshaData} options={{ plugins: { legend: { position: 'bottom' } } }} />
          </div>
          {latest.vikriti && (
            <ul className={styles.list}>
              <li>Vikriti: {Object.entries(latest.vikriti).map(([k,v])=>`${k}:${v}`).join(', ')}</li>
            </ul>
          )}
        </div>

        <div className={styles.card}>
          <h3>Guided Advice</h3>
          <div className={styles.actions}>
            <button className={styles.btn} onClick={generateAdvice} disabled={busy}>
              {busy ? 'Generating with Groq…' : 'Generate Advice'}
            </button>
            {!hasKey && (
              <span className={styles.notice}>
                Set <code>REACT_APP_GROQ_API_KEY</code> in <code>.env</code> for Groq AI responses.
              </span>
            )}
          </div>
          <div className={styles.advice} style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
            {advice || 'Click “Generate Advice” to see personalized suggestions.'}
          </div>
        </div>

        <div className={styles.card}>
          <h3>Recent Trends</h3>
          {vikritiSeries?.length ? (
            <Line data={lineData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
          ) : (
            <div className={styles.notice}>Take Vikriti a few times to see your trend.</div>
          )}
        </div>
      </div>

      <div className={styles.card} style={{ marginTop: 10 }}>
        <h3>What to do next</h3>
        <div className={styles.row}>
          <div className={styles.card}>
            <strong>Retake Vikriti</strong>
            <p>Track changes weekly, especially after diet/lifestyle tweaks.</p>
          </div>
          <div className={styles.card}>
            <strong>Daily Agni Check</strong>
            <p>Use the dashboard’s Daily Agni to align meals and timings.</p>
          </div>
          <div className={styles.card}>
            <strong>Review Diet Plan</strong>
            <p>Adjust foods for your dominant tendencies and current state.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
