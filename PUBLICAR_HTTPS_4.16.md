# Vitrine Digital PRO 4.16 — publicação HTTPS

Base preparada para hospedagem estática HTTPS.

## GitHub Pages
1. Crie/abra um repositório exclusivo para Vitrine Digital.
2. Envie o CONTEÚDO desta pasta para a raiz do repositório.
3. GitHub: Settings > Pages > Build and deployment.
4. Source: Deploy from a branch.
5. Branch: main / root.
6. Aguarde o endereço HTTPS ficar disponível.

## Endereços
Painel: /admin/login.html
Player: /player/index.html?code=TV-0001

## Samsung Tizen / Android
Abra no navegador do aparelho o endereço HTTPS do Player com o código da tela.
Não use caminhos C:\ ou file:// no aparelho remoto.

## Segurança
O arquivo js/config.js deve conter apenas URL do projeto e chave pública publishable/anon.
Nunca coloque service_role, senha de usuário ou segredo administrativo no repositório.

## Validação
1. Login remoto.
2. Abrir TV-0001.
3. Confirmar Online e Player v4.16.0.
4. Alterar playlist/programação no painel.
5. Confirmar atualização no Player sem copiar arquivos para o aparelho.
