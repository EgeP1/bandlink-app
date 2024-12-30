import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { SharingProvider } from './providers/SharingProvider';
import { useAuthStore } from './lib/auth/authStore';
import Layout from './components/Layout';
import AuthForm from './components/AuthForm';
import Dashboard from './pages/Dashboard';
import Referrals from './pages/Referrals';
import Rewards from './pages/Rewards';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SharingProvider>
          <AppRoutes />
        </SharingProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { session, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {!session ? (
        <Route path="*" element={<AuthForm />} />
      ) : (
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      )}
    </Routes>
  );
}