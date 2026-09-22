-- Políticas V1.
-- Painel autenticado: leitura/escrita.
-- Player: leitura pública apenas do conteúdo necessário.
-- Em produção, recomendo evoluir para tokens de dispositivo e políticas por tela.

drop policy if exists "auth read groups" on public.groups;
create policy "auth read groups" on public.groups for select to authenticated using (true);

drop policy if exists "auth write groups" on public.groups;
create policy "auth write groups" on public.groups for all to authenticated using (true) with check (true);

drop policy if exists "auth read profiles" on public.profiles;
create policy "auth read profiles" on public.profiles for select to authenticated using (true);

drop policy if exists "auth write profiles" on public.profiles;
create policy "auth write profiles" on public.profiles for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "auth all playlists" on public.playlists;
create policy "auth all playlists" on public.playlists for all to authenticated using (true) with check (true);

drop policy if exists "auth all screens" on public.screens;
create policy "auth all screens" on public.screens for all to authenticated using (true) with check (true);

drop policy if exists "public read active screens" on public.screens;
create policy "public read active screens" on public.screens for select to anon using (active = true);

drop policy if exists "auth all media" on public.media;
create policy "auth all media" on public.media for all to authenticated using (true) with check (true);

drop policy if exists "public read active media" on public.media;
create policy "public read active media" on public.media for select to anon using (active = true);

drop policy if exists "auth all playlist items" on public.playlist_items;
create policy "auth all playlist items" on public.playlist_items for all to authenticated using (true) with check (true);

drop policy if exists "public read playlist items" on public.playlist_items;
create policy "public read playlist items" on public.playlist_items for select to anon using (true);

drop policy if exists "auth all schedules" on public.schedules;
create policy "auth all schedules" on public.schedules for all to authenticated using (true) with check (true);

drop policy if exists "public read active schedules" on public.schedules;
create policy "public read active schedules" on public.schedules for select to anon using (active = true);

drop policy if exists "auth all heartbeat" on public.screen_heartbeat;
create policy "auth all heartbeat" on public.screen_heartbeat for all to authenticated using (true) with check (true);

-- O player precisa atualizar o heartbeat/status.
-- Para o MVP, isso exige uma política específica de UPDATE para anon.
-- A política abaixo é deliberadamente simples para o teste inicial.
drop policy if exists "public heartbeat update" on public.screens;
create policy "public heartbeat update" on public.screens
for update to anon
using (active = true)
with check (active = true);

-- IMPORTANTE: em produção, substituir esta política por autenticação
-- de dispositivo/token antes de colocar o sistema em escala.


-- Storage V2.3: bucket público para imagens/vídeos exibidos pelo player.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "public read media files" on storage.objects;
create policy "public read media files" on storage.objects
for select to public
using (bucket_id = 'media');

drop policy if exists "authenticated upload media files" on storage.objects;
create policy "authenticated upload media files" on storage.objects
for insert to authenticated
with check (bucket_id = 'media');

drop policy if exists "authenticated update media files" on storage.objects;
create policy "authenticated update media files" on storage.objects
for update to authenticated
using (bucket_id = 'media')
with check (bucket_id = 'media');

drop policy if exists "authenticated delete media files" on storage.objects;
create policy "authenticated delete media files" on storage.objects
for delete to authenticated
using (bucket_id = 'media');
