# 4.22.1 — Preview ao vivo corrigido

- Corrigido cache-busting do painel: o HTML da 4.22 ainda carregava `app.js?v=4.21.0`, o que podia manter o JavaScript antigo no navegador/GitHub Pages.
- `app.js`, `admin.css`, `config.js` e `auth-guard.js` agora usam versão 4.22.1 na URL.
- Preview usa a ordem real de `playlist_items`.
- Duração configurada no item da playlist tem prioridade sobre a duração da mídia.
- Mantidos monitoramento compacto, logout, player, programação e blackout.
