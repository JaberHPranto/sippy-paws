import { NextResponse } from "next/server";
import { admin, userFrom } from "@/lib/server";

/** Saves this device's push subscription for the signed-in user. */
export async function POST(req: Request) {
  const user = await userFrom(req);
  if (!user) return NextResponse.json({ error: "sign in first" }, { status: 401 });
  const { subscription, tz } = await req.json();
  const sub = subscription as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) return NextResponse.json({ error: "bad subscription" }, { status: 400 });
  const { error } = await admin().from("push_subscriptions").upsert(
    { user_id: user.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth, tz: typeof tz === "string" ? tz.slice(0, 64) : "Asia/Dhaka" },
    { onConflict: "endpoint" },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
