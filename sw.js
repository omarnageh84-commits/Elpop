const CACHE_NAME = 'elpop-v1';
const urlsToCache = [
  './',
  './index.html',
  './home.html',
  './daily.html',
  './attendance.html',
  './tasks.html',
  './themes.js',
  './firebase-config.js',
  './firebase-bridge.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
