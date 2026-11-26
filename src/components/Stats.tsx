"use client";
import { useEffect, useRef, useState } from "react";
import { FireIcon, Award01Icon, PawPrintIcon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";
import { Ring } from "./Ring";
import { DaySheet } from "./DaySheet";
import { useModal } from "./Modal";
import { DAYS, drinkById } from "@/lib/data";
import { addDays, dk, fmtL, fmtMl, k2d } from "@/lib/dates";
import { bestStreak, hitOf, mlOf, pctOf, useStore, waterStreak, type State } from "@/lib/store";

const levelClass = (s: State, k: string) => { const p = pctOf(s, k); return p >= 1 ? "l5" : p >= 0.75 ? "l4" : p >= 0.5 ? "l3" : p >= 0.25 ? "l2" : p > 0 ? "l1" : ""; };

export function Stats() {
  const s = useStore(), { open } = useModal();
  const [range, setRange] = useState<7 | 30>(7);
  const [cal, setCal] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const heatRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const h = heatRef.current; if (h) h.scrollLeft = h.scrollWidth; }, []);
  const today = dk(), day = (k: string) => open(<DaySheet k={k} />);

  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, -i));
  const avg = last7.reduce((a, k) => a + mlOf(s, k), 0) / 7;
  const dim0 = k2d(today).getDate();
  let hitsMonth = 0; for (let i = 0; i < dim0; i++) if (hitOf(s, addDays(today, -i))) hitsMonth++;
  const last30 = Array.from({ length: 30 }, (_, i) => addDays(today, -i));
  const total30 = last30.reduce((a, k) => a + mlOf(s, k), 0);
  const jd30 = Object.keys(s.jdays).filter((k) => k >= addDays(today, -29)).length;
  const td30 = last30.reduce((a, k) => a + (s.tdone[k] ?? 0), 0);

  // bar chart
  const keys = Array.from({ length: range }, (_, i) => addDays(today, i - range + 1));
  const W = 340, H = 170, pad = { l: 30, r: 6, t: 14, b: 24 }, goal = s.settings.goalMl;
  const maxV = Math.max(goal * 1.2, ...keys.map((k) => mlOf(s, k)));
  const bw = (W - pad.l - pad.r) / keys.length, y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / maxV);

  // heatmap
  const weeks = 20, start = addDays(today, -k2d(today).getDay() - (weeks - 1) * 7);
  let lastMonth = -1;

  // calendar
  const nowM = new Date(), isNow = cal.getFullYear() === nowM.getFullYear() && cal.getMonth() === nowM.getMonth();
  const firstKey = dk(cal), dim = new Date(cal.getFullYear(), cal.getMonth() + 1, 0).getDate();

  // mix
  const mix: Record<string, number> = {};
  last7.forEach((k) => Object.entries(s.drinks[k] ?? {}).forEach(([id, v]) => { mix[id] = (mix[id] ?? 0) + v; }));
  const entries = Object.entries(mix).sort((a, b) => b[1] - a[1]), mx = entries.length ? entries[0][1] : 1;

  return (
    <section className="view">
      <div className="card"><div className="stats">
        <div className="stat"><small>Daily average (7d)</small><b>{fmtL(avg)}</b> <em>/ {fmtL(goal)}</em></div>
        <div className="stat"><small>Goal days this month</small><b>{hitsMonth}</b> <em>/ {dim0}</em></div>
        <div className="stat"><small>Current streak</small><b><span style={{ color: "#e2711d" }}><Icon icon={FireIcon} size={22} stroke={2} /></span> {waterStreak(s)}</b> <em>days</em></div>
        <div className="stat"><small>Best streak</small><b><span style={{ color: "#e5a400" }}><Icon icon={Award01Icon} size={22} stroke={2} /></span> {bestStreak(s)}</b> <em>days</em></div>
        <div className="stat" style={{ gridColumn: "1/-1" }}><small>Last 30 days</small><b>{fmtL(total30)}</b> <em>sipped · {jd30} journal days · {td30} to-dos done</em></div>
      </div></div>

      <div className="card chart">
        <div className="card-h"><h3>Hydration</h3><div className="seg">
          <button className={range === 7 ? "on" : ""} onClick={() => setRange(7)}>Week</button>
          <button className={range === 30 ? "on" : ""} onClick={() => setRange(30)}>Month</button>
        </div></div>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Daily hydration chart">
          {[0, goal / 2, goal].map((v) => (
            <g key={v}><text x={pad.l - 4} y={y(v) + 3} textAnchor="end" fontSize="9" fontWeight="800" fill="#8c7f89">{(v / 1000).toFixed(1)}L</text>
              <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#f1e4e8" /></g>
          ))}
          {keys.map((k, i) => {
            const v = mlOf(s, k), x = pad.l + i * bw + bw * 0.18, w = bw * 0.64, top = y(v), hit = hitOf(s, k);
            const lbl = range === 7 ? DAYS[k2d(k).getDay()] : k2d(k).getDate() % 5 === 1 || k === today ? k2d(k).getDate() : "";
            return (
              <g key={k} onClick={() => day(k)} style={{ cursor: "pointer" }}>
                <rect x={pad.l + i * bw} y={pad.t} width={bw} height={H - pad.t - pad.b} fill="transparent" />
                {v ? <rect x={x} y={top} width={w} height={H - pad.b - top} rx={Math.min(6, w / 2)} fill={hit ? "#ff8fa3" : "#8fd3ff"} />
                  : <rect x={x} y={H - pad.b - 3} width={w} height={3} rx={1.5} fill="#efe4ea" />}
                {range === 7 && hit && <circle cx={x + w / 2} cy={top - 6} r={3.5} fill="#ff8fa3" />}
                <text x={pad.l + i * bw + bw / 2} y={H - 8} textAnchor="middle" fontSize="10" fontWeight="800" fill={k === today ? "#3d2f3b" : "#8c7f89"}>{lbl}</text>
              </g>
            );
          })}
          <line x1={pad.l} x2={W - pad.r} y1={y(goal)} y2={y(goal)} stroke="#ff8fa3" strokeWidth="1.5" strokeDasharray="4 3" />
          <text x={W - pad.r} y={y(goal) - 4} textAnchor="end" fontSize="9" fontWeight="800" fill="#ff8fa3">goal</text>
        </svg>
      </div>

      <div className="card">
        <div className="card-h"><h3>Hydration heatmap</h3><span className="muted small" style={{ fontWeight: 800 }}>last 20 weeks</span></div>
        <div className="heat-wrap" ref={heatRef}><div className="heat">
          <div className="dl"><span /><span>Mon</span><span /><span>Wed</span><span /><span>Fri</span><span /></div>
          {Array.from({ length: weeks }, (_, w) => {
            const first = addDays(start, w * 7), m = k2d(first).getMonth();
            const mo = m !== lastMonth ? k2d(first).toLocaleDateString(undefined, { month: "short" }) : ""; lastMonth = m;
            return (
              <div className="hcol" key={w}><div className="mo">{mo}</div>
                {Array.from({ length: 7 }, (_, d) => { const k = addDays(first, d);
                  return k > today ? <span key={d} className="hc fut" />
                    : <button key={d} className={`hc ${levelClass(s, k)} ${k === today ? "today" : ""}`} title={`${k}: ${fmtMl(mlOf(s, k))}`} aria-label={k} onClick={() => day(k)} />; })}
              </div>
            );
          })}
        </div></div>
        <div className="legend">Less <span className="hc" /><span className="hc l1" /><span className="hc l2" /><span className="hc l3" /><span className="hc l4" /> More · <span className="hc l5" /> Goal hit!</div>
      </div>

      <div className="card">
        <div className="card-h"><h3>{cal.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h3><div className="cal-nav">
          <button aria-label="Previous month" onClick={() => setCal(new Date(cal.getFullYear(), cal.getMonth() - 1, 1))}>‹</button>
          <button aria-label="Next month" disabled={isNow} onClick={() => setCal(new Date(cal.getFullYear(), cal.getMonth() + 1, 1))}>›</button>
        </div></div>
        <div className="cal">
          {DAYS.map((d) => <div key={d} className="dh">{d[0]}</div>)}
          {Array.from({ length: cal.getDay() }, (_, i) => <div key={"b" + i} />)}
          {Array.from({ length: dim }, (_, i) => {
            const k = addDays(firstKey, i), fut = k > today, td = s.tdone[k] ?? 0, jd = !!s.jdays[k] || s.journal.some((e) => e.date === k);
            return (
              <button key={k} className={`cd ${k === today ? "today" : ""} ${fut ? "fut" : ""}`} disabled={fut} onClick={() => day(k)}>
                <Ring s={s} k={k} label={i + 1} />
                {hitOf(s, k) && <span className="paw"><Icon icon={PawPrintIcon} size={13} stroke={2.2} /></span>}
                <span className="dots">{jd && <i className="j" />}{td > 0 && <i />}</span>
              </button>
            );
          })}
        </div>
        <div className="legend"><span style={{ color: "var(--pink)" }}><Icon icon={PawPrintIcon} size={12} stroke={2.2} /></span> goal hit · <i style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#b48cf2" }} /> journaled · <i style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--mint)" }} /> to-dos done</div>
      </div>

      <div className="card">
        <div className="card-h"><h3>Drink mix</h3><span className="muted small" style={{ fontWeight: 800 }}>last 7 days</span></div>
        <div className="mix">
          {entries.length ? entries.map(([id, v]) => { const d = drinkById(id); return (
            <div className="mixrow" key={id}><span className="e" style={{ color: d.color }}><Icon icon={d.icon} size={20} /></span><span className="nm">{d.name}</span>
              <span className="tr"><i style={{ width: `${Math.max(4, (v / mx) * 100)}%`, background: d.color }} /></span><span className="v">{fmtL(v)}</span></div>
          ); }) : <div className="empty">No drinks logged this week yet</div>}
        </div>
      </div>
    </section>
  );
}
