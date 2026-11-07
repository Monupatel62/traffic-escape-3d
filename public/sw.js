const CACHE_PREFIX = "traffic-escape-";
const CACHE_NAME = `${CACHE_PREFIX}shell-v2`;
const APP_SHELL = ["/", "/manifest.webmanifest", "/icons/traffic-escape.svg"];

async function getBuildAssets() {
  try {
    const response = await fetch("/manifest.json", { cache: "no-cache" });
    if (!response.ok) return [];
    const manifest = await response.json();
    const assets = new Set();
    const visited = new Set();
    const visit = entry => {
      if (visited.has(entry)) return;
      visited.add(entry);
      if (!entry || typeof entry !== "object") return;
      if (typeof entry.file === "string") assets.add(`/${entry.file.replace(/^\//, "")}`);
      for (const file of [...(entry.css ?? []), ...(entry.assets ?? [])]) {
        if (typeof file === "string") assets.add(`/${file.replace(/^\//, "")}`);
      }
      for (const imported of [...(entry.imports ?? []), ...(entry.dynamicImports ?? [])]) {
        if (typeof imported === "string" && manifest[imported]) visit(manifest[imported]);
      }
    };
    for (const entry of Object.values(manifest)) visit(entry);
    return [...assets];
  } catch {
    return [];
  }
}

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const buildAssets = await getBuildAssets();
    await cache.addAll([...new Set([...APP_SHELL, ...buildAssets])]);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put("/", response.clone());
        }
        return response;
      } catch {
        return (await caches.match(request)) ?? (await caches.match("/"));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(url.pathname);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && response.type === "basic") {
        await cache.put(url.pathname, response.clone());
      }
      return response;
    } catch {
      return new Response("Offline and this resource is not cached.", {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  })());
});
