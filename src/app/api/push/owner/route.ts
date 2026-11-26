import { NextResponse } from "next/server";
import { admin, sendPush, userFrom, type Sub } from "@/lib/server";

/** Lets Pranto know when she redeems a coupon or sends an outfit wish. */
export async function POST(req: Request) {
  const user = await userFrom(req);
  if (!user) return NextResponse.json({ error: "sign in first" }, { status: 401 });
  const { text } = await req.json();
  if (typeof text !== "string" || !text.trim()) return NextResponse.json({ error: "empty" }, { status: 400 });
  const db = admin();
  const { data: owners } = await db.from("profiles").select("id").eq("role", "owner").neq("id", user.id);
  const ids = (owners ?? []).map((o) => o.id);
  if (!ids.length) return NextResponse.json({ ok: true, sent: 0 });
  const { data: subs } = await db.from("push_subscriptions").select("*").in("user_id", ids);
  let sent = 0;
  for (const s of (subs ?? []) as Sub[]) if (await sendPush(s, { title: "Sippy Paws", body: text.slice(0, 160), url: "/" })) sent++;
  return NextResponse.json({ ok: true, sent });
}
