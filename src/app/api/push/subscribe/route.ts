import { NextResponse } from "next/server";

// TODO: persist to Supabase `push_subscriptions` (user_id, endpoint, keys, tz, remind settings).
export async function POST(req: Request) {
  const sub = await req.json();
  if (!sub?.endpoint) return NextResponse.json({ error: "bad subscription" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
