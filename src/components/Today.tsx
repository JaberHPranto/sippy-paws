"use client";
import { useEffect, useMemo, useState } from "react";
import { Add01Icon, Undo02Icon, FireIcon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";
import { Bao } from "./Bao";
import { DRINKS, type DrinkId } from "@/lib/drinks";

type Log = { id: DrinkId; ml: number; t: number }[];
const GOAL = 2000;
const KEY = "sippypaws.next.today";

export function Today({ name }: { name: string }) {
  const [log, setLog] = useState<Log>([]);
  const [drink, setDrink] = useState<DrinkId>("water");
  useEffect(() => { try { setLog(JSON.parse(localStorage.getItem(KEY) ?? "[]")); } catch {} }, []);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(log)); }, [log]);

  const eff = useMemo(
    () => Math.round(log.reduce((s, l) => s + l.ml * (DRINKS.find((d) => d.id === l.id)?.factor ?? 1), 0)),
    [log],
  );
  const pct = Math.min(100, Math.round((eff / GOAL) * 100));
  const mood = pct >= 100 ? "happy" : pct < 25 ? "sad" : "happy";

  return (
    <div className="px-5 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">Hello,</p>
          <h1 className="font-display text-2xl font-semibold">{name}</h1>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-orange-500 shadow-sm">
          <Icon icon={FireIcon} size={18} /> 1
        </span>
      </header>

      <section className="mt-4 flex flex-col items-center rounded-[2rem] bg-gradient-to-b from-[#d9f1e3] to-white p-5 shadow-sm">
        <Bao mood={mood} size={120} className="bob" />
        <div className="relative mt-3 h-44 w-44 overflow-hidden rounded-full border-4 border-water/40 bg-water/10">
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-water-d to-water transition-all duration-700" style={{ height: `${pct}%` }} />
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="font-display text-4xl font-semibold text-ink">{pct}%</div>
            </div>
          </div>
        </div>
        <p className="mt-2 text-sm font-bold text-muted">{eff} / {GOAL} ml</p>
      </section>

      <section className="mt-4">
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {DRINKS.map((d) => (
            <button
              key={d.id}
              onClick={() => setDrink(d.id)}
              className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl px-3.5 py-2 text-xs font-bold transition ${drink === d.id ? "bg-white shadow-md ring-2 ring-brand" : "bg-white/60"}`}
            >
              <Icon icon={d.icon} size={24} />
              <span style={{ color: d.color }} className="sr-only">{d.label}</span>
              {d.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setLog((l) => [...l, { id: drink, ml: 250, t: Date.now() }])}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-water-d py-3.5 font-display text-lg text-white shadow-lg shadow-water/40 active:scale-[.98]"
          >
            <Icon icon={Add01Icon} /> 250 ml
          </button>
          <button
            onClick={() => setLog((l) => l.slice(0, -1))}
            aria-label="Undo last drink"
            className="grid w-14 place-items-center rounded-full bg-white text-muted shadow-sm active:scale-95"
          >
            <Icon icon={Undo02Icon} />
          </button>
        </div>
      </section>
    </div>
  );
}
