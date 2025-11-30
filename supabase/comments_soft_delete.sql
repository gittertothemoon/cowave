-- Soft delete support for comments
alter table if exists public.comments
  add column if not exists is_deleted boolean not null default false;

alter table if exists public.comments
  add column if not exists deleted_at timestamptz;

create policy "Update own comments to soft delete"
  on public.comments
  for update
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);
