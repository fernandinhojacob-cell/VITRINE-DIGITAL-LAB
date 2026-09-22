# 4.19.3 — edição direta da programação

- Formulário de programação ganhou handler dedicado, isolado do fluxo genérico.
- UPDATE usa o ID exato e relê o registro no Supabase após salvar.
- Só confirma sucesso quando início/fim retornados pelo servidor coincidem com o formulário.
- Mensagem de sucesso mostra explicitamente o horário persistido.
- Cache-bust do app.js atualizado para 4.19.3.
- Banco, mídias, playlists e telas não foram alterados.
