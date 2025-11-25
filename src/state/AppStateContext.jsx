import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  personas as initialPersonas,
  rooms as initialRooms,
  threads as initialThreads,
  postsByThread as initialPostsByThread,
} from '../mockData.js';
import { ACHIEVEMENT_IDS } from '../features/achievements/achievementsConfig.js';

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
const defaultWaves = {
  support: 0,
  insight: 0,
  question: 0,
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

function normalizePost(post) {
  if (!post) return post;
  const safeWaves = normalizeWaves(post.waves, post.waveCount);
  return {
    ...post,
    waves: safeWaves,
    waveCount: getTotalWaves(safeWaves),
  };
}

function normalizeThreads(initialThreads, postsByThread) {
  const repliesByThread = {};

  const threadsWithInitialPost = initialThreads.map((thread) => {
    const posts = (postsByThread?.[thread.id] ?? []).map(normalizePost);
    const initialPost =
      posts.find((p) => p.parentId === null) ?? null;
    const safeInitialPost = normalizePost(initialPost);
    const replies = posts
      .filter((p) => p.parentId !== null)
      .map((reply) => normalizePost(reply));
    repliesByThread[thread.id] = replies;

    return {
      ...thread,
      initialPost: safeInitialPost || null,
      rootSnippet: thread.rootSnippet || safeInitialPost?.content || '',
    };
  });

  return { threadsWithInitialPost, repliesByThread };
}

function normalizeUser(user) {
  const unlocked = Array.isArray(user?.unlockedAchievements)
    ? user.unlockedAchievements.filter((id) =>
        ACHIEVEMENT_IDS.includes(id)
      )
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

export function AppStateProvider({ children }) {
  const { threadsWithInitialPost, repliesByThread } = useMemo(
    () => normalizeThreads(initialThreads, initialPostsByThread),
    []
  );
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
  const [rooms, setRooms] = useState(initialRooms);
  const [threads, setThreads] = useState(threadsWithInitialPost);
  const [postsByThread, setPostsByThread] = useState(repliesByThread);
  const [isOnboarded, setIsOnboarded] = useState(getInitialIsOnboarded);
  const [initialRoomIds, setInitialRoomIds] = useState(() =>
    getStoredIds(INITIAL_ROOMS_KEY)
  );
  const [followedRoomIds, setFollowedRoomIds] = useState(() =>
    getStoredIds(FOLLOWED_ROOMS_KEY)
  );
  const [primaryPersonaId, setPrimaryPersonaId] = useState(null);
  const [algorithmPreset, setAlgorithmPreset] = useState('balanced');
  const [justFinishedOnboarding, setJustFinishedOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return (
        window.localStorage.getItem(ONBOARDING_WELCOME_KEY) === 'true'
      );
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

  function updateCurrentUser(updates) {
    setCurrentUser((prev) =>
      normalizeUser({
        ...normalizeUser(prev),
        ...updates,
      })
    );
  }

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

  function createRoom({ name, description, isPrivate = false, tags = [] }) {
    const id = `room-${Date.now()}`;
    const newRoom = {
      id,
      name,
      description,
      isPrivate,
      tags,
      members: 1,
      prompts: [],
    };
    setRooms((prev) => [...prev, newRoom]);
    setFollowedRoomIds((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    );
    return id;
  }

  function createThread({
    roomId,
    title,
    initialContent,
    rootSnippet,
    personaId = personas[0]?.id ?? 'dev',
    energy = 'neutro',
  }) {
    const cleanedTitle = title?.trim();
    const cleanedInitialContent = initialContent?.trim();
    if (!cleanedTitle || !cleanedInitialContent) return null;
    const id = `thread-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const initialPost = {
      id: `p-${Date.now()}`,
      parentId: null,
      author: currentUser?.nickname || 'Tu',
      personaId,
      createdAt,
      content: cleanedInitialContent,
      waves: { ...defaultWaves },
      waveCount: 0,
    };
    const newThread = {
      id,
      roomId,
      title: cleanedTitle,
      author: currentUser?.nickname || 'Tu',
      personaId,
      createdAt,
      depth: 1,
      energy,
      rootSnippet: rootSnippet || cleanedInitialContent,
      branches: 0,
      initialPost,
    };
    setThreads((prev) => [newThread, ...prev]);
    setPostsByThread((prev) => ({
      ...prev,
      [id]: [],
    }));
    unlockAchievement('FIRST_THREAD');
    return id;
  }

  function createPost(
    threadId,
    { content, parentId = null, personaId, attachments = [] }
  ) {
    const hasImageAttachment = attachments?.some(
      (attachment) => attachment?.type === 'image'
    );
    const newPost = {
      id: `p-${Date.now()}`,
      parentId,
      author: currentUser?.nickname || 'Tu',
      personaId: personaId ?? personas[0]?.id ?? 'dev',
      createdAt: new Date().toISOString(),
      content,
      waves: { ...defaultWaves },
      waveCount: 0,
      attachments: attachments?.length
        ? attachments.slice(0, 1)
        : undefined,
    };

    if (parentId === null) {
      setThreads((prev) =>
        prev.map((thread) => {
          if (thread.id !== threadId || thread.initialPost) return thread;
          return {
            ...thread,
            initialPost: newPost,
            rootSnippet: thread.rootSnippet || newPost.content,
          };
        })
      );
      setPostsByThread((prev) => ({
        ...prev,
        [threadId]: prev[threadId] ?? [],
      }));
      return newPost.id;
    }

    setPostsByThread((prev) => {
      const existing = prev[threadId] ?? [];
      return {
        ...prev,
        [threadId]: [newPost, ...existing],
      };
    });

    unlockAchievement('FIRST_REPLY');
    if (hasImageAttachment) {
      unlockAchievement('FIRST_IMAGE_REPLY');
    }
    return newPost.id;
  }

  function addWaveToComment(threadId, commentId, waveType) {
    if (!['support', 'insight', 'question'].includes(waveType)) return;

    const incrementWave = (post) => {
      if (!post) return post;
      const safeWaves = normalizeWaves(post.waves, post.waveCount);
      const nextWaves = {
        ...safeWaves,
        [waveType]: safeWaves[waveType] + 1,
      };
      return {
        ...post,
        waves: nextWaves,
        waveCount: getTotalWaves(nextWaves),
      };
    };

    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread;
        if (!thread.initialPost || thread.initialPost.id !== commentId) {
          return thread;
        }
        return {
          ...thread,
          initialPost: incrementWave(thread.initialPost),
        };
      })
    );

    setPostsByThread((prev) => {
      const existing = prev[threadId];
      if (!existing) return prev;
      const updated = existing.map((post) =>
        post.id === commentId ? incrementWave(post) : post
      );
      return {
        ...prev,
        [threadId]: updated,
      };
    });

    setCurrentUser((prev) => {
      const safeUser = normalizeUser(prev);
      const nextSent = Number.isFinite(safeUser.wavesSent)
        ? safeUser.wavesSent + 1
        : 1;
      return { ...safeUser, wavesSent: nextSent };
    });
  }

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
    setFollowedRoomIds(selectedRoomIds);
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
    setFollowedRoomIds([]);
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
      threads,
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
      createPost,
      addWaveToComment,
      setActivePersonaId,
      completeOnboarding,
      resetOnboarding,
      updateCurrentUser,
      addReflection,
      unlockAchievement,
      addCustomPersona,
      setFollowedRoomIds,
      setJustFinishedOnboarding,
      recentlyUnlockedAchievementId,
      clearRecentlyUnlockedAchievement,
      pendingAchievementCelebrations,
      queueAchievementCelebration,
      shiftAchievementCelebration,
    }),
    [
      rooms,
      threads,
      postsByThread,
      isOnboarded,
      initialRoomIds,
      followedRoomIds,
      primaryPersonaId,
      algorithmPreset,
      activePersonaId,
      personas,
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
