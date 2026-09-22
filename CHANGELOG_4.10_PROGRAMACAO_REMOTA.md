# Vitrine Digital PRO 4.10 — Programação + operação remota

## Implementado
- Programação passa a ser aplicada também no Player Demo Local.
- Prioridade: agenda específica da tela > agenda do grupo > playlist padrão da tela.
- Troca automática de playlist quando uma agenda entra/sai do horário, sem recarregar o painel.
- Suporte a faixas que atravessam meia-noite (ex.: 22:00–06:00).
- Player remoto/Supabase atualizado para v4.10.0 com a mesma regra de agenda.
- Mantidos: múltiplos itens, loop, IndexedDB local, heartbeat e proof-of-play.

## Supabase
A base está pronta para conexão, mas o ZIP não contém credenciais reais por segurança. Preencha `js/config.js` com URL e anon key do seu projeto e execute os SQLs existentes. O bucket deve se chamar `media`.
