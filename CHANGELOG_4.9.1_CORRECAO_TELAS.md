# Vitrine Digital PRO 4.9.1 — Correção de cadastro de telas

- Corrigido o formulário de **Adicionar tela** para impedir submissão HTML nativa (`?id=&name=...`).
- O salvamento agora é tratado diretamente no formulário, com `preventDefault`, bloqueio de clique duplo e feedback "Salvando…".
- Cadastro local continua persistindo em `localStorage` quando Supabase não estiver configurado.
- Quando Supabase estiver configurado, o mesmo fluxo usa a tabela `screens` e exibe o erro real se o banco rejeitar a gravação.
- Adicionado `js/config.js` seguro em modo local para evitar arquivo ausente no pacote de teste.
- Nenhuma migration de banco é exigida apenas para esta correção.
