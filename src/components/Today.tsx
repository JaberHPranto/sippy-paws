"use client";
import { useState } from "react";
import { Add01Icon, Undo02Icon, CoinsIcon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";
import { Bao } from "./Bao";
import { DRINKS, type DrinkId } from "@/lib/drinks";
import { actions, dayKey, effMl, levelInfo, useStore } from "@/lib/store";

export function Today() {
  const s = useStore();
  const [drink, setDrink] = useState<DrinkId>("water");
  const eff = effMl(s.drinks[dayKey()]);
  const pct = Math.min(100, Math.round((eff / s.goalMl) * 100));
  const { lvl, into, need } = levelInfo(s.xp);

  return (
    <div className="px-5 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">Hello,</p>
          <h1 className="font-display text-2xl font-semibold">{s.name}</h1>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-amber-600 shadow-sm">
          <Icon icon={CoinsIcon} size={18} /> {s.points}
        </span>
      </header>

      <section className="mt-4 flex flex-col items-center rounded-[2rem] bg-gradient-to-b from-[#d9f1e3] to-white p-5 shadow-sm">
        <Bao mood={pct < 25 ? "sad" : "happy"} size={120} className="bob" />
        <div className="relative mt-3 h-44 w-44 overflow-hidden rounded-full border-4 border-water/40 bg-water/10">
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-water-d to-water transition-all duration-700" style={{ height: `${pct}%` }} />
          <div className="absolute inset-0 grid place-items-center font-display text-4xl font-semibold">{pct}%</div>
        </div>
        <p className="mt-2 text-sm font-bold text-muted">{eff} / {s.goalMl} ml</p>
        <div className="mt-3 w-full">
          <div className="flex justify-between text-xs font-bold text-muted"><span>Bond level {lvl}</span><span>{into}/{need}</span></div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/5"><div className="h-full rounded-full bg-brand" style={{ width: `${(into / need) * 100}%` }} /></div>
        </div>
      </section>

      <section className="mt-4">
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {DRINKS.map((d) => (
            <button key={d.id} onClick={() => setDrink(d.id)}
              className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl px-3.5 py-2 text-xs font-bold transition ${drink === d.id ? "bg-white shadow-md ring-2 ring-brand" : "bg-white/60"}`}>
              <span style={{ color: d.color }}><Icon icon={d.icon} size={24} /></span>
              {d.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => actions.addDrink(drink, s.glassMl)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-water-d py-3.5 font-display text-lg text-white shadow-lg shadow-water/40 active:scale-[.98]">
            <Icon icon={Add01Icon} /> {s.glassMl} ml
          </button>
          <button onClick={actions.undoDrink} aria-label="Undo last drink" className="grid w-14 place-items-center rounded-full bg-white text-muted shadow-sm active:scale-95">
            <Icon icon={Undo02Icon} />
          </button>
        </div>
      </section>
    </div>
  );
}
