const CACHE_NAME = "diccionario-ar-cache-v2";

const urlsToCache = [
  "/",
  "/index.html",
  "/admin.html",
  "/agregar.html",
  "/sugerencias.html",
  "/revisar-sugerencias.html",
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
  "/js/main.js",
  "/js/admin.js",
  "/js/agregar.js",
  "/js/sugerencias.js",
  "/js/revisar-sugerencias.js"
];

// Instalar y cachear todos los archivos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activar y limpiar cachés viejos
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

// Interceptar todas las peticiones
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
