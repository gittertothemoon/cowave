import { useCallback, useMemo } from 'react';
import { useAppState } from '../../state/AppStateContext.jsx';
import { ACHIEVEMENTS } from './achievementsConfig.js';

export function useAchievements() {
  const {
    currentUser,
    unlockAchievement,
    recentlyUnlockedAchievementId,
    clearRecentlyUnlockedAchievement,
    pendingAchievementCelebrations,
    queueAchievementCelebration,
    shiftAchievementCelebration,
  } = useAppState();
  const unlockedIds = currentUser?.unlockedAchievements ?? [];
  const unlockedSet = useMemo(
    () => new Set(unlockedIds),
    [unlockedIds]
  );

  const unlocked = useMemo(
    () => ACHIEVEMENTS.filter((achievement) => unlockedSet.has(achievement.id)),
    [unlockedSet]
  );
  const locked = useMemo(
    () => ACHIEVEMENTS.filter((achievement) => !unlockedSet.has(achievement.id)),
    [unlockedSet]
  );

  const unlock = useCallback(
    (id) => unlockAchievement?.(id),
    [unlockAchievement]
  );

  return {
    unlockedIds,
    unlockedSet,
    unlocked,
    locked,
    unlockAchievement: unlock,
    recentlyUnlockedAchievementId,
    clearRecentlyUnlockedAchievement,
    pendingAchievementCelebrations,
    queueAchievementCelebration,
    shiftAchievementCelebration,
  };
}
