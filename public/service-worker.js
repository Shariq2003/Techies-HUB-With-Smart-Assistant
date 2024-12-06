const STATIC_CACHE = "appV2"; // Update this for versioning
const DYNAMIC_CACHE = "dynamic-cache";
const USER_IMAGE_CACHE = "user-image-cache";
const MAX_DYNAMIC_ITEMS = 50; // Limit for dynamic cache items

const STATIC_FILES = [
    "/static/js/main.*.js",
    "/static/css/main.*.css",
    "/index.html",
    "/index.css",
    "/static/media/banner.8e687823b1422880cc3f.mp4",
    "/",
];

async function limitCacheSize(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
        await cache.delete(keys[0]);
    }
}

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return Promise.all(
                STATIC_FILES.map((url) =>
                    cache.add(url).catch((err) => {
                        console.error(`Failed to cache ${url}:`, err);
                    })
                )
            );
        })
    );
    console.log("Service Worker Installed");
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cacheName) => {
                    if (![STATIC_CACHE, USER_IMAGE_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
                        console.log(`Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            )
        )
    );
    console.log("Service Worker Activated");
});

self.addEventListener("fetch", (event) => {
    const requestUrl = new URL(event.request.url);

    if (requestUrl.origin === "https://api.dicebear.com" && requestUrl.pathname === "/5.x/initials/svg") {
        event.respondWith(
            caches.open(USER_IMAGE_CACHE).then((cache) =>
                cache.match(event.request).then((response) => {
                    return (
                        response ||
                        fetch(event.request).then((fetchResponse) => {
                            cache.put(event.request, fetchResponse.clone());
                            limitCacheSize(USER_IMAGE_CACHE, MAX_DYNAMIC_ITEMS);
                            return fetchResponse;
                        })
                    );
                })
            )
        );
        return;
    }
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request)
                .then((fetchResponse) => {
                    return caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(event.request, fetchResponse.clone());
                        limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);
                        return fetchResponse;
                    });
                })
                .catch((err) => {
                    console.error(`Fetch failed for ${event.request.url}:`, err);
                    return caches.match("/offline.html");
                });
        })
    );
});
