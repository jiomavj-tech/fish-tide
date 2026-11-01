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
| 1–15 | `<head>`, meta tags e um `<style>` de 309 bytes | 1.233 | 0,2% |
| 17–35 | script: registro do service worker | 811 | 0,1% |
| 36–52 | script: tratador de erro que mostra a falha na tela | 1.150 | 0,1% |
| 53–63 | `<div id="root">` e o shim `window.storage` (localStorage) | 660 | 0,1% |
| 65–73 | **bundle: React, ReactDOM, scheduler, Leaflet, Firebase** | 493.008 | 62,7% |
| **74** | **bundle: o código do app**, minificado | ~282.000 | 34% |
| 75–379 | **módulo da maré**, acrescentado depois do build, legível | ~30.000 | 3,6% |
| 380+ | comentários de licença das bibliotecas | 1.253 | 0,2% |

Ou seja: quase tudo é build, e o código minificado do app vive numa **única
linha, a 74**.

## A regra prática

**Para mexer no app minificado, leia e edite só a linha 74.** As linhas 65–73
são bibliotecas de terceiros e nunca precisam ser carregadas.

```bash
sed -n '74p' index.html > /tmp/app.js     # ~282 KB em vez de 813 KB
```

Alguns trechos de componentes ficam no fim da linha 73 (`T`, `W`, `Ba`, `da`,
`Ki`, `fe`, `Xi`, `Ha`, `Xd`, `n0`, `iv`, `tv`) — quando o alvo não estiver na
74, procure na 73.

**Atenção: nem todo o app cabe mais na linha 74.** O módulo da maré
(`ftMare*`) entrou como bloco legível de verdade, com quebras de linha, e por
isso ocupa da 75 à 379. Qualquer `node --check` tem que cobrir **65 até 379**,
não só até a 74:

```bash
sed -n '65,379p' index.html > /tmp/check.js && node --check /tmp/check.js
```

Esse bloco está fisicamente *depois* da linha 74, mas isso não é problema:
`var` e `function` sofrem hoist dentro do mesmo escopo do bundle, então `n0`
(linha 73) chama `ftMareDia` (linha ~330) sem susto — a chamada só acontece
em tempo de render, muito depois de tudo ter sido avaliado.

## As fotos dos peixes

`peixes/` guarda 37 arquivos `.webp` (1,4 MB no total, ~38 KB cada), recortados
dos pôsteres da série "Peixes de Florianópolis". O nome do arquivo é o `id` da
ficha em `ftPeixesFloripa`, então a ficha monta o caminho sozinha
(`"peixes/"+peixe.id+".webp"`).

Na aba Iscas há dois caminhos, e a diferença entre eles importa:

- `ftFotoPeixe` liga o `id` de `ge` a **uma** foto, e só entra quem casa no nome
  científico com o mapa `Nh`. São 10 espécies.
- `ftFotoSci` liga **nome científico** a arquivo, e serve o bloco de nome
  ambíguo: cada candidato de um `Nh[x].incerto` ganha a sua miniatura. Assim a
  criança compara as espécies em vez de só ler dois nomes em latim.

- `ftFotoGrupo` liga o `id` de `ge` a um desenho que vale para **o grupo**, não
  para uma espécie. Vem das pranchas de série, que desenham um peixe e listam
  duas ou três espécies embaixo. Aparece no lugar da foto única, com uma legenda
  dizendo que serve para o grupo todo.

Peixe marcado `incerto` **nunca** recebe foto única — seria cravar a espécie
pela imagem, justo onde o app diz que não crava. Pode receber foto de grupo
(legendada) e foto por candidato. O papa-terra e o badejo são os casos
completos: os dois candidatos têm foto e aparecem lado a lado.

Fonte das imagens: 37 vêm de pôster individual (recorte de ~1060 px, saída com
640) e 10 vêm da prancha "Série 4", que empacota dez peixes numa folha só — daí
saem em 295 px, no tamanho nativo. São visivelmente menos nítidas; se um dia
vier o pôster individual de alguma delas, é só trocar o arquivo.

Duas armadilhas:

- **`loading:"lazy"` só funciona com altura conhecida.** Numa imagem
  `width:100%;height:auto` a caixa nasce com 0 de altura, o observador nunca
  dispara e o navegador **não chega a pedir o arquivo**. Por isso o lazy está só
  nas miniaturas da lista, que têm largura e altura fixas.
- O service worker **não** precisa listar as fotos: o `fetch` dele já guarda
  qualquer arquivo da própria origem no primeiro acesso. Pôr as 37 em
  `ESSENCIAIS` só deixaria a instalação mais lenta.

Nem tudo na linha 74 é minificado. O conteúdo acrescentado depois do build entra
como bloco legível, com nome de verdade e ancorado logo antes de `var Xv=[` (a
lista de abas): `ftProModulos` (trilha da aba Pro), `ftPeixesZonas` +
`ftPeixesFloripa` + `ftFichaPeixe` + `ftPeixesTab` (as fichas de espécie). Para
acrescentar uma espécie, basta mais um objeto em `ftPeixesFloripa` — a contagem
("37 peixes"), a barra de progresso e os filtros saem do tamanho da lista.

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

## A maré

Esta é a parte do app que mais pode mentir, então vale ler com calma.

**De onde vem o número.** Tábua oficial da Marinha do Brasil (CHM), estação
**PORTO DE FLORIANÓPOLIS**, 27°35'.3 S / 48°33'.4 W, fuso UTC−3, nível médio
0,64 m, carta 1902. O ano de **2026 inteiro** está embutido em
`ftMareTabela2026`: 365 dias, 1.959 marés, verbatim, 19 KB. Erro zero e
funciona sem internet.

**Fora de 2026 o app calcula.** `ftMareNivel` soma 57 componentes harmônicas
(`ftMareComp`) com correção nodal, e `ftMareCalc` varre o dia de 2 em 2
minutos procurando os extremos. As constantes foram ajustadas por mínimos
quadrados sobre as próprias 1.959 marés oficiais, com a condição de derivada
nula em cada extremo.

**Quanto a conta erra**, medida contra a tábua oficial de 2026: **13,4 min de
erro médio** no horário (p95 = 35 min, pior caso 89 min) e **2,2 cm** na
altura. Num teste de generalização — ajustar só com jan–jun e prever jul–dez —
o erro sobe pouco, para 15,4 min. Ou seja: serve de rede de segurança, não
substitui a tábua. `ftMareCredito` diz na tela qual dos dois está valendo.

Sinal de que o ajuste fechou: o nível médio saiu em **0,646 m** sozinho, e a
tábua da Marinha declara **0,64 m**. Esse número nunca entrou no ajuste.

**O formato tem uma decisão de projeto dentro.** Cada maré é `"HHMMhhh"`, com
`hhh = (altura_em_m + 0,5) × 100`. Repare no que **não** está guardado: se a
maré é alta ou baixa. `ftMareTipar` deduz isso alternando a partir de um par
de alturas diferentes.

Isso é de propósito. A tabela anterior guardava o tipo numa letra (`A`/`B`) e,
em **30 dos 184 dias**, tinha duas altas ou duas baixas seguidas — coisa que
no mar não existe. Deduzindo o tipo das alturas, esse estado impossível não
tem como ser escrito. Ancorar num par de alturas **diferentes** também importa:
a tábua da Marinha tem dias com dois extremos de mesma altura, e comparar só
com o vizinho quebraria ali.

**Quando sair a tábua de 2027:** baixe o PDF da estação, gere a tabela nova e
troque `ftMareTabela2026` e `ftMareAnoTabela`. Nada mais muda.
<https://www.marinha.mil.br/chm/tabuas-de-mare-6>

**Cuidado ao mexer na fase.** `ftMareNivel` usa `cos(V + u + g)`. O `g`
guardado é o negativo da defasagem convencional, porque veio de
`atan2(−B, A)`. Trocar esse sinal não quebra o `node --check` e não derruba a
tela — só faz a maré ficar errada em meia hora. Já aconteceu uma vez.

## Uma pescaria, vários equipamentos

O diário guarda **um registro por equipamento**. Quem sai de casa uma vez e
pesca com molinete e com coca grava dois registros: mesma data, mesmo local,
materiais diferentes. O modelo de dados sempre aceitou isso — o que faltava
era a tela mostrar os dois como uma pescaria só, e a estatística parar de
contar duas saídas onde houve uma.

A chave de uma pescaria é `data + local` (`ftChavePescaria`). Não é um id
próprio **de propósito**: assim os registros gravados antes desta mudança se
agrupam sozinhos, sem migração nenhuma.

`ftAgrupaPescarias` monta os grupos para a tela e `ftIdas` conta as saídas
de verdade.

**A armadilha, e ela é silenciosa.** Qualquer contagem de "pescarias" tem de
usar `ftIdas(registros)`, nunca `registros.length` — senão anotar o segundo
equipamento do dia derruba a média pela metade e infla o nível em dobro.
Quatro lugares dependiam disso e foram corrigidos:

| onde | contava | passou a contar |
|---|---|---|
| `Xn` (peixes por ida) | um registro = uma ida | saídas distintas |
| `tr` nível "Pescador de Verdade" | `a.length` | `ftIdas(a)` |
| medalha "Registre 5 pescarias" | `a.length>=5` | `ftIdas(a)>=5` |
| resumo "N pescarias" (Conquistas) | `o.length` | `ftIdas(o)` |

Nada disso quebra o `node --check` nem derruba a tela: erra quieto, só no
número. Ao mexer em estatística do diário, confira esta lista.

**Dois defeitos conhecidos no formulário**, nenhum deles tocado aqui:

- o seletor de equipamento reaproveita `$i`, que é a lista de **módulos de
  aprendizado**. Por isso ele oferece "História da Pesca da Ilha" e
  "Pesque-pague: regras e dicas" como equipamentos. Trocar a lista exige
  cuidado: os registros antigos guardam esses ids;
- o campo "tamanho do maior" aparece **antes** de "quantos peixes", o que
  inverte a ordem natural de quem está preenchendo.

## Dia de chuva

`ftExperimentos` (linha 74) tem 8 experimentos de ciência, com `ftExpFicha` e
`ftChuvaTab`. Aparecem em dois lugares:

- seção **Dia de chuva** na aba Aprender;
- card na aba **Planejar** quando `Zx(dia)==="ruim"` — o mesmo critério que o app
  já usava (chuva ≥ 70%, vento ≥ 40 km/h ou onda ≥ 1,8 m).

O botão do card faz `ftSecoesAbertas.chuva=!0` **antes** de chamar `ia()`
(`irParaAprender`): `ftSecao` lê esse objeto na montagem, então a aba Aprender já
abre com a seção aberta. É o jeito de navegar para uma seção específica.

O texto dos experimentos foi escrito para este app — os fenômenos são
demonstrações clássicas (densidade, empuxo, tensão superficial, ponto de
congelamento), e cada um é amarrado a algo que a criança vê pescando. O livro que
deu a ideia é creditado dentro da própria seção. **Não copie texto de material de
terceiros para cá**: o app é publicado.

## Porta de entrada

`ftPrimeirosPassos` (linha 74) é o card do topo da aba Planejar, com três
passos para a primeira sessão. Some sozinho quando os três saem.

Os três são medidos por estado que o app **já guardava** — nenhum contador
novo: `fichasPeixes` (conheceu um peixe), `iscas` (marcou o que tem na caixa),
`locais` (salvou um pesqueiro). O único campo criado é `inicioFeito`, e só para
o usuário poder fechar o card de parabéns.

Os passos navegam com `ftSecoesAbertas.<id>=!0` antes de `irPara(aba)`, o mesmo
truque do card de dia de chuva. É o que faz o passo cair na seção certa —
`peixesfloripa` na aba Aprender e `sugestoes` na aba Locais. Sem isso o passo 3
cai numa aba onde a lista de pesqueiros está fechada, e a pessoa não acha.

`Nv` ganhou a prop `irPara`, navegação genérica que o roteador injeta como
`na=>e(na)`.

## Verificando de verdade

Não existe suíte de testes. O que existe é o app. Use Chromium via Playwright
para conferir mudança visual e de comportamento antes de commitar.

**Não fixe o caminho do Chromium.** A versão do pacote muda sozinha e o
caminho antigo some (já saiu de `chromium-1194` para `chromium-1243`, com o
diretório interno mudando de `chrome-linux` para `chrome-linux64`). Deixe o
Playwright achar:

```js
const { chromium } = require('playwright');
await chromium.launch();     // sem executablePath
```

**O servidor local:** `npx --no-install http-server` falha, o pacote não está
instalado e o `npx` não pode baixar. Use o que já existe:

```bash
python3 -m http.server 8899 --bind 127.0.0.1
```

Vale medir, não só olhar: erros de console, altura de área de toque, tamanho de
fonte, altura de rolagem por aba e ausência de scroll horizontal em 320px.

**O card da maré não aparece no modo guiado.** Ele mora na seção de detalhes
do painel. Para vê-lo no teste, escolha idade **18+** no onboarding — senão o
teste passa sem ter olhado para nada.

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
