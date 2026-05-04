const CACHE_NAME = "doodo-chat-v1";

// App shell files to pre-cache
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/avatar.png",
  "/manifest.json",
];

// --- Install: pre-cache app shell ---
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// --- Activate: clean old caches ---
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// --- Fetch: Network-first for API, Cache-first for assets ---
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and API/socket requests — always go to network
  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/socket.io/")
  ) {
    return;
  }

  // Cache-first for static assets (JS, CSS, images)
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff2?)$/)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached || fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return res;
        })
      )
    );
    return;
  }

  // Network-first for HTML navigation — fallback to cached index.html
  event.respondWith(
    fetch(request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return res;
      })
      .catch(() => caches.match("/index.html"))
  );
});
