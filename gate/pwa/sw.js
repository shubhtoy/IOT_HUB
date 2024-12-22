const CACHE_NAME = 'smart-access-v1';
const BASE_URL = 'https://shubhtoy.github.io/IOT_HUB/gate/pwa';

const ASSETS_TO_CACHE = [
    `${BASE_URL}/`,
    `${BASE_URL}/index.html`,
    `${BASE_URL}/manifest.json`,
    'https://cdnjs.cloudflare.com/ajax/libs/remixicon/3.5.0/remixicon.min.css',
    `${BASE_URL}/icons/icon-72x72.png`,
    `${BASE_URL}/icons/icon-96x96.png`,
    `${BASE_URL}/icons/icon-128x128.png`,
    `${BASE_URL}/icons/icon-144x144.png`,
    `${BASE_URL}/icons/icon-152x152.png`,
    `${BASE_URL}/icons/icon-192x192.png`,
    `${BASE_URL}/icons/icon-384x384.png`,
    `${BASE_URL}/icons/icon-512x512.png`
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version if found
                if (response) {
                    return response;
                }

                // Otherwise fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Add to cache
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    });
            })
    );
});

// Handle offline functionality
self.addEventListener('fetch', (event) => {
    if (!navigator.onLine) {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        return response;
                    }
                    return caches.match('offline.html');
                })
        );
    }
});
