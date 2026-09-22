# Vitrine Digital PRO 4.19 — Programação editável + tela preta

- Programações existentes agora possuem botão **Editar**.
- É possível alterar nome, playlist, destino, datas, horários e dias sem excluir a programação.
- Ao salvar uma edição, o registro existente é atualizado, preservando seu ID.
- Quando uma tela/grupo possui programação ativa e o horário/dia atual está fora dela, o Player entra em **blackout**: tela 100% preta, sem mensagens, controles ou status.
- Ao entrar novamente no horário programado, o Player sincroniza e retoma a playlist automaticamente.
- Se a tela não possuir nenhuma programação ativa, a playlist padrão continua funcionando normalmente.
- Em falha de comunicação com o servidor, o Player evita interpretar a falha como “fora do horário” e mantém o comportamento resiliente/cache da versão anterior.
