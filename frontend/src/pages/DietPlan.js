// Commit on 2026-02-16
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import styles from './DietPlan.module.css';
import { mockDietPlan } from '../data/mockDietPlan';
import { getHistory, clearAssessmentHistory } from '../utils/assessmentStorage';
import DietPreferencesModal from '../components/DietPreferencesModal';
import {
  createDietLog,
  deleteDietLog,
  getDietJobStatus,
  getDietLogs,
  getLatestDietJob,
  startDietPlanGeneration,
} from '../api/diet';

const POLL_INTERVAL_MS = 2500;

const DietPlan = () => {
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiDietPlan, setApiDietPlan] = useState(null);
  const [error, setError] = useState(null);
  const [jobState, setJobState] = useState({ id: null, status: 'none', message: '' });
  const [dietLogs, setDietLogs] = useState([]);
  const [logForm, setLogForm] = useState({ mealType: 'Breakfast', mealName: '', notes: '', adherence: 4 });
  const [logError, setLogError] = useState('');
  const [jobNotice, setJobNotice] = useState('');

  const captureRef = useRef(null);

  const history = useMemo(() => getHistory(), []);
  const hasPrakriti = history?.prakriti?.length > 0;
  const hasVikriti = history?.vikriti?.length > 0;
  const hasAgni = history?.agni?.length > 0;
  const canAccessDiet = hasPrakriti && hasVikriti && hasAgni;

  useEffect(() => {
    let mounted = true;

    const loadInitial = async () => {
      try {
        const [latestJob, logsResponse] = await Promise.all([getLatestDietJob(), getDietLogs(30)]);
        if (!mounted) return;

        if (latestJob?.id && latestJob?.status !== 'none') {
          setJobState({
            id: latestJob.id,
            status: latestJob.status,
            message: latestJob.message || '',
          });

          if (latestJob.status === 'completed' && latestJob.result) {
            setApiDietPlan(latestJob.result);
          }
        }

        setDietLogs(logsResponse?.items || []);
      } catch {
        // Ignore unauthenticated and startup errors for first paint.
      }
    };

    loadInitial();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!jobState.id || !['queued', 'running'].includes(jobState.status)) return undefined;

    setIsLoading(true);

    const timer = window.setInterval(async () => {
      try {
        const next = await getDietJobStatus(jobState.id);
        setJobState({ id: next.id, status: next.status, message: next.message || '' });

        if (next.status === 'completed') {
          setApiDietPlan(next.result || null);
          setIsLoading(false);
          setJobNotice(next.message || 'Congratulations! Your diet is ready.');
          window.clearInterval(timer);
        }

        if (next.status === 'failed') {
          setError(next?.error?.message || next?.message || 'Diet generation failed. Please try again.');
          setIsLoading(false);
          window.clearInterval(timer);
        }
      } catch (pollError) {
        setError(pollError.message || 'Unable to check diet generation status.');
        setIsLoading(false);
        window.clearInterval(timer);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [jobState.id, jobState.status]);

  const renderListSection = (sectionData) => {
    const items = sectionData?.items || [];
    return (
      <section className={styles.planSection}>
        <div className={styles.sectionHeader}>
          {sectionData?.icon && (
            <img src={`/images/${sectionData.icon}`} alt="" className={styles.sectionIcon} />
          )}
          <h2>{sectionData?.title || 'Section'}</h2>
        </div>
        <ul className={styles.itemList}>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>
    );
  };

  const handleDownloadPNG = async () => {
    if (!captureRef.current) return;
    const canvas = await html2canvas(captureRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'diet-plan.png';
    link.click();
  };

  const handleDownloadPDF = async () => {
    if (!captureRef.current) return;
    const canvas = await html2canvas(captureRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let imgWidth = pageWidth - 20;
    let imgHeight = (canvas.height * imgWidth) / canvas.width;
    if (imgHeight > pageHeight - 20) {
      imgHeight = pageHeight - 20;
      imgWidth = (canvas.width * imgHeight) / canvas.height;
    }
    const x = (pageWidth - imgWidth) / 2;
    pdf.addImage(imgData, 'PNG', x, 10, imgWidth, imgHeight, undefined, 'FAST');
    pdf.save('diet-plan.pdf');
  };

  const handleRegeneratePlan = () => {
    clearAssessmentHistory();
    setShowRegenerateConfirm(false);
    setApiDietPlan(null);
    setError(null);
    setJobState({ id: null, status: 'none', message: '' });
    window.location.reload();
  };

  const getAgniType = (agniScores) => {
    const { Vishama = 0, Tikshna = 0, Manda = 0 } = agniScores;
    const max = Math.max(Vishama, Tikshna, Manda);
    if (max === 0) return 'weak';
    if (Vishama === max) return 'irregular';
    if (Tikshna === max) return 'strong';
    return 'weak';
  };

  const buildDietPayload = (preferences) => ({
    profile: {
      prakriti: {
        vata: history.prakriti[0]?.scores?.Vata || 0,
        pitta: history.prakriti[0]?.scores?.Pitta || 0,
        kapha: history.prakriti[0]?.scores?.Kapha || 0,
      },
      vikriti: {
        vata: history.vikriti[0]?.scores?.Vata || 0,
        pitta: history.vikriti[0]?.scores?.Pitta || 0,
        kapha: history.vikriti[0]?.scores?.Kapha || 0,
      },
    },
    health: {
      agni: getAgniType(history.agni[0]?.scores || {}),
      ama: 'moderate',
    },
    dietPreferences: {
      dietType: preferences.dietType,
      allergies: preferences.allergies,
      cuisine: preferences.cuisine,
    },
    environment: {
      season: preferences.season,
    },
    goals: {
      primaryGoal: preferences.primaryGoal,
    },
  });

  const handleGeneratePlan = async (preferences) => {
    setShowPreferencesModal(false);
    setIsLoading(true);
    setError(null);
    setJobNotice('');

    try {
      const payload = buildDietPayload(preferences);
      const job = await startDietPlanGeneration(payload);
      setJobState({ id: job.id, status: job.status, message: job.message || '' });
    } catch (err) {
      setError(err.message || 'Failed to start diet generation.');
      setIsLoading(false);
    }
  };

  const onCreateDietLog = async (event) => {
    event.preventDefault();
    if (!logForm.mealName.trim()) {
      setLogError('Meal name is required.');
      return;
    }

    setLogError('');
    try {
      const created = await createDietLog({
        mealType: logForm.mealType,
        mealName: logForm.mealName.trim(),
        notes: logForm.notes.trim(),
        adherence: Number(logForm.adherence),
      });
      setDietLogs((prev) => [created, ...prev]);
      setLogForm({ mealType: logForm.mealType, mealName: '', notes: '', adherence: 4 });
    } catch (err) {
      setLogError(err.message || 'Failed to save diet log.');
    }
  };

  const onDeleteDietLog = async (id) => {
    try {
      await deleteDietLog(id);
      setDietLogs((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setLogError(err.message || 'Failed to delete diet log.');
    }
  };

  if (!canAccessDiet) {
    return (
      <div className={styles.dietPlan}>
        <div className={styles.planCard}>
          <div className={styles.assessmentRequired}>
            <h1>Complete Your Assessments First</h1>
            <p className={styles.summary}>
              To generate your personalized Ayurvedic diet plan, you need Prakriti, Vikriti, and Agni assessments.
            </p>

            <div className={styles.assessmentStatus}>
              <div className={`${styles.statusItem} ${hasPrakriti ? styles.completed : styles.pending}`}>
                <span className={styles.statusIcon}>{hasPrakriti ? '✓' : '○'}</span>
                <div>
                  <h3>Prakriti Assessment</h3>
                  <p>Determine your natural constitution</p>
                </div>
                {!hasPrakriti && <Link to="/assessment/prakriti" className={styles.assessmentBtn}>Take Assessment</Link>}
              </div>

              <div className={`${styles.statusItem} ${hasVikriti ? styles.completed : styles.pending}`}>
                <span className={styles.statusIcon}>{hasVikriti ? '✓' : '○'}</span>
                <div>
                  <h3>Vikriti Assessment</h3>
                  <p>Identify your current imbalances</p>
                </div>
                {!hasVikriti && <Link to="/assessment/vikriti" className={styles.assessmentBtn}>Take Assessment</Link>}
              </div>

              <div className={`${styles.statusItem} ${hasAgni ? styles.completed : styles.pending}`}>
                <span className={styles.statusIcon}>{hasAgni ? '✓' : '○'}</span>
                <div>
                  <h3>Agni Assessment</h3>
                  <p>Evaluate your digestive fire strength</p>
                </div>
                {!hasAgni && <Link to="/assessment/agni" className={styles.assessmentBtn}>Take Assessment</Link>}
              </div>
            </div>

            <div className={styles.actions}>
              <Link to="/assessment/combined" className={styles.primaryBtn}>Take All Assessments</Link>
              <Link to="/dashboard" className={styles.secondaryBtn}>Back to Dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!apiDietPlan && !isLoading && !error) {
    return (
      <div className={styles.dietPlan}>
        <div className={styles.planCard}>
          <div className={styles.assessmentRequired}>
            <h1>Ready to Generate Your Diet Plan!</h1>
            <p className={styles.summary}>
              We will start your RAG pipeline in the background and notify you when your diet is ready.
            </p>

            <div className={styles.actions}>
              <button onClick={() => setShowPreferencesModal(true)} className={styles.primaryBtn}>
                Set Preferences & Generate Plan
              </button>
              <Link to="/dashboard" className={styles.secondaryBtn}>Back to Dashboard</Link>
            </div>
          </div>
        </div>

        <DietPreferencesModal
          isOpen={showPreferencesModal}
          onClose={() => setShowPreferencesModal(false)}
          onSubmit={handleGeneratePlan}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.dietPlan}>
        <div className={styles.planCard}>
          <div className={styles.assessmentRequired}>
            <h1>Generating Your Personalized Diet Plan...</h1>
            <p className={styles.summary}>{jobState.message || 'Please wait while we process your dosha profile and preferences.'}</p>
            <div className={styles.loader}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dietPlan}>
        <div className={styles.planCard}>
          <div className={styles.assessmentRequired}>
            <h1>Diet Generation Issue</h1>
            <p className={styles.summary}>{error}</p>
            <div className={styles.actions}>
              <button onClick={() => setShowPreferencesModal(true)} className={styles.primaryBtn}>Try Again</button>
              <Link to="/dashboard" className={styles.secondaryBtn}>Back to Dashboard</Link>
            </div>
          </div>
        </div>

        <DietPreferencesModal
          isOpen={showPreferencesModal}
          onClose={() => setShowPreferencesModal(false)}
          onSubmit={handleGeneratePlan}
        />
      </div>
    );
  }

  const dietData = apiDietPlan || mockDietPlan;
  const {
    summary = '',
    doshaProfile = { dominant: 'Unknown', secondary: 'Unknown', agni: 'Unknown', goals: [] },
    rasaFocus = { favor: [], reduce: [] },
    gunaFocus = { favor: [], reduce: [] },
    dailyMealPlan = { title: '', meals: [] },
    recommendedFoods = { title: '', icon: '', items: [] },
    foodsToAvoid = { title: '', icon: '', items: [] },
    lifestyleTips = { title: '', icon: '', items: [] },
    seasonalTips = { title: '', tips: [] },
    hydration = { title: '', points: [] },
    spices = { title: '', favor: [], moderate: [], reduce: [] },
  } = dietData;

  return (
    <div className={styles.dietPlan}>
      <div className={styles.planCard} ref={captureRef}>
        <h1>Your Personalized Ayurvedic Diet & Lifestyle Plan</h1>
        <p className={styles.summary}>{jobNotice || summary}</p>

        <section className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <img src="/images/pitta.png" alt="Dosha profile" className={styles.sectionIcon} />
            <div>
              <h2>Dosha Profile</h2>
              <p className={styles.subtle}>
                Dominant: {doshaProfile?.dominant || 'Unknown'} • Secondary: {doshaProfile?.secondary || 'Unknown'} • Agni: {doshaProfile?.agni || 'Unknown'}
              </p>
            </div>
          </div>
          <ul className={styles.goalList}>
            {(doshaProfile?.goals || []).map((goal, idx) => <li key={idx}>{goal}</li>)}
          </ul>
        </section>

        <section className={styles.chipsRow}>
          <div className={styles.chipsCol}>
            <h3>Rasa (Tastes) to Favor</h3>
            <div className={styles.chips}>{(rasaFocus?.favor || []).map((r) => <span key={r} className={`${styles.chip} ${styles.chipGood}`}>{r}</span>)}</div>
            <h4 className={styles.subtle}>Reduce</h4>
            <div className={styles.chips}>{(rasaFocus?.reduce || []).map((r) => <span key={r} className={`${styles.chip} ${styles.chipWarn}`}>{r}</span>)}</div>
          </div>
          <div className={styles.chipsCol}>
            <h3>Guna (Qualities) Focus</h3>
            <div className={styles.chips}>{(gunaFocus?.favor || []).map((g) => <span key={g} className={`${styles.chip} ${styles.chipGood}`}>{g}</span>)}</div>
            <h4 className={styles.subtle}>Reduce</h4>
            <div className={styles.chips}>{(gunaFocus?.reduce || []).map((g) => <span key={g} className={`${styles.chip} ${styles.chipWarn}`}>{g}</span>)}</div>
          </div>
        </section>

        <section className={styles.planSection}>
          <div className={styles.sectionHeader}><h2>{dailyMealPlan?.title || 'Daily Meal Plan'}</h2></div>
          <div className={styles.mealPlan}>
            {(dailyMealPlan?.meals || []).map((meal, index) => (
              <div key={index} className={styles.meal}>
                <h4>{meal?.name || 'Meal'}</h4>
                <p>{meal?.description || 'No description available'}</p>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.gridContainer}>
          {renderListSection(recommendedFoods)}
          {renderListSection(foodsToAvoid)}
        </div>

        {renderListSection(lifestyleTips)}

        <section className={styles.planSection}>
          <div className={styles.sectionHeader}>
            <img src="/images/programs-icon.png" alt="Seasonal tips" className={styles.sectionIcon} />
            <h2>{seasonalTips.title || 'Seasonal Tips'}</h2>
          </div>
          <div className={styles.seasonList}>
            {(seasonalTips.tips || []).map((tip, idx) => (
              <div key={idx} className={styles.seasonItem}>
                <div className={styles.seasonBadge}>{tip.season}</div>
                <div className={styles.seasonNote}>{tip.note}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.planSection}>
          <div className={styles.sectionHeader}>
            <img src="/images/support-icon.png" alt="Hydration" className={styles.sectionIcon} />
            <h2>{hydration.title || 'Hydration'}</h2>
          </div>
          <ul className={styles.itemList}>{(hydration.points || []).map((point, idx) => <li key={idx}>{point}</li>)}</ul>
        </section>

        <section className={styles.planSection}>
          <div className={styles.sectionHeader}>
            <img src="/images/programs-icon.png" alt="Spices" className={styles.sectionIcon} />
            <h2>{spices.title || 'Spices'}</h2>
          </div>
          <div className={styles.spiceGrid}>
            <div><h4>Favor</h4><div className={styles.chips}>{(spices.favor || []).map((s) => <span key={s} className={`${styles.chip} ${styles.chipGood}`}>{s}</span>)}</div></div>
            <div><h4>Moderate</h4><div className={styles.chips}>{(spices.moderate || []).map((s) => <span key={s} className={styles.chip}>{s}</span>)}</div></div>
            <div><h4>Reduce</h4><div className={styles.chips}>{(spices.reduce || []).map((s) => <span key={s} className={`${styles.chip} ${styles.chipWarn}`}>{s}</span>)}</div></div>
          </div>
        </section>

        <section className={styles.planSection}>
          <div className={styles.sectionHeader}><h2>Diet Logger</h2></div>
          <form className={styles.loggerForm} onSubmit={onCreateDietLog}>
            <select value={logForm.mealType} onChange={(e) => setLogForm((p) => ({ ...p, mealType: e.target.value }))}>
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Snack</option>
            </select>
            <input
              type="text"
              placeholder="Meal name"
              value={logForm.mealName}
              onChange={(e) => setLogForm((p) => ({ ...p, mealName: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Notes"
              value={logForm.notes}
              onChange={(e) => setLogForm((p) => ({ ...p, notes: e.target.value }))}
            />
            <input
              type="number"
              min="1"
              max="5"
              value={logForm.adherence}
              onChange={(e) => setLogForm((p) => ({ ...p, adherence: e.target.value }))}
            />
            <button className={styles.primaryBtn} type="submit">Add Log</button>
          </form>
          {logError ? <p className={styles.subtle}>{logError}</p> : null}

          <ul className={styles.itemList}>
            {dietLogs.length === 0 ? <li>No logs yet. Start tracking your meals.</li> : null}
            {dietLogs.map((item) => (
              <li key={item.id}>
                <strong>{item.mealType}</strong>: {item.mealName} ({item.adherence || '-'} / 5)
                {item.notes ? ` • ${item.notes}` : ''}
                <button className={styles.cancelBtn} style={{ marginLeft: 10 }} onClick={() => onDeleteDietLog(item.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </section>

        <div className={styles.actions}>
          <button className={styles.downloadButton} onClick={handleDownloadPNG}>Download PNG</button>
          <button className={styles.downloadButton} onClick={handleDownloadPDF}>Download PDF</button>
          <button className={styles.regenerateButton} onClick={() => setShowRegenerateConfirm(true)}>Regenerate Plan</button>
          <span className={styles.printIcon} onClick={handleDownloadPDF} title="Download PDF">🖨️</span>
        </div>

        {showRegenerateConfirm && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>Regenerate Your Diet Plan?</h3>
              <p>This clears your current assessments and requires re-taking all core assessments.</p>
              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleRegeneratePlan}>Yes, Regenerate</button>
                <button className={styles.cancelBtn} onClick={() => setShowRegenerateConfirm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <DietPreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onSubmit={handleGeneratePlan}
      />
    </div>
  );
};

ex