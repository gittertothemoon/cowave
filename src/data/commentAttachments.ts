import { supabase } from '../lib/supabaseClient.js';
import {
  type CommentAttachment,
  type CommentAttachmentRecord,
} from './types';

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const COMMENT_IMAGES_BUCKET = 'comment-images';
const SIGNED_URL_TTL_SECONDS = 600;

const signedUrlCache = new Map<
  string,
  { url: string; expiresAt: number }
>();

export function validateAttachmentFile(file?: File | null) {
  if (!file) {
    return { ok: false, reason: 'Seleziona un file immagine.' };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      ok: false,
      reason: 'Puoi caricare solo immagini JPG, PNG, WEBP o GIF.',
    };
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return {
      ok: false,
      reason: 'Il file è troppo grande. Massimo 5 MB.',
    };
  }
  return { ok: true, reason: '' };
}

export async function uploadCommentAttachment({
  file,
  userId,
  commentId,
}: {
  file: File;
  userId: string;
  commentId: string;
}): Promise<{ attachment: CommentAttachment | null; error: Error | null }> {
  if (!file) {
    return {
      attachment: null,
      error: new Error('Seleziona un file immagine.'),
    };
  }
  const validation = validateAttachmentFile(file);
  if (!validation.ok) {
    return {
      attachment: null,
      error: new Error(validation.reason),
    };
  }
  if (!userId) {
    return {
      attachment: null,
      error: new Error('Devi essere autenticato per allegare una foto.'),
    };
  }
  if (!commentId) {
    return {
      attachment: null,
      error: new Error('Commento non valido per allegare una foto.'),
    };
  }

  const extension = inferExtension(file);
  if (!extension) {
    return {
      attachment: null,
      error: new Error('Formato immagine non riconosciuto.'),
    };
  }

  const objectPath = `${userId}/${commentId}/${buildUuid()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(COMMENT_IMAGES_BUCKET)
    .upload(objectPath, file, {
      contentType: file.type || 'application/octet-stream',
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    return {
      attachment: null,
      error: new Error(
        'Non riesco a caricare l’immagine. Controlla la connessione e riprova.'
      ),
    };
  }

  const dimensions = await readImageDimensions(file);
  const payload = {
    comment_id: commentId,
    user_id: userId,
    bucket_id: COMMENT_IMAGES_BUCKET,
    object_path: objectPath,
    mime_type: file.type || null,
    byte_size: Number.isFinite(file.size) ? file.size : null,
    width: dimensions?.width ?? null,
    height: dimensions?.height ?? null,
  };

  const { data, error: insertError } = await supabase
    .from('comment_attachments')
    .insert(payload)
    .select(
      'id, comment_id, user_id, bucket_id, object_path, mime_type, byte_size, width, height, created_at'
    )
    .maybeSingle();

  if (insertError || !data) {
    await supabase.storage
      .from(COMMENT_IMAGES_BUCKET)
      .remove([objectPath])
      .catch(() => {});
    return {
      attachment: null,
      error: new Error(
        'Il file è salito ma non ho salvato il collegamento. Riprova tra poco.'
      ),
    };
  }

  return {
    attachment: mapAttachmentRecord(data),
    error: null,
  };
}

export async function deleteCommentAttachment(
  attachment: CommentAttachment
): Promise<{ success: boolean; error: Error | null }> {
  if (!attachment?.id) {
    return {
      success: false,
      error: new Error('Allegato non valido.'),
    };
  }
  const { error: deleteRowError } = await supabase
    .from('comment_attachments')
    .delete()
    .eq('id', attachment.id)
    .eq('comment_id', attachment.commentId);

  if (deleteRowError) {
    return {
      success: false,
      error: new Error(
        'Non riesco a rimuovere il collegamento all’immagine. Riprova.'
      ),
    };
  }

  const bucketId = attachment.bucketId || COMMENT_IMAGES_BUCKET;
  const cacheKey = buildCacheKey(bucketId, attachment.objectPath);
  signedUrlCache.delete(cacheKey);

  const { error: storageError } = await supabase.storage
    .from(bucketId)
    .remove([attachment.objectPath]);

  if (storageError) {
    return {
      success: true,
      error: new Error(
        'Ho rimosso il collegamento, ma il file potrebbe impiegare qualche istante a sparire.'
      ),
    };
  }

  return { success: true, error: null };
}

export async function getSignedUrlForAttachment(
  attachment: CommentAttachment,
  options: { expiresIn?: number } = {}
): Promise<{ url: string | null; error: Error | null }> {
  if (!attachment?.objectPath || !attachment?.bucketId) {
    return {
      url: null,
      error: new Error('Dati allegato mancanti per creare il link sicuro.'),
    };
  }
  const expiresIn = Number.isFinite(options.expiresIn)
    ? Math.max(60, options.expiresIn as number)
    : SIGNED_URL_TTL_SECONDS;
  const key = buildCacheKey(attachment.bucketId, attachment.objectPath);
  const cached = signedUrlCache.get(key);
  const now = Date.now();
  if (cached && cached.expiresAt > now + 5000) {
    return { url: cached.url, error: null };
  }

  const { data, error } = await supabase.storage
    .from(attachment.bucketId)
    .createSignedUrl(attachment.objectPath, expiresIn);

  if (error || !data?.signedUrl) {
    return {
      url: null,
      error: new Error(
        'Non riesco a aprire l’immagine ora. Riprova tra poco.'
      ),
    };
  }

  const expiresAt = now + expiresIn * 1000 - 5000;
  signedUrlCache.set(key, { url: data.signedUrl, expiresAt });

  return { url: data.signedUrl, error: null };
}

function inferExtension(file: File) {
  const mimeExt = file.type?.split('/')[1];
  if (mimeExt) {
    return mimeExt.replace('jpeg', 'jpg');
  }
  const nameParts = file.name?.split('.') ?? [];
  if (nameParts.length > 1) {
    return nameParts.pop();
  }
  return null;
}

function buildUuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `img-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

async function readImageDimensions(file: File) {
  let objectUrl = '';
  try {
    objectUrl = URL.createObjectURL(file);
    const img = new Image();
    const size = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => reject(new Error('Impossibile leggere le dimensioni.'));
        img.src = objectUrl;
      }
    );
    return size;
  } catch {
    return null;
  } finally {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
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

function buildCacheKey(bucketId: string, path: string) {
  return `${bucketId}:${path}`;
}
