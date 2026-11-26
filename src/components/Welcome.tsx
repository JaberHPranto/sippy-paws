"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { Notification03Icon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";
import { Mascot } from "./Mascot";
import { InstallGuide } from "./InstallGuide";
import { AccountForm } from "./Account";
import { cloudEnabled } from "@/lib/supabase";
import { enableReminders, pushSupported } from "@/lib/push";
import { useEnv } from "@/lib/platform";

const rise = (i: number) => ({ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 + i * 0.1, type: "spring" as const, stiffness: 300, damping: 26 } });

export function Welcome({ name, onDone }: { name: string; onDone: () => void }) {
  const env = useEnv(), [res, setRes] = useState("");
  const needInstall = env?.os === "ios" && !env.standalone;
  return (
    <main className="welcome">
      <motion.div className="card stage happy" style={{ width: "100%" }} {...rise(0)}>
        <div className="mascots"><Mascot kind="panda" mood="happy" /><Mascot kind="cat" mood="wink" /></div>
        <div className="bubble"><span className="who">Bao &amp; Miso:</span> Hi {name}! We&apos;ll nudge you to sip, journal and tick things off.</div>
      </motion.div>
      <motion.div className="card" style={{ width: "100%", textAlign: "left" }} {...rise(1)}>
        <h3>{env?.os === "desktop" ? "Install the app" : "Add us to your Home Screen"}</h3>
        {env && <InstallGuide env={env} />}
        <div className="btns">
          <button className="btn primary" disabled={!env || needInstall || !pushSupported()} onClick={async () => setRes(await enableReminders())}><Icon icon={Notification03Icon} size={18} stroke={2} />Turn on reminders</button>
        </div>
        {needInstall && <p className="muted small" style={{ fontWeight: 700 }}>On iPhone, reminders unlock after you open the app from the Home Screen icon.</p>}
        {res === "signin" && <p className="muted small" style={{ fontWeight: 700 }}>Sign in below first, then turn on reminders.</p>}
        {res === "denied" && <p className="muted small" style={{ fontWeight: 700 }}>Notifications are off. You can turn them on in your phone&apos;s settings.</p>}
      </motion.div>
      {cloudEnabled && <motion.div className="card" style={{ width: "100%", textAlign: "left" }} {...rise(2)}><h3>Keep your data safe</h3><AccountForm /></motion.div>}
      <motion.button className="link" onClick={onDone} {...rise(3)}>{res === "granted" ? "Let's go ›" : "Maybe later"}</motion.button>
    </main>
  );
}
