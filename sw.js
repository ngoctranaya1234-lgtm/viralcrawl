// ViralCrawl 4K — Service Worker (2TECH MN - Nguyễn Minh Nhựt)
const CACHE_NAME = 'viralcrawl-4k-v2.5';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/app.css',
  './js/engine-resolver.js',
  './js/app.js',
  './js/page-dashboard.js',
  './js/page-download-link.js',
  './js/page-downloaded.js',
  './js/page-history.js',
  './js/page-settings.js',
  './js/page-pricing.js',
  './js/page-support.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests within same origin
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        })
      );
    })
  );
});
