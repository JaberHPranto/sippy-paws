"use client";
import { useState } from "react";
import { CloudSavingDone01Icon, Mail01Icon, Logout01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";
import { cloudEnabled } from "@/lib/supabase";
import { sendCode, signOut, useCloud, verifyCode } from "@/lib/sync";
import { sfx } from "@/lib/sound";

/** Email → 6-digit code sign-in. Works inside the installed iPhone app (no links to open). */
export function AccountForm({ compact = false }: { compact?: boolean }) {
  const cloud = useCloud();
  const [email, setEmail] = useState(""), [code, setCode] = useState(""), [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false), [err, setErr] = useState("");
  if (!cloudEnabled) return compact ? null : <p className="muted small" style={{ fontWeight: 700 }}>Cloud sync isn&apos;t set up on this build, so everything stays on this phone.</p>;
  if (cloud.session) {
    const label = cloud.status === "syncing" ? "Syncing…" : cloud.status === "error" ? "Couldn't sync, will retry" : "Synced";
    return (
      <div className="dline" style={{ borderBottom: 0 }}>
        <span className="e" style={{ color: "#2f8a5f" }}><Icon icon={CloudSavingDone01Icon} size={22} /></span>
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{cloud.session.user.email}</div><div className="muted small">{label}{cloud.role === "owner" ? " · owner" : ""}</div></div>
        <button className="btn ghost" style={{ padding: "8px 10px", fontSize: 13 }} onClick={() => void signOut()}><Icon icon={Logout01Icon} size={15} />Sign out</button>
      </div>
    );
  }
  const go = async () => {
    setErr(""); setBusy(true);
    try {
      if (step === "email") { await sendCode(email.trim()); setStep("code"); sfx("pop"); }
      else { await verifyCode(email.trim(), code.trim()); sfx("success"); }
    } catch (e) { setErr(e instanceof Error ? e.message : "Something went wrong"); }
    setBusy(false);
  };
  return (
    <form onSubmit={(e) => { e.preventDefault(); void go(); }}>
      {!compact && <p className="muted small" style={{ marginTop: -4, fontWeight: 700 }}>Sign in so your water, journal and outfits are backed up and reminders can reach this phone.</p>}
      {step === "email" ? (
        <div className="tform"><input type="email" required autoComplete="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn primary" disabled={busy || !email.includes("@")}><Icon icon={Mail01Icon} size={16} stroke={2} />Send code</button></div>
      ) : (
        <>
          <p className="small" style={{ fontWeight: 700, margin: "0 0 8px" }}>We emailed a 6-digit code to <b>{email}</b>.</p>
          <div className="tform"><input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} style={{ letterSpacing: 4, fontWeight: 800 }} />
            <button className="btn primary" disabled={busy || code.length < 6}>Sign in</button></div>
          <button type="button" className="link" onClick={() => { setStep("email"); setCode(""); }}>Use a different email</button>
        </>
      )}
      {err && <p className="small" style={{ color: "#e0405f", fontWeight: 700 }}>{err}</p>}
    </form>
  );
}
