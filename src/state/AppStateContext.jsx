import { createContext, useContext, useMemo, useState } from 'react';
import {
  personas as initialPersonas,
  rooms as initialRooms,
  threads as initialThreads,
  postsByThread as initialPostsByThread,
} from '../mockData.js';

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [rooms, setRooms] = useState(initialRooms);
  const [threads, setThreads] = useState(initialThreads);
  const [postsByThread, setPostsByThread] = useState(initialPostsByThread);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [initialRoomIds, setInitialRoomIds] = useState([]);
  const [primaryPersonaId, setPrimaryPersonaId] = useState(null);
  const [algorithmPreset, setAlgorithmPreset] = useState('balanced');
  const [activePersonaId, setActivePersonaId] = useState(
    initialPersonas[0]?.id ?? null
  );

  // In futuro se vuoi potrai creare anche nuove personas
  const personas = initialPersonas;

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
      author: 'Tu',
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
      author: 'Tu',
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
      primaryPersonaId,
      algorithmPreset,
      activePersonaId,
      createRoom,
      createThread,
      createPost,
      setActivePersonaId,
      completeOnboarding,
      resetOnboarding,
    }),
    [
      rooms,
      threads,
      postsByThread,
      isOnboarded,
      initialRoomIds,
      primaryPersonaId,
      algorithmPreset,
      activePersonaId,
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
