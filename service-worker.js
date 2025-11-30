// ===============================
// SERVICE WORKER — AUTO UPDATE
// ===============================

// Mude este número sempre que quiser forçar atualização manual.
// Mas na maioria das vezes não precisa, pois o hash faz isso sozinho.
const SW_VERSION = "v1";

// Nome do cache
const CACHE_NAME = "palavras-cache-" + SW_VERSION;

// Arquivos a serem cacheados
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
];

// INSTALAÇÃO — faz o download dos arquivos novos
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando nova versão", SW_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  // Força a ativação imediata
  self.skipWaiting();
});

// ATIVAÇÃO — apaga caches antigos automaticamente
self.addEventListener("activate", (event) => {
  console.log("[SW] Ativando versão", SW_VERSION);

  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

// FETCH — lógica inteligente de atualização
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)               // tenta pegar a versão nova sempre
      .then((response) => {
        // Atualiza o cache com o arquivo novo
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => caches.match(event.request)) // se offline, usa o cache
  );
});
