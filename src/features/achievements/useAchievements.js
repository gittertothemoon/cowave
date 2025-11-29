import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppState } from '../../state/AppStateContext.jsx';
import { ACHIEVEMENTS } from './achievementsConfig.js';
import { listUnlockedAchievements } from '../../data/achievements';
import { useAuth } from '../../state/AuthContext.jsx';

export function useAchievements() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const {
    currentUser,
    awardAchievement,
    recentlyUnlockedAchievementId,
    clearRecentlyUnlockedAchievement,
    pendingAchievementCelebrations,
    queueAchievementCelebration,
    shiftAchievementCelebration,
    updateCurrentUser,
  } = useAppState();

  const unlockedEntries = useMemo(() => {
    if (!Array.isArray(currentUser?.unlockedAchievements)) return [];
    return currentUser.unlockedAchievements
      .map((entry) => {
        if (typeof entry === 'string') {
          return { id: entry, unlockedAt: null };
        }
        if (entry && typeof entry === 'object' && typeof entry.id === 'string') {
          return { id: entry.id, unlockedAt: entry.unlockedAt ?? null };
        }
        return null;
      })
      .filter(Boolean);
  }, [currentUser?.unlockedAchievements]);

  const unlockedIds = useMemo(
    () => unlockedEntries.map((entry) => entry.id),
    [unlockedEntries]
  );
  const unlockedSet = useMemo(
    () => new Set(unlockedIds),
    [unlockedIds]
  );

  const unlocked = useMemo(
    () =>
      ACHIEVEMENTS.filter((achievement) => unlockedSet.has(achievement.id)).map(
        (achievement) => ({
          ...achievement,
          unlockedAt:
            unlockedEntries.find((entry) => entry.id === achievement.id)?.unlockedAt ??
            null,
        })
      ),
    [unlockedEntries, unlockedSet]
  );
  const locked = useMemo(
    () => ACHIEVEMENTS.filter((achievement) => !unlockedSet.has(achievement.id)),
    [unlockedSet]
  );

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    let isActive = true;
    async function syncUnlocked() {
      if (!userId) {
        updateCurrentUser?.({ unlockedAchievements: [] });
        return;
      }
      setIsSyncing(true);
      const { unlocked: remoteUnlocked, error } = await listUnlockedAchievements(userId);
      if (!isActive) return;
      if (!error) {
        updateCurrentUser?.({ unlockedAchievements: remoteUnlocked });
        setSyncError(null);
      } else {
        setSyncError(error);
      }
      setIsSyncing(false);
    }

    syncUnlocked();
    return () => {
      isActive = false;
    };
  }, [userId, updateCurrentUser]);

  const unlock = useCallback(
    async (id) => {
      const normalizedId = typeof id === 'string' ? id.toUpperCase() : '';
      if (!awardAchievement || unlockedSet.has(normalizedId)) {
        return { unlocked: false, error: null };
      }
      return awardAchievement(normalizedId, userId);
    },
    [awardAchievement, unlockedSet, userId]
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
    isSyncing,
    syncError,
  };
}
