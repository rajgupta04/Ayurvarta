import React from 'react';
import { ChevronRight } from 'lucide-react';
import styles from './LiquidGlassTitle.module.css';

const FLOATING_LEAVES = [
  { id: 1, top: '14%', left: '34%', size: 22, rotate: -32, blur: 0, delay: '0s', duration: '9s' },
  { id: 2, top: '21%', left: '61%', size: 18, rotate: 48, blur: 1, delay: '1.4s', duration: '11s' },
  { id: 3, top: '53%', left: '22%', size: 20, rotate: -18, blur: 0.5, delay: '0.8s', duration: '10s' },
  { id: 4, top: '56%', left: '84%', size: 22, rotate: 28, blur: 1.5, delay: '2.2s', duration: '12s' },
  { id: 5, top: '76%', left: '19%', size: 32, rotate: 16, blur: 1, delay: '1.1s', duration: '13s' },
  { id: 6, top: '69%', left: '47%', size: 16, rotate: -45, blur: 0, delay: '3s', duration: '9.5s' },
  { id: 7, top: '79%', left: '69%', size: 26, rotate: -26, blur: 1.5, delay: '0.4s', duration: '11.5s' },
];

export function LotusEmblem({ className = '', size = 34 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M32 6C27 14 25 23 32 34C39 23 37 14 32 6Z"
        fill="url(#lotusCore)"
      />
      <path
        d="M21 13C19 21 22 29 30 35C29 25 27 18 21 13Z"
        fill="url(#lotusPetal)"
        fillOpacity="0.92"
      />
      <path
        d="M43 13C45 21 42 29 34 35C35 25 37 18 43 13Z"
        fill="url(#lotusPetal)"
        fillOpacity="0.92"
      />
      <path
        d="M11 22C13 30 20 35 29 37C23 30 18 25 11 22Z"
        fill="url(#lotusPetal)"
        fillOpacity="0.82"
      />
      <path
        d="M53 22C51 30 44 35 35 37C41 30 46 25 53 22Z"
        fill="url(#lotusPetal)"
        fillOpacity="0.82"
      />
      <path
        d="M17 39C24 41 40 41 47 39"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="lotusCore" x1="32" y1="6" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FCE7B2" />
        </linearGradient>
        <linearGradient id="lotusPetal" x1="32" y1="12" x2="32" y2="37" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E6F5DF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function LeafGlyph({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M27 5C17 5 9 10 7 20C6.5 22.5 7 25 7 25C7 25 9.5 25.5 12 25C22 23 27 15 27 5Z"
        fill="url(#leafFill)"
      />
      <path
        d="M6 26C11 20 17 14 25 7"
        stroke="rgba(240, 255, 224, 0.85)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="leafFill" x1="7" y1="25" x2="27" y2="5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4E9439" />
          <stop offset="55%" stopColor="#7DC74B" />
          <stop offset="100%" stopColor="#B8E86C" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function LiquidGlassTitle({ onExplore }) {
  return (
    <>
      {/* Ambient Floating Leaves */}
      <div className={styles.leavesLayer} aria-hidden="true">
        {FLOATING_LEAVES.map((leaf) => (
          <span
            key={leaf.id}
            className={styles.floatingLeaf}
            style={{
              top: leaf.top,
              left: leaf.left,
              filter: leaf.blur ? `blur(${leaf.blur}px)` : undefined,
              animationDelay: leaf.delay,
              animationDuration: leaf.duration,
            }}
          >
            <span style={{ display: 'inline-block', transform: `rotate(${leaf.rotate}deg)` }}>
              <LeafGlyph size={leaf.size} />
            </span>
          </span>
        ))}
      </div>

      {/* Centered Liquid Glass Brand Stack */}
      <div className={styles.centerStage}>
        <div className={styles.wordmarkWrap}>
          <span className={styles.leftLeafAccent} aria-hidden="true">
            <LeafGlyph size={26} />
          </span>

          <h1 className={styles.titleText}>AyurVarta</h1>

          <span className={styles.rightLeafAccent} aria-hidden="true">
            <LeafGlyph size={44} className={styles.mainSprout} />
            <LeafGlyph size={24} className={styles.subSprout} />
          </span>
        </div>

        <div className={styles.dividerRow} aria-hidden="true">
          <span className={styles.dividerLineLeft} />
          <span className={styles.lotusGlowWrap}>
            <LotusEmblem size={38} />
          </span>
          <span className={styles.dividerLineRight} />
        </div>

        <p className={styles.subtitle}>Discover the Wisdom of Ayurveda</p>

        <button
          type="button"
          className={styles.exploreBtn}
          onClick={onExplore}
        >
          <LeafGlyph size={18} className={styles.btnLeaf} />
          <span>Explore More</span>
          <ChevronRight size={17} strokeWidth={2.2} className={styles.btnChevron} />
        </button>
      </div>
    </>
  );
}
