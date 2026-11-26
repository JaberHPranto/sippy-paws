"use client";
import { authHeader } from "./supabase";

export function pushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}
function urlB64ToUint8Array(b64: string) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}
/** Must be called from a user tap (iOS requirement). Needs a signed-in account to reach the server. */
export async function enableReminders(): Promise<"granted" | "denied" | "unsupported" | "signin"> {
  if (!pushSupported()) return "unsupported";
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return "denied";
  const reg = await navigator.serviceWorker.ready;
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const auth = await authHeader();
  if (!key || !auth.Authorization) return "signin";
  const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(key) }));
  const res = await fetch("/api/push/subscribe", {
    method: "POST", headers: { "content-type": "application/json", ...auth },
    body: JSON.stringify({ subscription: sub.toJSON(), tz: Intl.DateTimeFormat().resolvedOptions().timeZone }),
  });
  return res.ok ? "granted" : "signin";
}
