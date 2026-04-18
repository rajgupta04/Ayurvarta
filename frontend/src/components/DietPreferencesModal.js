// Commit on 2026-02-14
import React, { useState } from 'react';
import styles from './DietPreferencesModal.module.css';

const DietPreferencesModal = ({ isOpen, onClose, onSubmit }) => {
  const [preferences, setPreferences] = useState({
    dietType: 'vegetarian',
    allergies: [],
    cuisine: ['North Indian'],
    season: 'winter',
    primaryGoal: 'Improve energy levels and reduce anxiety'
  });

  const [allergyInput, setAllergyInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(preferences);
  };

  const addAllergy = () => {
    if (allergyInput.trim() && !preferences.allergies.includes(allergyInput.trim())) {
      setPreferences(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergyInput.trim()]
      }));
      setAllergyInput('');
    }
  };

  const removeAllergy = (allergy) => {
    setPreferences(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }));
  };

  const updateCuisine = (cuisine, checked) => {
    setPreferences(prev => ({
      ...prev,
      cuisine: checked 
        ? [...prev.cuisine, cuisine]
        : prev.cuisine.filter(c => c !== cuisine)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Diet Plan Preferences</h2>
        <p>Please provide your preferences to generate a personalized diet plan</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Diet Type */}
          <div className={styles.section}>
            <h3>Diet Type</h3>
            <div className={styles.radioGroup}>
              {['vegetarian', 'non-vegetarian', 'vegan', 'jain'].map(type => (
                <label key={type} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="dietType"
                    value={type}
                    checked={preferences.dietType === type}
                    onChange={(e) => setPreferences(prev => ({...prev, dietType: e.target.value}))}
                  />
                  <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Season */}
          <div className={styles.section}>
            <h3>Current Season</h3>
            <select 
              value={preferences.season}
              onChange={(e) => setPreferences(prev => ({...prev, season: e.target.value}))}
              className={styles.select}
            >
              <option value="spring">Spring</option>
              <option value="summer">Summer</option>
              <option value="monsoon">Monsoon</option>
              <option value="autumn">Autumn</option>
              <option value="winter">Winter</option>
            </select>
          </div>

          {/* Cuisine Preferences */}
          <div className={styles.section}>
            <h3>Cuisine Preferences</h3>
            <div className={styles.checkboxGroup}>
              {['North Indian', 'South Indian', 'Gujarati', 'Bengali', 'Punjabi', 'Continental'].map(cuisine => (
                <label key={cuisine} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={preferences.cuisine.includes(cuisine)}
                    onChange={(e) => updateCuisine(cuisine, e.target.checked)}
                  />
                  <span>{cuisine}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div className={styles.section}>
            <h3>Food Allergies</h3>
            <div className={styles.allergyInput}>
              <input
                type="text"
                placeholder="Enter an allergy"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                className={styles.input}
              />
              <button type="button" onClick={addAllergy} className={styles.addBtn}>Add</button>
            </div>
            <div className={styles.allergiesList}>
              {preferences.allergies.map(allergy => (
                <span key={allergy} className={styles.allergyTag}>
                  {allergy}
                  <button type="button" onClick={() => removeAllergy(allergy)} className={styles.removeBtn}>×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Primary Goal */}
          <div className={styles.section}>
            <h3>Primary Health Goal</h3>
            <textarea
              value={preferences.primaryGoal}
              onChange={(e) => setPreferences(prev => ({...prev, primaryGoal: e.target.value}))}
              className={styles.textarea}
              rows="3"
              placeholder="e.g., Improve energy levels and reduce anxiety"
            />
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Generate Diet Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DietPreferencesModal;