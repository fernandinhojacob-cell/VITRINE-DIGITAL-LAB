# Vitrine Digital PRO 4.17 — Operação contínua

Base: 4.16.1 validada em HTTPS/mobile.

## Melhorias
- Player 4.17.0.
- Mantém o último manifesto e mídias em cache durante perda temporária de internet.
- Detecta eventos online/offline e tenta sincronizar assim que a conexão volta.
- Nova tentativa preventiva de reconexão a cada 60 segundos.
- Retoma sincronização quando o navegador/app volta ao primeiro plano.
- Atualização remota da playlist continua a cada 30 segundos.
- Heartbeat e proof-of-play preservados.
- Orientação horizontal/vertical e modo mobile tela cheia preservados.

## Equipamentos
- Samsung Tizen: usar a URL HTTPS do player no navegador/launcher disponível no equipamento.
- Android/totem: usar a URL HTTPS em navegador kiosk/PWA e configurar inicialização automática no equipamento.

## Observação
O navegador pode impedir fullscreen automático sem gesto do usuário. Em instalação fixa, o modo kiosk/PWA do dispositivo é a forma recomendada para ocultar a interface do navegador.
