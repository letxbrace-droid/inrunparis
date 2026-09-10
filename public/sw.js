/* I&N RUN — Service Worker v136 */
const CACHE = 'inrun-v136';

const BASE  = 'https://letxbrace-droid.github.io/inrunparis'

self.addEventListener('push', event => {
  let data = { title: 'I&N RUN', body: '' }
  try { data = event.data?.json() || data } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon:  `${BASE}/icons/icon-192.png`,
      badge: `${BASE}/icons/icon-192.png`,
      vibrate: [200, 100, 200],
      data: { url: `${BASE}/` },
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const target = event.notification.data?.url || 'https://letxbrace-droid.github.io/inrunparis/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {
      const existing = cls.find(c => c.url === target)
      return existing ? existing.focus() : clients.openWindow(target)
    })
  )
})
const OFFLINE = '/inrunparis/offline.html'

// Hosts the service worker must never touch — see the fetch handler.
const MAP_HOSTS = /(^|\.)(cartocdn\.com|openstreetmap\.org|openstreetmap\.de|komoot\.io|project-osrm\.org)$/;

const STATIC = [
  OFFLINE,
  '/inrunparis/manifest.json',
  '/inrunparis/hub-manifest.json',
  '/inrunparis/favicon.ico',
  '/inrunparis/icon-180.png',
  '/inrunparis/icon-192.png',
  '/inrunparis/icon-512.png',
  '/inrunparis/icon-maskable-512.png',
  '/inrunparis/icons/icon-48.png',
  '/inrunparis/icons/icon-72.png',
  '/inrunparis/icons/icon-96.png',
  '/inrunparis/icons/icon-144.png',
  '/inrunparis/icons/icon-152.png',
  '/inrunparis/icons/icon-180.png',
  '/inrunparis/icons/icon-192.png',
  '/inrunparis/icons/icon-384.png',
  '/inrunparis/icons/icon-512.png',
  '/inrunparis/icons/icon-maskable-512.png',
];
const PASSTHROUGH = [
  '/inrunparis/hub.html',
  '/inrunparis/ops/',
  '/inrunparis/ops/index.html',
  '/inrunparis/mentions-legales.html',
  '/inrunparis/qr.html',
  '/inrunparis/urgence.html',
];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE)
    // Known static assets
    await c.addAll(STATIC)
    // Warm the app shell: fetch index.html, extract all hashed /assets/ bundles,
    // and cache them — the app then boots offline even before any in-app navigate
    try {
      const shell = await fetch('/inrunparis/')
      if (shell.ok) {
        await c.put(new Request('/inrunparis/'), shell.clone())
        const html = await shell.text()
        const assetRe = /(?:src|href)="(\/inrunparis\/assets\/[^"]+)"/g
        const urls = []
        let m
        while ((m = assetRe.exec(html)) !== null) urls.push(m[1])
        await Promise.allSettled(urls.map(u => c.add(u)))
      }
    } catch {}
    await self.skipWaiting()
  })())
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);
  if (PASSTHROUGH.some(p => url.pathname.startsWith(p))) { e.respondWith(fetch(request)); return; }
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(request, res.clone()));
        return res;
      }).catch(() => caches.match(request).then(r => r || caches.match(OFFLINE)))
    );
    return;
  }
  // Map tiles, styles, glyphs, geocoding, routing: the service worker steps
  // ASIDE. Returning without calling respondWith() hands the request straight
  // back to the browser's own network stack.
  //
  // This is the fix for the map that never appeared. MapLibre fetches tiles
  // from a dedicated worker thread. Intercepting those with
  // respondWith(fetch(request)) routes every one of them page-worker ->
  // service-worker -> network -> back, and if that detour stalls (a terminated
  // SW, an iOS cross-origin worker-fetch stall) the promise never settles: the
  // request neither succeeds nor fails. MapLibre then raises no error and
  // paints no tiles — precisely the "tuiles : NON, aucune erreur" the device
  // reported. The detour also bought nothing: tiles were deliberately not
  // cached anyway.
  if (MAP_HOSTS.test(url.hostname)) return;

  e.respondWith(caches.match(request).then(r => r || fetch(request).then(res => {
    if (res.ok && res.type !== 'opaque') caches.open(CACHE).then(c => c.put(request, res.clone()));
    return res;
  })));
});
