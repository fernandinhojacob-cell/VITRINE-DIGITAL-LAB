# Vitrine Digital PRO 4.9.3 — Correção do Player

- Corrigido botão **Abrir** para apontar explicitamente para `player/index.html`.
- Corrigida execução local via `file://`, evitando a listagem de diretório do Chrome.
- Player Demo Local agora lê a tela, playlist, itens e conteúdos salvos pelo painel em `localStorage`.
- Mantidos intactos os módulos já aprovados: telas, conteúdos e playlists.
- Player identificado como v4.9.3.

## Teste
1. Abra `admin/index.html`.
2. Em Telas, clique **Abrir** em `TV-0001`.
3. O navegador deve abrir `player/index.html?code=TV-0001...`.
4. O conteúdo da playlist vinculada deve iniciar no Player.
