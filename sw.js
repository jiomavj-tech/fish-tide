/* Fish & Tide — service worker
 *
 * POR QUE ELE EXISTE: o Chrome só oferece "instalar na tela inicial" se o site
 * tiver um service worker com fetch handler, além do manifest. Sem ele, o
 * convite simplesmente não aparece — e não avisa por quê.
 *
 * O CUIDADO PRINCIPAL: versões antigas do app já ficaram presas em cache, e por
 * isso o index.html chegou a desregistrar service workers de propósito. Aqui a
 * estratégia é REDE PRIMEIRO para a página: sempre que houver internet, o
 * navegador pega a versão nova do GitHub. O cache só entra quando a rede falha,
 * pra o app abrir na praia sem sinal.
 *
 * Nada de dado de previsão, maré ou onda é guardado aqui — isso muda de hora em
 * hora e cache velho daria informação errada. Só a casca do app fica guardada.
 */

const VERSAO = "fish-tide-v1";
const CACHE_TILES = "fish-tide-tiles-v1";
const ESSENCIAIS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icone-192.png",
  "./icone-512.png",
];

self.addEventListener("install", (ev) => {
  // assume o lugar do service worker antigo na hora, sem esperar fechar abas
  self.skipWaiting();
  ev.waitUntil(
    caches.open(VERSAO).then((c) => c.addAll(ESSENCIAIS)).catch(() => {})
  );
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO && n !== CACHE_TILES).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (ev) => {
  const req = ev.request;

  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Tiles do mapa (OpenStreetMap): são imagens que quase não mudam, então guardamos
  // pra funcionar na praia sem sinal. Mostra o que já foi visto antes na hora, e
  // atualiza o cache em segundo plano quando tem rede — sem atrasar o mapa.
  if (url.hostname === "tile.openstreetmap.org") {
    ev.respondWith(
      caches.open(CACHE_TILES).then((c) =>
        c.match(req).then((cacheado) => {
          const buscaNova = fetch(req)
            .then((resp) => {
              if (resp && resp.ok) c.put(req, resp.clone());
              return resp;
            })
            .catch(() => null);
          return cacheado || buscaNova;
        })
      )
    );
    return;
  }

  // Só cuidamos do que é nosso e de leitura, além dos tiles acima. Previsão do
  // tempo e Firebase passam direto pra rede: são dados que precisam estar frescos.
  if (url.origin !== self.location.origin) return;

  ev.respondWith(
    fetch(req)
      .then((resp) => {
        // deu certo: guarda uma cópia pra quando faltar sinal
        const copia = resp.clone();
        caches.open(VERSAO).then((c) => c.put(req, copia)).catch(() => {});
        return resp;
      })
      .catch(() =>
        // sem rede: serve o que estiver guardado; se nem isso, cai na página
        caches.match(req).then((c) => c || caches.match("./index.html"))
      )
  );
});
