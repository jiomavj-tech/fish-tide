// Service Worker do Pesca Kids Floripa
// ANTES: priorizava sempre o que já estava guardado no celular, mesmo com internet —
// isso fazia correções novas nunca chegarem em quem já tinha aberto o app uma vez!
// AGORA: com internet, sempre busca a versão mais nova primeiro. Só usa o que está
// guardado no celular quando não há internet de verdade (aí sim, funciona offline).

const VERSAO_CACHE = "pesca-kids-v2"; // troque esse número a cada atualização publicada
const ARQUIVOS_ESSENCIAIS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(VERSAO_CACHE).then((cache) => cache.addAll(ARQUIVOS_ESSENCIAIS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter((n) => n !== VERSAO_CACHE).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  const url = new URL(evento.request.url);

  if (url.origin !== self.location.origin) return;

  evento.respondWith(
    Promise.race([
      fetch(evento.request).then((respostaRede) => {
        caches.open(VERSAO_CACHE).then((cache) => cache.put(evento.request, respostaRede.clone()));
        return respostaRede;
      }),
      new Promise((_, rejeitar) => setTimeout(rejeitar, 4000)),
    ]).catch(() => caches.match(evento.request))
  );
});
