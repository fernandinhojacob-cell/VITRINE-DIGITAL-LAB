/* Vitrine Digital 5.2: Service Worker intentionally disabled.
   Media playback is strictly from IndexedDB Blob URLs. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.registration.unregister()));
