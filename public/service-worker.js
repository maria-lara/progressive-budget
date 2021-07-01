const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/css/styles.css",
    "/js/index.js",
    "/js/idb.js",
    "/icons/icon-192x192.png", "/icons/icon-192x192.png",
    "/icons/icon-512x512.png", "/icons/icon-512x512.png",
    "/manifest.json",
    "/service-worker.js"
  ];

const APP_PREFIX = 'Budget-';     
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = APP_PREFIX + 'DATA' + VERSION;

self.addEventListener('install', function(event) {
  event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
          console.log('Files have been pre-cached successfully!');
          return cache.addAll(FILES_TO_CACHE);
      })
  )
  self.skipWaiting();
});



self.addEventListener('activate', function(event) {
  event.waitUntil(
      caches.keys().then(keyList => {
          return Promise.all(
              keyList.map(key => {
                  if(key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                      console.log('Removing old data', key);
                      return caches.delete(key);
                  }
              })
          );
      })
  )
  self.clients.claim();
});



self.addEventListener('fetch', function(event) {
  if(event.request.url.includes('/api/')) {
      event.respondWith(
          caches
              .open(DATA_CACHE_NAME)
              .then(cache => {
                  return fetch(event.request)
                      .then(response => {
                          if (response.status === 200) {
                              cache.put(event.request.url, response.clone());
                          }
                          return response;
                      })
                      .catch(err => {
                          return cache.match(event.request);
                      });
              })
              .catch(err => console.log(err))
      );
      return;
  }
  event.respondWith(
      fetch(event.request).catch(function() {
          return caches.match(event.request).then(function(response) {
              if(response) {
                  return response;
              } else if (event.request.headers.get('accept').includes('text/html')) {
                  return caches.match('/');
              }
          });
      })
  );
});