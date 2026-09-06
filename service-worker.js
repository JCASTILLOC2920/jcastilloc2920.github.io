// Purge and unregister all legacy caches
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Network only - bypass cache completely
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});

