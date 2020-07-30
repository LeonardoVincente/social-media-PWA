self.addEventListener('install', function (event) {
  // event.waitUntil(
  //   caches.open('first-app')
  //     .then(function (cache) {
  //       cache.addAll([
  //         '/',
  //         '/index.html',
  //         '/src/css/app.css',
  //         '/src/js/app.js'
  //       ])
  //     })
  // );
  return self.clients.claim();
});

self.addEventListener('activate', function (event) {
  return self.clients.claim();
})

self.addEventListener('fetch', function (event) {
  event.respondWith(
    fetch(event.request)
    //   caches.match(event.request)
    //     .then(function (res) {
    //       return res;
    //     })
  );
});