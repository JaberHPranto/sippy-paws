"use client";
import { useState } from "react";
import { useModal } from "./Modal";
import { actions, useStore } from "@/lib/store";

export function SettingsSheet() {
  const s = useStore(), { close } = useModal();
  const [f, setF] = useState(s.settings);
  const num = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: +e.target.value });
  const txt = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <>
      <h2>Settings</h2>
      <label className="field">Your name<input type="text" value={f.name} onChange={txt("name")} /></label>
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
      <div className="btns"><button className="btn ghost" onClick={close}>Cancel</button><button className="btn pink" style={{ flex: 1 }} onClick={() => { actions.updateSettings(f); close(); }}>Save</button></div>
    </>
  );
}
