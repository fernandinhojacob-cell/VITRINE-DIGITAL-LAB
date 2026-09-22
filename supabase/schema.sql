-- Vitrine Digital V1
-- Execute no SQL Editor do Supabase.

create extension if not exists pgcrypto;

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text not null default 'operator' check (role in ('admin','operator','client')),
  created_at timestamptz not null default now()
);

create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.screens (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  location text,
  group_id uuid references public.groups(id) on delete set null,
  playlist_id uuid references public.playlists(id) on delete set null,
  status text not null default 'offline' check (status in ('online','offline','maintenance')),
  ultima_conexao timestamptz,
  resolution text,
  orientation text not null default 'landscape' check (orientation in ('landscape','portrait')),
  player_version text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('image','video','web','text')),
  file_url text,
  thumbnail_url text,
  text_content text,
  duration integer not null default 10 check (duration > 0),
  size_bytes bigint,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.playlist_items (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete cascade,
  sort_order integer not null default 0,
  duration integer check (duration is null or duration > 0),
  created_at timestamptz not null default now(),
  unique (playlist_id, media_id)
);

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  screen_id uuid references public.screens(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  start_date date,
  end_date date,
  start_time time not null,
  end_time time not null,
  days text not null default 'Seg,Ter,Qua,Qui,Sex,Sab,Dom',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (screen_id is not null or group_id is not null)
);

create table if not exists public.screen_heartbeat (
  id uuid primary key default gen_random_uuid(),
  screen_id uuid not null references public.screens(id) on delete cascade,
  last_ping timestamptz not null default now(),
  ip text,
  player_version text,
  created_at timestamptz not null default now()
);

create index if not exists idx_screens_code on public.screens(code);
create index if not exists idx_screens_status on public.screens(status);
create index if not exists idx_media_type on public.media(type);
create index if not exists idx_playlist_items_playlist on public.playlist_items(playlist_id, sort_order);
create index if not exists idx_schedules_screen on public.schedules(screen_id, active);
create index if not exists idx_schedules_group on public.schedules(group_id, active);
create index if not exists idx_heartbeat_screen on public.screen_heartbeat(screen_id, last_ping);

alter table public.groups enable row level security;
alter table public.profiles enable row level security;
alter table public.playlists enable row level security;
alter table public.screens enable row level security;
alter table public.media enable row level security;
alter table public.playlist_items enable row level security;
alter table public.schedules enable row level security;
alter table public.screen_heartbeat enable row level security;

-- Storage bucket: crie manualmente um bucket chamado "media".
