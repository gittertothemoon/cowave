-- Riflessioni personali (private di default)
create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  for_date date not null,
  body text not null check (char_length(body) between 1 and 2000),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reflections enable row level security;

create unique index if not exists reflections_user_for_date_key
  on public.reflections (user_id, for_date);

create index if not exists reflections_user_date_idx
  on public.reflections (user_id, for_date desc, updated_at desc);

create policy "Select own reflections"
  on public.reflections
  for select
  using (auth.uid() = user_id);

create policy "Insert own reflection"
  on public.reflections
  for insert
  with check (auth.uid() = user_id);

create policy "Update own reflection"
  on public.reflections
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Delete own reflection"
  on public.reflections
  for delete
  using (auth.uid() = user_id);
