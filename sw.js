const CACHE = 'medsearch-v1';
const ASSETS = [
  './MedicalCollegeSearch_pwa.html',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg'
];

// Install — cache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cache successful GET responses
        if (e.request.method === 'GET' && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, copy));
        }
        return response;
      }).catch(() => {
        // Offline fallback — return main HTML
        if (e.request.mode === 'navigate') {
          return caches.match('./MedicalCollegeSearch_pwa.html');
        }
      });
    })
  );
});
