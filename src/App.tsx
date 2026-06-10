import { type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import DashboardLayout from './layouts/DashboardLayout';
import ErrorBoundary from './components/ErrorBoundary';

import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import VerifyPending from './pages/Auth/VerifyPending';
import VerifyEmail from './pages/Auth/VerifyEmail';
import OAuthCallback from './pages/Auth/OAuthCallback';

import Dashboard from './pages/Dashboard/Dashboard';
import PostComposer from './pages/Composer/PostComposer';
import PostScheduler from './pages/Scheduler/PostScheduler';
import Analytics from './pages/Analytics/Analytics';
import LinkedInAccounts from './pages/Accounts/LinkedInAccounts';
import SettingsPage from './pages/Settings/Settings';
import AdminPanel from './pages/Admin/AdminPanel';

import { ThemeModeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

interface RouteProps {
  children: ReactNode;
}

const RouteLoader = (): JSX.Element => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
    <CircularProgress aria-label="Loading" />
  </Box>
);

const ProtectedRoute = ({ children }: RouteProps): JSX.Element => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <RouteLoader />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }: RouteProps): JSX.Element => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <RouteLoader />;
  return isAuthenticated && user?.role === 'admin' ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function AppRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-pending" element={<VerifyPending />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/auth/google/callback" element={<OAuthCallback provider="google" />} />
      <Route path="/auth/linkedin/callback" element={<OAuthCallback provider="linkedin" />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="compose" element={<PostComposer />} />
        <Route path="scheduler" element={<PostScheduler />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="accounts" element={<LinkedInAccounts />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <ThemeModeProvider>
        <AuthProvider>
          <SocketProvider>
            <Router>
              <AppRoutes />
            </Router>
          </SocketProvider>
        </AuthProvider>
      </ThemeModeProvider>
    </ErrorBoundary>
  );
}
