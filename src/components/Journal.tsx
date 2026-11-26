"use client";
import { useMemo, useState } from "react";
import { Delete02Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";
import { MOODS } from "@/lib/moods";
import { actions, dayKey, useStore } from "@/lib/store";

const PROMPTS = ["What made you smile today?", "What's one thing you're proud of today, even a tiny one?", "How is your heart feeling right now?"];
const fmt = (d: string) => new Date(d + "T00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

export function Journal() {
  const s = useStore();
  const [mood, setMood] = useState(3);
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [mf, setMf] = useState<number | null>(null);
  const prompt = PROMPTS[new Date().getDate() % PROMPTS.length];

  const list = useMemo(
    () => s.journal.filter((e) => (mf === null || e.mood === mf) && (!q || e.text.toLowerCase().includes(q.toLowerCase()))),
    [s.journal, q, mf],
  );
  const week = useMemo(() => {
    const out: { k: string; avg: number | null }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); const k = dayKey(d);
      const m = s.journal.filter((e) => e.date === k).map((e) => e.mood);
      out.push({ k, avg: m.length ? m.reduce((a, b) => a + b, 0) / m.length : null });
    }
    return out;
  }, [s.journal]);
  const moods = s.journal.map((e) => e.mood);
  const avg = moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : null;

  return (
    <div className="px-5 pt-6">
      <h1 className="font-display text-2xl font-semibold">Journal</h1>
      <section className="mt-3 rounded-3xl bg-card p-4 shadow-sm">
        <p className="text-sm font-bold text-muted">{prompt}</p>
        <div className="mt-3 flex justify-between">
          {MOODS.map((m, i) => (
            <button key={m.label} onClick={() => setMood(i)} aria-label={m.label}
              className={`grid h-12 w-12 place-items-center rounded-2xl transition ${mood === i ? "scale-110 shadow-md ring-2" : "opacity-50"}`}
              style={{ color: m.color, background: m.color + "1f", ["--tw-ring-color" as string]: m.color }}>
              <Icon icon={m.icon} size={28} />
            </button>
          ))}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Write whatever is on your mind…"
          className="mt-3 w-full resize-none rounded-2xl bg-bg p-3 text-[15px] outline-none focus:ring-2 focus:ring-brand/40" />
        <button disabled={!text.trim()} onClick={() => { actions.saveEntry(mood, text.trim()); setText(""); }}
          className="mt-2 w-full rounded-full bg-brand py-3 font-display text-lg text-white shadow-lg shadow-brand/30 disabled:opacity-40">Save entry</button>
      </section>

      {s.journal.length > 0 && (
        <section className="mt-4 rounded-3xl bg-card p-4 shadow-sm">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg">Your mood</h2>
            {avg !== null && <span className="text-sm font-bold" style={{ color: MOODS[Math.round(avg)].color }}>Mostly {MOODS[Math.round(avg)].label.toLowerCase()}</span>}
          </div>
          <div className="mt-3 flex h-20 items-end gap-1">
            {week.map((d) => (
              <div key={d.k} className="flex-1 rounded-t-full" title={d.k}
                style={{ height: d.avg === null ? 6 : 10 + (d.avg / 4) * 70, background: d.avg === null ? "#e6efe9" : MOODS[Math.round(d.avg)].color }} />
            ))}
          </div>
          <p className="mt-1 text-[11px] text-muted">Last 14 days</p>
        </section>
      )}

      <section className="mt-4 rounded-3xl bg-card p-4 shadow-sm">
        <h2 className="font-display text-lg">All entries</h2>
        <label className="mt-2 flex items-center gap-2 rounded-2xl bg-bg px-3 py-2 text-muted"><Icon icon={Search01Icon} size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="w-full bg-transparent text-sm text-ink outline-none" />
        </label>
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
          {[null, ...MOODS.keys()].map((i) => (
            <button key={String(i)} onClick={() => setMf(i)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${mf === i ? "bg-brand text-white" : "bg-bg text-muted"}`}>
              {i === null ? "All" : MOODS[i].label}
            </button>
          ))}
        </div>
        <ul className="mt-3 space-y-2">
          {list.map((e) => (
            <li key={e.id} className="flex gap-3 rounded-2xl bg-bg p-3">
              <span style={{ color: MOODS[e.mood].color }}><Icon icon={MOODS[e.mood].icon} size={26} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-muted">{fmt(e.date)}</p>
                <p className="whitespace-pre-wrap break-words text-sm">{e.text}</p>
              </div>
              <button onClick={() => actions.deleteEntry(e.id)} aria-label="Delete entry" className="self-start text-muted"><Icon icon={Delete02Icon} size={18} /></button>
            </li>
          ))}
          {!list.length && <li className="py-4 text-center text-sm text-muted">{s.journal.length ? "Nothing matches." : "Your first entry will show up here."}</li>}
        </ul>
      </section>
    </div>
  );
}
