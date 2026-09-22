# Vitrine Digital PRO 4.15 — Orientação corrigida

- Horizontal = landscape = 16:9.
- Vertical = portrait = 9:16.
- O Player passa a usar primeiro a orientação salva da tela no Supabase.
- O botão Abrir Player não força mais uma orientação antiga pela URL.
- Em monitor horizontal, uma tela vertical é mostrada como canvas 9:16 centralizado.
- Em monitor vertical, uma tela horizontal é mostrada como canvas 16:9 centralizado.
- Mídias usam `contain` para evitar cortes durante a validação de orientação.
- Nenhum cadastro ou mídia do Supabase foi alterado.
