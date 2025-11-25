import { useMemo, useState } from 'react';
import { useAppState } from '../state/AppStateContext.jsx';
import { useAchievements } from '../features/achievements/useAchievements.js';
import ProfileHeader from '../features/profile/ProfileHeader.jsx';
import ProfileStatsSection from '../features/profile/ProfileStatsSection.jsx';
import ProfileAchievementsSection from '../features/profile/ProfileAchievementsSection.jsx';
import ProfileRoomsSection from '../features/profile/ProfileRoomsSection.jsx';
import ProfileSettingsSection from '../features/profile/ProfileSettingsSection.jsx';
import AddReflectionModal from '../features/profile/AddReflectionModal.jsx';
import {
  bodyTextClass,
  buttonPrimaryClass,
  cardBaseClass,
  cardMutedClass,
  eyebrowClass,
} from '../components/ui/primitives.js';

const FALLBACK_JOINED_AT = new Date(
  Date.now() - 1000 * 60 * 60 * 24 * 60
).toISOString();

export default function ProfilePage({ activePersonaId }) {
  const {
    currentUser,
    personas,
    rooms,
    threads,
    postsByThread,
    followedRoomIds,
    addReflection,
  } = useAppState();
  const { unlockedIds } = useAchievements();
  const [isReflectionModalOpen, setReflectionModalOpen] = useState(false);

  const displayName = currentUser?.nickname?.trim() || 'Tu';
  const handle =
    currentUser?.handle?.trim() ||
    `@${displayName.toLowerCase().replace(/[^a-z0-9]/gi, '') || 'tu'}`;
  const bio =
    currentUser?.bio?.trim() ||
    'Aggiungi una breve descrizione su come vuoi usare CoWave.';
  const joinedAt = currentUser?.joinedAt || FALLBACK_JOINED_AT;
  const joinedLabel = formatJoinedLabel(joinedAt);
  const activePersona = personas.find((p) => p.id === activePersonaId);
  const personaLabel = activePersona?.title || activePersona?.label;

  const userData = useMemo(
    () =>
      deriveUserData(
        displayName,
        threads,
        postsByThread,
        currentUser
      ),
    [displayName, threads, postsByThread, currentUser]
  );

  const roomsWithMeta = useMemo(
    () =>
      deriveRoomMeta(
        rooms,
        threads,
        postsByThread,
        followedRoomIds,
        userData.isByUser
      ),
    [rooms, threads, postsByThread, followedRoomIds, userData.isByUser]
  );

  const stats = {
    threadsStarted: userData.userThreads.length,
    repliesSent: userData.userReplies.length,
    wavesSent: userData.wavesSent,
    wavesReceived: userData.wavesReceived,
  };

  const activity = {
    threads: buildRecentThreads(userData.userThreads, rooms),
    replies: buildRecentReplies(userData.userReplies, threads, rooms),
  };
  const reflections = useMemo(
    () =>
      [...(currentUser?.reflections ?? [])].sort(
        (a, b) => (getTimeValue(b.date) ?? 0) - (getTimeValue(a.date) ?? 0)
      ),
    [currentUser?.reflections]
  );

  function handleSaveReflection(reflection) {
    if (!reflection?.note?.trim()) return;
    addReflection(reflection);
    setReflectionModalOpen(false);
  }

  return (
    <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-6 pb-10 space-y-6 sm:space-y-8">
      <ProfileHeader
        user={{ displayName, handle, bio, joinedLabel }}
        personaLabel={personaLabel}
        stats={stats}
        followedRoomsCount={roomsWithMeta.length}
      />

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1.7fr),minmax(0,1.3fr)] lg:items-start">
        <ProfileStatsSection stats={stats} activity={activity} />
        <ProfileAchievementsSection unlocked={unlockedIds} />
      </div>

      <ProfileRoomsSection rooms={roomsWithMeta} />
      <section className={`${cardBaseClass} p-4 sm:p-5 space-y-4`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className={eyebrowClass}>I tuoi appunti da CoWave</p>
            <p className={bodyTextClass}>
              Qui trovi le note che hai scritto dopo le tue conversazioni.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReflectionModalOpen(true)}
            className={`${buttonPrimaryClass} text-sm`}
          >
            Aggiungi un appunto di oggi
          </button>
        </div>

        {reflections.length === 0 ? (
          <div className={`${cardMutedClass} rounded-2xl p-3 sm:p-4 space-y-1`}>
            <p className="font-semibold text-slate-100">
              Non hai ancora scritto nessun appunto.
            </p>
            <p className="text-[13px] text-slate-400">
              Puoi aggiungerne uno quando senti che una conversazione ti ha lasciato qualcosa.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {reflections.map((reflection) => (
              <article
                key={reflection.id}
                className={`${cardMutedClass} rounded-2xl p-3 sm:p-4 space-y-2`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    {formatReflectionDate(reflection.date)}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-[11px] font-semibold border ${getTagStyle(reflection.tag)}`}
                  >
                    {formatReflectionTag(reflection.tag)}
                  </span>
                </div>
                <p className="text-sm text-slate-100 leading-relaxed line-clamp-3">
                  {reflection.note}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
      <ProfileSettingsSection />
      <AddReflectionModal
        isOpen={isReflectionModalOpen}
        onClose={() => setReflectionModalOpen(false)}
        onSave={handleSaveReflection}
      />
    </main>
  );
}

function deriveUserData(displayName, threads, postsByThread, currentUser) {
  const nameToken = displayName.trim().toLowerCase();
  const isByUser = (author) =>
    !!author && author.trim().toLowerCase() === nameToken;

  const userThreads = threads.filter(
    (thread) =>
      isByUser(thread.author) || isByUser(thread.initialPost?.author)
  );

  const userReplies = [];
  Object.entries(postsByThread ?? {}).forEach(([threadId, replies]) => {
    replies.forEach((reply) => {
      if (isByUser(reply.author)) {
        userReplies.push({ ...reply, threadId });
      }
    });
  });

  const userInitialPosts = threads
    .map((thread) => thread.initialPost)
    .filter((post) => post && isByUser(post.author));

  const wavesReceived = [...userInitialPosts, ...userReplies].reduce(
    (acc, post) => acc + getWaveTotal(post?.waves),
    0
  );
  const wavesSent = Number.isFinite(currentUser?.wavesSent)
    ? currentUser.wavesSent
    : 0;

  return {
    isByUser,
    userThreads,
    userReplies,
    wavesSent,
    wavesReceived,
  };
}

function deriveRoomMeta(
  rooms,
  threads,
  postsByThread,
  followedRoomIds,
  isByUser
) {
  const followedRooms = rooms.filter((room) =>
    followedRoomIds.includes(room.id)
  );

  return followedRooms.map((room) => {
    const roomThreads = threads.filter(
      (thread) => thread.roomId === room.id
    );
    const participationCount = roomThreads.reduce((count, thread) => {
      const replies = postsByThread?.[thread.id] ?? [];
      const participated =
        isByUser(thread.author) ||
        isByUser(thread.initialPost?.author) ||
        replies.some((reply) => isByUser(reply.author));
      return participated ? count + 1 : count;
    }, 0);

    const timestamps = [];
    roomThreads.forEach((thread) => {
      const created = getTimeValue(thread.createdAt);
      if (created) timestamps.push(created);
      const initialTime = getTimeValue(thread.initialPost?.createdAt);
      if (initialTime) timestamps.push(initialTime);
      (postsByThread?.[thread.id] ?? []).forEach((reply) => {
        const time = getTimeValue(reply.createdAt);
        if (time) timestamps.push(time);
      });
    });

    const lastActivity =
      timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null;

    return {
      ...room,
      participationCount,
      lastActivity,
    };
  });
}

function buildRecentThreads(threads, rooms) {
  return [...threads]
    .sort(
      (a, b) =>
        (getTimeValue(b.createdAt || b.initialPost?.createdAt) ?? 0) -
        (getTimeValue(a.createdAt || a.initialPost?.createdAt) ?? 0)
    )
    .slice(0, 3)
    .map((thread) => ({
      id: thread.id,
      title: thread.title,
      roomName:
        rooms.find((room) => room.id === thread.roomId)?.name ||
        'Stanza',
      createdAt: thread.createdAt || thread.initialPost?.createdAt,
    }));
}

function buildRecentReplies(replies, threads, rooms) {
  return [...replies]
    .sort(
      (a, b) => (getTimeValue(b.createdAt) ?? 0) - (getTimeValue(a.createdAt) ?? 0)
    )
    .slice(0, 3)
    .map((reply) => {
      const thread = threads.find((t) => t.id === reply.threadId);
      return {
        id: reply.id,
        threadTitle: thread?.title || 'Thread',
        roomName:
          rooms.find((room) => room.id === thread?.roomId)?.name ||
          'Stanza',
        createdAt: reply.createdAt,
        preview: reply.content,
      };
    });
}

function getWaveTotal(waves) {
  if (!waves || typeof waves !== 'object') return 0;
  const support = Number.isFinite(waves.support) ? waves.support : 0;
  const insight = Number.isFinite(waves.insight) ? waves.insight : 0;
  const question = Number.isFinite(waves.question) ? waves.question : 0;
  return Math.max(0, support) + Math.max(0, insight) + Math.max(0, question);
}

function getTimeValue(dateLike) {
  if (!dateLike) return null;
  const value = new Date(dateLike).getTime();
  return Number.isNaN(value) ? null : value;
}

function formatJoinedLabel(dateLike) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return 'Ultime settimane';
  return date.toLocaleDateString('it-IT', {
    month: 'long',
    year: 'numeric',
  });
}

function formatReflectionDate(dateLike) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return 'Data non disponibile';
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatReflectionTag(tag) {
  const labels = {
    idea: 'Idea',
    sfogo: 'Sfogo',
    spunto: 'Spunto',
  };
  return labels[tag] || 'Appunto';
}

function getTagStyle(tag) {
  const map = {
    idea: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-100',
    sfogo: 'border-rose-400/60 bg-rose-500/10 text-rose-100',
    spunto: 'border-sky-400/60 bg-sky-500/10 text-sky-100',
  };
  return map[tag] || 'border-slate-700 bg-slate-900/60 text-slate-200';
}
