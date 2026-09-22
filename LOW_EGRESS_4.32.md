# Vitrine Digital LAB 4.32 — Low Egress

## Objetivo
Reduzir downloads repetidos de mídia e proteger a cota de Cached Egress.

## Alterações
- Player usa cache persistente em IndexedDB para mídias remotas.
- Cache API continua como fallback.
- Depois do primeiro download bem-sucedido, a reprodução usa o Blob local do aparelho.
- A biblioteca administrativa não carrega automaticamente vídeos apenas para gerar miniaturas.
- Vídeos só são baixados no painel quando o operador abre uma pré-visualização.
- Banco, playlists, programação, grupos, heartbeat e proof-of-play permanecem no Supabase.

## Importante
Cada TV/totem ainda precisa baixar uma mídia ao menos uma vez. Limpar dados/cache do navegador do aparelho força novo download. Alterar a URL da mídia também cria uma nova entrada de cache.

## Teste recomendado
1. Publicar esta versão no LAB.
2. Cadastrar uma tela de teste.
3. Adicionar uma mídia pequena.
4. Abrir o player e aguardar o primeiro download.
5. Repetir a playlist e confirmar que a mídia continua reproduzindo.
6. Reiniciar o navegador/aparelho sem limpar dados e confirmar reprodução.
