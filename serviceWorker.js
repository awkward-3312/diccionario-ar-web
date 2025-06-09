const CACHE_NAME = 'diccionario-ar-v5';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/inicio.html',
  '/admin.html',
  '/agregar.html',
  '/sugerencias.html',
  '/revisar-sugerencias.html',
  '/chat-sparkie.html',
  '/css/estilos.css',
  '/css/inicio.css',
  '/css/admin.css',
  '/css/agregar.css',
  '/css/sugerencias.css',
  '/css/revisar-sugerencias.css',
  '/css/chat-sparkie.css',
  '/js/main.js',
  '/js/inicio.js',
  '/js/admin.js',
  '/js/agregar.js',
  '/js/sugerencias.js',
  '/js/revisar-sugerencias.js',
  '/js/chat-sparkie.js',
  '/img/sparkie-icon.png',
  '/favicon-ar.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
