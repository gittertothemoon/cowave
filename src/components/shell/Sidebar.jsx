import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAppState } from '../../state/AppStateContext.jsx';
import CreateRoomModal from '../rooms/CreateRoomModal.jsx';
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  cardBaseClass,
} from '../ui/primitives.js';
import { SidebarQuickStats } from '../sidebar/SidebarQuickStats.jsx';
import { SidebarToggle } from '../sidebar/SidebarToggle.jsx';
import CoWaveLogo from '../CoWaveLogo.jsx';
import { computeRoomStats } from '../../utils/roomStats.js';

const MOBILE_DRAWER_ID = 'cowave-sidebar-drawer';
const SIDEBAR_NAV_ID = 'sidebar-navigation';

export default function Sidebar({
  variant = 'desktop',
  open = false,
  onClose,
  collapsed = false,
  onToggleCollapse = () => {},
}) {
  const { rooms, threads, postsByThread, followedRoomIds = [] } = useAppState();
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [roomFilter, setRoomFilter] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const navigate = useNavigate();
  const isMobile = variant === 'mobile';
  const isCollapsed = !isMobile && collapsed;
  const accentPalette = ['#38bdf8', '#a78bfa', '#34d399', '#f472b6', '#fb7185'];
  const getRoomAccent = (room, index) =>
    room.theme?.primary ?? accentPalette[index % accentPalette.length];
  const hasFollowedRooms = followedRoomIds.length > 0;
  const followedSet = new Set(followedRoomIds);
  const primaryRooms = hasFollowedRooms
    ? rooms.filter((room) => followedSet.has(room.id))
    : rooms;
  const exploreRooms = hasFollowedRooms
    ? rooms.filter((room) => !followedSet.has(room.id))
    : [];

  const roomStats = useMemo(
    () => computeRoomStats(rooms, threads, postsByThread),
    [rooms, threads, postsByThread]
  );

  const observedRooms = hasFollowedRooms ? primaryRooms : rooms;
  const observedRoomIdSet = useMemo(
    () => new Set(observedRooms.map((room) => room.id)),
    [observedRooms]
  );

  const repliesLast24h = useMemo(
    () =>
      observedRooms.reduce(
        (total, room) => total + (roomStats[room.id]?.repliesLast24h ?? 0),
        0
      ),
    [observedRooms, roomStats]
  );

  const threadsLast24h = useMemo(() => {
    const dayMs = 24 * 60 * 60 * 1000;
    const now = Date.now();
    return threads.filter((thread) => {
      if (!observedRoomIdSet.has(thread.roomId)) return false;
      const createdAt = new Date(thread.createdAt).getTime();
      return !Number.isNaN(createdAt) && now - createdAt <= dayMs;
    }).length;
  }, [threads, observedRoomIdSet]);

  const activeRooms = useMemo(
    () =>
      primaryRooms
        .map((room, index) => {
          const stats = roomStats[room.id] ?? {};
          return {
            room,
            stats,
            accent: getRoomAccent(room, index),
          };
        })
        .filter(
          ({ stats }) =>
            (stats.repliesLast24h ?? 0) > 0 || (stats.lastActivity ?? 0) > 0
        )
        .sort((a, b) => {
          const replyDiff =
            (b.stats.repliesLast24h ?? 0) - (a.stats.repliesLast24h ?? 0);
          if (replyDiff !== 0) return replyDiff;
          return (b.stats.lastActivity ?? 0) - (a.stats.lastActivity ?? 0);
        })
        .slice(0, 3),
    [primaryRooms, roomStats]
  );

  const filteredPrimaryRooms = useMemo(() => {
    const query = roomFilter.trim().toLowerCase();
    if (!query) return primaryRooms;
    return primaryRooms.filter((room) => {
      const tags = room.tags?.join(' ') ?? '';
      return (
        room.name.toLowerCase().includes(query) ||
        tags.toLowerCase().includes(query)
      );
    });
  }, [roomFilter, primaryRooms]);

  const filteredExploreRooms = useMemo(() => {
    const query = roomFilter.trim().toLowerCase();
    if (!query) return exploreRooms;
    return exploreRooms.filter((room) => {
      const tags = room.tags?.join(' ') ?? '';
      return (
        room.name.toLowerCase().includes(query) ||
        tags.toLowerCase().includes(query)
      );
    });
  }, [roomFilter, exploreRooms]);

  const handleNavigate = (path, options) => {
    navigate(path, options);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const threadRoomChoices = useMemo(() => {
    const merged = [...primaryRooms, ...exploreRooms];
    const seen = new Set();
    return merged.filter((room) => {
      if (!room || !room.id || seen.has(room.id)) return false;
      seen.add(room.id);
      return true;
    });
  }, [primaryRooms, exploreRooms]);

  const nextRoomId = threadRoomChoices[0]?.id ?? null;

  useEffect(() => {
    const firstAvailable = threadRoomChoices[0]?.id ?? '';
    const currentExists = selectedRoomId
      ? threadRoomChoices.some((room) => room.id === selectedRoomId)
      : false;
    if (!currentExists) {
      setSelectedRoomId(firstAvailable);
    }
  }, [threadRoomChoices, selectedRoomId]);

  const handleStartThread = () => {
    const targetRoomId = selectedRoomId || nextRoomId;
    if (targetRoomId) {
      handleNavigate(`/app/rooms/${targetRoomId}`, {
        state: { highlightCreateThread: true },
      });
      return;
    }
    setIsCreateRoomOpen(true);
  };

  useEffect(() => {
    if (!isMobile || !open) return undefined;
    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobile, open, onClose]);

  const content = (
    <div
      className={`flex h-full flex-col ${
        isMobile ? 'bg-slate-950 text-slate-100' : 'bg-surface/95 md:bg-transparent'
      }`}
    >
      {isMobile && (
        <div className="grid grid-cols-3 items-center px-4 py-3 border-b border-white/10">
          <div aria-hidden className="h-6" />
          <div className="flex justify-center">
            <CoWaveLogo size={96} />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-slate-400 hover:text-white hover:bg-slate-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              aria-label="Chiudi menu"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <nav
        id={isMobile ? SIDEBAR_NAV_ID : undefined}
        className={`flex-1 overflow-y-auto px-4 py-5 space-y-6 ${
          isMobile ? 'text-sm' : ''
        }`}
        aria-label="Navigazione principale"
      >
        <SidebarQuickStats
          rooms={primaryRooms.length}
          threadsToday={threadsLast24h}
          repliesToday={repliesLast24h}
        />
        <div className={`${cardBaseClass} p-4 space-y-4`}>
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
              Apri un thread in
            </p>
            <div className="flex flex-wrap gap-2">
              {threadRoomChoices.map((room, index) => {
                const accent = getRoomAccent(room, index);
                const isActive = selectedRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`px-3 py-1.5 rounded-xl border text-[12px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                      isActive
                        ? 'text-slate-950'
                        : 'text-slate-200 hover:text-white'
                    }`}
                    style={{
                      borderColor: isActive ? `${accent}80` : '#1e293b',
                      background: isActive
                        ? `${accent}cc`
                        : 'rgba(15,23,42,0.8)',
                      boxShadow: isActive ? `0 10px 30px ${accent}33` : 'none',
                    }}
                    aria-pressed={isActive}
                  >
                    {room.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleStartThread}
              className={`${buttonPrimaryClass} rounded-xl text-[13px] px-3 py-2 justify-center`}
            >
              Avvia un thread
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('/app/settings/esperienza')}
              className={`${buttonSecondaryClass} rounded-xl text-[13px] px-3 py-2 justify-center`}
            >
              Strumenti avanzati
            </button>
          </div>
        </div>

        {activeRooms.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Stanze attive
              </p>
              <span className="text-[11px] text-slate-500">
                {repliesLast24h} risposte oggi
              </span>
            </div>
            <ul className="space-y-1.5">
              {activeRooms.map(({ room, stats, accent }) => (
                <li key={room.id}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(`/app/rooms/${room.id}`)}
                    className="w-full text-left rounded-2xl border transition bg-slate-950/80 hover:border-white/25 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    style={{
                      borderColor: `${accent}30`,
                      boxShadow: `0 0 0 1px ${accent}20, 0 12px 30px ${accent}14`,
                    }}
                    aria-label={`Apri la stanza ${room.name}`}
                  >
                    <div className="px-3.5 py-3 flex items-start gap-3">
                      <span
                        className="h-9 w-9 rounded-xl flex items-center justify-center text-[11px] font-semibold text-slate-950 flex-shrink-0 shadow-inner"
                        style={{ background: `${accent}33` }}
                      >
                        {room.name[0]}
                      </span>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-sm font-semibold truncate text-slate-100">
                            {room.name}
                          </p>
                          <span className="text-[11px] text-slate-400 truncate">
                            #{room.tags?.[0] ?? 'focus'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-300">
                          <Chip>{stats.repliesLast24h ?? 0} risposte oggi</Chip>
                          <Chip>Ultima attività {formatRelativeTime(stats.lastActivity)}</Chip>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Le tue stanze
            </p>
            <button
              type="button"
              onClick={() => setIsCreateRoomOpen(true)}
              className={`${buttonSecondaryClass} rounded-full px-3 py-2 text-[11px] tracking-[0.12em]`}
            >
              <span className="text-sm leading-none">+</span> Crea
            </button>
          </div>

          <div className="px-1 mb-3">
            <label htmlFor="room-filter" className="sr-only">
              Filtra stanze
            </label>
            <div className="relative">
              <input
                id="room-filter"
                type="search"
                value={roomFilter}
                onChange={(event) => setRoomFilter(event.target.value)}
                placeholder="Cerca per nome o tag…"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/60"
              />
              {roomFilter && (
                <button
                  type="button"
                  onClick={() => setRoomFilter('')}
                  className="absolute right-3 top-2.5 text-[11px] text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/60 rounded"
                  aria-label="Cancella filtro"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <ul className="space-y-1.5">
            {filteredPrimaryRooms.map((room, index) => {
              const accent = getRoomAccent(room, index);
              return (
                <li key={room.id}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(`/app/rooms/${room.id}`)}
                    className="group w-full text-left rounded-2xl border transition overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 hover:-translate-y-0.5"
                    style={{
                      borderColor: `${accent}35`,
                      boxShadow: `0 12px 34px ${accent}18`,
                      backgroundImage: `linear-gradient(120deg, ${accent}1f, rgba(15,23,42,0.82))`,
                    }}
                    aria-label={`Apri stanza ${room.name}`}
                  >
                    <div className="px-3.5 py-3 flex items-start gap-3">
                      <span
                        className="mt-0.5 h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: accent }}
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-sm font-semibold truncate text-slate-100">
                            {room.name}
                          </p>
                          <span className="text-[11px] text-slate-400 truncate">
                            {Array.isArray(room.tags) && room.tags[0]
                              ? `#${room.tags[0]}`
                              : '—'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-300">
                          <Chip>{room.members} membri</Chip>
                          <Chip>{room.isPrivate ? 'Privata' : 'Aperta'}</Chip>
                          {Array.isArray(room.tags) && room.tags[1] && (
                            <Chip>#{room.tags[1]}</Chip>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          {filteredPrimaryRooms.length === 0 && (
            <p className="text-[11px] text-slate-500 px-1 mt-2">
              Nessuna stanza con questo nome o tag. Prova a rimuovere il filtro.
            </p>
          )}
          {exploreRooms.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Esplora altre stanze
              </p>
              <ul className="space-y-1.5">
                {filteredExploreRooms.map((room, index) => {
                  const accent = getRoomAccent(
                    room,
                    index + primaryRooms.length
                  );
                  return (
                    <li key={room.id}>
                      <button
                        type="button"
                        onClick={() => handleNavigate(`/app/rooms/${room.id}`)}
                        className="w-full text-left px-3 py-2 rounded-2xl border border-slate-800 bg-slate-950/40 text-xs text-slate-300 hover:border-white/20 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                        style={{
                          boxShadow: `inset 0 0 0 1px ${accent}20`,
                        }}
                        aria-label={`Esplora la stanza ${room.name}`}
                      >
                        {room.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {!hasFollowedRooms && (
            <p className="text-[11px] text-slate-500 px-1 mt-3">
              Seguirai le stanze preferite durante l’onboarding iniziale.
            </p>
          )}
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {variant === 'desktop' && (
        <aside
          className={`hidden md:flex flex-col bg-surface/80 border-r border-white/10 backdrop-blur-2xl relative z-30 overflow-visible transition-[width] duration-200 ease-out ${
            isCollapsed ? 'md:w-16' : 'md:w-72'
          }`}
          aria-label="Navigazione principale"
        >
          <SidebarToggle
            isCollapsed={isCollapsed}
            onToggle={onToggleCollapse}
          />
          <div
            className={`h-full transition-opacity duration-200 ${
              isCollapsed
                ? 'opacity-0 pointer-events-none select-none'
                : 'opacity-100'
            }`}
            aria-hidden={isCollapsed}
          >
            {content}
          </div>
        </aside>
      )}

      {variant === 'mobile' && open && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside
            id={MOBILE_DRAWER_ID}
            className="relative z-50 flex h-full w-72 max-w-[80%] flex-col border-r border-slate-800 bg-slate-950 shadow-soft"
            role="dialog"
            aria-modal="true"
            aria-label="Menu principale"
          >
            {content}
          </aside>
        </div>
      )}

      <CreateRoomModal
        open={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onCreated={(roomId) => {
          setIsCreateRoomOpen(false);
          handleNavigate(`/app/rooms/${roomId}`);
        }}
      />
    </>
  );
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-slate-900/70 px-2 py-1">
      {children}
    </span>
  );
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return '—';
  const now = Date.now();
  const diff = now - timestamp;
  if (diff < 60 * 1000) return 'adesso';
  const minutes = Math.round(diff / (60 * 1000));
  if (minutes < 60) return `${minutes} min fa`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h fa`;
  const days = Math.round(hours / 24);
  return `${days} g fa`;
}
