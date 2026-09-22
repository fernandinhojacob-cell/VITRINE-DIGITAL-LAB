-- Vitrine Digital PRO 4.9 — telemetria e preparação de cenas
create extension if not exists pgcrypto;

create table if not exists public.scenes (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Cena sem nome',
  orientation text not null default 'landscape' check (orientation in ('landscape','portrait')),
  content jsonb not null default '{"elements":[]}'::jsonb,
  duration integer not null default 10 check (duration > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_scenes_active on public.scenes(active);
alter table public.scenes enable row level security;

-- Painel autenticado pode administrar cenas; player pode ler cenas ativas.
drop policy if exists "auth all scenes" on public.scenes;
create policy "auth all scenes" on public.scenes for all to authenticated using (true) with check (true);
drop policy if exists "public read active scenes" on public.scenes;
create policy "public read active scenes" on public.scenes for select to anon using (active=true);

-- Telemetria do player (MVP/laboratório). Para produção, substituir anon por token de dispositivo.
drop policy if exists "public insert heartbeat" on public.screen_heartbeat;
create policy "public insert heartbeat" on public.screen_heartbeat for insert to anon with check (true);
drop policy if exists "public insert proof" on public.proof_of_play;
create policy "public insert proof" on public.proof_of_play for insert to anon with check (true);
drop policy if exists "public update proof" on public.proof_of_play;
create policy "public update proof" on public.proof_of_play for update to anon using (true) with check (true);
