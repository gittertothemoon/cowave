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
  listFollowedRoomIds,
  listRooms,
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
import { supabase } from '../lib/supabaseClient.js';

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

function getTotalWaves(waves) {
  const safe = normalizeWaves(waves);
  return safe.support + safe.insight + safe.question;
}

function normalizeUser(user) {
  const unlocked = Array.isArray(user?.unlockedAchievements)
    ? user.unlockedAchievements.filter((id) => ACHIEVEMENT_IDS.includes(id))
    : [];

  return {
    ...defaultUser,
    ...(user && typeof user === 'object' ? user : {}),
    reflections: Array.isArray(user?.reflections) ? user.reflections : [],
    wavesSent: Number.isFinite(user?.wavesSent) ? user.wavesSent : 0,
    unlockedAchievements: [...new Set(unlocked)],
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
    parentId: comment?.parentCommentId ?? null,
    waves,
    waveCount: getTotalWaves(waves),
  };
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
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
    if (!ACHIEVEMENT_IDS.includes(achievementId)) return;
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

  function unlockAchievement(achievementId) {
    if (!ACHIEVEMENT_IDS.includes(achievementId)) return false;
    let unlocked = false;
    setCurrentUser((prev) => {
      const safeUser = normalizeUser(prev);
      if (safeUser.unlockedAchievements.includes(achievementId)) {
        return safeUser;
      }
      unlocked = true;
      return {
        ...safeUser,
        unlockedAchievements: [
          ...safeUser.unlockedAchievements,
          achievementId,
        ],
      };
    });
    if (unlocked) {
      setRecentlyUnlockedAchievementId(achievementId);
      queueAchievementCelebration(achievementId);
    }
    return unlocked;
  }

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
    const { rooms: fetchedRooms, error } = await listRooms();
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
      return { thread: decorated, error: null };
    },
    [currentUser?.nickname]
  );

  const loadCommentsForThread = useCallback(
    async (threadId, options = {}) => {
      dispatch({ type: 'COMMENTS_LOADING_FOR_THREAD', threadId });
      const { page, error } = await listCommentsByThread(threadId, options);
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
      return { comment: decorated, error: null };
    },
    [currentUser?.nickname]
  );

  const addWaveToComment = useCallback(
    (threadId, commentId, waveType) => {
      if (!['support', 'insight', 'question'].includes(waveType)) return;
      if (commentId === threadId) {
        const thread = dataState.threadsById[threadId];
        if (!thread) return;
        const baseWaves = normalizeWaves(thread.waves);
        const nextWaves = {
          ...baseWaves,
          [waveType]: baseWaves[waveType] + 1,
        };
        dispatch({
          type: 'THREAD_PATCHED',
          thread: {
            ...thread,
            waves: nextWaves,
            waveCount: getTotalWaves(nextWaves),
          },
        });
      } else {
        const target = dataState.commentsById[commentId];
        if (!target) return;
        const baseWaves = normalizeWaves(target.waves);
        const nextWaves = {
          ...baseWaves,
          [waveType]: baseWaves[waveType] + 1,
        };
        dispatch({
          type: 'COMMENT_PATCHED',
          comment: {
            ...target,
            waves: nextWaves,
            waveCount: getTotalWaves(nextWaves),
          },
        });
      }
      setCurrentUser((prev) => {
        const safeUser = normalizeUser(prev);
        const nextSent = Number.isFinite(safeUser.wavesSent)
          ? safeUser.wavesSent + 1
          : 1;
        return { ...safeUser, wavesSent: nextSent };
      });
    },
    [dataState.commentsById, dataState.threadsById]
  );

  const createRoom = useCallback(
    async ({ name, description, isPrivate = false, slug }) => {
      const cleanedName = name?.trim();
      if (!cleanedName) return { roomId: null, error: new Error('Inserisci un nome valido.') };
      const payload = {
        name: cleanedName,
        description: description?.trim() || null,
        is_public: !isPrivate,
        slug: slug?.trim() || slugify(cleanedName),
      };
      const { data, error } = await supabase
        .from('rooms')
        .insert(payload)
        .select('id, slug, name, description, is_public, created_at')
        .maybeSingle();
      if (error) {
        const message =
          error.code === '42501'
            ? 'Non hai i permessi per creare una stanza. Se ti serve, scrivi al team.'
            : 'Non riesco a creare la stanza ora. Riprova tra poco.';
        return {
          roomId: null,
          error: new Error(message),
        };
      }
      const room = {
        id: data.id,
        slug: data.slug,
        name: data.name,
        description: data.description,
        isPublic: Boolean(data.is_public ?? true),
        createdAt: data.created_at,
      };
      dispatch({ type: 'ROOMS_LOADED', rooms: [room] });
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
    unlockAchievement('ONBOARDING_DONE');
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
      roomsById: dataState.roomsById,
      roomsStatus,
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
      addWaveToComment,
      setActivePersonaId,
      completeOnboarding,
      resetOnboarding,
      updateCurrentUser,
      addReflection,
      unlockAchievement,
      addCustomPersona,
      loadRooms,
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
      dataState.roomsById,
      roomsStatus,
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
