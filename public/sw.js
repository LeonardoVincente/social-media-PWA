importScripts('/src/js/idb.js');
importScripts('/src/js/secret.js');
importScripts('/src/js/utility.js');

const CACHE_STATIC_NAME = 'static-33';
const CACHE_DYNAMIC_NAME = 'dynamic-v9';
const STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  'src/js/feed.js',
  '/src/js/idb.js',
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


function trimCache(cacheName, maxItems) {
  caches.open(cacheName)
    .then(function (cache) {
      return cache.keys()
        .then(function (keys) {
          if (keys.length > maxItems) {
            cache.delete(keys[0])
              .then(trimCache(cacheName, maxItems));
          }
        });
    })
}

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

function isInArray(string, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == string) {
      return true;
    }
  }
  return false;
}

self.addEventListener('fetch', function (event) {
  console.log('Fetched called ' + event.request.url);
  var url = FIREBASE_URL_BASE + '/posts.json';
  console.log("URL " + url);
  if (event.request.url.indexOf(url) > -1) {
    console.log("INside if")
    event.respondWith(
      fetch(event.request)
        .then(function (res) {
          console.log("Clearing data")
          var cloneRes = res.clone();
          clearAllData('posts')
            .then(function () {
              console.log("After clearing data")
              return cloneRes.json()
            })
            .then(function (data) {
              console.log("New data", data)
              for (var key in data) {
                writeData('posts', data[key])
                  .then(function(){
                    console.log("Deleting item " + key)
                    deleteItemFromData('posts', key)
                  })
              }
            });
          return res;
        })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
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
                trimCache(CACHE_DYNAMIC_NAME, 100);
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then(function (cache) {
                    cache.put(event.request.url, res.clone());
                    console.log("Error error ", res)
                    return res;
                  })
              })
              .catch(function (err) {
                console.log("eRROR IN CATCH BLOCK ", err)
                return caches.open(CACHE_STATIC_NAME)
                  .then(function (cache) {
                    if (event.request.headers.get('accept').includes('text/html')) {
                      return cache.match('/offilne.html');
                    }
                  })
              })
          }
        })
    );
  }

});

