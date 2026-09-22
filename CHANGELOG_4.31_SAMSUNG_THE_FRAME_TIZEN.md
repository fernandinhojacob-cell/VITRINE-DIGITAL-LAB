# Vitrine Digital PRO 4.31 — Samsung The Frame / Tizen

Base: 4.30 Grupos Sincronizados.

- Detecta Samsung/Tizen automaticamente no Player.
- Ativa modo TV/Kiosk visual, removendo controles e cursor.
- Player ocupa 100vw x 100vh e mantém fundo preto.
- Tenta Fullscreen API quando permitido pelo navegador após interação do usuário.
- Suporte opcional a `?tv=1` ou `?kiosk=1` para forçar o modo TV em outros navegadores.
- Tenta Screen Wake Lock quando suportado.
- Mantém grupos sincronizados, heartbeat, cache, programação e Supabase.

Observação: o navegador Tizen pode exigir uma ação do controle remoto para autorizar fullscreen. Para operação 100% sem chrome do navegador desde a inicialização, a etapa posterior é empacotar o Player como aplicativo Tizen/kiosk.
