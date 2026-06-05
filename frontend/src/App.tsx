import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import DashboardLayout from '@/layouts/DashboardLayout';

// Pages
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import AboutPage from '@/pages/AboutPage';
import DashboardPage from '@/pages/DashboardPage';
import CVAnalyzerPage from '@/pages/CVAnalyzerPage';
import ResumeBuilderPage from '@/pages/ResumeBuilderPage';
import CoverLetterPage from '@/pages/CoverLetterPage';
import InterviewChatPage from '@/pages/InterviewChatPage';
import SalaryPredictorPage from '@/pages/SalaryPredictorPage';
import SettingsPage from '@/pages/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

            {/* Protected dashboard routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="cv-analyzer" element={<CVAnalyzerPage />} />
              <Route path="resume-builder" element={<ResumeBuilderPage />} />
              <Route path="cover-letter" element={<CoverLetterPage />} />
              <Route path="interview" element={<InterviewChatPage />} />
              <Route path="salary-predictor" element={<SalaryPredictorPage />} />
              <Route path="cv-generator" element={<Navigate to="/cv-analyzer" replace />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
