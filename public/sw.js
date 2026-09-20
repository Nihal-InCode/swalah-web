const CACHE_NAME = 'yawmi-v3';
const AUDIO_CACHE = 'yawmi-audio-v1';
const ASSETS = [
  '/',
  '/settings',
  '/admin',
  '/icon.png',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== AUDIO_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CDN audio: cache-first
  if (url.hostname === 'cdn.islamic.network') {
    event.respondWith(
      caches.open(AUDIO_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // API: network-only
  if (url.pathname.startsWith('/api/')) return;

  // App shell: stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || fetched;
    })
  );
});

// Message handler for pre-caching ayah audio
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CACHE_AUDIO') {
    const { urls } = event.data;
    if (!Array.isArray(urls)) return;

    caches.open(AUDIO_CACHE).then((cache) => {
      Promise.allSettled(
        urls.map((url) =>
          cache.match(url).then((cached) => {
            if (cached) return Promise.resolve();
            return fetch(url).then((response) => {
              if (response.ok) {
                return cache.put(url, response);
              }
            });
          })
        )
      ).then(() => {
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'AUDIO_CACHED' });
          });
        });
      });
    });
  }

  if (event.data?.type === 'CLEAR_AUDIO_CACHE') {
    caches.delete(AUDIO_CACHE).then(() => {
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'AUDIO_CACHE_CLEARED' });
        });
      });
    });
  }
});
