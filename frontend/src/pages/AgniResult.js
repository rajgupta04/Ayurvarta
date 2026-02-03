// Commit on 2026-03-16
// Commit on 2026-02-10
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getHistory } from '../utils/assessmentStorage';
import ResultPage from './ResultPage';

export default function AgniResult() {
  const params = new URLSearchParams(useLocation().search);
  const navigate = useNavigate();
  
  const chips = [
    { label: 'Vishama', value: params.get('vi') },
    { label: 'Tikshna', value: params.get('ti') },
    { label: 'Manda', value: params.get('ma') },
  ];

  // Check if all assessments are complete after Agni assessment
  useEffect(() => {
    const history = getHistory();
    const hasPrakriti = history?.prakriti?.length > 0;
    const hasVikriti = history?.vikriti?.length > 0;
    const hasAgni = history?.agni?.length > 0;
    
    // If all three assessments are complete, auto-redirect to diet plan after a short delay
    if (hasPrakriti && hasVikriti && hasAgni) {
      const timer = setTimeout(() => {
        navigate('/diet-plan');
      }, 3000); // 3 second delay to let user see the result
      
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  return (
    <ResultPage
      title="Agni Result"
      chips={chips}
      note="Congratulations! All assessments complete. Your personalized diet plan is ready!"
      nextHref="/diet-plan"
      n