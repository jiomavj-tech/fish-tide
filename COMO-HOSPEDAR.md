# Como colocar o Pesca Kids Floripa num site de verdade (grátis, ~15 minutos)

Isso resolve o GPS de vez (só funciona 100% em `https://`) e faz o "Adicionar à tela inicial" virar
um app de verdade, com ícone próprio, tela cheia, e atualizações instantâneas pra todo mundo.

## O que você vai usar
GitHub Pages — hospedagem gratuita do GitHub, sem cartão de crédito, sem servidor pra administrar.

## Passo a passo

1. **Crie uma conta gratuita** em https://github.com (se ainda não tiver).

2. **Crie um repositório novo**:
   - Clique no `+` no canto superior direito → "New repository"
   - Nome: `pesca-kids-floripa` (pode ser outro nome, sem espaços)
   - Marque como **Public**
   - Clique em "Create repository"

3. **Suba os arquivos desta pasta** (`index.html`, `manifest.json`, `service-worker.js`,
   `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`):
   - Na página do repositório recém-criado, clique em "uploading an existing file"
   - Arraste os 6 arquivos (não a pasta, os arquivos soltos)
   - Role para baixo e clique em "Commit changes"

4. **Ative o GitHub Pages**:
   - Vá em **Settings** (no menu do repositório) → **Pages** (menu lateral esquerdo)
   - Em "Branch", escolha `main` e a pasta `/ (root)` → **Save**
   - Espere 1-2 minutos. O GitHub mostra o endereço, algo como:
     `https://SEU-USUARIO.github.io/pesca-kids-floripa/`

5. **Abra esse endereço no celular** (Chrome no Android, Safari no iPhone) e teste:
   - O GPS ("📍 Estou aqui!") deve funcionar liso agora
   - No Android: menu (⋮) → "Adicionar à tela inicial" ou "Instalar app"
   - No iPhone: botão de compartilhar (□↑) → "Adicionar à Tela de Início"
   - Vai aparecer um ícone próprio, e abrindo por ele o app ocupa a tela inteira, sem barra do navegador

## Como atualizar depois

Quando eu (Claude) fizer uma nova versão do `index.html`, é só repetir o passo 3
(subir o arquivo novo por cima do antigo, mesmo nome) — todo mundo que já instalou
recebe a atualização sozinho, na próxima vez que abrir com internet.

## Se quiser seu próprio domínio (ex.: pescakidsfloripa.com.br)

Dá pra registrar um domínio (custa por volta de R$40/ano em registradores brasileiros)
e apontar pro GitHub Pages em "Settings → Pages → Custom domain". Não é obrigatório —
o endereço `github.io` já funciona perfeitamente para uso da família e para testes
com outras crianças.
