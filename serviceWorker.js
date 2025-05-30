const CACHE_NAME = "diccionario-ar-cache-v3";

const urlsToCache = [
  "/",
  "/index.html",
  "/admin.html",
  "/agregar.html",
  "/sugerencias.html",
  "/revisar-sugerencias.html",
  "/traductor.html",
  "/favicon-ar.png",
  "/favicon-ar.ico",
  "/fonts/Middle-of-April.ttf",
  "/img/FONDOOO.jpeg",
  "/img/fondo-claro.png",
  "/css/estilos.css",
  "/css/admin.css",
  "/css/agregar.css",
  "/css/sugerencias.css",
  "/css/revisar-sugerencias.css",
  "/css/traductor.css",
  "/js/main.js",
  "/js/admin.js",
  "/js/agregar.js",
  "/js/sugerencias.js",
  "/js/revisar-sugerencias.js",
  "/js/traductor.js"
];

self.addEventListener("install", (event) => {
  self.skipWaiting(); // ✅ activa de inmediato
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => response)
      .catch(() => caches.match(event.request))
  );
});
