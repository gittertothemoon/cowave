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
  comment_attachments?: CommentAttachmentRecord[];
};

export type CommentWaveKind = 'support' | 'insight' | 'question';

export type CommentWaves = {
  support: number;
  insight: number;
  question: number;
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
  attachments?: CommentAttachment[];
  waves?: CommentWaves;
  myWaves?: CommentWaveKind[];
  waveCount?: number;
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

export type CommentAttachmentRecord = {
  id: string;
  comment_id: string;
  user_id: string;
  bucket_id: string;
  object_path: string;
  mime_type: string | null;
  byte_size: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
};

export type CommentAttachment = {
  id: string;
  commentId: string;
  userId: string;
  bucketId: string;
  objectPath: string;
  mimeType: string | null;
  byteSize: number | null;
  width: number | null;
  height: number | null;
  createdAt: string;
};

export type ReflectionRecord = {
  id: string;
  user_id: string;
  for_date: string;
  body: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type Reflection = {
  id: string;
  userId: string;
  forDate: string;
  body: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};
