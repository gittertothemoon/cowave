import { supabase } from '../lib/supabaseClient.js';
import {
  type Comment,
  type CommentRecord,
  type PageResult,
  type PaginationCursor,
  type CommentAttachment,
  type CommentAttachmentRecord,
  type CommentWaveKind,
  type CommentWaves,
  type ProfileRecord,
} from './types';
import {
  fetchMyWavesForComments,
  fetchWaveCountsForComments,
} from './commentWaves';

type ListCommentsOptions = {
  limit?: number;
  cursor?: PaginationCursor | null;
  userId?: string | null;
};

function mapComment(
  record: CommentRecord,
  authorProfile?: ProfileRecord | null
): Comment {
  const attachments: CommentAttachment[] = Array.isArray(record.comment_attachments)
    ? record.comment_attachments.map(mapAttachmentRecord)
    : [];
  const profile = authorProfile ?? record.profiles ?? null;
  const authorName =
    profile?.username?.trim() ||
    profile?.display_name?.trim() ||
    null;
  return {
    id: record.id,
    threadId: record.thread_id,
    createdBy: record.created_by,
    body: record.body,
    parentCommentId: record.parent_comment_id,
    createdAt: record.created_at,
    attachments,
    isDeleted: Boolean(record.is_deleted),
    deletedAt: record.deleted_at ?? null,
    authorName,
  };
}

function mapAttachmentRecord(record: CommentAttachmentRecord): CommentAttachment {
  return {
    id: record.id,
    commentId: record.comment_id,
    userId: record.user_id,
    bucketId: record.bucket_id,
    objectPath: record.object_path,
    mimeType: record.mime_type,
    byteSize: record.byte_size,
    width: record.width,
    height: record.height,
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

function buildEmptyWaves(): CommentWaves {
  return { support: 0, insight: 0, question: 0 };
}

function normalizeWaveKinds(kinds: CommentWaveKind[] | undefined) {
  const allowed: CommentWaveKind[] = ['support', 'insight', 'question'];
  if (!Array.isArray(kinds)) return [];
  return kinds.filter((kind) => allowed.includes(kind));
}

export async function listCommentsByThread(
  threadId: string,
  options: ListCommentsOptions = {}
): Promise<{
  page: PageResult<Comment>;
  error: Error | null;
  wavesError?: Error | null;
}> {
  const limit = Number.isFinite(options.limit) ? Math.max(1, options.limit as number) : 10;

  try {
    let query = supabase
      .from('comments')
      .select(
        `
          id,
          thread_id,
          created_by,
          body,
          parent_comment_id,
          created_at,
          is_deleted,
          deleted_at,
          comment_attachments (
            id,
            comment_id,
            user_id,
            bucket_id,
            object_path,
            mime_type,
            byte_size,
            width,
            height,
            created_at
          )
        `
      )
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

    const authorIds = Array.from(
      new Set(
        trimmed
          .map((row) => row.created_by)
          .filter((id): id is string => Boolean(id))
      )
    );
    let profilesById: Record<string, ProfileRecord> = {};
    if (authorIds.length > 0) {
      const { data: authorProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .in('id', authorIds);
      if (profilesError) {
        console.error('Errore nel recupero dei profili autore', profilesError);
      } else if (Array.isArray(authorProfiles)) {
        profilesById = Object.fromEntries(
          authorProfiles
            .filter((profile) => profile?.id)
            .map((profile) => [profile.id, profile])
        );
      }
    }

    const baseComments = trimmed.map((record) => {
      const profile = profilesById[record.created_by ?? ''];
      const mapped = mapComment(record, profile);
      const authorName =
        mapped.authorName ||
        profile?.username?.trim() ||
        profile?.display_name?.trim() ||
        'Utente';
      return { ...mapped, authorName };
    });
    const commentIds = baseComments.map((comment) => comment.id);
    let wavesError: Error | null = null;

    let countsByComment: Record<string, CommentWaves> = {};
    let myWavesByComment: Record<string, CommentWaveKind[]> = {};

    if (commentIds.length > 0) {
      const { countsByComment: counts, error: countError } =
        await fetchWaveCountsForComments(commentIds);
      if (countError) {
        wavesError = countError;
      } else {
        countsByComment = counts;
      }

      const { wavesByComment, error: myError } = await fetchMyWavesForComments(
        commentIds,
        options.userId ?? null
      );
      if (myError) {
        wavesError = wavesError ?? myError;
      } else {
        myWavesByComment = wavesByComment;
      }
    }

    const mergedItems = baseComments.map((comment) => {
      const waves = countsByComment[comment.id] ?? buildEmptyWaves();
      const myWaves = normalizeWaveKinds(myWavesByComment[comment.id]);
      return {
        ...comment,
        waves,
        myWaves,
        waveCount: (waves.support ?? 0) + (waves.insight ?? 0) + (waves.question ?? 0),
      };
    });

    return {
      page: {
        items: mergedItems,
        cursor: hasMore ? nextCursor : null,
        hasMore,
      },
      error: null,
      wavesError,
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
      .select(
        'id, thread_id, created_by, body, parent_comment_id, created_at, is_deleted, deleted_at'
      )
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
): Promise<{ success: boolean; error: Error | null; deletedAt?: string | null }> {
  try {
    const deletedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from('comments')
      .update({ is_deleted: true, deleted_at: deletedAt })
      .eq('id', commentId)
      .select('id, deleted_at')
      .maybeSingle();

    if (error || !data) {
      return {
        success: false,
        error: buildError(
          'Non riesco a eliminare la risposta',
          error ?? new Error('Commento non trovato.')
        ),
      };
    }

    return { success: true, error: null, deletedAt: data?.deleted_at ?? deletedAt };
  } catch (err) {
    return {
      success: false,
      error: buildError('Problema inatteso durante l’eliminazione', err),
    };
  }
}
