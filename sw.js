/* I&N RUN — Service Worker v3 */
const CACHE = 'inrun-v3';
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

/* Pages admin/outils qui doivent être servies directement, jamais remplacées par index.html */
const PASSTHROUGH = [
  '/inrunparis/bdr-admin.html',
  '/inrunparis/bdradmin.html',
  '/inrunparis/ops/',
  '/inrunparis/ops/index.html',
  '/inrunparis/mentions-legales.html',
  '/inrunparis/qr.html',
  '/inrunparis/urgence.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  /* Pages admin : réseau direct, jamais de cache SPA */
  if (PASSTHROUGH.some(p => url.pathname.startsWith(p))) {
    e.respondWith(fetch(request));
    return;
  }

  /* Navigation SPA : servir index.html depuis le cache */
  if (request.mode === 'navigate') {
    e.respondWith(
      caches.match('/inrunparis/index.html').then(r => r || fetch(request))
    );
    return;
  }

  /* Tuiles carte + APIs externes : réseau d'abord */
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
    caches.match(request).then(r => r || fetch(request).then(res => {
      if (res.ok && res.type !== 'opaque') {
        caches.open(CACHE).then(c => c.put(request, res.clone()));
      }
      return res;
    }))
  );
});
