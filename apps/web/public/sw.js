// PrepTürk service worker — offline-first command center.
// Strategy:
//   * Precache the critical shell (resilient: one missing asset never aborts install)
//   * Cache-first for immutable build assets (/_next/static, fonts, images)
//   * Network-first for navigations, falling back to cached page then /dashboard
//   * API calls always go to the network (never served stale)
const CACHE_VERSION = 'v2';
const CACHE_NAME = `prepturk-cache-${CACHE_VERSION}`;
const OFFLINE_FALLBACK = '/dashboard';

const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/acil',
  '/savas-durumu',
  '/nukleer-tehlike',
  '/semptom-kontrol',
  '/su-aritma',
  '/logo.svg',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Resilient precache: add assets individually so a single 404 (e.g. a page
      // not yet built) cannot abort the whole install like cache.addAll() would.
      await Promise.allSettled(
        PRECACHE_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn('[sw] precache skipped:', asset, err && err.message);
          })
        )
      );
      await self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
      )
      .then(() => self.clients.claim())
  );
});

function isImmutableAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    /\.(?:js|css|woff2?|ttf|otf|png|jpg|jpeg|gif|svg|webp|ico)$/i.test(url.pathname)
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET; let the browser deal with POST/PUT/etc.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache API traffic or cross-origin requests.
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  // Cache-first for immutable build assets — instant offline, no network wait.
  if (isImmutableAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
    return;
  }

  // Network-first for navigations and everything else, with cache fallback.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_FALLBACK);
          }
          return Response.error();
        })
      )
  );
});
