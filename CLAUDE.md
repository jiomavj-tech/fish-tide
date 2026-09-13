# Fish & Tide

App de pescaria para crianças de Florianópolis: maré, lua, vento e os pesqueiros
da Ilha. É um PWA que roda offline, servido pelo GitHub Pages a partir da branch
`main`.

## Idioma

**Fale sempre em português do Brasil** — respostas no chat, mensagens de commit,
título e corpo de pull request, comentários no código. O app é para crianças
brasileiras e o dono do projeto trabalha em português.

## Antes de editar o `index.html`

**Leia o `ARQUITETURA.md` primeiro.** O resumo: `index.html` não é código-fonte,
é um artefato de build com React minificado embutido, e o projeto-fonte nunca foi
commitado. O código do app inteiro vive numa **única linha, a 74**.

Em resumo, o que o `ARQUITETURA.md` detalha:

- carregue só a linha 74 (`sed -n '74p' index.html > /tmp/app.js`), nunca o
  arquivo inteiro — as linhas 65–73 são 493 KB de biblioteca de terceiros;
- edite por **substituição de string exata**, ancorada num trecho que aparece
  **exatamente uma vez**;
- confira que o saldo de parênteses e chaves não mudou;
- **rode `node --check`** sobre as linhas 65–74 extraídas. Passo obrigatório: o
  saldo de parênteses não pega erro de aspas.

Conteúdo acrescentado depois do build entra como **bloco legível, com nome de
verdade**, ancorado logo antes de `var Xv=[` (a lista de abas). É assim que estão
`ftProModulos` (trilha da aba Pro) e `ftPeixesZonas` / `ftPeixesFloripa` /
`ftFichaPeixe` / `ftPeixesTab` (as fichas de espécie). Siga esse padrão: não
minifique conteúdo novo à mão.

Não existe folha de estilo — são objetos `style:{...}` inline no JS. Regra de CSS
não vence estilo inline.

## Verificação

Não há suíte de testes. O que vale é abrir o app no Chromium via Playwright e
conferir de verdade antes de commitar:

```bash
npx --no-install http-server -p 8899 -s .
```

Use `http://127.0.0.1:8899`, **não `file://`** — o onboarding depende de
`localStorage`, que não funciona direito em `file://`.

Para passar do onboarding: clicar em "Só experimentar, sem conta", preencher o
campo `input[placeholder="Seu nome"]`, escolher uma idade e clicar em "Começar!".
Sem o nome, o botão não avança.

```js
chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
```

Meça, não só olhe: erros de console, ausência de scroll horizontal a 390px **e a
320px**, e altura de área de toque (a regra global é `button{min-height:56px}`).
Erros `net::ERR_CONNECTION_RESET` de `gstatic`/`accounts.google` são do ambiente
sem rede, não do app — pode ignorar.

## Tom do conteúdo

O público é criança. Texto novo segue o que o app já faz:

- linguagem direta e concreta, sem jargão sem explicação;
- segurança aparece junto do perigo — peixe com dente ou espinho leva aviso para
  chamar um adulto, nunca "cuidado" solto;
- conservação também: tamanho mínimo, pesque e solte, defeso e espécie ameaçada
  entram na própria ficha, não numa página à parte.

## Publicação

Merge em `main` = no ar em 1–2 minutos. O `sw.js` usa rede primeiro para a
página, então quem já instalou recebe a versão nova ao abrir com internet — não
precisa mexer no cache.
