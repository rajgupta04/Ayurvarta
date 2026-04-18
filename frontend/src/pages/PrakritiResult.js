// Commit on 2026-03-12
import React from 'react';
import { useLocation } from 'react-router-dom';
import ResultPage from './ResultPage';

export default function PrakritiResult() {
  const params = new URLSearchParams(useLocation().search);
  const chips = [
    { label: 'Vata', value: params.get('v') },
    { label: 'Pitta', value: params.get('p') },
    { label: 'Kapha', value: params.get('k') },
  ];
  return (
    <ResultPage
      title="Prakriti Result"
      chips={chips}
      note="Proceed to Vikriti to assess your current imbalances."
      nextHref="/assessment/vikriti"
      nextText="Start Vikriti Assessment"
    />
  );
}