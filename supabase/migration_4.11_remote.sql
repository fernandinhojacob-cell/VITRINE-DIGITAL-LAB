-- Vitrine Digital PRO 4.11 — infraestrutura remota consolidada
-- Execute em um projeto EXCLUSIVO da Vitrine Digital, nunca no HNSS.
create extension if not exists pgcrypto;

-- Execute primeiro schema.sql e schema_v3.sql se este for um projeto vazio.
-- Este arquivo endurece telemetria e completa recursos 4.11.
create table if not exists public.proof_of_play (
 id uuid primary key default gen_random_uuid(), screen_id uuid references public.screens(id) on delete cascade,
 media_id uuid references public.media(id) on delete set null, playlist_id uuid references public.playlists(id) on delete set null,
 started_at timestamptz not null default now(), ended_at timestamptz, duration_seconds integer,
 status text not null default 'played', created_at timestamptz not null default now());
create index if not exists idx_proof_screen_time on public.proof_of_play(screen_id, started_at desc);
alter table public.proof_of_play enable row level security;

create table if not exists public.scenes (
 id uuid primary key default gen_random_uuid(), name text not null default 'Cena sem nome',
 orientation text not null default 'landscape' check (orientation in ('landscape','portrait')),
 content jsonb not null default '{"elements":[]}'::jsonb, duration integer not null default 10 check(duration>0),
 active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
alter table public.scenes enable row level security;

-- Painel autenticado.
drop policy if exists "auth all proof" on public.proof_of_play;
create policy "auth all proof" on public.proof_of_play for all to authenticated using(true) with check(true);
drop policy if exists "auth all scenes" on public.scenes;
create policy "auth all scenes" on public.scenes for all to authenticated using(true) with check(true);
drop policy if exists "public read active scenes" on public.scenes;
create policy "public read active scenes" on public.scenes for select to anon using(active=true);

-- Player MVP: somente leitura de configuração/conteúdo + telemetria.
drop policy if exists "public insert heartbeat" on public.screen_heartbeat;
create policy "public insert heartbeat" on public.screen_heartbeat for insert to anon with check(true);
drop policy if exists "public insert proof" on public.proof_of_play;
create policy "public insert proof" on public.proof_of_play for insert to anon with check(true);
drop policy if exists "public update proof" on public.proof_of_play;
create policy "public update proof" on public.proof_of_play for update to anon using(true) with check(true);

-- Bucket público de distribuição de mídia; escrita somente autenticada.
insert into storage.buckets(id,name,public) values('media','media',true) on conflict(id) do update set public=true;
drop policy if exists "public read media files" on storage.objects;
create policy "public read media files" on storage.objects for select to public using(bucket_id='media');
drop policy if exists "authenticated upload media files" on storage.objects;
create policy "authenticated upload media files" on storage.objects for insert to authenticated with check(bucket_id='media');
drop policy if exists "authenticated update media files" on storage.objects;
create policy "authenticated update media files" on storage.objects for update to authenticated using(bucket_id='media') with check(bucket_id='media');
drop policy if exists "authenticated delete media files" on storage.objects;
create policy "authenticated delete media files" on storage.objects for delete to authenticated using(bucket_id='media');
