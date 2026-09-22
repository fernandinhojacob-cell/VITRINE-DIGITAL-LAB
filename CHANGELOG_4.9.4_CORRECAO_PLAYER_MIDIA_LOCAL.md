# Vitrine Digital PRO 4.9.4 — correção do Player / mídia local

- Corrige vídeos locais que apareciam na biblioteca e na pré-visualização, mas não podiam ser reproduzidos pelo Player em outra aba.
- Arquivos de mídia do Demo Local agora são persistidos em IndexedDB e referenciados por `idb://...`.
- O Player resolve o arquivo persistido e cria uma URL de reprodução válida na própria aba.
- Mantém compatibilidade com URLs HTTP/HTTPS e com Supabase Storage.
- Player atualizado para v4.9.4.

## Importante para o teste
Conteúdos em vídeo cadastrados nas versões 4.9.2/4.9.3 usavam URLs `blob:` temporárias. Reenvie o vídeo uma vez na 4.9.4 para gravá-lo de forma persistente no Demo Local.
