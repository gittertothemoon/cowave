import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  personas as initialPersonas,
  rooms as initialRooms,
  threads as initialThreads,
  postsByThread as initialPostsByThread,
} from '../mockData.js';

const AppStateContext = createContext(null);
const USER_STORAGE_KEY = 'cowave-user';
const CUSTOM_PERSONAS_KEY = 'cowave-custom-personas';
const defaultUser = { nickname: 'Tu', email: '' };

export function AppStateProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window === 'undefined') return defaultUser;
    try {
      const stored = window.localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultUser;
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
  const [threads, setThreads] = useState(initialThreads);
  const [postsByThread, setPostsByThread] = useState(initialPostsByThread);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [initialRoomIds, setInitialRoomIds] = useState([]);
  const [followedRoomIds, setFollowedRoomIds] = useState([]);
  const [primaryPersonaId, setPrimaryPersonaId] = useState(null);
  const [algorithmPreset, setAlgorithmPreset] = useState('balanced');
  const [activePersonaId, setActivePersonaId] = useState(
    initialPersonas[0]?.id ?? null
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(currentUser ?? defaultUser)
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
    setCurrentUser((prev) => ({
      ...prev,
      ...updates,
    }));
  }

  function addCustomPersona(name) {
    const cleaned = name.trim();
    if (!cleaned) return null;
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
      description: 'Persona personalizzata',
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
    rootSnippet,
    personaId = personas[0]?.id ?? 'dev',
    energy = 'neutro',
  }) {
    const id = `thread-${Date.now()}`;
    const newThread = {
      id,
      roomId,
      title,
      author: currentUser?.nickname || 'Tu',
      personaId,
      createdAt: new Date().toISOString(),
      depth: 1,
      energy,
      rootSnippet,
      branches: 0,
    };
    setThreads((prev) => [newThread, ...prev]);
    return id;
  }

  function createPost(threadId, { content, parentId = null, personaId }) {
    const newPost = {
      id: `p-${Date.now()}`,
      parentId,
      author: currentUser?.nickname || 'Tu',
      personaId: personaId ?? personas[0]?.id ?? 'dev',
      createdAt: new Date().toISOString(),
      content,
    };

    setPostsByThread((prev) => {
      const existing = prev[threadId] ?? [];
      return {
        ...prev,
        [threadId]: [...existing, newPost],
      };
    });
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
    setIsOnboarded(true);
  }

  function resetOnboarding() {
    setIsOnboarded(false);
    setInitialRoomIds([]);
    setFollowedRoomIds([]);
    setPrimaryPersonaId(null);
    setAlgorithmPreset('balanced');
    setActivePersonaId(initialPersonas[0]?.id ?? null);
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
      createRoom,
      createThread,
      createPost,
      setActivePersonaId,
      completeOnboarding,
      resetOnboarding,
      updateCurrentUser,
      addCustomPersona,
      setFollowedRoomIds,
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
