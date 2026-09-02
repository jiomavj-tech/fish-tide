# Como este projeto é montado (leia antes de editar)

**`index.html` não é código-fonte. É um artefato de build.** Ele contém um bundle
React minificado, gerado por bundler, com as bibliotecas embutidas. O projeto-fonte
nunca foi commitado neste repositório.

Isso muda como se mexe nele. Este documento existe para que a próxima pessoa — ou a
próxima IA — não perca tempo tentando "refatorar o `index.html`" nem gaste tokens
carregando 493 KB de React sem necessidade.

## O que tem dentro do arquivo

| linhas | região | bytes | % |
|---|---|---:|---:|
| 1–15 | `<head>`, meta tags e um `<style>` de 309 bytes | 1.218 | 0,2% |
| 17–35 | script: registro do service worker | 792 | 0,1% |
| 36–52 | script: tratador de erro que mostra a falha na tela | 1.133 | 0,2% |
| 53–63 | `<div id="root">` e o shim `window.storage` (localStorage) | 649 | 0,1% |
| 65–73 | **bundle: React, ReactDOM, scheduler, Leaflet, Firebase** | 492.999 | 71,9% |
| **74** | **bundle: o código do app** | 187.964 | 27,4% |
| 75+ | comentários de licença das bibliotecas | 1.203 | 0,2% |

Ou seja: **99,3% do arquivo é build**, e o código do app inteiro vive numa
**única linha, a 74**.

## A regra prática

**Para mexer no app, leia e edite só a linha 74.** As linhas 65–73 são bibliotecas
de terceiros e nunca precisam ser carregadas.

```bash
sed -n '74p' index.html > /tmp/app.js     # 188 KB em vez de 686 KB
```

Alguns trechos de componentes ficam no fim da linha 73 (`T`, `W`, `Ba`, `da`,
`Ki`, `fe`, `Xi`, `Ha`, `Xd`) — quando o alvo não estiver na 74, procure na 73.

## Editando com segurança

O código é minificado: os nomes foram destruídos pelo minificador (React é `t`,
o componente Card é `T`, o Button é `W`, a tela Planejar é `Nv`, o quiz é `o0`).
Não dá para "melhorar os nomes" sem reconstruir a fonte.

O que funciona é **substituição de string exata, ancorada num trecho único**:

1. Escolha uma âncora e **confirme que ela aparece exatamente uma vez** (`s.count(x) == 1`).
2. Faça a substituição.
3. **Confira que o saldo de parênteses/chaves não mudou** — pega recorte torto.
4. **Rode `node --check`** sobre as linhas 65–74 extraídas. Este passo é obrigatório:
   o saldo de parênteses *não* pega erro de aspas.

```bash
sed -n '65,74p' index.html > /tmp/check.js && node --check /tmp/check.js
```

### Armadilha real, já vista em produção

Há um bloco de CSS embutido como **string JS de aspas duplas**
(`createElement("style",null,"...")`). Escrever `content:"👇"` dentro dele fecha a
string e quebra o bundle inteiro. **Dentro desse CSS, use aspas simples.**

### Estilos

Não existe folha de estilo: há **977 objetos `style:{...}` inline no JS** e 309 bytes
de CSS de verdade. Mudança visual global (tamanho de fonte, altura de botão) significa
alterar muitas ocorrências — use regex com fronteira, por exemplo
`fontSize:11(?![.0-9])`, para não pegar `11.5` junto.

Exceção: existe um bloco `<style>` injetado pelo app com as animações
(`ft-pulso`, `ft-cai`, `ft-sobe`…) e a regra global `button{min-height:56px}`.
Regra de folha de estilo **não** vence `style` inline — para mudar quem declara
inline, é preciso alterar o inline.

## Verificando de verdade

Não existe suíte de testes. O que existe é o app: ele roda em `file://` sem
servidor. Use Chromium via Playwright para conferir mudança visual e de
comportamento antes de commitar.

```js
// PLAYWRIGHT_BROWSERS_PATH já aponta para /opt/pw-browsers
chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
```

Vale medir, não só olhar: altura de área de toque, tamanho de fonte, altura de
rolagem por aba e ausência de scroll horizontal em 320px.

## Publicação

GitHub Pages serve a branch `main`. Merge em `main` = no ar em 1–2 minutos.
O `sw.js` usa **rede primeiro** para a página, então quem já instalou recebe a
versão nova ao abrir com internet — não precisa mexer no cache.

## O caminho para sair disso

Separar `index.html` em `style.css` + módulos **não resolve**: extrairia 309 bytes
de CSS e deixaria o resto minificado do mesmo jeito. O problema não é o número de
arquivos, é o código estar minificado e sem fonte.

O que resolve, em ordem de custo:

1. **Achar o projeto-fonte original.** Se ele existe em algum histórico ou pasta,
   é de longe o caminho mais barato.
2. **Estrangulamento incremental.** Montar um `src/` real com esbuild e migrar
   uma aba por vez do bundle para fonte de verdade, regerando o build a cada
   passo, com o app no ar o tempo todo.
