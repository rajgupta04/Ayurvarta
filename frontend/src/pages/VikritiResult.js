// Commit on 2026-03-04
import React from 'react';
import { useLocation } from 'react-router-dom';
import ResultPage from './ResultPage';

export default function VikritiResult() {
  const params = new URLSearchParams(useLocation().search);
  const chips = [];
  if (params.get('sama') || params.get('vishama') || params.get('tikshna') || params.get('manda')) {
    chips.push(
      { label: 'Sama', value: params.get('sama') },
      { label: 'Vishama', value: params.get('vishama') },
      { label: 'Tikshna', value: params.get('tikshna') },
      { label: 'Manda', value: params.get('manda') },
    );
  } else {
    chips.push(
      { label: 'Vata', value: params.get('v') },
      { label: 'Pitta', value: params.get('p') },
      { label: 'Kapha', value: params.get('k') },
    );
  }
  return (
    <ResultPage
      title="Vikriti Result"
      chips={chips}
      note="Next, evaluate your Agni (digestive fire)."
      nextHref="/assessment/agni"
      nextText="Start Agni →"
    />
  );
}

// Commit on 2026-03-07 
