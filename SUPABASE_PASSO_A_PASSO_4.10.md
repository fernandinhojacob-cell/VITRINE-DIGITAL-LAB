# Conectar a Vitrine Digital PRO 4.10 ao Supabase

1. No Supabase, execute `supabase/schema_v3.sql`, depois `supabase/policies.sql` e `supabase/migration_4.9.sql`.
2. Confirme que existe um bucket público chamado `media`.
3. Abra `js/config.js` e informe a URL do projeto e a chave anon/publishable. Nunca coloque service_role no navegador.
4. Publique a pasta completa em HTTPS. Não use `file://` para TVs remotas.
5. Cadastre uma tela no painel e use um código único, por exemplo `TV-0001`.
6. No dispositivo, abra `player/index.html?code=TV-0001`.
7. Crie uma programação para a tela ou grupo. Durante o período ativo, ela substitui a playlist padrão; ao terminar, o Player retorna à playlist padrão.

Observação: a política anon atual é adequada a laboratório. Antes de produção comercial, implemente token/autenticação de dispositivo e restrinja updates do player.
