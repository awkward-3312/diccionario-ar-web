const CACHE_NAME = 'diccionario-ar-v1.7';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/estilos.css',
  '/js/main.js',
  '/favicon-ar.png',
  '/img/sparkie.png',
  // Agrega más si es necesario
];

// Instalación: precachea recursos esenciales
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting(); // fuerza activación inmediata
});

// Activación: elimina cachés antiguas
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando y limpiando...');
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Eliminando caché antigua:', name);
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first con actualización en background
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchAndCache = fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          if (
            event.request.url.startsWith('http') &&
            !event.request.url.includes('/socket.io/')
          ) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      });

      return cachedResponse || fetchAndCache;
    })
  );
});

// Comunicación: forzar actualización desde la app
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    console.log('[SW] Forzando activación inmediata');
    self.skipWaiting();
  }
});
