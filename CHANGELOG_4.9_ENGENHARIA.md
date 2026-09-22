# Vitrine Digital PRO 4.9 — Engenharia

Base preservada: 3.1.1 + 4.8.

## Melhorias implementadas
- Player versionado em 4.9.0.
- Programação agora é resolvida pelo player por tela/grupo, data, horário e dia da semana.
- Programação específica da tela tem prioridade sobre programação do grupo; fallback continua sendo a playlist vinculada à tela.
- Heartbeat histórico passa a ser gravado em `screen_heartbeat` a cada ciclo.
- Proof-of-play passa a registrar início/fim e duração de cada mídia reproduzida.
- Cache offline recebeu namespace próprio da versão 4.9.
- Manifesto offline guarda também a playlist ativa.
- Editor de cenas mantém fallback local e passa a salvar no Supabase quando conectado.
- Migration `supabase/migration_4.9.sql` cria tabela `scenes` e políticas mínimas de laboratório.

## Importante antes do teste Supabase
1. Faça backup do projeto/banco atual.
2. Execute `schema.sql` e `schema_v3.sql` apenas se ainda não tiver a estrutura base.
3. Execute `migration_4.9.sql` no SQL Editor.
4. Mantenha `js/config.js` com a URL e a publishable/anon key do projeto de teste.
5. Não use `service_role` no navegador.

## Próxima etapa arquitetural
A tabela `scenes` já está preparada, mas a inclusão de cenas como itens de playlist deve ser feita numa migration separada para não alterar a constraint atual de `playlist_items.media_id` durante este teste. Isso reduz risco de regressão na base 3.1.1.
