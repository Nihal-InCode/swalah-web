const CACHE_NAME = 'yawmi-v5';
const AUDIO_CACHE = 'yawmi-audio-v2';
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

  if (url.pathname.startsWith('/api/')) return;

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

self.addEventListener('message', (event) => {
  if (event.data?.type === 'CACHE_AUDIO') {
    const { urls } = event.data;
    if (!Array.isArray(urls)) return;
    const client = event.source;

    caches.open(AUDIO_CACHE).then(async (cache) => {
      let done = 0;
      const total = urls.length;
      for (const url of urls) {
        try {
          const cached = await cache.match(url);
          if (!cached) {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
            }
          }
        } catch (e) { /* skip failed */ }
        done++;
        if (done % 5 === 0 || done === total) {
          client.postMessage({ type: 'AUDIO_PROGRESS', done, total });
        }
      }
      client.postMessage({ type: 'AUDIO_DONE', total });
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
