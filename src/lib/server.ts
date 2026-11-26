import "server-only";
import { createClient } from "@supabase/supabase-js";
import * as webpush from "web-push";

export const admin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server env vars missing");
  return createClient(url, key, { auth: { persistSession: false } });
};

let vapidReady = false;
function vapid() {
  if (vapidReady) return;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) throw new Error("VAPID keys missing");
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:hello@example.com", pub, priv);
  vapidReady = true;
}

export type Sub = { id: number; user_id: string; endpoint: string; p256dh: string; auth: string; tz: string; last_sent_at: string | null };
export type Payload = { title: string; body: string; url?: string };

/** Sends one push. Removes subscriptions the browser has thrown away (404/410). */
export async function sendPush(sub: Sub, p: Payload) {
  vapid();
  try {
    await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(p), { TTL: 60 * 30, urgency: "normal" });
    return true;
  } catch (e) {
    const code = (e as { statusCode?: number }).statusCode;
    if (code === 404 || code === 410) await admin().from("push_subscriptions").delete().eq("id", sub.id);
    return false;
  }
}

/** Verifies the caller's Supabase access token and returns their user id. */
export async function userFrom(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return null;
  const { data } = await admin().auth.getUser(token);
  return data.user ?? null;
}
