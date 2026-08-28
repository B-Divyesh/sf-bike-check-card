const CACHE = 'bike-check-card-v1.1.0';
const SHELL = ['/', '/index.html', '/offline.html', '/manifest.webmanifest', '/icon.svg', '/icon-192.png', '/icon-512.png', '/icon-maskable-512.png', '/assets/demo-sensor.webp'/* PRECACHE_ASSETS */];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('bike-check-card-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

async function offlineAppDocument() {
  const cache = await caches.open(CACHE);
  const cachedIndex = await cache.match('/index.html');
  if (!cachedIndex) return cache.match('/offline.html');
  let html = await cachedIndex.text();
  const scriptPath = SHELL.find(path => path.endsWith('.js'));
  const stylePath = SHELL.find(path => path.endsWith('.css'));
  if (scriptPath) {
    const script = await cache.match(scriptPath);
    if (script) html = html.replace(/<script type="module" crossorigin src="\/assets\/[^"]+"><\/script>/, `<script type="module">${await script.text()}</script>`);
  }
  if (stylePath) {
    const style = await cache.match(stylePath);
    if (style) html = html.replace(/<link rel="stylesheet" crossorigin href="\/assets\/[^"]+">/, `<style>${await style.text()}</style>`);
  }
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put('/index.html', copy));
      return response;
    }).catch(offlineAppDocument));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok) caches.open(CACHE).then(cache => cache.put(request, response.clone()));
    return response;
  })));
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
