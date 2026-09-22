# Vitrine Digital PRO 4.11 — implantação remota

Esta versão mantém a 4.10 validada e prepara a operação remota em infraestrutura própria.

1. Crie/use um projeto Supabase exclusivo da Vitrine Digital. Não use o projeto COMPRAS HNSS.
2. Em projeto vazio, execute `supabase/schema.sql`, depois `supabase/schema_v3.sql`, `supabase/policies.sql` e `supabase/migration_4.11_remote.sql`.
3. Em Authentication, crie o usuário administrador do painel.
4. Copie `js/config.example.js` para `js/config.js` e informe somente Project URL + chave publishable/anon. Nunca coloque service_role no navegador.
5. Publique a pasta inteira em HTTPS (GitHub Pages/Cloudflare Pages/Netlify/Vercel ou hospedagem equivalente).
6. Entre em `/admin/login.html`, envie mídia, crie playlist/tela/programação.
7. Na TV/totem abra `/player/index.html?code=TV-0001`. Use um código exclusivo por tela.
8. Valide status online, troca remota de playlist, agenda, reinício do navegador e teste sem internet/cache.

## Samsung Tizen
Use o navegador da TV em tela cheia para o primeiro rollout. Desative protetor de tela/economia agressiva quando possível e configure abertura automática da URL conforme o modelo/ambiente. Para frota maior, evoluir para pacote Tizen/MDM.

## Android/totens
Use Chrome/WebView em modo kiosk e configure auto-start. A URL do player é a mesma; muda apenas o código da tela.

## Gate de produção
Antes de escala comercial, a próxima etapa é substituir a escrita anônima de telemetria por credencial/token individual de dispositivo e aplicar retenção/limpeza de heartbeat/proof-of-play.
