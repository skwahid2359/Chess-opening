const CACHE_NAME = "chess-opening-academy-shell-v46";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./src/styles.css", "./src/app.js", "./src/opening-data.js", "./src/variation-data.js", "./src/study-patterns.js","./src/puzzle-data.js", "./engine/stockfish-loader.js", "./icons/icon-192.svg", "./icons/icon-512.svg", "./pieces/white-pawn.svg", "./pieces/white-rook.svg", "./pieces/white-knight.svg", "./pieces/white-bishop.svg", "./pieces/white-queen.svg", "./pieces/white-king.svg", "./pieces/black-pawn.svg", "./pieces/black-rook.svg", "./pieces/black-knight.svg", "./pieces/black-bishop.svg", "./pieces/black-queen.svg", "./pieces/black-king.svg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
    return response;
  })));
});
