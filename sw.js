// Subir el número en cada cambio de la app para que el celular tome la versión nueva.
const CACHE = 'planos-v5';
const ARCHIVOS = ['./', 'index.html', 'manifest.json', 'icono-192.png', 'icono-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith('planos-v') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Solo borra versiones viejas de esta app: las demás apps comparten handeress.github.io.
// Primero lo guardado (funciona sin señal) y, si hay internet, actualiza por detrás.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async c => {
      const guardado = await c.match(req, { ignoreSearch: true });
      const red = fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(() => guardado);
      return guardado || red;
    })
  );
});
