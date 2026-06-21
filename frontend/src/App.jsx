import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AnimatedBackground from './components/AnimatedBackground';
import FloatingRobot from './components/FloatingRobot';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import InterviewSetup from './pages/InterviewSetup';
import InterviewSession from './pages/InterviewSession';
import InterviewResults from './pages/InterviewResults';
import AdminDashboard from './pages/AdminDashboard';
import Documentation from './pages/Documentation';
import Support from './pages/Support';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AdminLogin from './pages/AdminLogin';
import Evaluation from './pages/Evaluation';
import JobRecommendations from './pages/JobRecommendations';
import InterviewModes from './pages/InterviewModes';

import DafAnalyzer from './pages/DafAnalyzer';
import CodingSession from './pages/CodingSession';
import QuestionBank from './pages/QuestionBank';
import DashboardLayout from './layouts/DashboardLayout';
import { Toaster } from 'sonner';

// Helper component to conditionally hide the Navbar
const AppContent = () => {
  const location = useLocation();
  
  // Routes where the top Navbar should be hidden
  const hideNavbarRoutes = ['/dashboard', '/resume-analyzer', '/daf-analyzer', '/interview-modes', '/interview/setup', '/evaluation', '/settings', '/question-bank', '/jobs'];
  const hideNavbarDynamicRoutes = ['/interview/']; // For hiding on session/results if needed, but session is fullscreen anyway
  
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname) || 
                           (location.pathname.startsWith('/interview/') && location.pathname !== '/interview/setup') ||
                           location.pathname.startsWith('/coding-session/');

  const hideRobotRoutes = ['/interview/', '/coding-session/'];
  const shouldHideRobot = hideRobotRoutes.some(route => location.pathname.startsWith(route) && !location.pathname.includes('/setup') && !location.pathname.includes('/results'));

  return (
    <>
      <Toaster theme="dark" position="top-right" />
      {!shouldHideNavbar && <Navbar />}
      {!shouldHideRobot && <FloatingRobot />}
      
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/support" element={<Support />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          
          {/* Dashboard Layout Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="/interview-modes" element={<InterviewModes />} />
            <Route path="/jobs" element={<JobRecommendations />} />

            <Route path="/interview/setup" element={<InterviewSetup />} />
            <Route path="/evaluation" element={<Evaluation />} />
  
          </Route>

          {/* Full Screen Routes (No Sidebar, No Navbar) */}
          <Route path="/interview/:id" element={<InterviewSession />} />
          <Route path="/interview/:id/results" element={<InterviewResults />} />
          <Route path="/coding-session/:id" element={<CodingSession />} />
        </Routes>
      </main>
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
        <AnimatedBackground />
        <AppContent />
      </div>
    </Router>
  );
}

export default App;
