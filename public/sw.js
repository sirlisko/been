// Offline support: pages are network-first (fresh deploys, share previews),
// everything else same-origin is served from cache and refreshed behind it.
const CACHE = "been-v2";

self.addEventListener("install", (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.add("/")));
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = new URL(request.url);
	if (request.method !== "GET" || url.origin !== location.origin) return;

	if (request.mode === "navigate") {
		event.respondWith(
			fetch(request)
				.then((response) => {
					if (response.ok && !url.search) {
						const copy = response.clone();
						caches.open(CACHE).then((cache) => cache.put("/", copy));
					}
					return response;
				})
				.catch(() => caches.match("/")),
		);
		return;
	}

	// Stale-while-revalidate: hashed assets never change, the rest refreshes on the next load
	// ponytail: old hashed assets pile up in the cache, bump CACHE if it ever matters
	const refresh = fetch(request).then((response) => {
		if (response.ok) {
			const copy = response.clone();
			caches.open(CACHE).then((cache) => cache.put(request, copy));
		}
		return response;
	});
	event.respondWith(
		caches.match(request).then((cached) => {
			if (!cached) return refresh;
			refresh.catch(() => {});
			return cached;
		}),
	);
});
