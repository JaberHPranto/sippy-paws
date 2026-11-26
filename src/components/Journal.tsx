"use client";
import { useMemo, useState } from "react";
import { Delete02Icon, DropletIcon, Calendar03Icon, Sun03Icon, CloudRainIcon, QuillWrite01Icon, Note01Icon, BubbleChatFavouriteIcon, FireIcon, PencilEdit02Icon, CheckmarkSquare02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";
import { Mascot } from "./Mascot";
import { useModal } from "./Modal";
import { DAYS, MOODS, MOOD_FILL, PROMPTS } from "@/lib/data";
import { addDays, dk, fmtDate, fmtMl, fmtTime, k2d, pick } from "@/lib/dates";
import { actions, hitOf, journalStreak, mlOf, useStore, who, type Entry, type State } from "@/lib/store";
import type { Mood } from "@/lib/mood";

const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
const mi = (v: number) => Math.max(0, Math.min(4, Math.round(v)));
const MoodIc = ({ v, size = 22 }: { v: number; size?: number }) => <span style={{ color: MOODS[mi(v)].color, display: "inline-grid" }}><Icon icon={MOODS[mi(v)].icon} size={size} /></span>;
type Range = 7 | 30 | 90 | "all";

function dayMoods(J: Entry[]) {
  const m: Record<string, number[]> = {};
  for (const e of J) if (e.mood != null) (m[e.date] ||= []).push(e.mood);
  return Object.fromEntries(Object.entries(m).map(([k, a]) => [k, avg(a)!]));
}

export function Journal() {
  const s = useStore(), J = s.journal, { open } = useModal();
  const [mood, setMood] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [prompt, setPrompt] = useState(() => pick(PROMPTS));
  const [range, setRange] = useState<Range>(30);
  const [q, setQ] = useState(""), [mf, setMf] = useState<string>("all");
  const [cal, setCal] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [memSeed, setMemSeed] = useState(0);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const today = dk(), dm = useMemo(() => dayMoods(J), [J]);
  const miniMood: Mood = mood === null ? "normal" : mood <= 1 ? "sad" : mood >= 4 ? "ecstatic" : "happy";

  const start = range !== "all" ? addDays(today, -(range - 1)) : (() => { const f = J.length ? J[J.length - 1].date : today; return f > addDays(today, -364) ? f : addDays(today, -364); })();
  const inR = J.filter((e) => e.date >= start), moods = inR.map((e) => e.mood).filter((v): v is number => v != null);
  const a = avg(moods), counts = [0, 0, 0, 0, 0]; moods.forEach((v) => counts[v]++);
  const daysJ = new Set(inR.map((e) => e.date)).size, js = journalStreak(s);
  const recent = J.filter((e) => e.date >= addDays(today, -6)).map((e) => e.mood).filter((v): v is number => v != null);
  const heavy = recent.length >= 4 && (avg(recent) ?? 5) <= 1.2;
  const ins = insights(s, dm, start, range);

  const save = () => { if (!text.trim() && mood === null) return; actions.saveEntry(mood, text.trim(), prompt); setText(""); setMood(null); setPrompt(pick(PROMPTS)); };
  const openDay = (k: string) => open(<JournalDay k={k} />);

  // memory
  const mem = useMemo(() => {
    const md = today.slice(5), d = today.slice(8);
    const old = J.filter((e) => e.date <= addDays(today, -3) && (e.text || e.mood != null));
    if (!old.length) return null;
    const on = old.filter((e) => e.date.slice(5) === md || e.date.slice(8) === d), pool = on.length ? on : old;
    const e = pool[(memSeed + 7) % pool.length], ago = Math.round((k2d(today).getTime() - k2d(e.date).getTime()) / 864e5);
    const when = e.date.slice(5) === md ? `On this day, ${Math.max(1, Math.round(ago / 365))} year${Math.round(ago / 365) > 1 ? "s" : ""} ago`
      : e.date.slice(8) === d ? `On this day, ${Math.round(ago / 30.4)} month${Math.round(ago / 30.4) > 1 ? "s" : ""} ago` : `${ago} days ago`;
    return { e, when };
  }, [J, memSeed, today]);

  // entries
  const ql = q.trim().toLowerCase();
  let list = J;
  if (mf !== "all") list = list.filter((e) => String(e.mood) === mf);
  if (ql) list = list.filter((e) => `${e.text} ${e.prompt ?? ""}`.toLowerCase().includes(ql));
  const groups: { m: string; items: Entry[] }[] = [];
  for (const e of list) { const m = e.date.slice(0, 7); if (!groups.length || groups[groups.length - 1].m !== m) groups.push({ m, items: [] }); groups[groups.length - 1].items.push(e); }

  // calendar
  const first = dk(cal), dim = new Date(cal.getFullYear(), cal.getMonth() + 1, 0).getDate();
  const nowM = new Date(), isNow = cal.getFullYear() === nowM.getFullYear() && cal.getMonth() === nowM.getMonth();
  const monthMoods = Object.entries(dm).filter(([k]) => k.slice(0, 7) === first.slice(0, 7)).map(([, v]) => v);

  return (
    <section className="view">
      <div className="card">
        <div className="prompt-row"><Mascot kind="cat" mood={miniMood} className="mini" /><div className="bubble" dangerouslySetInnerHTML={{ __html: `${who(s, "C")} ${prompt.replace(/</g, "&lt;")}` }} /></div>
        <button className="link" onClick={() => setPrompt(pick(PROMPTS.filter((p) => p !== prompt)))}>Ask me something else ↻</button>
        <div className="moods">
          {MOODS.map((m, i) => (
            <button key={m.label} type="button" className={mood === i ? "sel" : ""} style={{ ["--c" as string]: m.color }} aria-label={m.label} onClick={() => setMood(mood === i ? null : i)}>
              <Icon icon={m.icon} size={30} stroke={1.8} />
            </button>
          ))}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write anything… this is just for you." />
        <button className="btn primary" style={{ width: "100%" }} onClick={save}><Icon icon={QuillWrite01Icon} size={18} stroke={2} />Save entry</button>
      </div>

      <div className="card">
        <div className="card-h"><h3>How you&apos;ve been feeling</h3><div className="seg">
          {([[7, "7d"], [30, "30d"], [90, "90d"], ["all", "All"]] as [Range, string][]).map(([v, l]) => <button key={l} className={range === v ? "on" : ""} onClick={() => setRange(v)}>{l}</button>)}
        </div></div>
        {moods.length && a !== null ? <>
          <div className="mood-hero">
            <div className="mh-face" style={{ background: MOOD_FILL[mi(a)] + "33" }}><MoodIc v={a} size={36} /></div>
            <div style={{ flex: 1 }}><div className="muted small" style={{ fontWeight: 800 }}>Mostly</div><div className="big" style={{ fontSize: 26 }}>{MOODS[mi(a)].label}</div>
              <div className="muted small" style={{ fontWeight: 700 }}>{inR.length} entr{inR.length === 1 ? "y" : "ies"} · {daysJ} day{daysJ === 1 ? "" : "s"} journaled{js ? ` · ${js}-day streak` : ""}</div></div>
          </div>
          <div className="mood-chart"><MoodChart dm={dm} start={start} range={range} onDay={openDay} /></div>
          <div className="mix-bar">{counts.map((c, i) => c ? <i key={i} style={{ flex: c, background: MOOD_FILL[i] }} title={MOODS[i].label} /> : null)}</div>
          <div className="mix-legend">{counts.map((c, i) => <span key={i} className={c ? "" : "dim"} style={{ display: "flex", alignItems: "center", gap: 3 }}><MoodIc v={i} size={15} />{Math.round((c / moods.length) * 100)}%</span>)}</div>
          {heavy && <div className="care"><div className="mini-face"><Mascot kind="cat" mood="sad" className="mini" /></div><div><b>{s.settings.catName}:</b> Lots of heavy days lately… be gentle with yourself, {s.settings.name}. Maybe share a little of it with someone you trust?</div></div>}
          {ins.length ? <div className="insights">{ins.map(([ic, t], i) => <div className="ins" key={i}><span><Icon icon={ic} size={20} /></span><p dangerouslySetInnerHTML={{ __html: t }} /></div>)}</div>
            : <p className="muted small" style={{ margin: "10px 0 0" }}>Keep picking a mood when you write. Patterns show up after a few more entries.</p>}
        </> : <div className="empty">Pick a mood when you write, and your mood story will start showing up here</div>}
      </div>

      {mem && (
        <div className="card">
          <div className="card-h"><h3 style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "var(--pink)" }}><Icon icon={BubbleChatFavouriteIcon} size={20} /></span>A memory</h3><span className="tag">{mem.when}</span></div>
          <div className="memory" style={{ borderColor: mem.e.mood != null ? MOOD_FILL[mem.e.mood] : "var(--line)" }}>
            <div className="mem-m">{mem.e.mood != null ? <MoodIc v={mem.e.mood} size={30} /> : <Icon icon={Note01Icon} size={30} />}</div>
            <div style={{ flex: 1, minWidth: 0 }}>{mem.e.prompt && <div className="q">{mem.e.prompt}</div>}
              <p>{(mem.e.text || "(just a mood, no words)").slice(0, 220)}{mem.e.text.length > 220 ? "…" : ""}</p><div className="muted small" style={{ fontWeight: 800 }}>{fmtDate(mem.e.ts)}</div></div>
          </div>
          <div className="btns" style={{ marginTop: 10 }}><button className="btn ghost nw" style={{ flex: 1 }} onClick={() => setMemSeed((n) => n + 1)}>Another memory ↻</button><button className="btn ghost nw" style={{ flex: 1 }} onClick={() => openDay(mem.e.date)}>Open that day</button></div>
        </div>
      )}

      <div className="card">
        <div className="card-h"><h3>{cal.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h3><div className="cal-nav">
          <button aria-label="Previous month" onClick={() => setCal(new Date(cal.getFullYear(), cal.getMonth() - 1, 1))}>‹</button>
          <button aria-label="Next month" disabled={isNow} onClick={() => setCal(new Date(cal.getFullYear(), cal.getMonth() + 1, 1))}>›</button>
        </div></div>
        <div className="mcal">
          {DAYS.map((d) => <div key={d} className="dh">{d[0]}</div>)}
          {Array.from({ length: cal.getDay() }, (_, i) => <div key={"b" + i} />)}
          {Array.from({ length: dim }, (_, i) => {
            const k = addDays(first, i), has = J.some((e) => e.date === k), v = dm[k], fut = k > today;
            return (
              <button key={k} className={`mcell ${k === today ? "today" : ""} ${fut ? "fut" : ""}`} disabled={!has} onClick={() => openDay(k)}
                style={v !== undefined ? { background: MOOD_FILL[mi(v)] } : has ? { background: "#efe6ea" } : undefined}>
                <span className="mc-n">{i + 1}</span>{v !== undefined ? <span className="mc-e"><Icon icon={MOODS[mi(v)].icon} size={18} /></span> : has ? <span className="mc-e"><Icon icon={Note01Icon} size={16} /></span> : null}
              </button>
            );
          })}
        </div>
        <div className="legend" style={{ justifyContent: "space-between" }}>{MOODS.map((m, i) => <span key={i}><i className="lg" style={{ background: MOOD_FILL[i] }} />{m.label}</span>)}</div>
        {monthMoods.length > 0 && <p className="muted small" style={{ margin: "8px 0 0", fontWeight: 700 }}>This month: mostly {MOODS[mi(avg(monthMoods)!)].label.toLowerCase()} across {monthMoods.length} day{monthMoods.length === 1 ? "" : "s"}.</p>}
      </div>

      <div className="card">
        <div className="card-h"><h3>All entries</h3><span className="tag">{list.length} of {J.length}</span></div>
        <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your entries…" style={{ width: "100%" }} />
        <div className="filters" style={{ marginTop: 8 }}>
          <button className={mf === "all" ? "on" : ""} onClick={() => setMf("all")}>All</button>
          {MOODS.map((m, i) => <button key={i} className={mf === String(i) ? "on" : ""} onClick={() => setMf(String(i))} style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon icon={m.icon} size={14} stroke={2} />{m.label}</button>)}
        </div>
        {!J.length ? <div className="empty">No entries yet. {s.settings.pandaName} is ready to listen</div>
          : !list.length ? <div className="empty">Nothing matches. Try another word or mood</div>
          : groups.map((g) => {
            const c = [0, 0, 0, 0, 0]; g.items.forEach((e) => { if (e.mood != null) c[e.mood]++; });
            return (
              <div className="mgroup" key={g.m}>
                <div className="mg-h"><b>{k2d(g.m + "-01").toLocaleDateString(undefined, { month: "long", year: "numeric" })}</b><span className="muted small">{g.items.length} entr{g.items.length === 1 ? "y" : "ies"}</span>
                  <div className="mix-bar thin">{c.map((n, i) => n ? <i key={i} style={{ flex: n, background: MOOD_FILL[i] }} /> : null)}</div></div>
                {g.items.map((e) => {
                  const long = e.text.length > 260, op = openIds.has(e.id);
                  return (
                    <div key={e.id} className={`entry jentry ${long && !op ? "clamp" : ""}`} style={{ borderLeftColor: e.mood != null ? MOOD_FILL[e.mood] : "var(--line)" }}>
                      <div className="h"><span className="mood" style={{ ["--c" as string]: e.mood != null ? MOODS[e.mood].color : "var(--muted)" }}><Icon icon={e.mood != null ? MOODS[e.mood].icon : Note01Icon} size={22} /></span>
                        <span>{e.mood != null && <><b style={{ color: "var(--ink)" }}>{MOODS[e.mood].label}</b> · </>}{fmtDate(e.ts)} · {fmtTime(e.ts)}</span>
                        <button className="x" aria-label="Delete" onClick={() => { if (confirm("Delete this entry?")) actions.deleteEntry(e.id); }}><Icon icon={Delete02Icon} size={18} /></button></div>
                      {e.prompt && <div className="q"><Hl s={e.prompt} q={q.trim()} /></div>}
                      {e.text && <p><Hl s={e.text} q={q.trim()} /></p>}
                      {long && <button className="link" onClick={() => setOpenIds((o) => { const n = new Set(o); if (n.has(e.id)) n.delete(e.id); else n.add(e.id); return n; })}>{op ? "Show less" : "Read more"}</button>}
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>
    </section>
  );
}

function Hl({ s, q }: { s: string; q: string }) {
  if (!q) return <>{s}</>;
  const i = s.toLowerCase().indexOf(q.toLowerCase());
  return i < 0 ? <>{s}</> : <>{s.slice(0, i)}<mark>{s.slice(i, i + q.length)}</mark>{s.slice(i + q.length)}</>;
}

function MoodChart({ dm, start, range, onDay }: { dm: Record<string, number>; start: string; range: Range; onDay: (k: string) => void }) {
  const today = dk(), days: string[] = []; for (let k = start; k <= today; k = addDays(k, 1)) days.push(k);
  const W = 340, H = 150, pad = { l: 28, r: 8, t: 10, b: 22 }, n = Math.max(1, days.length - 1);
  const x = (i: number) => pad.l + ((W - pad.l - pad.r) * i) / n, y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / 4);
  const pts = days.map((k, i) => (dm[k] !== undefined ? { k, i, v: dm[k] } : null)).filter((p): p is { k: string; i: number; v: number } => !!p);
  const win = range === 7 ? 1 : range === 30 ? 3 : 5;
  const sm = pts.map((p, j) => ({ ...p, s: avg(pts.slice(Math.max(0, j - win + 1), j + 1).map((q) => q.v))! }));
  const path = sm.length > 1 ? sm.map((p, j) => `${j ? "L" : "M"}${x(p.i).toFixed(1)} ${y(p.s).toFixed(1)}`).join(" ") : "";
  const area = path ? `${path} L${x(sm[sm.length - 1].i).toFixed(1)} ${H - pad.b} L${x(sm[0].i).toFixed(1)} ${H - pad.b} Z` : "";
  const ticks = [0, Math.floor(n / 2), n].filter((v, i, a) => a.indexOf(v) === i);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mood over time">
      <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff8fa3" stopOpacity=".28" /><stop offset="1" stopColor="#8fa8d8" stopOpacity=".04" /></linearGradient></defs>
      {[0, 1, 2, 3, 4].map((v) => <g key={v}><line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#f3eaee" /><circle cx={pad.l - 10} cy={y(v)} r={5} fill={MOOD_FILL[v]} /></g>)}
      {area && <path d={area} fill="url(#mg)" />}
      {path && <path d={path} fill="none" stroke="#ff8fa3" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
      {pts.map((p) => <circle key={p.k} cx={x(p.i)} cy={y(p.v)} r={days.length > 60 ? 3 : 4.5} fill={MOOD_FILL[mi(p.v)]} stroke="#fff" strokeWidth="1.5" style={{ cursor: "pointer" }} onClick={() => onDay(p.k)} />)}
      {ticks.map((i) => <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === n ? "end" : "middle"} fontSize="10" fontWeight="800" fill="#8c7f89">{k2d(days[i]).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</text>)}
    </svg>
  );
}

type Ins = [Parameters<typeof Icon>[0]["icon"], string];
function insights(s: State, dm: Record<string, number>, start: string, range: Range): Ins[] {
  const out: Ins[] = [], inRange = Object.entries(dm).filter(([k]) => k >= start), word = (v: number) => MOODS[mi(v)].label.toLowerCase();
  const hitM = inRange.filter(([k]) => hitOf(s, k)).map(([, v]) => v), missM = inRange.filter(([k]) => !hitOf(s, k)).map(([, v]) => v);
  if (hitM.length >= 3 && missM.length >= 3) {
    const a = avg(hitM)!, b = avg(missM)!;
    if (a - b >= 0.3) out.push([DropletIcon, `On days you hit your water goal, you felt <b>${word(a)}</b> on average, compared with ${word(b)} on other days.`]);
    else if (b - a >= 0.3) out.push([DropletIcon, "Water goal or not, your mood held up. Busy days still had good moments."]);
  }
  const wd: Record<number, number[]> = {}; inRange.forEach(([k, v]) => (wd[k2d(k).getDay()] ||= []).push(v));
  const wds = Object.entries(wd).filter(([, a]) => a.length >= 2).map(([d, a]) => [+d, avg(a)!] as [number, number]).sort((p, q) => q[1] - p[1]);
  if (wds.length >= 3 && wds[0][1] - wds[wds.length - 1][1] >= 0.5) out.push([Calendar03Icon, `<b>${["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"][wds[0][0]]}</b> tend to be your brightest days.`]);
  if (range !== "all") {
    const prevStart = addDays(start, -range), prev = Object.entries(dm).filter(([k]) => k >= prevStart && k < start).map(([, v]) => v), cur = inRange.map(([, v]) => v);
    if (prev.length >= 3 && cur.length >= 3) {
      const d = avg(cur)! - avg(prev)!;
      if (d >= 0.3) out.push([Sun03Icon, `Brighter than the ${range} days before. Something's going right!`]);
      else if (d <= -0.3) out.push([CloudRainIcon, `A little heavier than the ${range} days before. That's okay. Rough patches pass.`]);
    }
  }
  const words = s.journal.filter((e) => e.date >= start && e.text).reduce((a, e) => a + e.text.trim().split(/\s+/).length, 0);
  if (words >= 50) out.push([PencilEdit02Icon, `You wrote <b>${words.toLocaleString()} words</b> in this stretch. That's a lot of feelings, written down.`]);
  return out;
}

function JournalDay({ k }: { k: string }) {
  const s = useStore(), { close } = useModal();
  const es = s.journal.filter((e) => e.date === k).sort((a, b) => a.ts - b.ts), td = s.tdone[k] ?? 0;
  return (
    <>
      <h2>{k2d(k).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h2>
      <div className="muted small" style={{ fontWeight: 800, marginBottom: 8, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <Icon icon={DropletIcon} size={14} /> {fmtMl(mlOf(s, k))}{hitOf(s, k) ? " · goal hit" : ""} · <Icon icon={CheckmarkSquare02Icon} size={14} /> {td} to-do{td === 1 ? "" : "s"} done
      </div>
      {es.length ? es.map((e) => (
        <div key={e.id} className="entry jentry" style={{ borderLeftColor: e.mood != null ? MOOD_FILL[e.mood] : "var(--line)", boxShadow: "none", border: "2px solid var(--line)", borderLeftWidth: 6 }}>
          <div className="h"><span className="mood" style={{ ["--c" as string]: e.mood != null ? MOODS[e.mood].color : "var(--muted)" }}><Icon icon={e.mood != null ? MOODS[e.mood].icon : Note01Icon} size={22} /></span>
            <span>{e.mood != null && <><b style={{ color: "var(--ink)" }}>{MOODS[e.mood].label}</b> · </>}{fmtTime(e.ts)}</span></div>
          {e.prompt && <div className="q">{e.prompt}</div>}{e.text && <p>{e.text}</p>}
        </div>
      )) : <div className="empty">No journal entry this day.</div>}
      <button className="btn primary" style={{ width: "100%", marginTop: 10 }} onClick={close}>Close</button>
    </>
  );
}
export { FireIcon };
