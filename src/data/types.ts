export type RoomRecord = {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  is_public: boolean | null;
  created_at: string;
  created_by: string | null;
  status: RoomStatus | null;
};

export type ThreadRecord = {
  id: string;
  room_id: string;
  created_by: string | null;
  title: string;
  body: string;
  created_at: string;
};

export type CommentRecord = {
  id: string;
  thread_id: string;
  created_by: string | null;
  body: string;
  parent_comment_id: string | null;
  created_at: string;
};

export type RoomStatus = 'pending' | 'approved' | 'rejected';

export type Room = {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  createdBy: string | null;
  status: RoomStatus | 'sconosciuto';
};

export type Thread = {
  id: string;
  roomId: string;
  createdBy: string | null;
  title: string;
  body: string;
  createdAt: string;
};

export type Comment = {
  id: string;
  threadId: string;
  createdBy: string | null;
  body: string;
  parentCommentId: string | null;
  createdAt: string;
};

export type PaginationCursor = {
  createdAt: string;
  id: string;
};

export type PageResult<T> = {
  items: T[];
  cursor: PaginationCursor | null;
  hasMore: boolean;
};
