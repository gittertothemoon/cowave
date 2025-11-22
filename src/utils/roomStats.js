export function computeRoomStats(rooms = [], threads = [], postsByThread = {}) {
  const dayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const statsByRoom = {};

  rooms.forEach((room) => {
    statsByRoom[room.id] = {
      threadCount: 0,
      repliesCount: 0,
      repliesLast24h: 0,
      lastActivity: null,
    };
  });

  threads.forEach((thread) => {
    const stats = statsByRoom[thread.roomId] ?? {
      threadCount: 0,
      repliesCount: 0,
      repliesLast24h: 0,
      lastActivity: null,
    };
    stats.threadCount += 1;
    const posts = postsByThread?.[thread.id] ?? [];
    posts.forEach((post) => {
      const time = new Date(post.createdAt).getTime();
      if (post.parentId !== null) {
        stats.repliesCount += 1;
        if (!Number.isNaN(time) && now - time <= dayMs) {
          stats.repliesLast24h += 1;
        }
      }
      if (!Number.isNaN(time)) {
        stats.lastActivity =
          stats.lastActivity === null
            ? time
            : Math.max(stats.lastActivity, time);
      }
    });
    const threadTime = new Date(thread.createdAt).getTime();
    if (!Number.isNaN(threadTime)) {
      stats.lastActivity =
        stats.lastActivity === null
          ? threadTime
          : Math.max(stats.lastActivity, threadTime);
    }
    statsByRoom[thread.roomId] = stats;
  });

  return statsByRoom;
}
