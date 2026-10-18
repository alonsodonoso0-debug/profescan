// Service worker: la app funciona sin conexión tras la primera carga.
// Archivos propios: primero red (así se actualizan al subir una versión nueva), con respaldo en caché.
// Librerías externas (Tailwind CDN): primero caché.
const CACHE = 'profescan-v2';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const same = new URL(e.request.url).origin === self.location.origin;
  const save = res => {
    if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  };
  if (same) {
    e.respondWith(fetch(e.request).then(save).catch(() => caches.match(e.request).then(h => h || caches.match('./index.html'))));
  } else {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(save)));
  }
});
