import { NextResponse } from "next/server";
import { admin, sendPush, type Sub } from "@/lib/server";
import { decide, type RemindState } from "@/lib/remind";

export const dynamic = "force-dynamic";

/** Called every ~15 min by Supabase pg_cron. Sends a nudge to whoever is due one. */
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}` || !process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = admin();
  const { data: subs, error } = await db.from("push_subscriptions").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const users = [...new Set((subs ?? []).map((s) => s.user_id))];
  const { data: states } = users.length ? await db.from("app_state").select("user_id,state").in("user_id", users) : { data: [] };
  const byUser = new Map((states ?? []).map((r) => [r.user_id as string, r.state as RemindState]));
  const now = new Date();
  let sent = 0;
  for (const sub of (subs ?? []) as Sub[]) {
    const st = byUser.get(sub.user_id); if (!st) continue;
    const msg = decide(st, now, sub.tz || "Asia/Dhaka", sub.last_sent_at ? Date.parse(sub.last_sent_at) : null);
    if (!msg) continue;
    if (await sendPush(sub, { ...msg, url: "/" })) {
      sent++;
      await db.from("push_subscriptions").update({ last_sent_at: now.toISOString() }).eq("id", sub.id);
    }
  }
  return NextResponse.json({ ok: true, checked: subs?.length ?? 0, sent });
}
