// Generated at build. Cache-first, so play needs no network after the first visit.
const CACHE = "vortex-wisdom-mvuz7z0g";
const FILES = ["./","./assets/index-CrDPCKbg.js","./assets/index-b_TMXydA.css","./assets/theme-CrQfqKxL.flac","./assets/title-landscape-CWfx9hkj.webp","./assets/title-portrait-D-JFwrUq.webp","./apple-touch-icon.png","./cover.jpg","./icon-192.png","./icon-512.png","./share.jpg","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request)));
});
