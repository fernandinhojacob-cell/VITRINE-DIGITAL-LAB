# 4.15.1 — Correção de programação
- Valida playlist contra o Supabase no momento de salvar.
- Se uma aba antiga tiver UUID obsoleto, usa a playlist válida vinculada à tela.
- Se não houver playlist válida, bloqueia o INSERT com mensagem clara.
- Corrigida identificação visual antiga 4.8.
- Nenhum dado existente foi apagado ou recriado.
