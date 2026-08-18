
const CACHE_NAME = 'yawmiyati-v3';
const urlsToCache = [
  './',
  './index.html',
  './home.html',
  './daily.html',
  './attendance.html',
  './tasks.html',
  './themes.js',
  './manifest.json',
  './icon-192.jpg',
  './icon-512.jpg',
  './icon-1024.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'}))).catch(err => {
        console.log('Cache failed for some files', err);
        // حاول تحمل الموجود بس
        return Promise.all(
          urlsToCache.map(url => cache.add(url).catch(()=>{}))
        );
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(names.filter(n=>n!==CACHE_NAME).map(n=>caches.delete(n))))
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('firebase') || event.request.url.includes('firestore') || event.request.url.includes('googleapis')) {
    return; // سيب فايربيز يشتغل اونلاين
  }
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request).catch(()=>caches.match('./index.html')))
  );
});
