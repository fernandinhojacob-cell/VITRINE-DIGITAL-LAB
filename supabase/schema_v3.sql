-- Vitrine Digital 3.0 — migration/estrutura complementar
create extension if not exists pgcrypto;

alter table public.playlist_items add column if not exists transition text not null default 'fade';
alter table public.playlists add column if not exists description text;
alter table public.playlists add column if not exists transition text not null default 'fade';
alter table public.groups add column if not exists playlist_id uuid references public.playlists(id) on delete set null;
alter table public.screens add column if not exists last_error text;
alter table public.screens add column if not exists operating_start time;
alter table public.screens add column if not exists operating_end time;
alter table public.schedules add column if not exists recurrence text not null default 'weekly';
alter table public.schedules add column if not exists monthly_day integer;
alter table public.media add column if not exists folder text;
alter table public.media add column if not exists mime_type text;
alter table public.media add column if not exists size_bytes bigint;

create table if not exists public.proof_of_play (
 id uuid primary key default gen_random_uuid(),
 screen_id uuid references public.screens(id) on delete cascade,
 media_id uuid references public.media(id) on delete set null,
 playlist_id uuid references public.playlists(id) on delete set null,
 started_at timestamptz not null default now(),
 ended_at timestamptz,
 duration_seconds integer,
 status text not null default 'played',
 created_at timestamptz not null default now()
);
create index if not exists idx_proof_screen_time on public.proof_of_play(screen_id, started_at desc);
create index if not exists idx_media_folder on public.media(folder);

alter table public.proof_of_play enable row level security;

-- Para um ambiente autenticado, crie políticas de leitura/escrita de acordo com seus perfis.
-- Nunca exponha service_role no navegador.
