import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import EmailVerification from './components/auth/EmailVerification';
import CreateJobForm from './components/jobs/CreateJobForm';
import DashboardPage from './pages/DashboardPage';
import ChatSystem from './components/messages/ChatSystem';
import UserProfile from './components/profile/UserProfile';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import JobApplicationsPage from './pages/JobApplicationsPage';
import JobDetailPage from './pages/JobDetailPage';

// Protected Route Component - only for actions that require login
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, firebaseUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Check if email is verified for certain routes
  if (firebaseUser && !firebaseUser.emailVerified) {
    return <Navigate to="/verify-email" />;
  }
  
  return <>{children}</>;
};

// Auth Route Component (redirects if already logged in)
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, firebaseUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (currentUser && firebaseUser?.emailVerified) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

// Layout Component - always show navbar
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

// Auth Pages
const LoginPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <LoginForm />
  </div>
);

const SignUpPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <SignUpForm />
  </div>
);

const EmailVerificationPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <EmailVerification />
  </div>
);

// Main App Component
const AppContent: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/login" 
            element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <AuthRoute>
                <SignUpPage />
              </AuthRoute>
            } 
          />
          <Route 
            path="/verify-email" 
            element={<EmailVerificationPage />} 
          />
          {/* Protected routes for actions that require login */}
          <Route 
            path="/jobs/new" 
            element={
              <ProtectedRoute>
                <CreateJobForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/messages" 
            element={
              <ProtectedRoute>
                <ChatSystem />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/:userId" 
            element={<UserProfile />} 
          />
          <Route 
            path="/notifications/settings" 
            element={
              <ProtectedRoute>
                <NotificationSettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jobs/applications" 
            element={
              <ProtectedRoute>
                <JobApplicationsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jobs/:jobId" 
            element={<JobDetailPage />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
