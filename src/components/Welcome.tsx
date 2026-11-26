"use client";
import { useEffect, useState } from "react";
import { Notification03Icon, Share01Icon, AddSquareIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";
import { Mascot } from "./Mascot";
import { enableReminders, isIOS, isStandalone, pushSupported } from "@/lib/push";

export function Welcome({ name, onDone }: { name: string; onDone: () => void }) {
  const [standalone, setStandalone] = useState(false), [ios, setIos] = useState(false), [res, setRes] = useState("");
  useEffect(() => { setStandalone(isStandalone()); setIos(isIOS()); }, []);
  const needInstall = ios && !standalone;
  return (
    <main className="welcome">
      <div className="card stage happy" style={{ width: "100%" }}>
        <div className="mascots"><Mascot kind="panda" mood="happy" /><Mascot kind="cat" mood="wink" /></div>
        <div className="bubble"><span className="who">Bao &amp; Miso:</span> Hi {name}! We&apos;ll nudge you to sip, journal and tick things off.</div>
      </div>
      <div className="card" style={{ width: "100%", textAlign: "left" }}>
        <h3>Add us to your Home Screen</h3>
        <ol className="steps">
          <li><span className="si" style={{ background: "var(--blue2)", color: "#3a9ad6" }}><Icon icon={Share01Icon} /></span><span>Tap <b>Share</b> in Safari.</span></li>
          <li><span className="si" style={{ background: "var(--mint2)", color: "#2f8a5f" }}><Icon icon={AddSquareIcon} /></span><span>Choose <b>Add to Home Screen</b>, then open Sippy Paws from the new icon.</span></li>
        </ol>
        {standalone && <p className="small" style={{ color: "#2f8a5f", fontWeight: 800, display: "flex", gap: 6, alignItems: "center" }}><Icon icon={CheckmarkCircle02Icon} size={18} /> Installed. You&apos;re all set!</p>}
        <div className="btns">
          <button className="btn primary" disabled={needInstall || !pushSupported()} onClick={async () => setRes(await enableReminders())}><Icon icon={Notification03Icon} size={18} stroke={2} />Turn on reminders</button>
        </div>
        {needInstall && <p className="muted small" style={{ fontWeight: 700 }}>Reminders unlock after you open the app from the Home Screen icon.</p>}
        {res === "denied" && <p className="muted small" style={{ fontWeight: 700 }}>Notifications are off. Turn them on in Settings → Notifications.</p>}
      </div>
      <button className="link" onClick={onDone}>{res === "granted" ? "Let's go ›" : "Maybe later"}</button>
    </main>
  );
}
