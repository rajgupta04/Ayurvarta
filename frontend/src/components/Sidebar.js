// Commit on 2026-02-10
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

export default function Sidebar({ onSelect }) {
  const [collapsed, setCollapsed] = useState(false);
  const [assessmentsExpanded, setAssessmentsExpanded] = useState(false);
  const { pathname } = useLocation();
  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.topRow}>
        <Link to="/" className={styles.title} aria-label="Go to Home">Dashboard</Link>
        <button className={styles.collapseBtn} onClick={() => setCollapsed(v=>!v)} aria-label="Toggle sidebar">
          {collapsed ? '›' : '‹'}
        </button>
      </div>
      <nav className={styles.menu}>
        <a
          className={`${styles.item} ${pathname.includes('/dashboard') ? styles.active : ''}`}
          href="#overview"
          role="button"
          title="Overview"
          onClick={(e)=>{e.preventDefault(); onSelect?.('overview')}}
        >
          <span className={styles.icon} aria-hidden>🏠</span>
          <span className={styles.label}>Overview</span>
        </a>

        {/* Diet Plan Section */}
        <Link className={styles.item} to="/diet-plan" title="Diet Plan">
          <span className={styles.icon} aria-hidden>🍽️</span>
          <span className={styles.label}>Diet Plan</span>
        </Link>

        {/* Expandable Assessments Section */}
        <a 
          className={`${styles.item} ${styles.expandable} ${assessmentsExpanded ? styles.expanded : ''}`}
          href="#assessments"
          role="button"
          title="Assessments"
          onClick={(e)=>{e.preventDefault(); setAssessmentsExpanded(!assessmentsExpanded)}}
        >
          <span className={styles.icon} aria-hidden>📋</span>
          <span className={styles.label}>Assessments</span>
          <span className={styles.expandIcon}>{assessmentsExpanded ? '▼' : '▶'}</span>
        </a>

        {/* Sub-items for Assessments */}
        {assessmentsExpanded && (
          <div className={styles.subMenu}>
            <a className={styles.subItem} href="#prakriti" role="button" title="Prakriti"
               onClick={(e)=>{e.preventDefault(); onSelect?.('prakriti')}}>
              <span className={styles.icon} aria-hidden>🌿</span>
              <span className={styles.label}>Prakriti</span>
            </a>

            <a className={styles.subItem} href="#vikriti" role="button" title="Vikriti"
               onClick={(e)=>{e.preventDefault(); onSelect?.('vikriti')}}>
              <span className={styles.icon} aria-hidden>🩺</span>
              <span className={styles.label}>Vikriti</span>
            </a>

            <a className={styles.subItem} href="#agni" role="button" title="Agni"
               onClick={(e)=>{e.preventDefault(); onSelect?.('agni')}}>
              <span className={styles.icon} aria-hidden>🔥</span>
              <span className={styles.label}>Agni</span>
            </a>
          </div>
        )}

        <Link className={styles.item} to="/dashboard/ai" title="Personal AI">
          <span className={styles.icon} aria-hidden>🤖</span>
          <span className={styles.label}>Personal AI</span>
        </Link>

        <Link className={styles.item} to="/dashboard/video" title="Video Consultation">
          <span className={styles.icon} aria-hidden>📹</span>
          <span className={styles.label}>Video</span>
        </Link>

        <Link className={styles.item} to="/food" title="Food Library">
          <span className={styles.icon} aria-hidden>🥗</span>
          <span className={styles.label}>Food Library</span>
        </Link>

        <Link className={styles.item} to="/profile" title="Personalize">
          <span className={styles.icon} aria-hidden>🎯</span>
          <span className={styles.label}>Personalize</span>
        </Link>

        <Link className={styles.item} to="/profile" title="Edit Profile">
          <span className={styles.icon} aria-hidden>👤</span>
          <span className={styles.label}>Edit Profile</span>
        </Link>
      </n