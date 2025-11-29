import { supabase } from '../lib/supabaseClient.js';
import {
  type CommentWaveKind,
  type CommentWaves,
} from './types';

const VALID_WAVE_KINDS: CommentWaveKind[] = ['support', 'insight', 'question'];

function buildError(message: string, cause?: unknown) {
  const errorMessage =
    cause && typeof cause === 'object' && 'message' in cause
      ? `${message}: ${(cause as Error).message}`
      : message;
  return new Error(errorMessage);
}

function normalizeKind(kind?: string | null): CommentWaveKind | null {
  if (!kind || typeof kind !== 'string') return null;
  const lower = kind.toLowerCase();
  return VALID_WAVE_KINDS.includes(lower as CommentWaveKind)
    ? (lower as CommentWaveKind)
    : null;
}

function buildEmptyCounts(): CommentWaves {
  return { support: 0, insight: 0, question: 0 };
}

export async function fetchWaveCountsForComments(
  commentIds: string[]
): Promise<{
  countsByComment: Record<string, CommentWaves>;
  error: Error | null;
}> {
  if (!Array.isArray(commentIds) || commentIds.length === 0) {
    return { countsByComment: {}, error: null };
  }

  const { data, error } = await supabase
    .from('comment_wave_counts')
    .select('comment_id, kind, count')
    .in('comment_id', commentIds);

  if (error) {
    return {
      countsByComment: {},
      error: buildError('Non riesco a leggere le onde sui commenti', error),
    };
  }

  const countsByComment: Record<string, CommentWaves> = {};
  commentIds.forEach((id) => {
    countsByComment[id] = buildEmptyCounts();
  });

  const rows = Array.isArray(data) ? data : [];
  rows.forEach((row) => {
    const kind = normalizeKind((row as { kind?: string }).kind);
    const commentId = (row as { comment_id?: string }).comment_id;
    const count = Number((row as { count?: number }).count);
    if (!kind || !commentId || !countsByComment[commentId]) return;
    countsByComment[commentId][kind] = Number.isFinite(count) ? count : 0;
  });

  return { countsByComment, error: null };
}

export async function fetchMyWavesForComments(
  commentIds: string[],
  userId: string | null
): Promise<{
  wavesByComment: Record<string, CommentWaveKind[]>;
  error: Error | null;
}> {
  if (!userId || !Array.isArray(commentIds) || commentIds.length === 0) {
    return { wavesByComment: {}, error: null };
  }

  const { data, error } = await supabase
    .from('comment_waves')
    .select('comment_id, kind')
    .eq('user_id', userId)
    .in('comment_id', commentIds);

  if (error) {
    return {
      wavesByComment: {},
      error: buildError('Non riesco a leggere le tue onde', error),
    };
  }

  const wavesByComment: Record<string, CommentWaveKind[]> = {};
  const rows = Array.isArray(data) ? data : [];
  rows.forEach((row) => {
    const commentId = (row as { comment_id?: string }).comment_id;
    const kind = normalizeKind((row as { kind?: string }).kind);
    if (!commentId || !kind) return;
    if (!wavesByComment[commentId]) {
      wavesByComment[commentId] = [];
    }
    if (!wavesByComment[commentId].includes(kind)) {
      wavesByComment[commentId].push(kind);
    }
  });

  return { wavesByComment, error: null };
}

export async function upsertCommentWave({
  commentId,
  userId,
  kind,
}: {
  commentId: string;
  userId: string;
  kind: CommentWaveKind;
}): Promise<{ error: Error | null }> {
  const normalizedKind = normalizeKind(kind);
  if (!normalizedKind) {
    return { error: new Error('Tipo di onda non valido.') };
  }
  if (!commentId || !userId) {
    return { error: new Error('Dati mancanti per inviare l’onda.') };
  }

  const { error } = await supabase.from('comment_waves').upsert(
    {
      comment_id: commentId,
      user_id: userId,
      kind: normalizedKind,
    },
    { onConflict: 'comment_id,user_id,kind' }
  );

  if (error) {
    return {
      error: buildError('Non riesco a salvare la tua onda', error),
    };
  }

  return { error: null };
}

export async function deleteCommentWave({
  commentId,
  userId,
  kind,
}: {
  commentId: string;
  userId: string;
  kind: CommentWaveKind;
}): Promise<{ error: Error | null }> {
  const normalizedKind = normalizeKind(kind);
  if (!normalizedKind) {
    return { error: new Error('Tipo di onda non valido.') };
  }
  if (!commentId || !userId) {
    return { error: new Error('Dati mancanti per questa onda.') };
  }

  const { error } = await supabase
    .from('comment_waves')
    .delete()
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .eq('kind', normalizedKind);

  if (error) {
    return {
      error: buildError('Non riesco a togliere la tua onda', error),
    };
  }

  return { error: null };
}
