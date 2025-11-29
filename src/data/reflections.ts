import { supabase } from '../lib/supabaseClient.js';
import { type Reflection, type ReflectionRecord } from './types';

type ReflectionErrorType = 'permission' | 'offline' | null;

const MAX_BODY_LENGTH = 2000;

function mapReflection(record: ReflectionRecord): Reflection {
  return {
    id: record.id,
    userId: record.user_id,
    forDate: record.for_date,
    body: record.body,
    isPublic: Boolean(record.is_public),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function buildError(message: string, cause?: unknown) {
  const errorMessage =
    cause && typeof cause === 'object' && 'message' in cause
      ? `${message}: ${(cause as Error).message}`
      : message;
  return new Error(errorMessage);
}

function detectErrorType(error: unknown): ReflectionErrorType {
  const status =
    typeof error === 'object' && error && 'status' in error
      ? Number((error as { status?: number }).status)
      : null;
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code?: string }).code)
      : '';
  const message =
    typeof error === 'object' && error && 'message' in error
      ? String((error as { message?: string }).message ?? '')
      : '';

  if (status === 401 || status === 403 || code === '42501' || code === 'PGRST301') {
    return 'permission';
  }

  const offline =
    (typeof navigator !== 'undefined' && navigator.onLine === false) ||
    message.toLowerCase().includes('failed to fetch') ||
    message.toLowerCase().includes('network') ||
    message.toLowerCase().includes('fetch');

  return offline ? 'offline' : null;
}

function normalizeDateOnly(value?: string | Date | null): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
  }

  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

async function resolveUserId(
  userId?: string | null
): Promise<{
  userId: string | null;
  error: Error | null;
  errorType: ReflectionErrorType;
}> {
  if (userId) {
    return { userId, error: null, errorType: null };
  }

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return {
        userId: null,
        error: buildError('Devi accedere per vedere le tue riflessioni.', error),
        errorType: detectErrorType(error) ?? 'permission',
      };
    }
    const resolvedId = data?.user?.id ?? null;
    if (!resolvedId) {
      return {
        userId: null,
        error: new Error('Nessun profilo attivo trovato.'),
        errorType: 'permission',
      };
    }
    return { userId: resolvedId, error: null, errorType: null };
  } catch (err) {
    return {
      userId: null,
      error: buildError('Non riesco a recuperare il profilo attivo', err),
      errorType: 'offline',
    };
  }
}

export async function listReflections({
  userId,
  limit = 30,
}: {
  userId?: string | null;
  limit?: number;
} = {}): Promise<{
  reflections: Reflection[];
  error: Error | null;
  errorType: ReflectionErrorType;
}> {
  const { userId: resolvedUserId, error: userError, errorType: userErrorType } =
    await resolveUserId(userId);

  if (!resolvedUserId || userError) {
    return {
      reflections: [],
      error: userError ?? new Error('Devi accedere per vedere le tue riflessioni.'),
      errorType: userErrorType ?? 'permission',
    };
  }

  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(1, limit), 50) : 30;

  const { data, error } = await supabase
    .from('reflections')
    .select('id, user_id, for_date, body, is_public, created_at, updated_at')
    .eq('user_id', resolvedUserId)
    .order('for_date', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(safeLimit);

  if (error) {
    return {
      reflections: [],
      error: buildError('Non riesco a caricare le tue riflessioni', error),
      errorType: detectErrorType(error),
    };
  }

  const reflections = Array.isArray(data)
    ? data.map((row) => mapReflection(row as ReflectionRecord))
    : [];
  return { reflections, error: null, errorType: null };
}

export async function upsertReflection({
  userId,
  forDate,
  body,
  isPublic = false,
}: {
  userId?: string | null;
  forDate?: string | Date | null;
  body: string;
  isPublic?: boolean;
}): Promise<{
  reflection: Reflection | null;
  error: Error | null;
  errorType: ReflectionErrorType;
}> {
  const trimmed = body?.trim() ?? '';
  if (!trimmed) {
    return {
      reflection: null,
      error: new Error('Scrivi qualcosa prima di salvare.'),
      errorType: null,
    };
  }
  if (trimmed.length > MAX_BODY_LENGTH) {
    return {
      reflection: null,
      error: new Error('Hai superato il limite di 2000 caratteri.'),
      errorType: null,
    };
  }

  const { userId: resolvedUserId, error: userError, errorType: userErrorType } =
    await resolveUserId(userId);
  if (!resolvedUserId || userError) {
    return {
      reflection: null,
      error: userError ?? new Error('Devi accedere per salvare.'),
      errorType: userErrorType ?? 'permission',
    };
  }

  const payload = {
    user_id: resolvedUserId,
    for_date: normalizeDateOnly(forDate),
    body: trimmed,
    is_public: Boolean(isPublic),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('reflections')
    .upsert(payload, { onConflict: 'user_id,for_date' })
    .select('id, user_id, for_date, body, is_public, created_at, updated_at')
    .maybeSingle();

  if (error) {
    return {
      reflection: null,
      error: buildError('Non riesco a salvare la riflessione', error),
      errorType: detectErrorType(error),
    };
  }

  return {
    reflection: data ? mapReflection(data as ReflectionRecord) : null,
    error: null,
    errorType: null,
  };
}
