import { supabase } from '../lib/supabaseClient.js';
import { type Room, type RoomRecord } from './types';

type CreateRoomInput = {
  name: string;
  description?: string | null;
  slug?: string | null;
  isPublic?: boolean;
  createdBy?: string | null;
};

function mapRoom(record: RoomRecord): Room {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    description: record.description,
    isPublic: Boolean(record.is_public ?? true),
    createdAt: record.created_at,
    createdBy: record.created_by,
    status: record.status ?? 'sconosciuto',
  };
}

function buildError(message: string, cause?: unknown) {
  const errorMessage =
    cause && typeof cause === 'object' && 'message' in cause
      ? `${message}: ${(cause as Error).message}`
      : message;
  return new Error(errorMessage);
}

function normalizeSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 64);
}

function isValidSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export async function listPublicRooms(): Promise<{
  rooms: Room[];
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('id, slug, name, description, is_public, created_at, created_by, status')
      .eq('status', 'approved')
      .eq('is_public', true)
      .order('name', { ascending: true });

    if (error) {
      return { rooms: [], error: buildError('Non riesco a caricare le stanze', error) };
    }

    const safeRooms = Array.isArray(data) ? data.map(mapRoom) : [];
    return { rooms: safeRooms, error: null };
  } catch (err) {
    return {
      rooms: [],
      error: buildError('Si è verificato un problema inatteso nel caricamento stanze', err),
    };
  }
}

export async function listMyRooms(userId?: string): Promise<{
  rooms: Room[];
  error: Error | null;
}> {
  try {
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const { data, error: sessionError } = await supabase.auth.getUser();
      if (sessionError) {
        return {
          rooms: [],
          error: buildError('Non riesco a recuperare il profilo attivo', sessionError),
        };
      }
      resolvedUserId = data?.user?.id ?? null;
    }

    if (!resolvedUserId) {
      return { rooms: [], error: new Error('Devi accedere per vedere le tue stanze.') };
    }

    const { data, error } = await supabase
      .from('rooms')
      .select('id, slug, name, description, is_public, created_at, created_by, status')
      .eq('created_by', resolvedUserId)
      .order('created_at', { ascending: false });

    if (error) {
      return {
        rooms: [],
        error: buildError('Non riesco a caricare le tue stanze', error),
      };
    }

    const safeRooms = Array.isArray(data) ? data.map(mapRoom) : [];
    return { rooms: safeRooms, error: null };
  } catch (err) {
    return {
      rooms: [],
      error: buildError('Problema inatteso nel recupero delle tue stanze', err),
    };
  }
}

export async function createRoom({
  name,
  description,
  slug,
  isPublic = true,
  createdBy,
}: CreateRoomInput): Promise<{ room: Room | null; error: Error | null }> {
  const cleanedName = name?.trim();
  if (!cleanedName) {
    return { room: null, error: new Error('Inserisci un nome valido per la stanza.') };
  }

  const rawSlug = slug?.trim() || cleanedName;
  const normalizedSlug = normalizeSlug(rawSlug);
  if (!normalizedSlug || !isValidSlug(normalizedSlug)) {
    return {
      room: null,
      error: new Error('Slug non valido. Usa solo lettere, numeri e trattini.'),
    };
  }

  try {
    let resolvedUserId = createdBy ?? null;
    if (!resolvedUserId) {
      const { data, error: sessionError } = await supabase.auth.getUser();
      if (sessionError) {
        return {
          room: null,
          error: buildError('Non riesco a recuperare il profilo attivo', sessionError),
        };
      }
      resolvedUserId = data?.user?.id ?? null;
    }

    if (!resolvedUserId) {
      return { room: null, error: new Error('Accedi per proporre una stanza.') };
    }

    const { data, error } = await supabase
      .from('rooms')
      .insert({
        name: cleanedName,
        description: description?.trim() || null,
        is_public: Boolean(isPublic),
        slug: normalizedSlug,
        created_by: resolvedUserId,
        status: 'pending',
      })
      .select('id, slug, name, description, is_public, created_at, created_by, status')
      .maybeSingle();

    if (error) {
      const code = error.code ?? '';
      if (code === '42501' || code === 'PGRST301' || error?.status === 403) {
        return {
          room: null,
          error: new Error(
            'Hai raggiunto il limite: puoi proporre al massimo 3 stanze (e 1 ogni 24 ore).'
          ),
        };
      }
      if (code === '23505') {
        return {
          room: null,
          error: new Error('Esiste già una stanza con questo nome/slug.'),
        };
      }
      return {
        room: null,
        error: buildError('Non riesco a creare la stanza ora. Riprova tra poco.', error),
      };
    }

    if (!data) {
      return { room: null, error: new Error('Risposta vuota dal server.') };
    }

    const room = mapRoom(data as RoomRecord);
    return { room, error: null };
  } catch (err) {
    return {
      room: null,
      error: buildError('Problema inatteso durante la creazione della stanza', err),
    };
  }
}

export async function followRoom(
  roomId: string,
  userId?: string
): Promise<{ success: boolean; error: Error | null }> {
  if (!roomId) {
    return { success: false, error: buildError('ID stanza non valido') };
  }
  try {
    const payload: Record<string, string> = { room_id: roomId };
    if (userId) {
      payload.user_id = userId;
    }
    const { error } = await supabase
      .from('room_follows')
      .upsert(payload, { onConflict: 'room_id,user_id' });
    if (error) {
      return { success: false, error: buildError('Non riesco a seguire la stanza', error) };
    }
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: buildError('Problema inatteso durante il follow della stanza', err),
    };
  }
}

export async function unfollowRoom(
  roomId: string,
  userId?: string
): Promise<{ success: boolean; error: Error | null }> {
  if (!roomId) {
    return { success: false, error: buildError('ID stanza non valido') };
  }
  try {
    let query = supabase.from('room_follows').delete().eq('room_id', roomId);
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { error } = await query;
    if (error) {
      return { success: false, error: buildError('Non riesco a smettere di seguire la stanza', error) };
    }
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: buildError('Problema inatteso durante l’operazione di unfollow', err),
    };
  }
}

export async function listFollowedRoomIds(
  userId?: string
): Promise<{ roomIds: string[]; error: Error | null }> {
  try {
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const { data, error: sessionError } = await supabase.auth.getUser();
      if (sessionError) {
        return {
          roomIds: [],
          error: buildError('Non riesco a recuperare il profilo attivo', sessionError),
        };
      }
      resolvedUserId = data?.user?.id;
    }

    if (!resolvedUserId) {
      return { roomIds: [], error: null };
    }

    const { data, error } = await supabase
      .from('room_follows')
      .select('room_id')
      .eq('user_id', resolvedUserId);

    if (error) {
      return {
        roomIds: [],
        error: buildError('Non riesco a leggere le stanze seguite', error),
      };
    }

    const ids = Array.isArray(data)
      ? data
          .map((row) => row?.room_id)
          .filter((id): id is string => typeof id === 'string' && id.length > 0)
      : [];

    return { roomIds: ids, error: null };
  } catch (err) {
    return {
      roomIds: [],
      error: buildError('Problema inatteso nel recupero delle stanze seguite', err),
    };
  }
}

export { listPublicRooms as listRooms };
