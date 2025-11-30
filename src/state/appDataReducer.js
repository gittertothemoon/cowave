const emptyStatus = { loading: false, error: null };

export const initialDataState = {
  roomsById: {},
  roomOrder: [],
  myRoomIds: [],
  threadsById: {},
  threadsByRoom: {},
  commentsById: {},
  commentsByThread: {},
  follows: [],
  roomsStatus: { ...emptyStatus },
  myRoomsStatus: { ...emptyStatus },
};

export function appDataReducer(state, action) {
  switch (action.type) {
    case 'ROOMS_LOADING': {
      return {
        ...state,
        roomsStatus: { loading: true, error: null },
      };
    }
    case 'ROOMS_LOADED': {
      const nextRoomsById = { ...state.roomsById };
      const incomingRooms = (action.rooms ?? []).filter((room) => room?.id);
      incomingRooms.forEach((room) => {
        nextRoomsById[room.id] = { ...nextRoomsById[room.id], ...room };
      });
      const orderedIds = incomingRooms
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((room) => room.id);
      return {
        ...state,
        roomsById: nextRoomsById,
        roomOrder: orderedIds,
        roomsStatus: { loading: false, error: null },
      };
    }
    case 'ROOMS_ERROR': {
      return {
        ...state,
        roomsStatus: { loading: false, error: action.error ?? 'Errore' },
      };
    }
    case 'MY_ROOMS_LOADING': {
      return {
        ...state,
        myRoomsStatus: { loading: true, error: null },
      };
    }
    case 'MY_ROOMS_LOADED': {
      const nextRoomsById = { ...state.roomsById };
      (action.rooms ?? []).forEach((room) => {
        if (!room?.id) return;
        nextRoomsById[room.id] = { ...nextRoomsById[room.id], ...room };
      });
      const incomingIds = (action.rooms ?? [])
        .map((room) => room?.id)
        .filter(Boolean);
      const nextIds = action.append
        ? Array.from(new Set([...(state.myRoomIds ?? []), ...incomingIds]))
        : Array.from(new Set(incomingIds));
      return {
        ...state,
        roomsById: nextRoomsById,
        myRoomIds: nextIds,
        myRoomsStatus: { loading: false, error: null },
      };
    }
    case 'MY_ROOMS_ERROR': {
      return {
        ...state,
        myRoomsStatus: { loading: false, error: action.error ?? 'Errore' },
      };
    }
    case 'SET_FOLLOWS': {
      const ids = Array.from(new Set(action.roomIds ?? []));
      return { ...state, follows: ids };
    }
    case 'ROOM_FOLLOWED': {
      const ids = new Set(state.follows);
      if (action.roomId) {
        ids.add(action.roomId);
      }
      return { ...state, follows: Array.from(ids) };
    }
    case 'ROOM_UNFOLLOWED': {
      const ids = new Set(state.follows);
      if (action.roomId) {
        ids.delete(action.roomId);
      }
      return { ...state, follows: Array.from(ids) };
    }
    case 'THREADS_LOADING_FOR_ROOM': {
      const existing = state.threadsByRoom[action.roomId] ?? {
        ids: [],
        cursor: null,
        hasMore: true,
        loading: false,
        error: null,
      };
      return {
        ...state,
        threadsByRoom: {
          ...state.threadsByRoom,
          [action.roomId]: { ...existing, loading: true, error: null },
        },
      };
    }
    case 'THREADS_LOADED_FOR_ROOM': {
      const nextThreadsById = { ...state.threadsById };
      const incomingThreads = action.threads ?? [];
      incomingThreads.forEach((thread) => {
        nextThreadsById[thread.id] = { ...nextThreadsById[thread.id], ...thread };
      });

      const existing = state.threadsByRoom[action.roomId] ?? {
        ids: [],
        cursor: null,
        hasMore: true,
        loading: false,
        error: null,
      };
      const baseIds = action.replace ? [] : existing.ids;
      const mergedIds = [...baseIds, ...incomingThreads.map((t) => t.id)];
      const dedupedIds = mergedIds.filter(
        (id, index) => mergedIds.indexOf(id) === index
      );

      return {
        ...state,
        threadsById: nextThreadsById,
        threadsByRoom: {
          ...state.threadsByRoom,
          [action.roomId]: {
            ids: dedupedIds,
            cursor: action.cursor ?? null,
            hasMore: action.hasMore ?? false,
            loading: false,
            error: null,
          },
        },
      };
    }
    case 'THREAD_ERROR_FOR_ROOM': {
      const existing = state.threadsByRoom[action.roomId] ?? {
        ids: [],
        cursor: null,
        hasMore: true,
        loading: false,
        error: null,
      };
      return {
        ...state,
        threadsByRoom: {
          ...state.threadsByRoom,
          [action.roomId]: { ...existing, loading: false, error: action.error },
        },
      };
    }
    case 'THREAD_CREATED': {
      const newThread = action.thread;
      if (!newThread) return state;
      const nextThreadsById = {
        ...state.threadsById,
        [newThread.id]: { ...state.threadsById[newThread.id], ...newThread },
      };
      const existing = state.threadsByRoom[newThread.roomId] ?? {
        ids: [],
        cursor: null,
        hasMore: true,
        loading: false,
        error: null,
      };
      const nextIds = [newThread.id, ...existing.ids.filter((id) => id !== newThread.id)];
      return {
        ...state,
        threadsById: nextThreadsById,
        threadsByRoom: {
          ...state.threadsByRoom,
          [newThread.roomId]: { ...existing, ids: nextIds },
        },
      };
    }
    case 'UPSERT_THREAD': {
      const thread = action.thread;
      if (!thread) return state;
      const nextThreadsById = {
        ...state.threadsById,
        [thread.id]: { ...state.threadsById[thread.id], ...thread },
      };
      return {
        ...state,
        threadsById: nextThreadsById,
      };
    }
    case 'COMMENTS_LOADING_FOR_THREAD': {
      const existing = state.commentsByThread[action.threadId] ?? {
        ids: [],
        cursor: null,
        hasMore: true,
        loading: false,
        error: null,
      };
      return {
        ...state,
        commentsByThread: {
          ...state.commentsByThread,
          [action.threadId]: { ...existing, loading: true, error: null },
        },
      };
    }
    case 'COMMENTS_LOADED_FOR_THREAD': {
      const incomingComments = action.comments ?? [];
      const nextCommentsById = { ...state.commentsById };
      incomingComments.forEach((comment) => {
        nextCommentsById[comment.id] = {
          ...nextCommentsById[comment.id],
          ...comment,
        };
      });

      const existing = state.commentsByThread[action.threadId] ?? {
        ids: [],
        cursor: null,
        hasMore: true,
        loading: false,
        error: null,
      };
      const baseIds = action.replace ? [] : existing.ids;
      const mergedIds = [...baseIds, ...incomingComments.map((c) => c.id)];
      const dedupedIds = mergedIds.filter(
        (id, index) => mergedIds.indexOf(id) === index
      );

      return {
        ...state,
        commentsById: nextCommentsById,
        commentsByThread: {
          ...state.commentsByThread,
          [action.threadId]: {
            ids: dedupedIds,
            cursor: action.cursor ?? null,
            hasMore: action.hasMore ?? false,
            loading: false,
            error: null,
          },
        },
      };
    }
    case 'COMMENTS_ERROR_FOR_THREAD': {
      const existing = state.commentsByThread[action.threadId] ?? {
        ids: [],
        cursor: null,
        hasMore: true,
        loading: false,
        error: null,
      };
      return {
        ...state,
        commentsByThread: {
          ...state.commentsByThread,
          [action.threadId]: { ...existing, loading: false, error: action.error },
        },
      };
    }
    case 'COMMENT_CREATED': {
      const comment = action.comment;
      if (!comment) return state;
      const nextCommentsById = {
        ...state.commentsById,
        [comment.id]: { ...state.commentsById[comment.id], ...comment },
      };
      const existing = state.commentsByThread[comment.threadId] ?? {
        ids: [],
        cursor: null,
        hasMore: true,
        loading: false,
        error: null,
      };
      const nextIds = [comment.id, ...existing.ids.filter((id) => id !== comment.id)];
      return {
        ...state,
        commentsById: nextCommentsById,
        commentsByThread: {
          ...state.commentsByThread,
          [comment.threadId]: { ...existing, ids: nextIds },
        },
      };
    }
    case 'ATTACHMENT_ADDED': {
      const { commentId, attachment } = action;
      if (!commentId || !attachment) return state;
      const comment = state.commentsById[commentId];
      if (!comment || comment.isDeleted) return state;
      const existingAttachments = Array.isArray(comment.attachments)
        ? comment.attachments
        : [];
      const nextAttachments = [
        attachment,
        ...existingAttachments.filter((att) => att.id !== attachment.id),
      ];
      return {
        ...state,
        commentsById: {
          ...state.commentsById,
          [commentId]: { ...comment, attachments: nextAttachments },
        },
      };
    }
    case 'ATTACHMENT_REMOVED': {
      const { commentId, attachmentId } = action;
      if (!commentId || !attachmentId) return state;
      const comment = state.commentsById[commentId];
      if (!comment) return state;
      const nextAttachments = (comment.attachments ?? []).filter(
        (att) => att.id !== attachmentId
      );
      return {
        ...state,
        commentsById: {
          ...state.commentsById,
          [commentId]: { ...comment, attachments: nextAttachments },
        },
      };
    }
    case 'COMMENT_PATCHED': {
      const comment = action.comment;
      if (!comment?.id) return state;
      return {
        ...state,
        commentsById: {
          ...state.commentsById,
          [comment.id]: {
            ...state.commentsById[comment.id],
            ...comment,
          },
        },
      };
    }
    case 'THREAD_PATCHED': {
      const thread = action.thread;
      if (!thread?.id) return state;
      return {
        ...state,
        threadsById: {
          ...state.threadsById,
          [thread.id]: {
            ...state.threadsById[thread.id],
            ...thread,
          },
        },
      };
    }
    default:
      return state;
  }
}
