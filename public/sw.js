self.addEventListener('install', function (event) {
  console.log("[Service worked]  installig service worked ", event)
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
  console.log("[Service worked]  activate service worked ", event)
  return self.clients.claim();
})

self.addEventListener('fetch', function (event) {
  console.log("[Service worked]  fetching something ", event)
  event.respondWith(
    fetch(event.request)
    //   caches.match(event.request)
    //     .then(function (res) {
    //       return res;
    //     })
  );
});