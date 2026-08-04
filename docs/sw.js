/* ============================================================
   Service worker — makes the app open instantly and keep
   working with no connection at all.

   Strategy: stale-while-revalidate. Every request is answered
   from the cache immediately, and a fresh copy is fetched in
   the background for next time. Since the whole app is one
   HTML file that is already loaded, swapping the cache mid-
   session cannot disturb what you are looking at.

   BUILD is rewritten by build.ps1 on every bundle, which is
   what makes a redeploy actually reach the phone.
   ============================================================ */

const BUILD = '20260804-214155';
const CACHE = `aturinduit-${BUILD}`;

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // addAll is all-or-nothing; a single 404 would leave the app
      // uncached entirely, so each entry is allowed to fail on its own.
      //
      // `cache: 'reload'` matters more than it looks. cache.add() otherwise
      // goes through the HTTP cache, so a stale copy of the page can be
      // precached and then pinned here for as long as it stays fresh in
      // that cache -- a redeploy would appear to do nothing.
      .then((cache) => Promise.all(
        PRECACHE.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => null)
        )
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('aturinduit-') && k !== CACHE)
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only same-origin GETs are ours to serve.
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });

      // 'no-cache' still lets the server answer 304, but never hands back a
      // stale entry from the HTTP cache -- otherwise this revalidation would
      // keep writing the same old bytes back into our cache forever.
      const network = fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' })
        .then((res) => {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => null);

      if (cached) return cached;

      const fresh = await network;
      if (fresh) return fresh;

      // Offline and never cached: fall back to the app shell so a
      // deep link still opens something usable.
      if (req.mode === 'navigate') {
        const shell = await cache.match('./index.html');
        if (shell) return shell;
      }
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    })
  );
});
