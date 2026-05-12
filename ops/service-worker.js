const CACHE = 'inrun-ops-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './seed_data.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys =>
        Promise.all(
          keys.filter(k => k !== CACHE).map(k => caches.delete(k))
        )
      )
    ])
  );
});

self.addEventListener('fetch', e => {
  // Only cache-first for same-origin assets; pass CDN requests through
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) {
    return; // Let CDN requests fall through
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
