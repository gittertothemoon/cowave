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
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  const { profile, authReady, isAuthReady } = useAuth();
  const { activePersonaId, setActivePersonaId } = useAppState();
  const ready = authReady ?? isAuthReady;
  const isOnboarded = Boolean(profile?.is_onboarded);

  const protectedAppLayout = (
    <ProtectedRoute>
      <OnboardedRoute
        authReady={ready}
        isOnboarded={isOnboarded}
      >
        <MainLayout
          activePersonaId={activePersonaId}
          onPersonaChange={setActivePersonaId}
        >
          <Outlet />
        </MainLayout>
      </OnboardedRoute>
    </ProtectedRoute>
  );

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
              {isOnboarded && ready ? (
                <Navigate to="/feed" replace />
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
              {isOnboarded && ready ? (
                <Navigate to="/feed" replace />
              ) : (
                <OnboardingPage />
              )}
            </ProtectedRoute>
          }
        />
        <Route element={protectedAppLayout}>
          <Route
            path="/feed"
            element={<HomePage activePersonaId={activePersonaId} />}
          />
          <Route
            path="/rooms"
            element={<RoomsOverviewPage />}
          />
          <Route
            path="/rooms/:roomId"
            element={<RoomPage activePersonaId={activePersonaId} />}
          />
          <Route
            path="/threads/:threadId"
            element={<ThreadPage activePersonaId={activePersonaId} />}
          />
          <Route
            path="/profile"
            element={<ProfilePage activePersonaId={activePersonaId} />}
          />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/esperienza" element={<AdvancedToolsPage />} />
          {/* Legacy /app paths kept for compatibility */}
          <Route
            path="/app"
            element={<HomePage activePersonaId={activePersonaId} />}
          />
          <Route
            path="/app/rooms"
            element={<RoomsOverviewPage />}
          />
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
          <Route
            path="/app/settings/esperienza"
            element={<AdvancedToolsPage />}
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <AchievementCelebrationPortal />
    </>
  );
}

function OnboardedRoute({ isOnboarded, authReady, children }) {
  if (isOnboarded === false && authReady) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
