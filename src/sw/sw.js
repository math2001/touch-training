const CACHE_NAME = 'touch-trainer-v1';

let fetchFromCacheFirst = false;

// list of requests whose responses will be pre-cached at install
const INITIAL_CACHED_RESOURCES = [
    '/',
    '/app.js',
    '/app.css'
];

// install event handler (note async operation)
// opens named cache, pre-caches identified resources above
self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        cache.addAll(INITIAL_CACHED_RESOURCES).then(() => console.log("add all worked")).catch(e => console.error("all all failed"));
    })());
});


const smartNetwork = async (request) => {
    const cache = await caches.open(CACHE_NAME);
    let response;
    if (fetchFromCacheFirst)
    {
        console.log("Fetching from cache first")
        response = await cache.match(request);
        if (response)
        {
            console.log("  got response from cache")
            return response;
        }
        console.log("  fetch from network")
        return await fetch(request);
    }
    console.log("Fetching from network first")
    response = null;
    try {
        response = await fetch(request)
    } catch (e) {
        console.error("  fetching from network", e)
        response = null;
    }
    if (response) {
        console.log("  got response, saving in cache")
        cache.put(request, response.clone())
    } else {
        response = await cache.match(request)
        console.log("  loaded from cache", response)
    }
    return response;
}

self.addEventListener('fetch', event => {
    event.respondWith(smartNetwork(event.request))
})

// self.addEventListener('message', (event) => {
//     if (event.data && event.data.type === 'FETCH_FROM_CACHE_FIRST') {
//         fetchFromCacheFirst = true;
//     } else {
//         fetchFromCacheFirst = false;
//     }
// });
  