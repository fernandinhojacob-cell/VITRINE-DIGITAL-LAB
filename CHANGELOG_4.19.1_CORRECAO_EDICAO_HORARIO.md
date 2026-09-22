# Vitrine Digital PRO 4.19.1 — Correção da edição de horário

- Corrigida a atualização de programações existentes.
- O UPDATE agora exige confirmação do registro retornado pelo Supabase.
- O horário inicial e final são conferidos antes de informar “Salvo com sucesso”.
- Se RLS/sessão impedir a alteração, o painel agora mostra erro em vez de falso sucesso.
- Cache-busting do app.js no painel para evitar JavaScript antigo após publicação no GitHub Pages.
- Mantida a tela preta fora da programação e toda a resiliência da 4.18/4.19.
