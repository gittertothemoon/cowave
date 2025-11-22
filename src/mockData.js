export const personas = [
  {
    id: 'dev',
    title: 'Sviluppo',
    description: 'Per condividere progetti, codice e idee tecniche.',
    color: 'bg-emerald-500',
  },
  {
    id: 'creator',
    title: 'Laboratorio creator',
    description: 'Per contenuti creativi, social e media.',
    color: 'bg-fuchsia-500',
  },
  {
    id: 'deep',
    title: 'Conversazioni profonde',
    description: 'Per riflessioni personali e conversazioni profonde.',
    color: 'bg-sky-500',
  },
  {
    id: 'host',
    title: 'Host accogliente',
    description: 'Per curare rituali e stanze con tono accogliente.',
    color: 'bg-amber-400',
  },
];

export const rooms = [
  {
    id: 'room-dev',
    name: 'Dev Lab',
    description: 'Co-creazione su coding, AI, automazioni e side-project.',
    members: 328,
    isPrivate: false,
    tags: ['coding', 'ai', 'automation'],
    theme: {
      primary: '#34d399',
      secondary: '#10b981',
      glow: 'rgba(16,185,129,0.45)',
      text: '#ecfdf5',
    },
  },
  {
    id: 'room-adult',
    name: 'Creators 18+ Lab',
    description: 'Strumenti seri per creator adult e gestione community.',
    members: 142,
    isPrivate: true,
    tags: ['adult', 'monetization'],
    theme: {
      primary: '#f472b6',
      secondary: '#fb7185',
      glow: 'rgba(244,114,182,0.45)',
      text: '#fff1f2',
    },
  },
  {
    id: 'room-mental',
    name: 'Deep Talk',
    description: 'Discussioni lunghe, filosofia, crescita personale.',
    members: 89,
    isPrivate: false,
    tags: ['mindset', 'long-form'],
    theme: {
      primary: '#60a5fa',
      secondary: '#a78bfa',
      glow: 'rgba(96,165,250,0.45)',
      text: '#eff6ff',
    },
  },
];

export const threads = [
  {
    id: 'thread-1',
    roomId: 'room-dev',
    title: 'Costruiamo un tool per migliorare la produttività in magazzino',
    author: 'Pionio-dev',
    personaId: 'dev',
    createdAt: '2025-11-10T09:00:00Z',
    depth: 3,
    energy: 'costruttivo',
    rootSnippet:
      'Vorrei un sistema per unire SAP, file Excel e dashboard interattive…',
    branches: 7,
  },
  {
    id: 'thread-2',
    roomId: 'room-mental',
    title: 'Come evitare di farsi mangiare dai social',
    author: 'Pionio-thinker',
    personaId: 'deep',
    createdAt: '2025-11-12T18:30:00Z',
    depth: 4,
    energy: 'riflessivo',
    rootSnippet:
      'Pensavo a un algoritmo che puoi controllare tu, invece che il contrario…',
    branches: 4,
  },
];

export const postsByThread = {
  'thread-1': [
    {
      id: 'p1',
      parentId: null,
      author: 'Pionio-dev',
      personaId: 'dev',
      createdAt: '2025-11-10T09:00:00Z',
      content:
        'Vorrei un flusso da: SAP → esport BO → normalizzazione → dashboard web con filtri intelligenti.',
      waveCount: 0,
      hasWaved: false,
    },
    {
      id: 'p2',
      parentId: 'p1',
      author: 'another-user',
      personaId: 'dev',
      createdAt: '2025-11-10T09:15:00Z',
      content:
        'Potremmo usare un layer di validazione per le AUoM e un simulatore di occupancy integrato.',
      waveCount: 0,
      hasWaved: false,
    },
    {
      id: 'p3',
      parentId: 'p2',
      author: 'Pionio-dev',
      personaId: 'dev',
      createdAt: '2025-11-10T09:25:00Z',
      content:
        'Mi piace, branchiamo in “simulazione magazzino” come sottothread e vediamo dove ci porta.',
      waveCount: 0,
      hasWaved: false,
    },
  ],
  'thread-2': [
    {
      id: 'p4',
      parentId: null,
      author: 'Pionio-thinker',
      personaId: 'deep',
      createdAt: '2025-11-12T18:30:00Z',
      content:
        'Se potessi spostare slider tipo: %contenuti che mi sfidano vs %comfort, cambierebbe tutto.',
      waveCount: 0,
      hasWaved: false,
    },
  ],
};
