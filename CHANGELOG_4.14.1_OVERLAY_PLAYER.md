# Vitrine Digital PRO 4.14.1 — correção do overlay do Player

Causa identificada:
O CSS `.empty { display:flex }` sobrescrevia visualmente o atributo HTML `hidden`.
Assim, a playlist era carregada e o Player ficava Online, mas a camada
“Aguardando conteúdo...” permanecia por cima da mídia.

Correção:
`.empty[hidden] { display:none!important }`

Nenhum cadastro, mídia, playlist ou dado do Supabase foi alterado.
Player: v4.14.1.
