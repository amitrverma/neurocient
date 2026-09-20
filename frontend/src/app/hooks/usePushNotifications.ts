"use client";

import { useState, useEffect } from "react";

export default function usePushNotifications(vapidPublicKey: string) {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  // ✅ Register SW on client
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);

      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
  .register("/service-worker.js")
  .then((reg) => console.log("✅ SW registered with scope:", reg.scope))
  .catch((err) => console.error("❌ SW registration failed:", err));

      }
    }
  }, []);

  // Subscribe (register in DB + subs table)
  const subscribe = async () => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push not supported in this browser");
      return;
    }

    const permissionResult = await Notification.requestPermission();
    setPermission(permissionResult);
    if (permissionResult !== "granted") return;

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    const subJson = sub.toJSON();

    await fetch("/api/register-webpush", {
      method: "POST",
      credentials: "include", // ✅ forward cookies
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subJson.endpoint,
        keys: subJson.keys,
      }),
    });

    console.log("📩 Push subscription saved:", subJson);
  };

  // Unsubscribe (remove from DB + subs table)
  const unsubscribe = async () => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      console.log("🗑️ Push unsubscribed in browser");
    }

    await fetch("/api/unregister-webpush", {
      method: "POST",
      credentials: "include", // ✅ forward cookies
      headers: { "Content-Type": "application/json" },
    });

    console.log("🗑️ Push subscription removed from DB");
  };

  return { permission, subscribe, unsubscribe };
}

// Helper
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
