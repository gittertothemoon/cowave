-- Achievements and unlocks
create table if not exists public.achievements (
  code text primary key,
  title text not null,
  description text not null,
  tier text not null default 'bronze',
  created_at timestamptz not null default now()
);

create table if not exists public.achievements_unlocked (
  achievement_code text not null references public.achievements (code) on delete cascade,
  user_id uuid not null references auth.users (id),
  unlocked_at timestamptz not null default now(),
  primary key (achievement_code, user_id)
);

alter table public.achievements enable row level security;
alter table public.achievements_unlocked enable row level security;

create index if not exists achievements_unlocked_user_idx
  on public.achievements_unlocked (user_id, unlocked_at desc);

create policy "Read achievements (authenticated)"
  on public.achievements
  for select
  to authenticated
  using (true);

create policy "Read own unlocks"
  on public.achievements_unlocked
  for select
  using (auth.uid() = user_id);

create policy "Insert own unlocks"
  on public.achievements_unlocked
  for insert
  with check (auth.uid() = user_id);

insert into public.achievements (code, title, description, tier)
values
  ('FIRST_THREAD', 'Primo thread aperto', 'Hai avviato la tua prima conversazione nella community.', 'bronze'),
  ('FIRST_COMMENT', 'Prima risposta inviata', 'Hai scritto la tua prima risposta in un thread.', 'bronze'),
  ('FIRST_WAVE', 'Prima onda inviata', 'Hai mandato la tua prima onda di supporto o curiosità.', 'bronze'),
  ('FIRST_PHOTO', 'Prima foto allegata', 'Hai aggiunto una foto per dare più contesto.', 'bronze'),
  ('CONSISTENT_3', 'Serie da 3 giorni', 'Hai scritto una riflessione per 3 giorni di fila.', 'silver')
on conflict (code) do update
set
  title = excluded.title,
  description = excluded.description,
  tier = excluded.tier;
