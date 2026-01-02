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
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
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

drop policy if exists songs_insert_by_owner on songs;
create policy songs_insert_by_owner on songs
  for insert with check (auth.uid() IS NOT NULL);

drop policy if exists songs_update_by_owner on songs;
create policy songs_update_by_owner on songs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists songs_delete_by_owner on songs;
create policy songs_delete_by_owner on songs
  for delete using (auth.uid() = user_id);

create or replace function songs_set_owner()
  returns trigger
  language plpgsql
  security definer
  as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

create trigger songs_set_owner_trigger
  before insert on songs
  for each row execute function songs_set_owner();

create table if not exists song_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  song_id uuid not null references songs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, song_id)
);

create index if not exists song_likes_song_id_idx on song_likes (song_id);
create index if not exists song_likes_user_id_idx on song_likes (user_id);

alter table song_likes enable row level security;

create policy song_likes_select_owner on song_likes
  for select using (auth.uid() = user_id);

create policy song_likes_insert_owner on song_likes
  for insert with check (auth.uid() = user_id);

create policy song_likes_delete_owner on song_likes
  for delete using (auth.uid() = user_id);

create table if not exists playlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  cover_url text not null default 'default-vinyl',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists playlists_user_idx on playlists (user_id);

create table if not exists playlist_tracks (
  id uuid default gen_random_uuid() primary key,
  playlist_id uuid not null references playlists(id) on delete cascade,
  song_id uuid not null references songs(id) on delete cascade,
  added_at timestamptz not null default now()
);

create index if not exists playlist_tracks_playlist_idx on playlist_tracks (playlist_id);
create index if not exists playlist_tracks_song_idx on playlist_tracks (song_id);

create table if not exists recently_played (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  song_id uuid not null references songs(id) on delete cascade,
  played_at timestamptz not null default now()
);

create index if not exists recently_played_user_idx on recently_played (user_id, played_at desc);

alter table playlists enable row level security;
alter table playlist_tracks enable row level security;
alter table recently_played enable row level security;

create policy playlists_owner on playlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy playlist_tracks_select_owner on playlist_tracks
  for select using (exists (
    select 1 from playlists p where p.id = playlist_tracks.playlist_id and p.user_id = auth.uid()
  ));

create policy playlist_tracks_insert_owner on playlist_tracks
  for insert with check (exists (
    select 1 from playlists p where p.id = playlist_tracks.playlist_id and p.user_id = auth.uid()
  ));

create policy playlist_tracks_delete_owner on playlist_tracks
  for delete using (exists (
    select 1 from playlists p where p.id = playlist_tracks.playlist_id and p.user_id = auth.uid()
  ));

create policy playlist_tracks_update_owner on playlist_tracks
  for update using (exists (
    select 1 from playlists p where p.id = playlist_tracks.playlist_id and p.user_id = auth.uid()
  )) with check (exists (
    select 1 from playlists p where p.id = playlist_tracks.playlist_id and p.user_id = auth.uid()
  ));

create policy recently_played_owner on recently_played
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

do $$
begin
  if not exists (select 1 from storage.buckets where name = 'music') then
    perform storage.create_bucket('music', true);
  end if;
end;
$$;

do $$
begin
  if not exists (select 1 from storage.buckets where name = 'covers') then
    perform storage.create_bucket('covers', true);
  end if;
end;
$$;
