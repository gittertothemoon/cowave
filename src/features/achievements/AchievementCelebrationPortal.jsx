import { useNavigate } from 'react-router-dom';
import { ACHIEVEMENTS } from './achievementsConfig.js';
import { useAchievements } from './useAchievements.js';
import { AchievementCelebrationOverlay } from './AchievementCelebrationOverlay.jsx';

export default function AchievementCelebrationPortal() {
  const navigate = useNavigate();
  const { pendingAchievementCelebrations, shiftAchievementCelebration } =
    useAchievements();
  const activeId = pendingAchievementCelebrations?.[0] ?? null;
  const achievement = activeId
    ? ACHIEVEMENTS.find((item) => item.id === activeId) ?? null
    : null;

  if (!achievement) return null;

  return (
    <AchievementCelebrationOverlay
      achievement={achievement}
      onContinue={shiftAchievementCelebration}
      onViewAchievements={() => {
        shiftAchievementCelebration();
        navigate('/app/profile');
      }}
    />
  );
}
