// Commit on 2026-03-11
import React, { useEffect, useMemo, useState } from 'react';
import styles from './MedicalProfile.module.css';
import pageStyles from './Assessment.module.css';
import { loadProfile, saveProfile } from '../utils/profileStorage';

const enumOpts = {
  gender: ['Male', 'Female', 'Other'],
  dietType: ['Vegetarian', 'Vegan', 'Non-Vegetarian', 'Eggetarian', 'Other'],
  bowelMovementFrequency: ['Daily', 'Alternate Days', 'Irregular'],
  appetiteLevel: ['Low', 'Normal', 'High'],
  exerciseRoutine: ['None', 'Light', 'Moderate', 'Intense'],
  dominantDosha: ['Vata', 'Pitta', 'Kapha'],
};

export default function MedicalProfile() {
  const [form, setForm] = useState(() => loadProfile() || {
    // Basic Details
    patientId: '', firstName: '', lastName: '', age: '', gender: '', contactNumber: '', email: '', address: '',
    // Lifestyle & Dietary
    dietType: '', mealFrequency: '', snackingHabits: '', waterIntake: '', alcoholIntake: false, alcoholFrequency: '', caffeineIntake: false, caffeineCups: '', sleepDuration: '', exerciseRoutine: '',
    // Health & Bowel
    bowelMovementFrequency: '', bowelMovementType: '', appetiteLevel: '', digestionIssues: [],
    // Critical Health
    weight: '', height: '', bmi: '', bloodPressure: '', bloodSugar: '', cholesterol: '', medicalHistory: [], allergies: [], currentMedications: [],
    // Ayurveda-specific
    dominantDosha: '', doshaImbalance: [], recommendedDiet: [], restrictedDiet: [],
  });

  const bmi = useMemo(() => {
    const h = parseFloat(form.height); // cm
    const w = parseFloat(form.weight); // kg
    if (!h || !w) return '';
    const meters = h / 100;
    const val = w / (meters * meters);
    return Math.round(val * 10) / 10;
  }, [form.height, form.weight]);

  useEffect(() => {
    setForm(f => ({ ...f, bmi }));
  }, [bmi]);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const submit = (e) => {
    e.preventDefault();
    const ok = saveProfile(form);
    if (ok) alert('Profile saved');
    else alert('Could not save profile');
  };

  return (
    <section className={pageStyles.page} data-reveal>
      <h1 className={pageStyles.title}>Medical Profile</h1>
      <p className={pageStyles.subtitle}>Fill your basic details, lifestyle, health parameters, and Ayurveda alignment. This powers your dashboard and recommendations.</p>

      <form className={styles.form} onSubmit={submit}>
        <fieldset className={styles.group}>
          <legend>Basic Details</legend>
          <div className={styles.grid2}>
            <label>Patient ID<input value={form.patientId} onChange={e=>update('patientId', e.target.value)} placeholder="UUID or your ID" /></label>
            <label>First Name<input value={form.firstName} onChange={e=>update('firstName', e.target.value)} /></label>
            <label>Last Name<input value={form.lastName} onChange={e=>update('lastName', e.target.value)} /></label>
            <label>Age<input type="number" value={form.age} onChange={e=>update('age', e.target.value)} /></label>
            <label>Gender<select value={form.gender} onChange={e=>update('gender', e.target.value)}><option value="">Select</option>{enumOpts.gender.map(o=><option key={o} value={o}>{o}</option>)}</select></label>
            <label>Contact Number<input value={form.contactNumber} onChange={e=>update('contactNumber', e.target.value)} /></label>
            <label>Email<input type="email" value={form.email} onChange={e=>update('email', e.target.value)} /></label>
            <label className={styles.col2}>Address<textarea value={form.address} onChange={e=>update('address', e.target.value)} rows={2} /></label>
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Lifestyle & Dietary Habits</legend>
          <div className={styles.grid2}>
            <label>Diet Type<select value={form.dietType} onChange={e=>update('dietType', e.target.value)}><option value="">Select</option>{enumOpts.dietType.map(o=><option key={o} value={o}>{o}</option>)}</select></label>
            <label>Meals/Day<input type="number" value={form.mealFrequency} onChange={e=>update('mealFrequency', e.target.value)} /></label>
            <label>Snacking Habits<input value={form.snackingHabits} onChange={e=>update('snackingHabits', e.target.value)} placeholder="Frequent, Occasional" /></label>
            <label>Water Intake (L/day)<input type="number" step="0.1" value={form.waterIntake} onChange={e=>update('waterIntake', e.target.value)} /></label>
            <label className={styles.inline}><input type="checkbox" checked={!!form.alcoholIntake} onChange={e=>update('alcoholIntake', e.target.checked)} /> Alcohol intake</label>
            {form.alcoholIntake && <label>Frequency<input value={form.alcoholFrequency} onChange={e=>update('alcoholFrequency', e.target.value)} placeholder="e.g., Weekly" /></label>}
            <label className={styles.inline}><input type="checkbox" checked={!!form.caffeineIntake} onChange={e=>update('caffeineIntake', e.target.checked)} /> Caffeine intake</label>
            {form.caffeineIntake && <label>Cups/Day<input type="number" value={form.caffeineCups} onChange={e=>update('caffeineCups', e.target.value)} /></label>}
            <label>Sleep (hours/night)<input type="number" step="0.1" value={form.sleepDuration} onChange={e=>update('sleepDuration', e.target.value)} /></label>
            <label>Exercise<select value={form.exerciseRoutine} onChange={e=>update('exerciseRoutine', e.target.value)}><option value="">Select</option>{enumOpts.exerciseRoutine.map(o=><option key={o} value={o}>{o}</option>)}</select></label>
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Health & Bowel Movements</legend>
          <div className={styles.grid2}>
            <label>BM Frequency<select value={form.bowelMovementFrequency} onChange={e=>update('bowelMovementFrequency', e.target.value)}><option value="">Select</option>{enumOpts.bowelMovementFrequency.map(o=><option key={o} value={o}>{o}</option>)}</select></label>
            <label>BM Type<input value={form.bowelMovementType} onChange={e=>update('bowelMovementType', e.target.value)} placeholder="Constipated, Normal, Loose" /></label>
            <label>Appetite<select value={form.appetiteLevel} onChange={e=>update('appetiteLevel', e.target.value)}><option value="">Select</option>{enumOpts.appetiteLevel.map(o=><option key={o} value={o}>{o}</option>)}</select></label>
            <label className={styles.col2}>Digestion Issues (comma separated)<input value={form.digestionIssues.join(', ')} onChange={e=>update('digestionIssues', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} placeholder="Bloating, Acidity, Indigestion" /></label>
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Critical Health Parameters</legend>
          <div className={styles.grid2}>
            <label>Weight (kg)<input type="number" step="0.1" value={form.weight} onChange={e=>update('weight', e.target.value)} /></label>
            <label>Height (cm)<input type="number" value={form.height} onChange={e=>update('height', e.target.value)} /></label>
            <label>BMI<input value={form.bmi} readOnly /></label>
            <label>Blood Pressure<input value={form.bloodPressure} onChange={e=>update('bloodPressure', e.target.value)} placeholder="120/80 mmHg" /></label>
            <label>Blood Sugar (mg/dL)<input type="number" value={form.bloodSugar} onChange={e=>update('bloodSugar', e.target.value)} /></label>
            <label>Cholesterol (mg/dL)<input type="number" value={form.cholesterol} onChange={e=>update('cholesterol', e.target.value)} /></label>
            <label className={styles.col2}>Medical History (comma separated)<input value={form.medicalHistory.join(', ')} onChange={e=>update('medicalHistory', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} placeholder="Diabetes, Hypertension" /></label>
            <label className={styles.col2}>Allergies (comma separated)<input value={form.allergies.join(', ')} onChange={e=>update('allergies', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} placeholder="Peanuts, Dust" /></label>
            <label className={styles.col2}>Current Medications (comma separated)<input value={form.currentMedications.join(', ')} onChange={e=>update('currentMedications', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} /></label>
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Ayurveda Alignment</legend>
          <div className={styles.grid2}>
            <label>Dominant Dosha<select value={form.dominantDosha} onChange={e=>update('dominantDosha', e.target.value)}><option value="">Select</option>{enumOpts.dominantDosha.map(o=><option key={o} value={o}>{o}</option>)}</select></label>
            <label className={styles.col2}>Dosha Imbalance (comma separated)<input value={form.doshaImbalance.join(', ')} onChange={e=>update('doshaImbalance', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} placeholder="Vata, Pitta" /></label>
            <label className={styles.col2}>Recommended Diet (comma separated)<input value={form.recommendedDiet.join(', ')} onChange={e=>update('recommendedDiet', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} placeholder="Cucumber, Ghee" /></label>
            <label className={styles.col2}>Restricted Diet (comma separated)<input value={form.restrictedDiet.join(', ')} onChange={e=>update('restrictedDiet', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} placeholder="Chili, Sour foods" /></label>
          </div>
        </fieldset>

        <div className={styles.actions}>
          <button type="submit" className={styles.saveBtn}>Save Profile</button>
        </div>
      </form>
    </section>
  );
}