import { supabase } from '../lib/supabaseClient.js';
import { type Room, type RoomRecord } from './types';

function mapRoom(record: RoomRecord): Room {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    description: record.description,
    isPublic: Boolean(record.is_public ?? true),
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

export async function listRooms(): Promise<{
  rooms: Room[];
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('id, slug, name, description, is_public, created_at')
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
