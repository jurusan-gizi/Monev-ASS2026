/* Service worker: aplikasi tetap bisa dibuka & dipakai tanpa internet */
const CACHE = 'monev-gizi2-v1';
const ASSETS = ['./', './index.html', './app.js', './data.js', './config.js', './manifest.json',
  './icons/logo-sulsel.png', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return; // kiriman ke Google tidak di-cache
  // Network-first agar pembaruan cepat sampai, cadangan cache saat offline
  e.respondWith(
    fetch(req).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return res; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
