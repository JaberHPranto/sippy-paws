"use client";
import { useEffect, useRef, useState } from "react";
import { FireIcon, Leaf01Icon, GlassWaterIcon, DropletIcon } from "@hugeicons/core-free-icons";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "./Icon";
import { CountUp } from "./CountUp";
import { Mascot } from "./Mascot";
import { Ring } from "./Ring";
import { DaySheet } from "./DaySheet";
import { useModal } from "./Modal";
import { DAYS, DRINKS, TIPS } from "@/lib/data";
import { addDays, dk, fmtL, fmtMl, k2d } from "@/lib/dates";
import { defaultLine, moodNow, POKES } from "@/lib/mood";
import { actions, goalOf, journalStreak, levelInfo, mlOf, say, useFx, useStore, waterStreak, who } from "@/lib/store";

export function Today({ go }: { go: (t: "overview") => void }) {
  const s = useStore(), fx = useFx(), { open, close } = useModal();
  const k = dk(), goal = goalOf(s, k), ml = mlOf(s, k), md = moodNow(s), L = levelInfo(s.xp);
  const [seed] = useState(() => Math.floor(Math.random() * 100));
  const [pop, setPop] = useState<string | null>(null);
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 30000); return () => clearInterval(t); }, []);

  const sun = addDays(k, -k2d(k).getDay());
  const pct = Math.round((ml / goal) * 100);
  const ws = waterStreak(s), js = journalStreak(s);
  const done = s.todos.filter((t) => t.done).length;
  const tip = TIPS[Math.floor(k2d(k).getTime() / 864e5) % TIPS.length];
  const canUndo = s.undo.some((u) => u.date === k);

  const drink = (id: string, amount: number) => { actions.addDrink(id, amount); setPop(id); setTimeout(() => setPop(null), 450); };
  const pokeLine = (kind: "panda" | "cat") => { const a = POKES[kind]; say(`${who(s, kind === "panda" ? "P" : "C")} ${a[Math.floor(Math.random() * a.length)]}`, 3500); };

  return (
    <section className="view">
      <div className={`card stage ${md}`}>
        <div className="mascots">
          <Mascot kind="panda" mood={md} id="mPanda" onPoke={() => pokeLine("panda")} />
          <Mascot kind="cat" mood={md} id="mCat" onPoke={() => pokeLine("cat")} />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={fx.say ?? "default"} className="bubble" initial={{ opacity: 0, scale: 0.92, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 520, damping: 28 }} dangerouslySetInnerHTML={{ __html: fx.say ?? defaultLine(s, seed) }} />
        </AnimatePresence>
        <div className="lvl"><span>Lv {L.lvl}</span><div className="bar"><i style={{ transition: "width .7s cubic-bezier(.3,1.4,.5,1)", width: `${Math.round((L.into / L.need) * 100)}%` }} /></div><span className="muted">{L.need - L.into} to go</span></div>
      </div>

      <div className="card">
        <div className="card-h"><h3>Today, {new Date().toLocaleDateString(undefined, { day: "numeric", month: "long" })}</h3><button className="link" onClick={() => go("overview")}>Calendar ›</button></div>
        <div className="week">
          {DAYS.map((name, i) => { const d = addDays(sun, i), fut = d > k; return (
            <button key={d} className={`wd ${d === k ? "today" : ""} ${fut ? "future" : ""}`} disabled={fut} onClick={() => open(<DaySheet k={d} />)}>
              {name}<Ring s={s} k={d} label={k2d(d).getDate()} />
            </button>
          ); })}
        </div>
      </div>

      <div className="card">
        <div className="target">
          <div className={`orb ${ml >= goal ? "done" : ""}`}>
            <div className="fill" style={{ height: `${Math.min(100, pct)}%` }} />
            <div className="orb-txt"><b><CountUp value={ml} /></b><span>of {goal.toLocaleString()} ml</span></div>
          </div>
          <div className="t-info">
            <div className="muted small" style={{ fontWeight: 800 }}>Daily target</div>
            <div className="big"><CountUp value={pct} suffix="%" /></div>
            <div className="muted small">{ml >= goal ? "Goal complete!" : `${fmtMl(goal - ml)} left today`}</div>
            <div className="streak"><Icon icon={FireIcon} size={16} stroke={2} />{ws ? `${ws}-day streak` : "Hit your goal to start a streak"}</div>
          </div>
        </div>
        <div className="btns">
          <motion.button whileTap={{ scale: 0.96 }} className="btn primary" onClick={() => drink("water", s.settings.waterMl)}><Icon icon={DropletIcon} size={18} stroke={2} />Drink {s.settings.waterMl} ml water</motion.button>
          <button className="btn ghost" disabled={!canUndo} onClick={actions.undo}>Undo</button>
        </div>
      </div>

      <div className="card">
        <h3>What are you sipping?</h3>
        <div className="drinks">
          {DRINKS.map((d) => (
            <motion.button whileTap={{ scale: 0.9 }} key={d.id} className={`drink ${pop === d.id ? "pop" : ""}`} style={{ ["--c" as string]: d.color }} onClick={() => drink(d.id, d.ml)}>
              <span className="ic"><Icon icon={d.icon} size={28} stroke={1.8} /></span><span className="nm">{d.name}</span><span className="ml">{d.ml} ml</span>
            </motion.button>
          ))}
          <button className="drink custom" style={{ ["--c" as string]: "#8c7f89" }} onClick={() => open(<CustomDrink onDone={close} />)}>
            <span className="ic"><Icon icon={GlassWaterIcon} size={28} /></span><span className="nm">Custom</span><span className="ml">any amount</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="tip"><div className="ti"><Icon icon={Leaf01Icon} size={24} /></div><div><b>Tip of the day</b><p>{tip}</p></div></div>
      </div>

      <div className="card">
        <h3>Today at a glance</h3>
        <div className="glance">
          <div className="g"><b>{fmtL(ml)}</b><small>hydrated</small></div>
          <div className="g"><b>{s.jdays[k] ? "✓" : "–"}</b><small>journal{js ? ` · ${js}d` : ""}</small></div>
          <div className="g"><b>{done}/{s.todos.length}</b><small>to-dos</small></div>
        </div>
      </div>
    </section>
  );
}

function CustomDrink({ onDone }: { onDone: () => void }) {
  const [id, setId] = useState("water"), [ml, setMl] = useState(200);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <h2>Log a drink</h2>
      <div className="chips">{DRINKS.map((d) => <button key={d.id} className={id === d.id ? "sel" : ""} onClick={() => setId(d.id)}>{d.name}</button>)}</div>
      <label className="field">Amount (ml)<input ref={ref} type="number" min={10} max={2000} value={ml} onChange={(e) => setMl(+e.target.value)} /></label>
      <div className="btns"><button className="btn ghost" onClick={onDone}>Cancel</button><button className="btn primary" onClick={() => { actions.addDrink(id, ml); onDone(); }}>Add</button></div>
    </>
  );
}
