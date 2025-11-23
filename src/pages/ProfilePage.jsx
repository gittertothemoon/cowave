import { useMemo } from 'react';
import { useAppState } from '../state/AppStateContext.jsx';
import { useAchievements } from '../features/achievements/useAchievements.js';
import ProfileHeader from '../features/profile/ProfileHeader.jsx';
import ProfileStatsSection from '../features/profile/ProfileStatsSection.jsx';
import ProfileAchievementsSection from '../features/profile/ProfileAchievementsSection.jsx';
import ProfileRoomsSection from '../features/profile/ProfileRoomsSection.jsx';
import ProfileSettingsSection from '../features/profile/ProfileSettingsSection.jsx';

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
  } = useAppState();
  const { unlockedIds } = useAchievements();

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
    () => deriveUserData(displayName, threads, postsByThread),
    [displayName, threads, postsByThread]
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
      <ProfileSettingsSection />
    </main>
  );
}

function deriveUserData(displayName, threads, postsByThread) {
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

  const allPosts = [
    ...threads.map((thread) => thread.initialPost).filter(Boolean),
    ...Object.values(postsByThread ?? {}).flat(),
  ];
  const wavesSent = allPosts.filter((post) => post?.hasWaved).length;

  const wavesReceived = [...userInitialPosts, ...userReplies].reduce(
    (acc, post) => acc + (Number.isFinite(post?.waveCount) ? post.waveCount : 0),
    0
  );

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
