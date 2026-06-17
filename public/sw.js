/* I&N RUN — Service Worker v95 */
const CACHE = 'inrun-v95';

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
  '/inrunparis/coupe2026.html',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting()));
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
  if (url.hostname.includes('cartocdn.com') || url.hostname.includes('openstreetmap.org') || url.hostname.includes('openstreetmap.de') || url.hostname.includes('komoot.io') || url.hostname.includes('project-osrm.org')) {
    e.respondWith(fetch(request).catch(() => new Response('', { status: 503 }))); return;
  }
  e.respondWith(caches.match(request).then(r => r || fetch(request).then(res => {
    if (res.ok && res.type !== 'opaque') caches.open(CACHE).then(c => c.put(request, res.clone()));
    return res;
  })));
});
