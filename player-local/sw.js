/* Vitrine Digital 5.1: Service Worker intentionally disabled.
   Samsung Tizen 9 supports CacheStorage but not Service Worker.
   player-local.js reads cached media directly and plays Blob object URLs. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.registration.unregister()));
