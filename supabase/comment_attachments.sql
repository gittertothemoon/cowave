-- Comment attachments table and storage rules
create table if not exists public.comment_attachments (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments (id) on delete cascade,
  user_id uuid not null references auth.users (id),
  bucket_id text not null,
  object_path text not null,
  mime_type text,
  byte_size bigint,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

alter table public.comment_attachments
  enable row level security;

create index if not exists comment_attachments_comment_id_idx
  on public.comment_attachments (comment_id);

create index if not exists comment_attachments_user_id_idx
  on public.comment_attachments (user_id);

create index if not exists comment_attachments_bucket_path_idx
  on public.comment_attachments (bucket_id, object_path);

create unique index if not exists comment_attachments_bucket_object_unique
  on public.comment_attachments (bucket_id, object_path);

create policy "Select attachments for visible comments"
  on public.comment_attachments
  for select
  using (
    exists (
      select 1
      from public.comments c
      where c.id = comment_id
    )
  );

create policy "Insert attachments for own comments"
  on public.comment_attachments
  for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and exists (
      select 1
      from public.comments c
      where c.id = comment_id
        and c.created_by = auth.uid()
    )
  );

create policy "Update attachments only by owner"
  on public.comment_attachments
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Delete attachments only by owner"
  on public.comment_attachments
  for delete
  using (auth.uid() = user_id);

-- Storage: bucket policies for comment-images
create policy "Insert comment images with own prefix"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'comment-images'
    and auth.uid() is not null
    and position(auth.uid()::text || '/' in name) = 1
  );

create policy "Select comment images when attachment exists"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'comment-images'
    and exists (
      select 1
      from public.comment_attachments ca
      join public.comments c on c.id = ca.comment_id
      where ca.bucket_id = bucket_id
        and ca.object_path = name
    )
  );

create policy "Update comment images under own prefix"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'comment-images'
    and auth.uid() is not null
    and position(auth.uid()::text || '/' in name) = 1
  );

create policy "Delete comment images under own prefix"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'comment-images'
    and auth.uid() is not null
    and position(auth.uid()::text || '/' in name) = 1
  );
