// Commit on 2026-03-09
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './FoodLibrary.module.css';

function normalizeSections(raw) {
  // Convert can_eat/can_use/can_drink to unified array
  const out = {};
  Object.keys(raw || {}).forEach((cat) => {
    const val = raw[cat] || {};
    const arr = val.can_eat || val.can_use || val.can_drink || [];
    out[cat] = arr;
  });
  return out;
}


export default function FoodLibrary({ embed = false }) {
  const [data, setData] = useState({});
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(() => {
    try {
      const raw = localStorage.getItem('foodLibrarySelection');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }); 
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch('/data/foodlibrary.txt');
        const text = await resp.text();
        const json = JSON.parse(text);
        setData(normalizeSections(json));
      } catch (e) {

        console.error('Failed to load food library', e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    try { localStorage.setItem('foodLibrarySelection', JSON.stringify(selected)); } catch {}
  }, [selected]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    const out = {};
    Object.keys(data).forEach((cat) => {
      const items = (data[cat] || []).filter((i) => i.toLowerCase().includes(q));
      if (items.length) out[cat] = items;
    });
    return out;
  }, [data, search]);

  const toggleItem = (cat, item) => {
    setSelected((prev) => {
      const set = new Set(prev[cat] || []);
      if (set.has(item)) set.delete(item); else set.add(item);
      return { ...prev, [cat]: Array.from(set) };
    });
  };

  const selectAllInCategory = (cat) => {
    setSelected((prev) => ({ ...prev, [cat]: data[cat] ? [...data[cat]] : [] }));
  };
  const clearCategory = (cat) => {
    setSelected((prev) => ({ ...prev, [cat]: [] }));
  };
  const clearAll = () => setSelected({});

  const resultArray = useMemo(() => {
    // Flatten to object array: { category, item }
    const arr = [];
    Object.keys(selected).forEach((cat) => {
      (selected[cat] || []).forEach((item) => arr.push({ category: cat, item }));
    });
    return arr;
  }, [selected]);

  const copyJson = async () => {
    try { await navigator.clipboard.writeText(JSON.stringify(resultArray, null, 2)); } catch {}
  };

  const handleSaveAndGo = () => {
    try { localStorage.setItem('foodLibrarySelection', JSON.stringify(selected)); } catch {}
    navigate('/dashboard');
  };

  const topBar = (
    <div className={styles.topBar}>
      {!pathname.startsWith('/dashboard') && (
        <Link to="/dashboard" className={styles.link}>← Back to Dashboard</Link>
      )}
    </div>
  );

  const content = (
    <>
      <div className={styles.card}>
        <h2 className={styles.title}>Know Your Food Library</h2>
        <div className={styles.searchRow}>
          <input className={styles.input} placeholder="Search items..." value={search} onChange={(e)=>setSearch(e.target.value)} />
          <button className={`${styles.btn} ${styles.ghost}`} onClick={clearAll}>Clear All</button>
        </div>
        <div className={styles.catGrid}>
          {Object.keys(filtered).map((cat) => {
            const total = (data[cat] || []).length;
            const count = (selected[cat] || []).length;
            return (
              <div key={cat} className={styles.catCard}>
                <div className={styles.categoryHeader}>
                  <strong style={{ textTransform:'capitalize' }}>{cat}</strong>
                  <div className={styles.row}>
                    <span className={styles.badge}>{count}/{total} selected</span>
                    <button className={`${styles.btn} ${styles.small}`} onClick={()=>selectAllInCategory(cat)}>Select all</button>
                    <button className={`${styles.btn} ${styles.ghost} ${styles.small}`} onClick={()=>clearCategory(cat)}>Clear</button>
                  </div>
                </div>
                <div className={styles.items}>
                  {(filtered[cat] || []).map((item) => {
                    const checked = (selected[cat] || []).includes(item);
                    return (
                      <div
                        key={item}
                        className={`${styles.chip} ${checked ? styles.selected : ''}`}
                        role="button"
                        tabIndex={0}
                        onClick={()=>toggleItem(cat, item)}
                        onKeyDown={(e)=>{ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleItem(cat, item); } }}
                        aria-pressed={checked}
                        aria-label={`Select ${item}`}
                      >
                        <span>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`${styles.card} ${styles.sticky}`}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
          <h3 className={styles.title} style={{margin:0}}>Your Selection</h3>
          <div className={styles.row}>
            <span className={styles.badge}>{resultArray.length} items</span>
            <button className={`${styles.btn} ${styles.small}`} onClick={copyJson}>Copy JSON</button>
          </div>
        </div>
        <div className={styles.jsonBox}>{JSON.stringify(resultArray, null, 2)}</div>
        {!pathname.startsWith('/dashboard') && (
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:10}}>
            <button className={styles.btn} onClick={handleSaveAndGo}>Save your Food Library → Dashboard</button>
          </div>
        )}
      </div>
    </>
  );

  if (embed) {
    // Embed without Sidebar/outer grid
    return (
      <section className={styles.wrap}>
        {topBar}
        <div className={styles.grid} style={{gridTemplateColumns:'1fr 360px'}}>
          <div>{content.props.children[0]}</div>
          <div>{content.props.children[1]}</div>
        </div>
      </section>
    );
  }

  // Standalone: no Sidebar, with Back and Save
  return (
    <section className={styles.wrap}>
      {topBar}
      <div className={styles.grid}>
        <div style={{gridColumn:'1 / -1'}}>
          {content}
        </div>
      </div>
    </section>
  );
}

// Commit on 2026-03-06 
// Commit on 2026-03-06 
// Commit on 2026-03-06 
// Commit on 2026-02-16 
// Commit on 2026-02-16 
// Commit on 2026-02-16 
