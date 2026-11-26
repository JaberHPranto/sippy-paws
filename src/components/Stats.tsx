"use client";
import { useMemo } from "react";
import { dayKey, effMl, useStore } from "@/lib/store";

export function Stats() {
  const s = useStore();
  const days = useMemo(() => {
    const out: { k: string; ml: number; d: Date }[] = [];
    for (let i = 83; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = dayKey(d); out.push({ k, d, ml: effMl(s.drinks[k]) }); }
    return out;
  }, [s.drinks]);
  const week = days.slice(-7);
  const max = Math.max(s.goalMl, ...week.map((d) => d.ml));
  const hit = days.filter((d) => d.ml >= s.goalMl).length;
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) { if (days[i].ml >= s.goalMl) streak++; else if (i !== days.length - 1) break; }
  const shade = (ml: number) => (ml <= 0 ? "#e3ece6" : ml >= s.goalMl ? "#2f9bd0" : ml >= s.goalMl * 0.5 ? "#7cc9ec" : "#bfe4f5");

  return (
    <div className="px-5 pt-6">
      <h1 className="font-display text-2xl font-semibold">Stats</h1>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[["Streak", streak], ["Goals hit", hit], ["Today", effMl(s.drinks[dayKey()])]].map(([l, v]) => (
          <div key={l} className="rounded-2xl bg-card p-3 shadow-sm"><div className="font-display text-2xl font-semibold">{v}</div><div className="text-xs font-bold text-muted">{l}{l === "Today" ? " ml" : ""}</div></div>
        ))}
      </div>
      <section className="mt-4 rounded-3xl bg-card p-4 shadow-sm">
        <h2 className="font-display text-lg">This week</h2>
        <div className="mt-3 flex h-36 items-end gap-2">
          {week.map((d) => (
            <div key={d.k} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full rounded-t-xl bg-gradient-to-t from-water-d to-water" style={{ height: Math.max(4, (d.ml / max) * 120) }} />
              <span className="text-[11px] font-bold text-muted">{d.d.toLocaleDateString(undefined, { weekday: "narrow" })}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-4 rounded-3xl bg-card p-4 shadow-sm">
        <h2 className="font-display text-lg">Last 12 weeks</h2>
        <div className="mt-3 grid grid-flow-col grid-rows-7 gap-1" style={{ gridTemplateColumns: "repeat(12, 1fr)" }}>
          {days.map((d) => <div key={d.k} title={`${d.k}: ${d.ml} ml`} className="aspect-square rounded-[5px]" style={{ background: shade(d.ml) }} />)}
        </div>
      </section>
    </div>
  );
}
