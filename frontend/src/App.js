// Commit on 2026-03-15
// Commit on 2026-02-11
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Quiz from './pages/Quiz';
import DietPlan from './pages/DietPlan';
import Blog from './pages/Blog';
import Faq from './pages/Faq';
import Assessment from './pages/Assessment';
import PrakritiAssessment from './pages/PrakritiAssessment';
import VikritiAssessment from './pages/VikritiAssessment';
import AgniAssessment from './pages/AgniAssessment';
import AssessmentCombined from './pages/AssessmentCombined';
import Dashboard from './pages/Dashboard';
import PersonalAI from './pages/PersonalAI';
import FoodLibrary from './pages/FoodLibrary';
import MedicalProfile from './pages/MedicalProfile';
import PrakritiResult from './pages/PrakritiResult';
import VikritiResult from './pages/VikritiResult';
import AgniResult from './pages/AgniResult';
import Auth from './pages/Auth';
import VideoConsultation from './pages/VideoConsultation';
import './global.css';

function App() {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');
    let fallbackTimer;
    let observerSupported = 'IntersectionObserver' in window;
    const io = observerSupported ? new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    ) : null;

    elements.forEach((el) => {
      el.classList.add('reveal');
      if (io) io.observe(el); else el.classList.add('in-view');
    });

    // Fallback: if after 800ms few elements have .in-view, force reveal
    fallbackTimer = window.setTimeout(() => {
      const visibleCount = document.querySelectorAll('.reveal.in-view').length;
      if (visibleCount < 2) {
        document.documentElement.classList.add('no-intersection');
        elements.forEach(el => el.classList.add('in-view'));
      }
    }, 800);

    return () => { if (io) io.disconnect(); clearTimeout(fallbackTimer); };
  }, []);

  const HeaderVisibility = () => {
    const location = useLocation();
    if (location.pathname.startsWith('/dashboard')) return null;
    return <Header />;
  };

  return (
    <AuthProvider>
      <Router>
        <HeaderVisibility />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Navigate to="/"  />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Assessment routes - public */}
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/assessment/prakriti" element={<PrakritiAssessment />} />
            <Route path="/assessment/prakriti/result" element={<PrakritiResult />} />
            <Route path="/assessment/vikriti" element={<VikritiAssessment />} />
            <Route path="/assessment/vikriti/result" element={<VikritiResult />} />
            <Route path="/assessment/agni" element={<AgniAssessment />} />
            <Route path="/assessment/agni/result" element={<AgniResult />} />
            <Route path="/assessment/combined" element={<AssessmentCombined />} />
            
            {/* Protected routes */}
            <Route path="/diet-plan" element={
              <ProtectedRoute>
                <DietPlan />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/food" element={
              <ProtectedRoute>
                <FoodLibrary />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/video" element={
              <ProtectedRoute>
                <VideoConsultation />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/ai" element={
              <ProtectedRoute>
                <PersonalAI />
              </ProtectedRoute>
            } />
            <Route path="/food" element={
              <ProtectedRoute>
                <FoodLibrary />
              </ProtectedRoute>
            } />
            <Route path="/video" element={
              <ProtectedRoute>
                <VideoConsultation />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <MedicalProfile />
              </ProtectedRoute>
            } />
            {/* Catch-all route -> redirect home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <Chatbot />
      </Router>
    </AuthProvider>
  );
}

export default App;


// Commit on 2026-02-03 
// Commit on 2026-02-03 
// Commit on 2026-02-03 
// Commit on 2026-02-03 
// Commit on 2026-02-03 
// Commit on 2026-02-03 
// Commit on 2026-02-03 
