"use client";
import { useEffect, useState } from "react";

export type OS = "ios" | "android" | "desktop";
export type Browser = "safari" | "chrome" | "firefox" | "edge" | "samsung" | "other";
export type Env = { os: OS; browser: Browser; standalone: boolean };

export function detect(): Env {
  if (typeof navigator === "undefined") return { os: "desktop", browser: "other", standalone: false };
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(ua);
  const os: OS = ios ? "ios" : android ? "android" : "desktop";
  let browser: Browser = "other";
  if (ios) browser = /CriOS/.test(ua) ? "chrome" : /FxiOS/.test(ua) ? "firefox" : /EdgiOS/.test(ua) ? "edge" : /Safari/.test(ua) ? "safari" : "other";
  else if (/SamsungBrowser/.test(ua)) browser = "samsung";
  else if (/Edg(A)?\//.test(ua)) browser = "edge";
  else if (/Firefox\//.test(ua)) browser = "firefox";
  else if (/Chrome\//.test(ua)) browser = "chrome";
  else if (/Safari\//.test(ua)) browser = "safari";
  const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return { os, browser, standalone };
}

/* Chromium's native install prompt. Captured as early as possible. */
type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
let deferred: BIP | null = null;
const subs = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e as BIP; subs.forEach((f) => f()); });
  window.addEventListener("appinstalled", () => { deferred = null; subs.forEach((f) => f()); });
}
export function useInstallPrompt() {
  const [can, setCan] = useState(false);
  useEffect(() => { const f = () => setCan(!!deferred); f(); subs.add(f); return () => { subs.delete(f); }; }, []);
  return {
    can,
    async install() { if (!deferred) return false; await deferred.prompt(); const r = await deferred.userChoice; deferred = null; setCan(false); return r.outcome === "accepted"; },
  };
}
export function useEnv() {
  const [env, setEnv] = useState<Env | null>(null);
  useEffect(() => setEnv(detect()), []);
  return env;
}
