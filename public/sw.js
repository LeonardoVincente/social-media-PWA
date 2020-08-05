const CACHE_STATIC_NAME = 'static-v17';
const CACHE_DYNAMIC_NAME = 'dynamic-v2';
const STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
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
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function (cache) {
        console.log('[Service Worker] Precaching app shell');
        cache.addAll(STATIC_FILES);
      })
  );
  return self.clients.claim();
});

self.addEventListener('activate', function (event) {
  console.log("Activate called");
  event.waitUntil(caches.keys()
    .then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key != CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
          console.log('[Service Worker] removing caches');
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
})

//cache then network
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function (response) {
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request)
//             .then(function (res) {
//               caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function (cache) {
//                   cache.put(event.request.url, res.clone());
//                   console.log("Error error ", res)
//                   return res;
//                 })
//             })
//             .catch(function (err) {
//               console.log(err)
//               return caches.open(CACHE_STATIC_NAME)
//             }).then(function(cache){
//               return cache.match('/offilne.html');
//             })
//         }
//       })
//   );
// });

//Cache only
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     caches.match(event.request)
// )});    

//Network only
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     fetch(event.request)
// )});    


//network then cache
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     fetch(event.request)
//       .catch(err => {
//         return caches.match(event.request)

//       })
//   );
// });



//cache then network

self.addEventListener('fetch', function (event) {
  var url = 'https://httpbin.org/get';
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME)
        .then(function (cache) {
          return fetch(event.request)
            .then(function (res) {
              cache.put(event.request, res.clone());
              return res;
            })
        })
    )
  } else if (new RegExp('\\b' + STATIC_FILES.join('\\b|\\b') + '\\b').test(event.request.url)) {
    event.respondWith(
      caches.match(event.request)
    )
  } else { // cache with network fallback
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
                return caches.open(CACHE_STATIC_NAME)
              }).then(function (cache) {
                if (event.request.url.indexOf('/help') > -1) {
                  return cache.match('/offilne.html');
                }
              })
          }
        })
    );
  }
});