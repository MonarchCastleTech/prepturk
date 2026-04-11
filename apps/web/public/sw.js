const CACHE_NAME = 'prepturk-cache-v1';

const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/acil',
  '/savas-durumu',
  '/nukleer-tehlike',
  '/semptom-kontrol',
  '/su-aritma',
  '/logo.png',
  '/logo.svg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Try network first, then cache, for everything except API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
  } else {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // If offline and not in cache, and it's a navigation request, maybe return an offline page
          if (event.request.mode === 'navigate') {
            return caches.match('/dashboard');
          }
        });
      })
    );
  }
});
