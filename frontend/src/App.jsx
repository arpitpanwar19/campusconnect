import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PageLayout } from './components/layout/PageLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { Spinner } from './components/common/Spinner';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Onboarding } from './pages/Onboarding';
import { Discover } from './pages/Discover';
import { EventDetail } from './pages/EventDetail';
import { Calendar } from './pages/Calendar';
import { MyEvents } from './pages/MyEvents';
import { OrgDashboard } from './pages/OrgDashboard';
import { CreateEvent } from './pages/CreateEvent';
import { EditEvent } from './pages/EditEvent';
import { OrgProfile } from './pages/OrgProfile';
import { AdminPanel } from './pages/AdminPanel';
import { Notifications } from './pages/Notifications';
import { NotFound } from './pages/NotFound';

function App() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
      <Route path="/signup" element={<AuthLayout><Signup /></AuthLayout>} />
      
      <Route path="/onboarding" element={<ProtectedRoute><AuthLayout><Onboarding /></AuthLayout></ProtectedRoute>} />
      
      <Route path="/" element={<ProtectedRoute><PageLayout><Home /></PageLayout></ProtectedRoute>} />
      <Route path="/discover" element={<ProtectedRoute><PageLayout><Discover /></PageLayout></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><PageLayout><Calendar /></PageLayout></ProtectedRoute>} />
      <Route path="/my-events" element={<ProtectedRoute><PageLayout><MyEvents /></PageLayout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><PageLayout><Notifications /></PageLayout></ProtectedRoute>} />
      <Route path="/events/:slug" element={<ProtectedRoute><PageLayout><EventDetail /></PageLayout></ProtectedRoute>} />
      
      <Route path="/organizations/:slug" element={<PageLayout><OrgProfile /></PageLayout>} />
      
      <Route path="/organizer/dashboard" element={<ProtectedRoute requiredRole="organizer"><PageLayout><OrgDashboard /></PageLayout></ProtectedRoute>} />
      <Route path="/organizer/events/new" element={<ProtectedRoute requiredRole="organizer"><PageLayout><CreateEvent /></PageLayout></ProtectedRoute>} />
      <Route path="/organizer/events/:id/edit" element={<ProtectedRoute requiredRole="organizer"><PageLayout><EditEvent /></PageLayout></ProtectedRoute>} />
      
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><PageLayout><AdminPanel /></PageLayout></ProtectedRoute>} />
      
      <Route path="*" element={<PageLayout><NotFound /></PageLayout>} />
    </Routes>
  );
}

export default App;