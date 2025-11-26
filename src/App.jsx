import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import AuthConfirm from './pages/AuthConfirm.jsx';
import MainLayout from './components/layout/MainLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import RoomsOverviewPage from './pages/RoomsOverviewPage.jsx';
import RoomPage from './pages/RoomPage.jsx';
import ThreadPage from './pages/ThreadPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import AdvancedToolsPage from './pages/AdvancedToolsPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import { useAppState } from './state/AppStateContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AchievementCelebrationPortal from './features/achievements/AchievementCelebrationPortal.jsx';
import { useAuth } from './state/AuthContext.jsx';

export default function App() {
  const { profile } = useAuth();
  const { activePersonaId, setActivePersonaId } = useAppState();
  const isOnboarded = Boolean(profile?.is_onboarded);

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/confirm" element={<AuthConfirm />} />
        <Route path="/auth/*" element={<AuthPage />} />
        <Route
          path="/app/onboarding"
          element={
            <ProtectedRoute>
              {isOnboarded ? (
                <Navigate to="/app" replace />
              ) : (
                <OnboardingPage />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              {isOnboarded ? (
                <Navigate to="/app" replace />
              ) : (
                <OnboardingPage />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <OnboardedRoute isOnboarded={isOnboarded}>
                <MainLayout
                  activePersonaId={activePersonaId}
                  onPersonaChange={setActivePersonaId}
                >
                  <Outlet />
                </MainLayout>
              </OnboardedRoute>
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<HomePage activePersonaId={activePersonaId} />}
          />
          <Route
            path="rooms"
            element={<RoomsOverviewPage />}
          />
          <Route
            path="rooms/:roomId"
            element={<RoomPage activePersonaId={activePersonaId} />}
          />
          <Route
            path="threads/:threadId"
            element={<ThreadPage activePersonaId={activePersonaId} />}
          />
          <Route
            path="profile"
            element={<ProfilePage activePersonaId={activePersonaId} />}
          />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/esperienza" element={<AdvancedToolsPage />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AchievementCelebrationPortal />
    </>
  );
}

function OnboardedRoute({ isOnboarded, children }) {
  if (!isOnboarded) {
    return <Navigate to="/app/onboarding" replace />;
  }

  return children;
}
