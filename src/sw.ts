/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import { Serwist, type PrecacheEntry, type SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});
serwist.addEventListeners();

// Web Push: every push MUST show a notification on iOS.
self.addEventListener("push", (event) => {
  let data: { title?: string; body?: string; url?: string } = {};
  try { data = event.data?.json() ?? {}; } catch { /* ignore */ }
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Bao says hi", {
      body: data.body ?? "Time for a sip of water!",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url ?? "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string })?.url ?? "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((wins) => {
      const w = wins.find((c) => "focus" in c);
      return w ? w.focus() : self.clients.openWindow(url);
    }),
  );
});
