/* Minimal service worker — exists only to satisfy PWA installability so the
   browser fires `beforeinstallprompt` (Chrome/Edge/Android). It deliberately
   does NOT cache anything: the fetch handler is a pure pass-through, so there's
   no risk of serving stale content after a deploy. */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  /* No respondWith → the browser handles the request normally. The mere
     presence of a fetch handler is what makes the app installable. */
});
