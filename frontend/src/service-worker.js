// Workbox imports
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkOnly, CacheFirst } from "workbox-strategies";

// --- Precaching ---

// Filter out problematic entries (like app-build-manifest.json)
const safeManifest = (self.__WB_MANIFEST || []).filter(
  (entry) => !entry.url.includes("app-build-manifest.json")
);

// ✅ Precache safe list only
precacheAndRoute(safeManifest, {
  ignoreURLParametersMatching: [/.*/], // ignore query params
  cleanURLs: false,                    // don’t assume clean URLs
  directoryIndex: null,                // don’t assume index.html
});

// --- Runtime caching rules ---

// 🚫 Never cache Next.js internals (chunks, build files)
registerRoute(
  ({ url }) => url.pathname.startsWith("/_next/"),
  new NetworkOnly()
);

// 🚫 Never cache API routes
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkOnly()
);

// ✅ Cache images with CacheFirst
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [], // add ExpirationPlugin if you want limits
  })
);

// --- Push Notifications ---

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Neurocient", {
      body: data.body || "You have a new notification",
      icon: "/icons/icon-192.png",
      data: data.url || "https://neurocient.com",
    })
  );
});

// --- Notification Click ---

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data));
});
