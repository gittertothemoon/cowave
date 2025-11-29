-- Onde sui commenti
create table if not exists public.comment_waves (
  comment_id uuid not null references public.comments (id) on delete cascade,
  user_id uuid not null references auth.users (id),
  kind text not null check (kind in ('support', 'insight', 'question')),
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id, kind)
);

alter table public.comment_waves enable row level security;

create index if not exists comment_waves_comment_id_idx
  on public.comment_waves (comment_id);

create policy "Select waves for visible comments"
  on public.comment_waves
  for select
  using (
    exists (
      select 1
      from public.comments c
      where c.id = comment_id
    )
  );

create policy "Insert own wave on visible comment"
  on public.comment_waves
  for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and exists (
      select 1
      from public.comments c
      where c.id = comment_id
    )
  );

create policy "Delete own wave only"
  on public.comment_waves
  for delete
  using (auth.uid() = user_id);

create or replace view public.comment_wave_counts as
select
  comment_id,
  kind,
  count(*)::bigint as count
from public.comment_waves
group by comment_id, kind;
