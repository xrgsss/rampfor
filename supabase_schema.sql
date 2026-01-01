-- Supabase schema for Rampfor music player
create extension if not exists "pgcrypto";

create table if not exists songs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  artist text not null,
  cover_url text not null default 'default-vinyl',
  audio_url text not null,
  plays integer not null default 0,
  duration integer not null default 180,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists songs_user_id_idx on songs (user_id);
create index if not exists songs_created_at_idx on songs (created_at desc);

create or replace function songs_updated_at()
  returns trigger
  language plpgsql
  as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger songs_updated_at_trigger
  before update on songs
  for each row execute function songs_updated_at();

alter table songs enable row level security;

create policy songs_public_read on songs
  for select using (true);

create policy songs_insert_by_owner on songs
  for insert with check (auth.uid() = user_id);

create policy songs_update_by_owner on songs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy songs_delete_by_owner on songs
  for delete using (auth.uid() = user_id);

select storage.create_bucket('music', true);
select storage.create_bucket('covers', true);
