import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { personas as initialPersonas } from '../mockData.js';
import { ACHIEVEMENT_IDS } from '../features/achievements/achievementsConfig.js';
import { appDataReducer, initialDataState } from './appDataReducer.js';
import {
  followRoom as followRoomRequest,
  createRoom as createRoomRequest,
  listFollowedRoomIds,
  listMyRooms,
  listPublicRooms,
  unfollowRoom as unfollowRoomRequest,
} from '../data/rooms';
import {
  createThread as createThreadRequest,
  getThread,
  listThreadsByRoom,
} from '../data/threads';
import {
  createComment as createCommentRequest,
  listCommentsByThread,
} from '../data/comments';
import {
  deleteCommentAttachment,
  getSignedUrlForAttachment as fetchSignedAttachmentUrl,
  uploadCommentAttachment,
} from '../data/commentAttachments';
import {
  deleteCommentWave,
  upsertCommentWave,
} from '../data/commentWaves';
import { unlockAchievementForUser } from '../data/achievements';

const AppStateContext = createContext(null);
const USER_STORAGE_KEY = 'cowave-user';
const CUSTOM_PERSONAS_KEY = 'cowave-custom-personas';
const ONBOARDING_KEY = 'cowave:isOnboarded';
const ONBOARDING_WELCOME_KEY = 'cowave-just-finished-onboarding';
const FOLLOWED_ROOMS_KEY = 'cowave-followed-rooms';
const INITIAL_ROOMS_KEY = 'cowave-initial-rooms';

const defaultUser = {
  nickname: 'Tu',
  email: '',
  unlockedAchievements: [],
  reflections: [],
  wavesSent: 0,
};

function normalizeAchievementId(id) {
  if (!id || typeof id !== 'string') return null;
  const cleaned = id.trim().toUpperCase();
  return ACHIEVEMENT_IDS.includes(cleaned) ? cleaned : null;
}

function parseUnlockEntry(entry) {
  const rawId =
    typeof entry === 'string'
      ? entry
      : typeof entry?.id === 'string'
        ? entry.id
        : typeof entry?.achievementId === 'string'
          ? entry.achievementId
          : typeof entry?.achievement_id === 'string'
            ? entry.achievement_id
            : null;
  const id = normalizeAchievementId(rawId);
  if (!id) return null;
  const unlockedAt =
    typeof entry?.unlockedAt === 'string'
      ? entry.unlockedAt
      : typeof entry?.unlocked_at === 'string'
        ? entry.unlocked_at
        : null;
  return { id, unlockedAt };
}

function normalizeUnlockedAchievements(list) {
  if (!Array.isArray(list)) return [];
  const map = new Map();
  list.forEach((item) => {
    const parsed = parseUnlockEntry(item);
    if (!parsed) return;
    const existing = map.get(parsed.id);
    if (!existing || (!existing.unlockedAt && parsed.unlockedAt)) {
      map.set(parsed.id, parsed);
    }
  });
  return Array.from(map.values()).sort((a, b) => {
    const aTime = a.unlockedAt ? new Date(a.unlockedAt).getTime() : Infinity;
    const bTime = b.unlockedAt ? new Date(b.unlockedAt).getTime() : Infinity;
    return aTime - bTime;
  });
}

function normalizeWaves(waves, fallbackWaveCount = 0) {
  const base =
    waves && typeof waves === 'object'
      ? waves
      : { support: 0, insight: 0, question: 0 };
  const safe = {
    support: Number.isFinite(base.support) ? Math.max(0, base.support) : 0,
    insight: Number.isFinite(base.insight) ? Math.max(0, base.insight) : 0,
    question: Number.isFinite(base.question) ? Math.max(0, base.question) : 0,
  };
  const fallback =
    (!waves || typeof waves !== 'object') && Number.isFinite(fallbackWaveCount)
      ? Math.max(0, fallbackWaveCount)
      : 0;
  if (
    fallback > 0 &&
    safe.support === 0 &&
    safe.insight === 0 &&
    safe.question === 0
  ) {
    safe.support = fallback;
  }
  return safe;
}

function normalizeWaveKinds(kinds) {
  const allowed = ['support', 'insight', 'question'];
  if (!Array.isArray(kinds)) return [];
  return kinds.filter((kind) => allowed.includes(kind));
}

function getTotalWaves(waves) {
  const safe = normalizeWaves(waves);
  return safe.support + safe.insight + safe.question;
}

function normalizeUser(user) {
  return {
    ...defaultUser,
    ...(user && typeof user === 'object' ? user : {}),
    reflections: Array.isArray(user?.reflections) ? user.reflections : [],
    wavesSent: Number.isFinite(user?.wavesSent) ? user.wavesSent : 0,
    unlockedAchievements: normalizeUnlockedAchievements(user?.unlockedAchievements),
  };
}

function getInitialIsOnboarded() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(ONBOARDING_KEY) === 'true';
  } catch {
    return false;
  }
}

function getStoredIds(key) {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function decorateThread(thread, authorName = 'Utente') {
  const waves = normalizeWaves(thread?.waves);
  return {
    ...thread,
    author: thread?.author ?? thread?.createdBy ?? authorName ?? 'Utente',
    waves,
    waveCount: getTotalWaves(waves),
  };
}

function decorateComment(comment, authorName = 'Utente') {
  const waves = normalizeWaves(comment?.waves);
  return {
    ...comment,
    author: comment?.author ?? comment?.createdBy ?? authorName ?? 'Utente',
    content: comment?.content ?? comment?.body ?? '',
    parentId: comment?.parentCommentId ?? null,
    waves,
    myWaves: normalizeWaveKinds(comment?.myWaves),
    waveCount: getTotalWaves(waves),
  };
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 64);
}

export function AppStateProvider({ children }) {
  const [dataState, dispatch] = useReducer(appDataReducer, {
    ...initialDataState,
    follows: getStoredIds(FOLLOWED_ROOMS_KEY),
  });
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window === 'undefined') return defaultUser;
    try {
      const stored = window.localStorage.getItem(USER_STORAGE_KEY);
      return stored ? normalizeUser(JSON.parse(stored)) : defaultUser;
    } catch {
      return defaultUser;
    }
  });
  const [customPersonas, setCustomPersonas] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = window.localStorage.getItem(CUSTOM_PERSONAS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isOnboarded, setIsOnboarded] = useState(getInitialIsOnboarded);
  const [initialRoomIds, setInitialRoomIds] = useState(() =>
    getStoredIds(INITIAL_ROOMS_KEY)
  );
  const [primaryPersonaId, setPrimaryPersonaId] = useState(null);
  const [algorithmPreset, setAlgorithmPreset] = useState('balanced');
  const [justFinishedOnboarding, setJustFinishedOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(ONBOARDING_WELCOME_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [activePersonaId, setActivePersonaId] = useState(
    initialPersonas[0]?.id ?? null
  );
  const [recentlyUnlockedAchievementId, setRecentlyUnlockedAchievementId] =
    useState(null);
  const [
    pendingAchievementCelebrations,
    setPendingAchievementCelebrations,
  ] = useState([]);

  const followedRoomIds = dataState.follows;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(normalizeUser(currentUser))
      );
    } catch {
      // ignore storage errors
    }
  }, [currentUser]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        CUSTOM_PERSONAS_KEY,
        JSON.stringify(customPersonas)
      );
    } catch {
      // ignore storage errors
    }
  }, [customPersonas]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        FOLLOWED_ROOMS_KEY,
        JSON.stringify(followedRoomIds)
      );
    } catch {
      // ignore storage errors
    }
  }, [followedRoomIds]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        INITIAL_ROOMS_KEY,
        JSON.stringify(initialRoomIds)
      );
    } catch {
      // ignore storage errors
    }
  }, [initialRoomIds]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (justFinishedOnboarding) {
        window.localStorage.setItem(ONBOARDING_WELCOME_KEY, 'true');
      } else {
        window.localStorage.removeItem(ONBOARDING_WELCOME_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }, [justFinishedOnboarding]);

  const personas = useMemo(() => {
    const displayName = currentUser?.nickname?.trim() || 'Tu';
    const baseList = initialPersonas.map((persona) => ({
      ...persona,
      label: `${displayName} – ${persona.title}`,
    }));
    const customList = customPersonas.map((persona) => ({
      ...persona,
      label: `${displayName} – ${persona.title}`,
    }));
    return [...baseList, ...customList];
  }, [currentUser?.nickname, customPersonas]);

  const rooms = useMemo(
    () =>
      dataState.roomOrder
        .map((id) => dataState.roomsById[id])
        .filter(Boolean),
    [dataState.roomOrder, dataState.roomsById]
  );

  const myRooms = useMemo(
    () =>
      (dataState.myRoomIds ?? [])
        .map((id) => dataState.roomsById[id])
        .filter(Boolean),
    [dataState.myRoomIds, dataState.roomsById]
  );

  const threads = useMemo(
    () =>
      Object.values(dataState.threadsById).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [dataState.threadsById]
  );

  const threadsByRoom = useMemo(() => {
    const map = {};
    Object.entries(dataState.threadsByRoom).forEach(([roomId, meta]) => {
      map[roomId] = meta.ids
        .map((id) => dataState.threadsById[id])
        .filter(Boolean);
    });
    return map;
  }, [dataState.threadsByRoom, dataState.threadsById]);

  const commentsByThread = useMemo(() => {
    const map = {};
    Object.entries(dataState.commentsByThread).forEach(([threadId, meta]) => {
      map[threadId] = meta.ids
        .map((id) => dataState.commentsById[id])
        .filter(Boolean);
    });
    return map;
  }, [dataState.commentsByThread, dataState.commentsById]);

  const postsByThread = commentsByThread;

  const roomsStatus = dataState.roomsStatus;
  const myRoomsStatus = dataState.myRoomsStatus;
  const threadListsMeta = dataState.threadsByRoom;
  const commentListsMeta = dataState.commentsByThread;

  const updateCurrentUser = useCallback((updates) => {
    setCurrentUser((prev) =>
      normalizeUser({
        ...normalizeUser(prev),
        ...updates,
      })
    );
  }, []);

  function queueAchievementCelebration(achievementId) {
    if (!normalizeAchievementId(achievementId)) return;
    setPendingAchievementCelebrations((prev) => {
      if (prev.includes(achievementId)) return prev;
      return [...prev, achievementId];
    });
  }

  function shiftAchievementCelebration() {
    setPendingAchievementCelebrations((prev) =>
      prev.length ? prev.slice(1) : prev
    );
  }

  function unlockAchievement(
    achievementId,
    unlockedAt = null,
    { silent = false } = {}
  ) {
    const normalizedId = normalizeAchievementId(achievementId);
    if (!normalizedId) return false;
    const timestamp = unlockedAt || new Date().toISOString();
    let unlocked = false;
    setCurrentUser((prev) => {
      const safeUser = normalizeUser(prev);
      const existing = (safeUser.unlockedAchievements ?? []).some(
        (item) => item.id === normalizedId
      );
      if (existing) {
        return safeUser;
      }
      unlocked = true;
      return {
        ...safeUser,
        unlockedAchievements: [
          ...safeUser.unlockedAchievements,
          { id: normalizedId, unlockedAt: timestamp },
        ],
      };
    });
    if (unlocked && !silent) {
      setRecentlyUnlockedAchievementId(normalizedId);
      queueAchievementCelebration(normalizedId);
    }
    return unlocked;
  }

  const awardAchievement = useCallback(
    async (
      achievementId,
      userId,
      { silentIfExists = false } = {}
    ) => {
      const normalizedId = normalizeAchievementId(achievementId);
      if (!normalizedId) {
        return { unlocked: false, error: new Error('Traguardo non valido.') };
      }
      if (!userId) {
        return {
          unlocked: false,
          error: new Error('Accedi per sbloccare i traguardi.'),
        };
      }

      const alreadyUnlocked = (normalizeUnlockedAchievements(currentUser?.unlockedAchievements) ?? []).some(
        (item) => item.id === normalizedId
      );
      if (alreadyUnlocked) {
        return { unlocked: false, error: null };
      }

      const { unlocked, unlockedAt, error } = await unlockAchievementForUser({
        achievementId: normalizedId,
        userId,
      });

      if (error) {
        return { unlocked: false, error };
      }

      if (unlocked) {
        unlockAchievement(normalizedId, unlockedAt ?? undefined);
        return { unlocked: true, error: null };
      }

      if (unlockedAt && (!silentIfExists || !alreadyUnlocked)) {
        unlockAchievement(normalizedId, unlockedAt, { silent: true });
      }

      return { unlocked: false, error: null };
    },
    [currentUser?.unlockedAchievements, unlockAchievement]
  );

  function clearRecentlyUnlockedAchievement() {
    setRecentlyUnlockedAchievementId(null);
  }

  function addCustomPersona(name, tagline = '') {
    const cleaned = name.trim();
    if (!cleaned) return null;
    const description = tagline.trim();
    const palette = [
      'bg-emerald-500',
      'bg-sky-500',
      'bg-fuchsia-500',
      'bg-amber-500',
      'bg-cyan-500',
    ];
    const id = `persona-${Date.now()}`;
    const color = palette[customPersonas.length % palette.length];
    const persona = {
      id,
      title: cleaned,
      description: description || 'Persona personalizzata',
      color,
    };
    setCustomPersonas((prev) => [...prev, persona]);
    return id;
  }

  const loadRooms = useCallback(async () => {
    dispatch({ type: 'ROOMS_LOADING' });
    const { rooms: fetchedRooms, error } = await listPublicRooms();
    if (error) {
      dispatch({ type: 'ROOMS_ERROR', error });
      return { rooms: [], error };
    }
    dispatch({ type: 'ROOMS_LOADED', rooms: fetchedRooms });
    return { rooms: fetchedRooms, error: null };
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const loadMyRooms = useCallback(async (userId) => {
    if (!userId) {
      dispatch({ type: 'MY_ROOMS_LOADED', rooms: [], append: false });
      return { rooms: [], error: null };
    }
    dispatch({ type: 'MY_ROOMS_LOADING' });
    const { rooms: fetchedRooms, error } = await listMyRooms(userId);
    if (error) {
      dispatch({ type: 'MY_ROOMS_ERROR', error });
      return { rooms: [], error };
    }
    dispatch({ type: 'MY_ROOMS_LOADED', rooms: fetchedRooms, append: false });
    return { rooms: fetchedRooms, error: null };
  }, []);

  const loadFollowedRooms = useCallback(async (userId) => {
    const { roomIds, error } = await listFollowedRoomIds(userId);
    if (!error && roomIds) {
      dispatch({ type: 'SET_FOLLOWS', roomIds });
    }
    return { roomIds: roomIds ?? [], error };
  }, []);

  const followRoom = useCallback(
    async (roomId, userId) => {
      if (!roomId) {
        return { error: new Error('Stanza non valida') };
      }
      dispatch({ type: 'ROOM_FOLLOWED', roomId });
      const { error } = await followRoomRequest(roomId, userId);
      if (error) {
        dispatch({ type: 'ROOM_UNFOLLOWED', roomId });
        return { error };
      }
      return { error: null };
    },
    []
  );

  const unfollowRoom = useCallback(
    async (roomId, userId) => {
      if (!roomId) {
        return { error: new Error('Stanza non valida') };
      }
      dispatch({ type: 'ROOM_UNFOLLOWED', roomId });
      const { error } = await unfollowRoomRequest(roomId, userId);
      if (error) {
        dispatch({ type: 'ROOM_FOLLOWED', roomId });
        return { error };
      }
      return { error: null };
    },
    []
  );

  const loadThreadsForRoom = useCallback(
    async (roomId, options = {}) => {
      dispatch({ type: 'THREADS_LOADING_FOR_ROOM', roomId });
      const { page, error } = await listThreadsByRoom(roomId, options);
      if (error) {
        dispatch({
          type: 'THREAD_ERROR_FOR_ROOM',
          roomId,
          error,
        });
        return { threads: [], cursor: null, hasMore: false, error };
      }
      const decorated = page.items.map((thread) =>
        decorateThread(thread)
      );
      dispatch({
        type: 'THREADS_LOADED_FOR_ROOM',
        roomId,
        threads: decorated,
        cursor: page.cursor,
        hasMore: page.hasMore,
        replace: !options?.cursor,
      });
      return {
        threads: decorated,
        cursor: page.cursor,
        hasMore: page.hasMore,
        error: null,
      };
    },
    []
  );

  const loadThreadById = useCallback(
    async (threadId) => {
      const cached = dataState.threadsById[threadId];
      if (cached) {
        return { thread: cached, error: null };
      }
      const { thread, error } = await getThread(threadId);
      if (thread) {
        const decorated = decorateThread(thread);
        dispatch({ type: 'UPSERT_THREAD', thread: decorated });
        return { thread: decorated, error: null };
      }
      return { thread: null, error };
    },
    [dataState.threadsById]
  );

  const createThread = useCallback(
    async ({ roomId, title, body, createdBy, authorName }) => {
      const trimmedTitle = title?.trim();
      const trimmedBody = body?.trim();
      if (!trimmedTitle || !trimmedBody) {
        return {
          thread: null,
          error: new Error('Titolo e testo del thread sono obbligatori.'),
        };
      }
      const { thread, error } = await createThreadRequest({
        roomId,
        title: trimmedTitle,
        body: trimmedBody,
        createdBy,
      });
      if (error || !thread) {
        return {
          thread: null,
          error: error ?? new Error('Non riesco a creare il thread.'),
        };
      }
      const decorated = decorateThread(
        thread,
        authorName || currentUser?.nickname || 'Tu'
      );
      dispatch({ type: 'THREAD_CREATED', thread: decorated });
      if (createdBy) {
        awardAchievement('FIRST_THREAD', createdBy).catch(() => {});
      }
      return { thread: decorated, error: null };
    },
    [currentUser?.nickname, awardAchievement]
  );

  const loadCommentsForThread = useCallback(
    async (threadId, options = {}) => {
      dispatch({ type: 'COMMENTS_LOADING_FOR_THREAD', threadId });
      const { page, error, wavesError } = await listCommentsByThread(
        threadId,
        options
      );
      if (error) {
        dispatch({
          type: 'COMMENTS_ERROR_FOR_THREAD',
          threadId,
          error,
        });
        return { comments: [], cursor: null, hasMore: false, error };
      }
      const decorated = page.items.map((comment) =>
        decorateComment(comment)
      );
      dispatch({
        type: 'COMMENTS_LOADED_FOR_THREAD',
        threadId,
        comments: decorated,
        cursor: page.cursor,
        hasMore: page.hasMore,
        replace: !options?.cursor,
      });
      return {
        comments: decorated,
        cursor: page.cursor,
        hasMore: page.hasMore,
        error: null,
        wavesError: wavesError ?? null,
      };
    },
    []
  );

  const createComment = useCallback(
    async ({
      threadId,
      body,
      parentCommentId = null,
      createdBy,
      authorName,
    }) => {
      const trimmedBody = body?.trim();
      if (!trimmedBody) {
        return {
          comment: null,
          error: new Error('Scrivi qualcosa prima di pubblicare.'),
        };
      }
      const { comment, error } = await createCommentRequest({
        threadId,
        body: trimmedBody,
        parentCommentId,
        createdBy,
      });
      if (error || !comment) {
        return {
          comment: null,
          error: error ?? new Error('Non riesco a pubblicare la risposta.'),
        };
      }
      const decorated = decorateComment(
        comment,
        authorName || currentUser?.nickname || 'Tu'
      );
      dispatch({ type: 'COMMENT_CREATED', comment: decorated });
      if (createdBy) {
        awardAchievement('FIRST_COMMENT', createdBy).catch(() => {});
      }
      return { comment: decorated, error: null };
    },
    [currentUser?.nickname, awardAchievement]
  );

  const toggleWaveOnComment = useCallback(
    async ({ threadId, commentId, waveType, userId }) => {
      if (!['support', 'insight', 'question'].includes(waveType)) {
        return { error: new Error('Tipo di onda non valido.') };
      }
      if (!userId) {
        return { error: new Error('Accedi per mandare un’onda.') };
      }
      if (!commentId) {
        return { error: new Error('Commento non trovato.') };
      }

      const target = dataState.commentsById[commentId];
      if (!target) {
        return { error: new Error('Commento non trovato.') };
      }

      const baseWaves = normalizeWaves(target.waves);
      const baseMyWaves = normalizeWaveKinds(target.myWaves);
      const hasWave = baseMyWaves.includes(waveType);
      const nextMyWaves = hasWave
        ? baseMyWaves.filter((kind) => kind !== waveType)
        : [...baseMyWaves, waveType];
      const nextWaves = {
        ...baseWaves,
        [waveType]: Math.max(0, baseWaves[waveType] + (hasWave ? -1 : 1)),
      };

      dispatch({
        type: 'COMMENT_PATCHED',
        comment: {
          ...target,
          waves: nextWaves,
          myWaves: nextMyWaves,
          waveCount: getTotalWaves(nextWaves),
        },
      });

      const action = hasWave ? deleteCommentWave : upsertCommentWave;
      const { error } = await action({
        commentId,
        userId,
        kind: waveType,
      });

      if (error) {
        dispatch({
          type: 'COMMENT_PATCHED',
          comment: {
            ...target,
            waves: baseWaves,
            myWaves: baseMyWaves,
            waveCount: getTotalWaves(baseWaves),
          },
        });
        return { error };
      }

      if (!hasWave) {
        setCurrentUser((prev) => {
          const safeUser = normalizeUser(prev);
          const nextSent = Number.isFinite(safeUser.wavesSent)
            ? safeUser.wavesSent + 1
            : 1;
          return { ...safeUser, wavesSent: nextSent };
        });
        if (userId) {
          awardAchievement('FIRST_WAVE', userId).catch(() => {});
        }
      }

      return { error: null };
    },
    [dataState.commentsById, awardAchievement]
  );

  const addAttachmentToComment = useCallback(
    async ({ commentId, file, userId }) => {
      const { attachment, error } = await uploadCommentAttachment({
        file,
        userId,
        commentId,
      });
      if (attachment) {
        dispatch({
          type: 'ATTACHMENT_ADDED',
          commentId,
          attachment,
        });
        if (userId) {
          awardAchievement('FIRST_PHOTO', userId).catch(() => {});
        }
      }
      return { attachment, error };
    },
    [awardAchievement]
  );

  const removeAttachmentFromComment = useCallback(
    async (attachment) => {
      const { success, error } = await deleteCommentAttachment(attachment);
      if (success) {
        dispatch({
          type: 'ATTACHMENT_REMOVED',
          commentId: attachment.commentId,
          attachmentId: attachment.id,
        });
      }
      return { success, error };
    },
    []
  );

  const createRoom = useCallback(
    async ({ name, description, isPrivate = false, slug }) => {
      const trimmedName = name?.trim() ?? '';
      if (!trimmedName) {
        return { roomId: null, error: new Error('Inserisci un nome valido.') };
      }
      const { room, error } = await createRoomRequest({
        name: trimmedName,
        description: description?.trim() ?? '',
        slug: slug?.trim() || slugify(trimmedName),
        isPublic: !isPrivate,
      });
      if (error || !room) {
        return {
          roomId: null,
          error: error ?? new Error('Non riesco a creare la stanza ora.'),
        };
      }
      dispatch({ type: 'MY_ROOMS_LOADED', rooms: [room], append: true });
      return { roomId: room.id, error: null };
    },
    []
  );

  function addReflection({ tag = 'idea', note, date }) {
    const trimmedNote = note?.trim();
    if (!trimmedNote) return null;
    const allowedTags = ['idea', 'sfogo', 'spunto'];
    const safeTag = allowedTags.includes(tag) ? tag : 'idea';
    const reflection = {
      id: `reflection-${Date.now()}`,
      date: date || new Date().toISOString(),
      tag: safeTag,
      note: trimmedNote,
    };
    setCurrentUser((prev) => {
      const safeUser = normalizeUser(prev);
      const existing = Array.isArray(safeUser.reflections)
        ? safeUser.reflections
        : [];
      return {
        ...safeUser,
        reflections: [reflection, ...existing],
      };
    });
    return reflection.id;
  }

  function completeOnboarding({
    initialRoomIds: selectedRoomIds = [],
    primaryPersonaId: personaId = null,
    algorithmPreset: preset = 'balanced',
  }) {
    setInitialRoomIds(selectedRoomIds);
    dispatch({ type: 'SET_FOLLOWS', roomIds: selectedRoomIds });
    setPrimaryPersonaId(personaId);
    setAlgorithmPreset(preset);
    if (personaId) {
      setActivePersonaId(personaId);
    }
    setJustFinishedOnboarding(true);
    setIsOnboarded(true);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ONBOARDING_KEY, 'true');
      }
    } catch {
      // ignore storage errors
    }
  }

  function resetOnboarding() {
    setIsOnboarded(false);
    setJustFinishedOnboarding(false);
    setInitialRoomIds([]);
    dispatch({ type: 'SET_FOLLOWS', roomIds: [] });
    setPrimaryPersonaId(null);
    setAlgorithmPreset('balanced');
    setActivePersonaId(initialPersonas[0]?.id ?? null);
    setPendingAchievementCelebrations([]);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(ONBOARDING_KEY);
        window.localStorage.removeItem(FOLLOWED_ROOMS_KEY);
        window.localStorage.removeItem(INITIAL_ROOMS_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }

  const value = useMemo(
    () => ({
      personas,
      rooms,
      myRooms,
      roomsById: dataState.roomsById,
      roomsStatus,
      myRoomsStatus,
      threads,
      threadsById: dataState.threadsById,
      threadsByRoom,
      threadListsMeta,
      commentsByThread,
      commentsById: dataState.commentsById,
      commentListsMeta,
      postsByThread,
      isOnboarded,
      initialRoomIds,
      followedRoomIds,
      primaryPersonaId,
      algorithmPreset,
      activePersonaId,
      currentUser,
      justFinishedOnboarding,
      createRoom,
      createThread,
      createComment,
      toggleWaveOnComment,
      addAttachmentToComment,
      removeAttachmentFromComment,
      getSignedUrlForAttachment: fetchSignedAttachmentUrl,
      setActivePersonaId,
      completeOnboarding,
      resetOnboarding,
      updateCurrentUser,
      addReflection,
      unlockAchievement,
      awardAchievement,
      addCustomPersona,
      loadRooms,
      loadMyRooms,
      loadFollowedRooms,
      followRoom,
      unfollowRoom,
      loadThreadsForRoom,
      loadThreadById,
      loadCommentsForThread,
      setJustFinishedOnboarding,
      recentlyUnlockedAchievementId,
      clearRecentlyUnlockedAchievement,
      pendingAchievementCelebrations,
      queueAchievementCelebration,
      shiftAchievementCelebration,
    }),
    [
      personas,
      rooms,
      myRooms,
      dataState.roomsById,
      roomsStatus,
      myRoomsStatus,
      threads,
      dataState.threadsById,
      threadsByRoom,
      threadListsMeta,
      commentsByThread,
      dataState.commentsById,
      commentListsMeta,
      postsByThread,
      isOnboarded,
      initialRoomIds,
      followedRoomIds,
      primaryPersonaId,
      algorithmPreset,
      activePersonaId,
      currentUser,
      justFinishedOnboarding,
      recentlyUnlockedAchievementId,
      pendingAchievementCelebrations,
      addAttachmentToComment,
      removeAttachmentFromComment,
      fetchSignedAttachmentUrl,
      toggleWaveOnComment,
      awardAchievement,
    ]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error(
      'useAppState deve essere usato dentro un <AppStateProvider>'
    );
  }
  return ctx;
}
