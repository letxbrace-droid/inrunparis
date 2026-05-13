/* I&N RUN — Service Worker v2 */
const CACHE = 'inrun-v2';
const STATIC = [
  '/inrunparis/',
  '/inrunparis/index.html',
  '/inrunparis/icon-180.png',
  '/inrunparis/icon-192.png',
  '/inrunparis/icon-512.png',
  '/inrunparis/icon.svg',
  '/inrunparis/manifest.json',
  '/inrunparis/lib/leaflet.js',
  '/inrunparis/lib/leaflet.css',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  /* Navigation : toujours servir index.html depuis le cache si dispo */
  if (request.mode === 'navigate') {
    e.respondWith(
      caches.match('/inrunparis/index.html').then(r => r || fetch(request))
    );
    return;
  }

  /* Tuiles cartographiques et APIs météo/trafic : réseau d'abord, pas de cache */
  if (
    url.hostname.includes('cartocdn.com') ||
    url.hostname.includes('openstreetmap.org') ||
    url.hostname.includes('komoot.io') ||
    url.hostname.includes('open-meteo.com') ||
    url.hostname.includes('project-osrm.org')
  ) {
    e.respondWith(fetch(request).catch(() => new Response('', { status: 503 })));
    return;
  }

  /* Tout le reste : cache d'abord, réseau en fallback */
  e.respondWith(
    caches.match(request).then(r => r || fetch(request).then(response => {
      if (response.ok && response.type !== 'opaque') {
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, clone));
      }
      return response;
    }))
  );
});
