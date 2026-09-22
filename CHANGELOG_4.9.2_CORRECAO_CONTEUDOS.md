# Vitrine Digital PRO 4.9.2 — Correção de Conteúdos

- Corrigido submit nativo do formulário de conteúdo que recarregava a página e perdia o cadastro.
- Salvamento agora é interceptado diretamente no formulário, com proteção contra duplo clique e estado “Salvando…”.
- Mensagens de erro passam a ser exibidas ao usuário.
- Em Demo Local: imagens pequenas persistem no navegador; vídeos/arquivos maiores podem ser usados durante a sessão atual via Blob URL.
- Para persistência real de vídeos e distribuição aos players, permanece necessário conectar o Supabase/Storage.
- Preservadas as correções de telas da 4.9.1.
