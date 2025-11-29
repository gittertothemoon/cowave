import { supabase } from '../lib/supabaseClient.js';
import { ACHIEVEMENT_IDS } from '../features/achievements/achievementsConfig.js';

export type AchievementUnlock = {
  id: string;
  unlockedAt: string | null;
};

function buildError(message: string, cause?: unknown) {
  const errorMessage =
    cause && typeof cause === 'object' && 'message' in cause
      ? `${message}: ${(cause as Error).message}`
      : message;
  return new Error(errorMessage);
}

function normalizeId(value?: string | null): string | null {
  if (!value || typeof value !== 'string') return null;
  const upper = value.trim().toUpperCase();
  return ACHIEVEMENT_IDS.includes(upper as (typeof ACHIEVEMENT_IDS)[number])
    ? upper
    : null;
}

function isConflict(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const status = 'status' in error ? Number((error as { status?: number }).status) : null;
  const code = 'code' in error ? String((error as { code?: string }).code) : '';
  const message =
    'message' in error && typeof (error as { message?: string }).message === 'string'
      ? (error as { message: string }).message
      : '';
  return status === 409 || code === '23505' || message.toLowerCase().includes('duplicate key');
}

export async function listUnlockedAchievements(
  userId: string | null
): Promise<{ unlocked: AchievementUnlock[]; error: Error | null }> {
  if (!userId) {
    return { unlocked: [], error: null };
  }

  const { data, error } = await supabase
    .from('achievements_unlocked')
    .select('achievement_code, unlocked_at')
    .eq('user_id', userId);

  if (error) {
    return {
      unlocked: [],
      error: buildError('Non riesco a recuperare i tuoi traguardi', error),
    };
  }

  const unlocked: AchievementUnlock[] = [];
  const rows = Array.isArray(data) ? data : [];
  rows.forEach((row) => {
    const id = normalizeId((row as { achievement_code?: string }).achievement_code);
    if (!id) return;
    unlocked.push({
      id,
      unlockedAt:
        typeof (row as { unlocked_at?: string }).unlocked_at === 'string'
          ? (row as { unlocked_at?: string }).unlocked_at
          : null,
    });
  });

  return { unlocked, error: null };
}

export async function unlockAchievementForUser({
  achievementId,
  userId,
}: {
  achievementId: string;
  userId: string | null;
}): Promise<{ unlocked: boolean; unlockedAt: string | null; error: Error | null }> {
  const normalizedId = normalizeId(achievementId);
  if (!normalizedId) {
    return { unlocked: false, unlockedAt: null, error: new Error('Traguardo non valido.') };
  }
  if (!userId) {
    return {
      unlocked: false,
      unlockedAt: null,
      error: new Error('Devi accedere per sbloccare i traguardi.'),
    };
  }

  const payload = {
    achievement_code: normalizedId,
    user_id: userId,
  };

  const { data, error } = await supabase
    .from('achievements_unlocked')
    .insert(payload)
    .select('achievement_code, unlocked_at')
    .maybeSingle();

  if (error) {
    if (isConflict(error)) {
      const { data: existing } = await supabase
        .from('achievements_unlocked')
        .select('achievement_code, unlocked_at')
        .eq('achievement_code', normalizedId)
        .eq('user_id', userId)
        .maybeSingle();

      return {
        unlocked: false,
        unlockedAt:
          existing && 'unlocked_at' in (existing as { unlocked_at?: string })
            ? ((existing as { unlocked_at?: string }).unlocked_at ?? null)
            : null,
        error: null,
      };
    }

    return {
      unlocked: false,
      unlockedAt: null,
      error: buildError('Non riesco a sbloccare il traguardo ora', error),
    };
  }

  return {
    unlocked: true,
    unlockedAt:
      data && 'unlocked_at' in (data as { unlocked_at?: string })
        ? ((data as { unlocked_at?: string }).unlocked_at ?? null)
        : null,
    error: null,
  };
}
