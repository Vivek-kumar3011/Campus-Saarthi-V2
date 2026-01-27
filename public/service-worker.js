const CACHE_NAME = 'saarthi-v2'; // Changed from v1 to v2
const urlsToCache = [
  '/',
  '/index.html',
  '/logo.png', // Ensure this matches your new filename in the public folder
  '/manifest.json'
];

// Install: Cache new files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache: v2');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate: Delete old caches (v1)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch: Serve from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});