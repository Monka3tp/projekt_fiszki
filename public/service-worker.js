const CACHE_NAME = 'brain-deck-cache-v1';
const OFFLINE_URL = '/';
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Przy instalacji cache'ujemy podstawowe zasoby
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_RESOURCES))
  );
});

// Aktywacja - czyszczenie starych cache'y
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Prosty cache-first: najpierw cache, potem sieć; jeśli obie nie będą dostępne - offline fallback
self.addEventListener('fetch', event => {
  const request = event.request;

  // Ignore non-GET requests
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(request)
        .then(networkResponse => {
          // opcjonalnie cache'ujemy nowe odpowiedzi
          return caches.open(CACHE_NAME).then(cache => {
            // skanujemy tylko, jeżeli odpowiedź jest OK i typu basic (same-origin)
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        })
        .catch(() => {
          // fallback do root (offline page) jeśli jest cache'owany
          return caches.match(OFFLINE_URL);
        });
    })
  );
});

// Obsługa komunikatów z aplikacji (opcja: wymuszenie aktualizacji)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});