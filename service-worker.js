const CACHE_NAME = 'viscardi-app-v4';
const APP_SHELL = [
  '/',
  '/index.html',
  '/servizi.html',
  '/simulazioni.html',
  '/copertura.html',
  '/privacy.html',
  '/cookie.html',
  '/styles.css',
  '/enhancements.css',
  '/script.js',
  '/pwa.js',
  '/simulazioni.js',
  '/copertura.js',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/app-icon-192.png',
  '/app-icon-512.png',
  '/apple-touch-icon.png',
  '/assets/images/hero-quattro-aree-v2.png',
  '/logo-viscardi.png',
  '/social-share-viscardi.png',
  '/assets/images/compagnie-lockup.webp',
  '/assets/images/gennaro-viscardi.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(response => response || caches.match('/index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(response => {
        if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
