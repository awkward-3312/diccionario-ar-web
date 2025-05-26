// serviceWorker.js

const CACHE_NAME = 'diccionario-ar-v1.5';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/estilos.css',
  '/js/main.js',
  '/favicon-ar.png',
  '/img/sparkie.png',
  // Agrega aquí más imágenes, fuentes o páginas si deseas cachearlas
];

// Instalación: precachea recursos esenciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching...');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación: limpia cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Borrando caché antigua:', name);
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: responde desde cache primero, luego red
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            // Evitar cachear llamadas a extensiones o eventos dinámicos
            if (
              event.request.url.startsWith('http') &&
              !event.request.url.includes('/socket.io/')
            ) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        })
        .catch(() => {
          // Fallback: muestra offline.html si se desea
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
    })
  );
});
