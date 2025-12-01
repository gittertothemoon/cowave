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
import RequireAuth from './routes/ProtectedRoute.jsx';
import AchievementCelebrationPortal from './features/achievements/AchievementCelebrationPortal.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function RoomRedirect() {
  const { roomId } = useParams();
  const target = roomId ? `/app/rooms/${roomId}` : '/app/rooms';
  return <Navigate to={target} replace />;
}

function ThreadRedirect() {
  const { threadId } = useParams();
  const target = threadId ? `/app/threads/${threadId}` : '/app/threads';
  return <Navigate to={target} replace />;
}

function ThreadRoute() {
  const { threadId } = useParams();
  // Force a remount when the thread id changes so the view resets correctly
  return <ThreadPage key={threadId} />;
}

function AppLayout({ activePersonaId, onPersonaChange }) {
  return (
    <MainLayout
      activePersonaId={activePersonaId}
      onPersonaChange={onPersonaChange}
    >
      <Outlet />
    </MainLayout>
  );
}

export default function App() {
  const { activePersonaId, setActivePersonaId } = useAppState();

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/confirm" element={<AuthConfirm />} />
        <Route path="/auth/*" element={<AuthPage />} />
        <Route path="/rooms" element={<Navigate to="/app/rooms" replace />} />
        <Route
          path="/rooms/:roomId"
          element={<RoomRedirect />}
        />
        <Route
          path="/threads/:threadId"
          element={<ThreadRedirect />}
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
        <Route element={<RequireAuth />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/app/onboarding" element={<OnboardingPage />} />
          <Route
          element={
            <AppLayout
              activePersonaId={activePersonaId}
              onPersonaChange={setActivePersonaId}
            />
          }
        >
          <Route path="/app/*">
            <Route index element={<Navigate to="feed" replace />} />
            <Route path="feed" element={<HomePage />} />
            <Route path="rooms" element={<RoomsOverviewPage />} />
            <Route path="rooms/:roomId" element={<RoomPage />} />
            <Route path="threads/:threadId" element={<ThreadRoute />} />
            <Route
              path="profile"
              element={<ProfilePage activePersonaId={activePersonaId} />}
            />
            <Route path="settings" element={<SettingsPage />} />
              <Route path="settings/esperienza" element={<AdvancedToolsPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <AchievementCelebrationPortal />
    </>
  );
}
