import { supabase } from '../lib/supabaseClient.js';
import {
  type PaginationCursor,
  type PageResult,
  type Thread,
  type ThreadRecord,
} from './types';

type ListThreadsOptions = {
  limit?: number;
  cursor?: PaginationCursor | null;
};

function mapThread(record: ThreadRecord): Thread {
  return {
    id: record.id,
    roomId: record.room_id,
    createdBy: record.created_by,
    title: record.title,
    body: record.body,
    createdAt: record.created_at,
  };
}

function buildError(message: string, cause?: unknown) {
  const errorMessage =
    cause && typeof cause === 'object' && 'message' in cause
      ? `${message}: ${(cause as Error).message}`
      : message;
  return new Error(errorMessage);
}

function buildCursorFilter(cursor: PaginationCursor) {
  const createdAt = cursor.createdAt;
  const id = cursor.id;
  return `created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`;
}

export async function listThreadsByRoom(
  roomId: string,
  options: ListThreadsOptions = {}
): Promise<{ page: PageResult<Thread>; error: Error | null }> {
  const limit = Number.isFinite(options.limit) ? Math.max(1, options.limit as number) : 10;
  try {
    let query = supabase
      .from('threads')
      .select('id, room_id, created_by, title, body, created_at')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1);

    if (options.cursor) {
      query = query.or(buildCursorFilter(options.cursor));
    }

    const { data, error } = await query;
    if (error) {
      return {
        page: { items: [], cursor: null, hasMore: false },
        error: buildError('Non riesco a caricare i thread della stanza', error),
      };
    }

    const rows = Array.isArray(data) ? data : [];
    const hasMore = rows.length > limit;
    const trimmed = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor =
      trimmed.length > 0
        ? {
            createdAt: trimmed[trimmed.length - 1].created_at,
            id: trimmed[trimmed.length - 1].id,
          }
        : null;

    return {
      page: {
        items: trimmed.map(mapThread),
        cursor: hasMore ? nextCursor : null,
        hasMore,
      },
      error: null,
    };
  } catch (err) {
    return {
      page: { items: [], cursor: null, hasMore: false },
      error: buildError('Problema inatteso nel recupero dei thread', err),
    };
  }
}

type CreateThreadInput = {
  roomId: string;
  title: string;
  body: string;
  createdBy?: string | null;
};

export async function createThread(
  input: CreateThreadInput
): Promise<{ thread: Thread | null; error: Error | null }> {
  const payload = {
    room_id: input.roomId,
    title: input.title,
    body: input.body,
    created_by: input.createdBy ?? null,
  };

  try {
    const { data, error } = await supabase
      .from('threads')
      .insert(payload)
      .select('id, room_id, created_by, title, body, created_at')
      .maybeSingle();

    if (error) {
      return {
        thread: null,
        error: buildError('Non riesco a creare il thread', error),
      };
    }

    return {
      thread: data ? mapThread(data) : null,
      error: null,
    };
  } catch (err) {
    return {
      thread: null,
      error: buildError('Problema inatteso durante la creazione del thread', err),
    };
  }
}

export async function getThread(
  threadId: string
): Promise<{ thread: Thread | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('threads')
      .select('id, room_id, created_by, title, body, created_at')
      .eq('id', threadId)
      .maybeSingle();

    if (error) {
      return {
        thread: null,
        error: buildError('Non riesco a recuperare questo thread', error),
      };
    }

    return {
      thread: data ? mapThread(data) : null,
      error: null,
    };
  } catch (err) {
    return {
      thread: null,
      error: buildError('Problema inatteso nel recupero del thread', err),
    };
  }
}
