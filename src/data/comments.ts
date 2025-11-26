import { supabase } from '../lib/supabaseClient.js';
import {
  type Comment,
  type CommentRecord,
  type PageResult,
  type PaginationCursor,
} from './types';

type ListCommentsOptions = {
  limit?: number;
  cursor?: PaginationCursor | null;
};

function mapComment(record: CommentRecord): Comment {
  return {
    id: record.id,
    threadId: record.thread_id,
    createdBy: record.created_by,
    body: record.body,
    parentCommentId: record.parent_comment_id,
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

export async function listCommentsByThread(
  threadId: string,
  options: ListCommentsOptions = {}
): Promise<{ page: PageResult<Comment>; error: Error | null }> {
  const limit = Number.isFinite(options.limit) ? Math.max(1, options.limit as number) : 10;

  try {
    let query = supabase
      .from('comments')
      .select('id, thread_id, created_by, body, parent_comment_id, created_at')
      .eq('thread_id', threadId)
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
        error: buildError('Non riesco a caricare le risposte', error),
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
        items: trimmed.map(mapComment),
        cursor: hasMore ? nextCursor : null,
        hasMore,
      },
      error: null,
    };
  } catch (err) {
    return {
      page: { items: [], cursor: null, hasMore: false },
      error: buildError('Problema inatteso nel recupero delle risposte', err),
    };
  }
}

type CreateCommentInput = {
  threadId: string;
  body: string;
  parentCommentId?: string | null;
  createdBy?: string | null;
};

export async function createComment(
  input: CreateCommentInput
): Promise<{ comment: Comment | null; error: Error | null }> {
  const payload = {
    thread_id: input.threadId,
    body: input.body,
    parent_comment_id: input.parentCommentId ?? null,
    created_by: input.createdBy ?? null,
  };

  try {
    const { data, error } = await supabase
      .from('comments')
      .insert(payload)
      .select('id, thread_id, created_by, body, parent_comment_id, created_at')
      .maybeSingle();

    if (error) {
      return {
        comment: null,
        error: buildError('Non riesco a pubblicare la risposta', error),
      };
    }

    return {
      comment: data ? mapComment(data) : null,
      error: null,
    };
  } catch (err) {
    return {
      comment: null,
      error: buildError('Problema inatteso durante la creazione della risposta', err),
    };
  }
}

export async function deleteComment(
  commentId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      return {
        success: false,
        error: buildError('Non riesco a eliminare la risposta', error),
      };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: buildError('Problema inatteso durante l’eliminazione', err),
    };
  }
}
