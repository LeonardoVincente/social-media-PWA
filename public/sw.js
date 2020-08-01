const CACHE_STATIC_NAME = 'static-v5';
const CACHE_DYNAMIC_NAME = 'dynamic-v2';

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function (cache) {
        console.log('[Service Worker] Precaching app shell');
        cache.addAll([
          '/',
          '/index.html',
          '/src/js/app.js',
          'src/js/feed.js',
          '/src/js/promise.js',
          '/src/js/fetch.js',
          '/src/js/material.min.js',
          '/src/css/app.css',
          '/src/css/feed.css',
          '/src/images/main-image.jpg',
          'https://fonts.googleapis.com/css?family=Roboto:400,700',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
          'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
        ]);
      })
  );
  return self.clients.claim();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys()
    .then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key != CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
          console.log('[Service Worker removing caches');
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
})

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function (res) {
              caches.open(CACHE_DYNAMIC_NAME)
                .then(function (cache) {
                  cache.put(event.request.url, res.clone());
                  console.log("Error error ", res)
                  return res;
                })
            })
            .catch(function (err) {
              console.log(err)
            })
        }
      })
  );
});