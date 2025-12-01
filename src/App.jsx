import { Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
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

function RoomRedirect() {
  const { roomId } = useParams();
  const target = roomId ? `/app/rooms/${roomId}` : '/app/rooms';
  return <Navigate to={target} replace />;
}

export default function App() {
  const {
    profile,
    authReady,
    isAuthReady,
    isProfileReady,
    isProfileLoading,
  } = useAuth();
  const { activePersonaId, setActivePersonaId } = useAppState();
  const ready = authReady ?? isAuthReady;
  const profileReady = (isProfileReady ?? !isProfileLoading) && !isProfileLoading;
  const isOnboarded = Boolean(profile?.is_onboarded);

  const protectedAppLayout = (
    <ProtectedRoute>
      <MainLayout
        activePersonaId={activePersonaId}
        onPersonaChange={setActivePersonaId}
      >
        <Outlet />
      </MainLayout>
    </ProtectedRoute>
  );

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/confirm" element={<AuthConfirm />} />
        <Route path="/auth/*" element={<AuthPage />} />
        <Route
          path="/app/onboarding"
          element={
            <ProtectedRoute>
              {isOnboarded && ready && profileReady ? (
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
              {isOnboarded && ready && profileReady ? (
                <Navigate to="/app" replace />
              ) : (
                <OnboardingPage />
              )}
            </ProtectedRoute>
          }
        />
        <Route path="/feed" element={<Navigate to="/app" replace />} />
        <Route path="/rooms" element={<Navigate to="/app/rooms" replace />} />
        <Route
          path="/rooms/:roomId"
          element={<RoomRedirect />}
        />
        <Route
          path="/threads/:threadId"
          element={<Navigate to="/app/threads/:threadId" replace />}
        />
        <Route
          path="/profile"
          element={<Navigate to="/app/profile" replace />}
        />
        <Route
          path="/settings"
          element={<Navigate to="/app/settings" replace />}
        />
        <Route
          path="/settings/esperienza"
          element={<Navigate to="/app/settings/esperienza" replace />}
        />
        <Route path="/app" element={protectedAppLayout}>
          <Route
            index
            element={<HomePage activePersonaId={activePersonaId} />}
          />
          <Route
            path="feed"
            element={<Navigate to="/app" replace />}
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
          <Route
            path="settings"
            element={<SettingsPage />}
          />
          <Route
            path="settings/esperienza"
            element={<AdvancedToolsPage />}
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <AchievementCelebrationPortal />
    </>
  );
}
