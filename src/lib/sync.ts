"use client";
import { useEffect, useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { sb, authHeader } from "./supabase";
import { getState, remote, replaceState, setOwner, subscribe, type SpecialDef, type State } from "./store";
import { setSpecials } from "./cards";
import { setCoupons } from "./shared";
import type { Coupon } from "./data";

type Inbox = { id: number; kind: "wish" | "redeem"; payload: Record<string, string | number>; created_at: string };
type Cloud = { session: Session | null; role: "her" | "owner" | null; status: "off" | "idle" | "syncing" | "synced" | "error"; inbox: Inbox[] };
let cloud: Cloud = { session: null, role: null, status: sb ? "idle" : "off", inbox: [] };
const subs = new Set<() => void>();
const set = (p: Partial<Cloud>) => { cloud = { ...cloud, ...p }; subs.forEach((f) => f()); };
export const useCloud = () => useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb); }; }, () => cloud, () => cloud);

/* ---------- auth (email + 6-digit code, works inside the installed iOS app) ---------- */
export async function sendCode(email: string) {
  if (!sb) throw new Error("Cloud sync isn't set up");
  const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) throw error;
}
export async function verifyCode(email: string, token: string) {
  if (!sb) throw new Error("Cloud sync isn't set up");
  const { error } = await sb.auth.verifyOtp({ email, token, type: "email" });
  if (error) throw error;
}
export async function signOut() { await sb?.auth.signOut(); }

/* ---------- state sync: last write wins, by the _t timestamp ---------- */
let pushTimer: ReturnType<typeof setTimeout> | undefined, pulling = false;
async function pull(uid: string) {
  if (!sb) return;
  pulling = true; set({ status: "syncing" });
  try {
    const { data, error } = await sb.from("app_state").select("state").eq("user_id", uid).maybeSingle();
    if (error) throw error;
    const local = getState(), rem = data?.state as State | undefined;
    if (rem && (rem._t ?? 0) > (local._t ?? 0)) replaceState({ ...rem, welcomed: true });
    else await push(uid);
    set({ status: "synced" });
  } catch { set({ status: "error" }); }
  pulling = false;
}
async function push(uid: string) {
  if (!sb) return;
  const { error } = await sb.from("app_state").upsert({ user_id: uid, state: getState(), updated_at: new Date().toISOString() });
  set({ status: error ? "error" : "synced" });
}
async function loadShared() {
  if (!sb) return;
  const { data } = await sb.from("shared").select("key,value");
  for (const row of data ?? []) {
    if (row.key === "coupons") setCoupons(row.value as Coupon[]);
    if (row.key === "specials") setSpecials(row.value as SpecialDef[]);
  }
}
async function loadInbox() {
  if (!sb) return;
  const { data } = await sb.from("inbox").select("id,kind,payload,created_at").order("created_at", { ascending: false }).limit(60);
  set({ inbox: (data ?? []) as Inbox[] });
}

/* ---------- owner writes ---------- */
export async function saveShared(key: "coupons" | "specials", value: unknown) {
  if (!sb) throw new Error("Cloud sync isn't set up");
  const { error } = await sb.from("shared").upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
  await loadShared();
}

/** Starts auth + sync once at app start. No-op when the backend isn't configured. */
export function useSyncEngine() {
  useEffect(() => {
    if (!sb) return;
    const client = sb;
    remote.inbox = (kind, payload) => { if (cloud.session) void client.from("inbox").insert({ kind, payload }); };
    remote.notifyOwner = (text) => { if (cloud.session) void authHeader().then((h) => fetch("/api/push/owner", { method: "POST", headers: { "content-type": "application/json", ...h }, body: JSON.stringify({ text }) })).catch(() => {}); };

    const onSession = async (session: Session | null) => {
      set({ session });
      if (!session) { setOwner(false); set({ role: null, status: "idle" }); return; }
      const { data } = await client.from("profiles").select("role").eq("id", session.user.id).maybeSingle();
      const role = (data?.role as Cloud["role"]) ?? "her";
      set({ role }); setOwner(role === "owner");
      await pull(session.user.id); await loadShared();
      if (role === "owner") await loadInbox();
    };
    client.auth.getSession().then(({ data }) => onSession(data.session));
    const { data: authSub } = client.auth.onAuthStateChange((evt, session) => { if (evt === "SIGNED_IN" || evt === "SIGNED_OUT") void onSession(session); });

    const unsub = subscribe(() => {
      const uid = cloud.session?.user.id; if (!uid || pulling) return;
      clearTimeout(pushTimer); pushTimer = setTimeout(() => void push(uid), 1200);
    });
    const onVis = () => { const uid = cloud.session?.user.id; if (!uid) return; if (document.visibilityState === "visible") { void pull(uid); void loadShared(); if (cloud.role === "owner") void loadInbox(); } else { clearTimeout(pushTimer); void push(uid); } };
    document.addEventListener("visibilitychange", onVis);
    return () => { authSub.subscription.unsubscribe(); unsub(); document.removeEventListener("visibilitychange", onVis); };
  }, []);
}
