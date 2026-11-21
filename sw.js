// QInsight Daily Log: offline support.
// Bump VERSION whenever you upload changed app files, so phones pick up the new version.
var VERSION = 'qts-v15';
var SHELL = ['./', './index.html', './config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './logo.png', './claims.js'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// App files: serve from cache instantly, refresh the cache in the background.
// Calls to the Google backend are never cached; they go straight to the network.
self.addEventListener('fetch', function (e) {
  var req = e.request;
  var u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== self.location.origin) return;
  if (/review\.html$/.test(u.pathname)) return;   // approval page: always live from the network, never cached
  e.respondWith(caches.open(VERSION).then(function (cache) {
    return cache.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) cache.put(req.mode === 'navigate' && /\/(index\.html)?$/.test(u.pathname) ? './index.html' : req, res.clone());
        return res;
      }).catch(function () { return hit || cache.match('./index.html'); });
      return hit || net;
    });
  }));
});
