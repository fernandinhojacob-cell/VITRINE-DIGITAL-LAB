# Vitrine Digital 3.0

Plataforma de sinalização digital para TVs, monitores e totens, com painel web e player multiplataforma.

## O que foi acrescentado
- Biblioteca com upload direto do aparelho (celular/PC) e URL.
- Playlists com inclusão, ordenação por arrastar e soltar e pré-visualização.
- Grupos de telas.
- Programação por tela ou grupo, data inicial/final, horário e dias da semana.
- Dashboard e monitoramento online/offline.
- Relatório básico de eventos/heartbeat.
- Player 16:9 e 9:16.
- Cache de mídia para continuidade quando a conexão cair, quando o navegador permitir cache/CORS.
- Compatibilidade com navegador, Android/Google TV/TCL e Samsung/Tizen via navegador/player web.
- Estrutura inicial para proof-of-play, transições, pastas e horários de operação no Supabase.

## Rotas
- `/admin/`
- `/player/?code=TV-0001`
- `/player/portrait/?code=TV-0001`

## Supabase
1. Execute `supabase/schema.sql` para a base original, se ainda não tiver executado.
2. Execute `supabase/schema_v3.sql` para complementar a V3.
3. Crie o bucket público `media` ou aplique as políticas de Storage de `supabase/policies.sql`.
4. Crie `js/config.js` a partir de `js/config.example.js` usando apenas a chave pública/publishable.

## Observação
A arquitetura é original. Ela busca oferecer um conjunto de funções equivalente às plataformas profissionais de digital signage, sem copiar código ou interface proprietária de terceiros.

## Engenharia 4.9
Consulte `CHANGELOG_4.9_ENGENHARIA.md` e execute `supabase/migration_4.9.sql` antes de testar telemetria/cenas no Supabase.
