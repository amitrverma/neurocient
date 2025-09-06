self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Stoc.ai", {
      body: data.body || "You have a new notification",
      icon: "/icon.png",
      data: data.url || "https://neurocient.com",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
