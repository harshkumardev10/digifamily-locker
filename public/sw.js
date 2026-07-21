const CACHE_NAME = 'docusaver-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/favicon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).catch(() => {});
    })
  );
});
