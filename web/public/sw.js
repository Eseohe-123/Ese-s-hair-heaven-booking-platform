/* Hairven service worker — offline shell.
 *
 * Deliberately does NOT cache HTML documents. A cached document survives
 * deploys while its JavaScript chunks do not, which leaves every button dead
 * (no hydration). Pages always come from the network; only static assets are
 * cached, and a dropped connection falls back to /offline.
 *
 * Bump CACHE to invalidate every cached asset.
 */
const CACHE = "hairven-v4";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll([OFFLINE_URL]);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

const CACHEABLE = new Set(["style", "script", "image", "font"]);

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: network only, with the offline page as the fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          const offline = await caches.match(OFFLINE_URL);
          return offline ?? Response.error();
        }
      })(),
    );
    return;
  }

  if (!CACHEABLE.has(request.destination)) return;

  // Static assets: cache-first, refresh in the background.
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) {
        fetch(request)
          .then((res) => {
            if (res.ok) caches.open(CACHE).then((c) => c.put(request, res.clone()));
          })
          .catch(() => {});
        return cached;
      }
      const res = await fetch(request);
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
      }
      return res;
    })(),
  );
});
