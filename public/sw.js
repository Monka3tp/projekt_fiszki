self.addEventListener('install', (event) => {
  console.log('[sw] install');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[sw] activate');
  event.waitUntil((async () => {
    try {
      await self.clients.claim();
    } catch (e) {
      console.warn('[sw] clients.claim failed', e);
    }
  })());
});

self.addEventListener('fetch', (event) => {
  // prosty passthrough — nie blokujemy krytycznych requestów podczas debugowania
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

// opcjonalnie: log errors globalnie
self.addEventListener('message', (ev) => {
  console.log('[sw] message', ev.data);
});