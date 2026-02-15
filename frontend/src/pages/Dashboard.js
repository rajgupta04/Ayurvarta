// Commit on 2026-02-13
import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { userProfile, currentDosha, currentDietPlan, dailyStats, nutrientsSuggested, improvementSeries, sleepSeries, records } from '../data/userDashboard';
import { useAuth } from '../contexts/AuthContext';
import { Line, Doughnut } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { loadProfile } from '../utils/profileStorage';
import { getHistory } from '../utils/assessmentStorage';
import Sidebar from '../components/Sidebar';
import PrakritiAssessment from './PrakritiAssessment';
import VikritiAssessment from './VikritiAssessment';
import AgniAssessment from './AgniAssessment';
import AgniDailyModal from '../components/AgniDailyModal';
import FoodLibrary from './FoodLibrary';
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

// helper to load saved food library
function loadSavedFood() {
  try {
    const raw = localStorage.getItem('foodLibrarySelection');
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' ? obj : {};
  } catch { return {}; }
}

export default function Dashboard() {
  const printRef = useRef(null);
  const saved = useMemo(() => loadProfile(), []);
  const history = useMemo(() => getHistory(), []);
  const [agniOpen, setAgniOpen] = useState(false);
  const [showReminder, setShowReminder] = useState(true);
  const savedFood = useMemo(() => loadSavedFood(), []);
  const { userDocument, currentUser } = useAuth();
  const displayName = (userDocument?.displayName || currentUser?.displayName || userProfile.name || currentUser?.email?.split('@')[0] || 'User');

  const handleDownloadPNG = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'dashboard-snapshot.png';
    link.click();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // Fit image into page while preserving aspect ratio
    let imgWidth = pageWidth - 20; // 10mm margins
    let imgHeight = (canvas.height * imgWidth) / canvas.width;
    if (imgHeight > pageHeight - 20) {
      imgHeight = pageHeight - 20;
      imgWidth = (canvas.width * imgHeight) / canvas.height;
    }
    const x = (pageWidth - imgWidth) / 2;
    const y = 10;
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
    pdf.save('dashboard.pdf');
  };
  const lineData = {
    labels: improvementSeries.labels,
    datasets: [
      { label: 'Energy', data: improvementSeries.energy, borderColor: '#e67e22', backgroundColor: 'rgba(230,126,34,0.15)', tension: 0.3, fill: true },
      { label: 'Digestion', data: improvementSeries.digestion, borderColor: '#3d5a46', backgroundColor: 'rgba(61,90,70,0.15)', tension: 0.3, fill: true },
      { label: 'Mood', data: improvementSeries.mood, borderColor: '#b7791f', backgroundColor: 'rgba(183,121,31,0.15)', tension: 0.3, fill: true },
    ]
  };

  const sleepData = {
    labels: sleepSeries.labels,
    datasets: [
      { label: 'Sleep Hours', data: sleepSeries.hours, borderColor: '#3d5a46', backgroundColor: 'rgba(61,90,70,0.15)', tension: 0.3 }
    ]
  };

  const doshaData = {
    labels: ['Vata', 'Pitta', 'Kapha'],
    datasets: [{
      data: [currentDosha.blend.Vata, currentDosha.blend.Pitta, currentDosha.blend.Kapha],
      backgroundColor: ['#7f8c8d', '#e67e22', '#16a085'],
      borderWidth: 0
    }]
  };

  const [panel, setPanel] = useState('overview');
  return (
    <section className={styles.page} data-reveal ref={printRef}>
      <div className={styles.dashboardContainer}>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 12 }}>
          <Sidebar onSelect={(p)=>setPanel(p)} />
          <div>
      <div className={styles.headerRow}>
        <div className={styles.profile}>
          <img className={styles.avatar} src={userProfile.avatar} alt={userProfile.name} />
          <div>
            <h1 className={styles.title}>Welcome back, {displayName.split(' ')[0]}</h1>
            <p className={styles.subtitle}>Your current snapshot and progress • <em>{saved?.role || 'as Dietitian'}</em></p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.doshaBadge}>Dominant: <strong>{currentDosha.dominant}</strong></div>
          <div className={styles.toolbar}>
    <button className={styles.toolBtn} onClick={() => setAgniOpen(true)}>Daily Agni</button>
            <button className={styles.toolBtn} onClick={handleDownloadPNG}>Download PNG</button>
            <button className={`${styles.toolBtn} ${styles.alt}`} onClick={handleDownloadPDF}>Download PDF</button>
            <a className={styles.toolBtn} href="/profile">Edit Profile</a>
          </div>
        </div>
      </div>
      
  {/* Video quick-start removed from dashboard per request */}

  {panel === 'overview' && showReminder && (
        <div className={styles.reminderPop} role="status" aria-live="polite">
          <span>Daily Agni due</span>
          <button className={styles.reminderBtn} onClick={() => setAgniOpen(true)}>Start now</button>
          <button className={styles.reminderBtn} onClick={() => setShowReminder(false)} aria-label="Dismiss">✕</button>
        </div>
      )}

      {panel !== 'overview' ? (
        <div className={styles.card}>
          {panel === 'prakriti' && <PrakritiAssessment />}
          {panel === 'vikriti' && <VikritiAssessment />}
          {panel === 'agni' && <AgniAssessment />}
          {panel === 'food' && <FoodLibrary embed />}
        </div>
      ) : (
      <div className={styles.grid}> 
          <div className={`${styles.card} ${styles.wide}`}>
            <h3>Improvement Trends</h3>
            <div className={styles.chartTall}>
              <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { suggestedMin: 0, suggestedMax: 100 } } }} />
            </div>
          </div>
        {/* Dosha pie chart */}
        <div className={styles.card}>
          <h3>Current Dosha Blend</h3>
          <Doughnut data={doshaData} options={{ plugins: { legend: { position: 'bottom' } } }} />
        </div>
        <div className={styles.card}>
          <h3>Your Food Library</h3>
          {Object.keys(savedFood).length ? (
            <ul className={styles.list}>
              {Object.keys(savedFood).map(cat => (
                (savedFood[cat]?.length ? (
                  <li key={cat}>
                    <strong style={{textTransform:'capitalize'}}>{cat}</strong>: {savedFood[cat].join(', ')}
                  </li>
                ) : null)
              ))}
            </ul>
          ) : (
            <p>No items saved yet. <Link className={styles.cta} to="/food">Save your Food Library →</Link></p>
          )}
          <div className={styles.actions}>
            <Link className={styles.cta} to="/food">Manage Food Library →</Link>
          </div>
        </div>

        {/* Combined assessments: Prakriti & Vikriti as rows */}
        {(history?.prakriti?.length || history?.vikriti?.length) ? (
          <div className={styles.card}>
            <h3>Assessments</h3>
            <div className={styles.rows}>
              {history?.prakriti?.length ? (
                <div>
                  <strong>Prakriti</strong>
                  <ul className={styles.list}>
                    {history.prakriti.slice(0, 3).map((h, i) => (
                      <li key={i}>
                        <strong>{new Date(h.ts).toLocaleString()}</strong> — V:{h.scores?.Vata ?? 0}, P:{h.scores?.Pitta ?? 0}, K:{h.scores?.Kapha ?? 0}
                        {' '}<a href="#prakriti" onClick={(e)=>{e.preventDefault(); setPanel('prakriti');}} className={styles.cta}>Retake →</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {history?.vikriti?.length ? (
                <div>
                  <strong>Vikriti</strong>
                  <ul className={styles.list}>
                    {history.vikriti.slice(0, 3).map((h, i) => (
                      <li key={i}>
                        <strong>{new Date(h.ts).toLocaleString()}</strong> — {h.scores ? Object.keys(h.scores).map((k) => `${k}:${h.scores[k]}`).join(', ') : 'No scores'} {h.disease?.disease ? `• ${h.disease.disease}` : ''}
                        {' '}<a href="#vikriti" onClick={(e)=>{e.preventDefault(); setPanel('vikriti');}} className={styles.cta}>Retake →</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {history?.agni?.length ? (
          <div className={styles.card}>
            <h3>Agni History</h3>
            <ul className={styles.list}>
              {history.agni.map((h, i) => (
                <li key={i}>
                  <strong>{new Date(h.ts).toLocaleString()}</strong> —{' '}
                  {h.scores ? Object.keys(h.scores).map((k) => `${k}:${h.scores[k]}`).join(', ') : 'No scores'}{' '}
                  <a href="#agni" onClick={(e)=>{e.preventDefault(); setPanel('agni');}} className={styles.cta}>Retake →</a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

  {/* Video consultation card removed from dashboard per request */}
        {saved && (
          <div className={styles.card}>
            <h3>Medical Profile</h3>
            <ul className={styles.list}>
              <li><strong>{saved.firstName} {saved.lastName}</strong> — {saved.age} • {saved.gender}</li>
              <li>{saved.email} • {saved.contactNumber}</li>
              <li>{saved.address}</li>
              <li>Diet: {saved.dietType} • Meals/day: {saved.mealFrequency} • Sleep: {saved.sleepDuration}h</li>
              <li>BM: {saved.bowelMovementFrequency} • {saved.bowelMovementType} • Appetite: {saved.appetiteLevel}</li>
              <li>Weight: {saved.weight}kg • Height: {saved.height}cm • BMI: {saved.bmi}</li>
              {saved.digestionIssues?.length ? <li>Digestion: {saved.digestionIssues.join(', ')}</li> : null}
              {saved.medicalHistory?.length ? <li>History: {saved.medicalHistory.join(', ')}</li> : null}
              {saved.allergies?.length ? <li>Allergies: {saved.allergies.join(', ')}</li> : null}
              {saved.currentMedications?.length ? <li>Medications: {saved.currentMedications.join(', ')}</li> : null}
            </ul>
          </div>
        )}

        <div className={styles.card}>
          <h3>Sleep (Last 7 days)</h3>
          <Line data={sleepData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { suggestedMin: 0, suggestedMax: 10 } } }} />
        </div>

        <div className={styles.card}>
          <h3>Your Personal AI</h3>
          <p>See what you should focus on today, your current scores, and improvement tips.</p>
          <div className={styles.actions}>
            <Link className={styles.cta} to="/dashboard/ai">Open Personal AI →</Link>
          </div>
        </div>

        

        <div className={styles.card}>
          <h3>Current Diet Plan</h3>
          <p><strong>{currentDietPlan.title}</strong></p>
          <ul className={styles.list}>
            <li>Next: {currentDietPlan.nextMeal}</li>
            <li>Hydration: {currentDietPlan.hydration}</li>
          </ul>
          <a className={styles.cta} href="/diet-plan">View plan →</a>
        </div>

        <div className={styles.card}>
          <h3>Daily Stats</h3>
          <div className={styles.kpis}>
            <div className={styles.kpi}><span>{dailyStats.sleepHours}h</span><small>Sleep</small></div>
            <div className={styles.kpi}><span>{dailyStats.waterIntakeL}L</span><small>Water</small></div>
            <div className={styles.kpi}><span>BM</span><small>{dailyStats.bowelMovement}</small></div>
          </div>
        </div>

        {saved && (
          <div className={styles.card}>
            <h3>Ayurveda Alignment</h3>
            <ul className={styles.list}>
              <li>Dominant Dosha: <strong>{saved.dominantDosha || currentDosha.dominant}</strong></li>
              {saved.doshaImbalance?.length ? <li>Imbalance: {saved.doshaImbalance.join(', ')}</li> : null}
              {saved.recommendedDiet?.length ? <li>Recommended: {saved.recommendedDiet.join(', ')}</li> : null}
              {saved.restrictedDiet?.length ? <li>Restricted: {saved.restrictedDiet.join(', ')}</li> : null}
            </ul>
          </div>
        )}

        <div className={styles.card}>
          <h3>Nutrients Suggested</h3>
          <ul className={styles.list}>
            {nutrientsSuggested.map(n => (
              <li key={n.name}><strong>{n.name}</strong> — {n.reason}</li>
            ))}
          </ul>
        </div>

        <div className={styles.card}>
          <h3>Records & Notes</h3>
          <ul className={styles.list}>
            {records.map(r => (
              <li key={r.date}><strong>{r.date}</strong> — {r.note}</li>
            ))}
          </ul>
        </div>
  </div>
  )}
        </div>
      </div>
      </div>
  <AgniDailyModal open={agniOpen} onClose={() => setAgniOpen(false)} />
    </section>
  );
}

// Commit on 2026-02-15 
// Commit on 2026-02-15 
