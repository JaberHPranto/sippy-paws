"use client";
import { useState } from "react";
import { useModal } from "./Modal";
import { actions, useStore } from "@/lib/store";
import { sfx } from "@/lib/sound";
import { useEnv } from "@/lib/platform";
import { InstallGuide } from "./InstallGuide";
import { AccountForm } from "./Account";
import { signOut, useCloud } from "@/lib/sync";
import { enableReminders, pushSupported } from "@/lib/push";

export function SettingsSheet() {
  const s = useStore(), { close } = useModal(), env = useEnv();
  const [f, setF] = useState(s.settings);
  const [push, setPush] = useState(""), [wipe, setWipe] = useState(false);
  const cloud = useCloud();
  const num = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: +e.target.value });
  const txt = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <>
      <h2>Settings</h2>
      <h3 style={{ marginTop: 6 }}>Account &amp; sync</h3>
      <AccountForm />
      <div className="row2">
        <label className="field">Your name<input type="text" value={f.name} onChange={txt("name")} /></label>
        <label className="field">Treats from<input type="text" value={f.partnerName} placeholder="optional" onChange={txt("partnerName")} /></label>
      </div>
      <div className="row2">
        <label className="field">Panda&apos;s name<input type="text" value={f.pandaName} onChange={txt("pandaName")} /></label>
        <label className="field">Cat&apos;s name<input type="text" value={f.catName} onChange={txt("catName")} /></label>
      </div>
      <div className="row2">
        <label className="field">Daily goal (ml)<input type="number" min={500} max={6000} step={100} value={f.goalMl} onChange={num("goalMl")} /></label>
        <label className="field">Glass size (ml)<input type="number" min={50} max={1000} step={10} value={f.waterMl} onChange={num("waterMl")} /></label>
      </div>
      <div className="row2">
        <label className="field">Nudge from (hour)<input type="number" min={0} max={23} value={f.startHour} onChange={num("startHour")} /></label>
        <label className="field">Until (hour)<input type="number" min={0} max={23} value={f.endHour} onChange={num("endHour")} /></label>
      </div>
      <label className="field">Remind every (minutes)<input type="number" min={15} max={240} step={5} value={f.interval} onChange={num("interval")} /></label>
      <label className="switch">Reminders<input type="checkbox" checked={f.remind} onChange={(e) => setF({ ...f, remind: e.target.checked })} /></label>
      <label className="switch">Sound effects<input type="checkbox" checked={f.sound} onChange={(e) => { setF({ ...f, sound: e.target.checked }); actions.updateSettings({ sound: e.target.checked }); if (e.target.checked) sfx("pop", true); }} /></label>
      {pushSupported() && <button className="btn ghost" style={{ width: "100%" }} onClick={async () => { const r = await enableReminders(); setPush(r === "granted" ? "Reminders are on for this phone." : r === "signin" ? "Sign in above first, then try again." : r === "denied" ? "Notifications are blocked in your phone settings." : "This browser can't receive reminders."); }}>Turn on reminders for this phone</button>}
      {push && <p className="muted small" style={{ fontWeight: 700 }}>{push}</p>}
      {env && !env.standalone && <><h3 style={{ marginTop: 14 }}>Install the app</h3><InstallGuide env={env} /></>}
      <h3 style={{ marginTop: 18 }}>Start over</h3>
      {!wipe ? <button className="btn ghost" style={{ width: "100%", color: "#e0405f" }} onClick={() => setWipe(true)}>Erase this phone&apos;s data &amp; redo setup</button> : (
        <div className="ob-help" style={{ marginTop: 0 }}>
          <span>This deletes your water log, journal, to-dos, outfits and cards on this phone{cloud.session ? ", and signs you out. Your cloud backup stays" : ""}. It can&apos;t be undone.</span>
          <div className="btns"><button className="btn ghost" onClick={() => setWipe(false)}>Keep my data</button>
            <button className="btn pink" style={{ flex: 1 }} onClick={async () => { await signOut(); actions.resetAll(); close(); }}>Erase &amp; start over</button></div>
        </div>
      )}
      <div className="btns"><button className="btn ghost" onClick={close}>Cancel</button><button className="btn pink" style={{ flex: 1 }} onClick={() => { actions.updateSettings(f); close(); }}>Save</button></div>
    </>
  );
}
