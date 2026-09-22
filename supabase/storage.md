# Storage — Vitrine Digital V2.3

A V2.3 permite selecionar imagens e vídeos diretamente do celular ou computador.

## Supabase
1. Execute o arquivo `policies.sql` no SQL Editor do Supabase (ou crie o bucket `media` como público e aplique as políticas de Storage).
2. O bucket deve se chamar exatamente `media`.
3. O painel precisa estar conectado ao Supabase em `js/config.js`.
4. Ao selecionar um arquivo, o painel faz o upload para `media` e grava a URL pública na tabela `media`.

## Modo local
Sem Supabase, imagens de até 2 MB podem ser armazenadas localmente no navegador como teste. Vídeos e arquivos maiores exigem Supabase.
