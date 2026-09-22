# Vitrine Digital PRO 4.9.5 — correção do Player local

## Correção principal
No modo Demo Local, o botão **Abrir** agora executa o Player dentro do mesmo documento/origem do painel (`admin/index.html`). Isso evita a separação de armazenamento do navegador ao usar arquivos `file://`, que impedia o Player em `player/index.html` de acessar vídeos gravados no IndexedDB pelo painel.

## Mantido
- Cadastro de telas
- Biblioteca de conteúdos
- Playlists
- Vinculação playlist/tela
- Player Supabase separado para ambiente publicado

## Diagnóstico
O Player local agora informa na tela quando a mídia não foi encontrada ou quando o navegador rejeita a reprodução do vídeo.
