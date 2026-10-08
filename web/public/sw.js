/* Hairven service worker — minimal offline shell.
 * Static assets are cached on first load; pages fall back to cache
 * when offline. Bump CACHE to invalidate.
 */
const CACHE = "hairven-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
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

const CACHEABLE = new Set(["document", "style", "script", "image", "font"]);

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  event.respondWith(
    (async () => {
      try {
        const res = await fetch(request);
        const url = new URL(request.url);
        if (
          url.origin === self.location.origin &&
          res.ok &&
          (request.destination === "" || CACHEABLE.has(request.destination))
        ) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
        }
        return res;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          const home = await caches.match("/");
          if (home) return home;
        }
        return Response.error();
      }
    })(),
  );
});
