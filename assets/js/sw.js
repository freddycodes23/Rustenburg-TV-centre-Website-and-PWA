// Simple service worker for caching static assets to improve repeat load performance
const CACHE_NAME = 'rustenburg-tv-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/about.html',
  '/gallery.html',
  '/contact.html',
  '/assets/css/style.css',
  '/assets/js/main.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // ignore failures to cache non-critical assets
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Cache-first for images and optimized assets, network-first for navigation (index.html)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // only handle GET requests
  if (req.method !== 'GET') return;

  // network-first for navigation (HTML)
  if (req.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('/index.html')))
    );
    return;
  }

  // cache-first for static assets (images, css, js)
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      // cache successful responses for future
      if (res && res.status === 200 && req.destination) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      }
      return res;
    }).catch(() => {
      // fallback: return cached version or nothing
      return caches.match(req);
    }))
  );
});
