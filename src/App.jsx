import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import MainLayout from './components/layout/MainLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import RoomPage from './pages/RoomPage.jsx';
import ThreadPage from './pages/ThreadPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import { useAppState } from './state/AppStateContext.jsx';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { isOnboarded, activePersonaId, setActivePersonaId } = useAppState();

  const location = useLocation();
  const isAuthFlow = location.pathname.startsWith('/auth');
  const isLanding = location.pathname === '/';
  const isAppRoute = location.pathname.startsWith('/app');
  const isOnboardingRoute = location.pathname === '/app/onboarding';

  if (!isAuthenticated && !isLanding && !isAuthFlow) {
    return <Navigate to="/" replace />;
  }

  if (
    isAuthenticated &&
    isAppRoute &&
    !isOnboardingRoute &&
    !isOnboarded
  ) {
    return <Navigate to="/app/onboarding" replace />;
  }

  if (isAuthenticated && isOnboarded && isOnboardingRoute) {
    return <Navigate to="/app" replace />;
  }

  if (isLanding) {
    return <LandingPage />;
  }

  if (isAuthFlow) {
    return <AuthPage onAuth={() => setIsAuthenticated(true)} />;
  }

  if (isOnboardingRoute) {
    return <OnboardingPage />;
  }

  return (
    <MainLayout
      activePersonaId={activePersonaId}
      onPersonaChange={setActivePersonaId}
    >
      <Routes>
        <Route path="/app" element={<HomePage activePersonaId={activePersonaId} />} />
        <Route
          path="/app/rooms/:roomId"
          element={<RoomPage activePersonaId={activePersonaId} />}
        />
        <Route
          path="/app/threads/:threadId"
          element={<ThreadPage activePersonaId={activePersonaId} />}
        />
        <Route
          path="/app/profile"
          element={<ProfilePage activePersonaId={activePersonaId} />}
        />
        <Route path="/app/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </MainLayout>
  );
}
