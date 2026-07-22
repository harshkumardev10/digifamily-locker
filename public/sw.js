// DigiFamily Locker - Service Worker
// Network-first strategy: always fetch fresh assets, cache for offline fallback only.
// Bumping version forces all devices to clear old stale caches immediately.
const CACHE_NAME = 'digifamily-v5';

// Only pre-cache the bare minimum for offline shell
const SHELL_ASSETS = [
  '/',
  '/index.html'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Activate new SW immediately without waiting
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache warning:', err);
      });
    })
  );
});

self.addEventListener('activate', (e) => {
  // Delete ALL old caches with different version name
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  // Use network-first strategy:
  // 1. Always try to fetch from network
  // 2. Cache the fresh response
  // 3. Only fall back to cache if network fails (offline)
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // Cache a clone of the fresh network response
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed — serve from cache as offline fallback
        return caches.match(e.request).then((cached) => {
          return cached || caches.match('/index.html');
        });
      })
  );
});
