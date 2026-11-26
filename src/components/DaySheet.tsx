"use client";
import { BookOpen01Icon, CheckmarkSquare02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";
import { Mascot } from "./Mascot";
import { useModal } from "./Modal";
import { DRINKS, MOODS, drinkById } from "@/lib/data";
import { dk, fmtMl, k2d } from "@/lib/dates";
import { moodForDay } from "@/lib/mood";
import { goalOf, hitOf, mlOf, useStore } from "@/lib/store";

export function DaySheet({ k }: { k: string }) {
  const s = useStore(), { close } = useModal();
  const ml = mlOf(s, k), goal = goalOf(s, k), p = Math.round((ml / goal) * 100), md = moodForDay(s, k);
  const drinks = Object.entries(s.drinks[k] ?? {}).sort((a, b) => b[1] - a[1]);
  const entries = s.journal.filter((e) => e.date === k), td = s.tdone[k] ?? 0;
  const msg = hitOf(s, k) ? "Goal smashed!" : k === dk() ? `${fmtMl(goal - ml)} to go today` : ml ? `Got ${p}% of the way there` : "No drinks logged";
  return (
    <>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Mascot kind={hitOf(s, k) ? "panda" : "cat"} mood={md} style={{ width: 80, height: 100, flex: "none" }} />
        <div>
          <h2>{k2d(k).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h2>
          <div className="big" style={{ fontSize: 26 }}>{fmtMl(ml)} <span className="muted small">/ {goal.toLocaleString()}</span></div>
          <div className="muted small" style={{ fontWeight: 800 }}>{msg}</div>
        </div>
      </div>
      <h3 style={{ marginTop: 16 }}>Drinks</h3>
      {drinks.length ? drinks.map(([id, v]) => { const d = drinkById(id); return (
        <div className="dline" key={id}><span className="e" style={{ color: d.color }}><Icon icon={d.icon} size={22} /></span>{d.name}<span className="v">{fmtMl(v)}</span></div>
      ); }) : <div className="muted small">Nothing logged.</div>}
      <h3 style={{ marginTop: 16 }}>Journal &amp; to-dos</h3>
      <div className="dline"><span className="e" style={{ color: "#b48cf2" }}><Icon icon={BookOpen01Icon} size={22} /></span>
        {entries.length ? <>{entries.length} entr{entries.length === 1 ? "y" : "ies"}&nbsp;{entries.map((e) => e.mood != null && <span key={e.id} style={{ color: MOODS[e.mood].color }}><Icon icon={MOODS[e.mood].icon} size={18} /></span>)}</> : s.jdays[k] ? "Journaled" : "No entry"}
      </div>
      <div className="dline"><span className="e" style={{ color: "var(--mint)" }}><Icon icon={CheckmarkSquare02Icon} size={22} /></span>{td} to-do{td === 1 ? "" : "s"} finished</div>
      <button className="btn primary" style={{ width: "100%", marginTop: 14 }} onClick={close}>Close</button>
    </>
  );
}
export { DRINKS };
