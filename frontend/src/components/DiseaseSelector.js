// Commit on 2026-03-14
// Commit on 2026-03-06
import React, { useEffect, useMemo, useState } from 'react';
import assStyles from '../pages/Assessment.module.css';

// Props:
// - value: { category: string|null, disease: string|null }
// - onChange: (value) => void
// - dataUrl: optional override for text data path
export default function DiseaseSelector({ value, onChange, dataUrl = '/data/vikritidisease.txt' }) {
  const [raw, setRaw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(dataUrl)
      .then(res => res.text())
      .then(text => { if (alive) { setRaw(text); setLoading(false); } })
      .catch(e => { if (alive) { setError('Failed to load disease list'); setLoading(false); } });
    return () => { alive = false; };
  }, [dataUrl]);

  const parsed = useMemo(() => {
    // Supports two formats:
    // 1) Single-line: "Category: item1, item2"
    // 2) Multi-line blocks:
    //    Category Heading\n\nitem1, item2, ..., [dosha hint]\n\n
    const map = {};
    const hints = {};

    const lines = raw.split('\n');
    let i = 0;
    while (i < lines.length) {
      let line = lines[i].trim();
      if (!line || line.startsWith('#')) { i++; continue; }

      // Try format 1 first
      if (line.includes(':')) {
        const [catPart, listPart] = line.split(':');
        const cat = (catPart || '').trim();
        const list = (listPart || '').trim();
        if (cat && list) {
          const cleaned = list.replace(/\[(.*?)\]$/, '').replace(/[.。]$/, '');
          const diseases = cleaned.split(',').map(s => s.trim()).filter(Boolean);
          const hintMatch = list.match(/\[(.*?)\]$/);
          if (hintMatch) hints[cat] = hintMatch[1];
          if (diseases.length) map[cat] = diseases;
          i++; continue;
        }
      }

      // Otherwise treat as heading (format 2)
      const cat = line;
      // skip possible blank lines after heading
      i++;
      while (i < lines.length && !lines[i].trim()) i++;
      // collect until blank line or next heading (double blank)
      let itemsText = '';
      while (i < lines.length) {
        const t = lines[i].trim();
        if (!t) break; // end of block
        itemsText += (itemsText ? ' ' : '') + t;
        i++;
      }
      if (itemsText) {
        const hintMatch = itemsText.match(/\[(.*?)\]$/);
        if (hintMatch) hints[cat] = hintMatch[1];
        const cleaned = itemsText.replace(/\[(.*?)\]$/, '').replace(/[.。]$/, '');
        const diseases = cleaned.split(',').map(s => s.trim()).filter(Boolean);
        if (diseases.length) map[cat] = diseases;
      }
      // move past blank separator
      while (i < lines.length && !lines[i].trim()) i++;
    }

    return { dataMap: map, hints };
  }, [raw]);

  const categories = Object.keys(parsed.dataMap);
  const selectedCat = value?.category ?? null;
  const diseases = selectedCat ? parsed.dataMap[selectedCat] ?? [] : [];
  const hint = selectedCat ? parsed.hints[selectedCat] : null;

  if (loading) return <div className={assStyles.qCard}>Loading disease list…</div>;
  if (error) return <div className={assStyles.qCard}>{error}</div>;
  if (!categories.length) return <div className={assStyles.qCard}>No categories found in data file.</div>;

  return (
    <div>
      <div className={assStyles.resultTitle} style={{marginBottom: 8}}>Pick your condition</div>
      <div className={assStyles.diseaseCatRow}>
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            className={`${assStyles.chip} ${selectedCat === cat ? assStyles.chipActive : ''}`}
            onClick={() => onChange({ category: cat, disease: null })}
          >
            {cat}
          </button>
        ))}
      </div>

      {selectedCat && (
        <div className={assStyles.diseaseListWrap}>
          <div className={assStyles.note} style={{marginBottom: 6}}>
            Now choose a specific disease in “{selectedCat}”
            {hint ? <><br />Dosha patterns: {hint}</> : null}
          </div>
          <div className={assStyles.diseaseList}>
            {diseases.map(dis => (
              <div
                key={dis}
                role="button"
                tabIndex={0}
                onClick={() => onChange({ category: selectedCat, disease: dis })}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onChange({ category: selectedCat, disease: dis })}
                className={`${assStyles.diseaseItem} ${value?.disease === dis ? assStyles.diseaseItemActive : ''}`}
              >
                {dis}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// Commit on 2026-02-07 
// Commit on 2026-02-07 
// Commit on 2026-03-12 
