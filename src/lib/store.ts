"use client";
import { useSyncExternalStore } from "react";
import { drinkById, COUPONS } from "./data";
import { addDays, dk, prevDay } from "./dates";

export type Entry = { id: string; date: string; ts: number; mood: number | null; prompt?: string; text: string };
export type Todo = { id: string; text: string; done: boolean; ts: number; doneAt?: number; doneDay?: string; paid?: boolean };
export type Ticket = { code: string; couponId: string; title: string; cost: number; ts: number };
export type Settings = { name: string; pandaName: string; catName: string; goalMl: number; waterMl: number; remind: boolean; interval: number; startHour: number; endHour: number; sound: boolean };

/** Same shape as the v1 artifact (minus style/cards, which come later) so data can be migrated. */
export type State = {
  v: 2; welcomed: boolean; settings: Settings;
  ml: Record<string, number>; drinks: Record<string, Record<string, number>>; dayGoal: Record<string, number>;
  undo: { date: string; id: string; ml: number; eff: number; paid: boolean }[]; lastDrink: number;
  jdays: Record<string, number>; tdone: Record<string, number>; todos: Todo[]; journal: Entry[];
  points: number; xp: number; awards: Record<string, { goal?: boolean; todo?: number }>; redeemed: Ticket[]; packs: number;
};

const KEY = "sippypaws.v2";
const initial: State = {
  v: 2, welcomed: false,
  settings: { name: "Rizu", pandaName: "Bao", catName: "Miso", goalMl: 2000, waterMl: 250, remind: true, interval: 60, startHour: 9, endHour: 22, sound: true },
  ml: {}, drinks: {}, dayGoal: {}, undo: [], lastDrink: 0, jdays: {}, tdone: {}, todos: [], journal: [],
  points: 0, xp: 0, awards: {}, redeemed: [], packs: 0,
};

let S: State = initial;
let loaded = false;
const subs = new Set<() => void>();
const load = () => {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { const raw = localStorage.getItem(KEY); if (raw) { const d = JSON.parse(raw); S = { ...initial, ...d, settings: { ...initial.settings, ...d.settings } }; } } catch { /* ignore */ }
};
const commit = (next: State) => { S = next; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* ignore */ } subs.forEach((f) => f()); };
export const getState = () => { load(); return S; };
export function useStore(): State {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb); }; }, getState, () => initial);
}

/* ---------- toasts + bubble override (ephemeral) ---------- */
type Fx = { toasts: { id: number; text: string }[]; say: string | null; confetti: number };
let FX: Fx = { toasts: [], say: null, confetti: 0 };
const fxSubs = new Set<() => void>();
const setFx = (f: Partial<Fx>) => { FX = { ...FX, ...f }; fxSubs.forEach((x) => x()); };
export const useFx = () => useSyncExternalStore((cb) => { fxSubs.add(cb); return () => { fxSubs.delete(cb); }; }, () => FX, () => FX);
let tid = 0, sayTimer: ReturnType<typeof setTimeout> | undefined;
export function toast(text: string) {
  const id = ++tid;
  setFx({ toasts: [...FX.toasts, { id, text }].slice(-3) });
  setTimeout(() => setFx({ toasts: FX.toasts.filter((t) => t.id !== id) }), 2200);
}
export function say(html: string, ms = 6000) { clearTimeout(sayTimer); setFx({ say: html }); sayTimer = setTimeout(() => setFx({ say: null }), ms); }
export const confetti = () => setFx({ confetti: FX.confetti + 1 });

/* ---------- selectors ---------- */
export const goalOf = (s: State, k: string) => s.dayGoal[k] || s.settings.goalMl;
export const mlOf = (s: State, k: string) => s.ml[k] || 0;
export const pctOf = (s: State, k: string) => mlOf(s, k) / goalOf(s, k);
export const hitOf = (s: State, k: string) => mlOf(s, k) >= goalOf(s, k);
export function levelInfo(xp: number) {
  let lvl = 1, need = 80, acc = 0;
  while (xp >= acc + need) { acc += need; lvl++; need = 80 + (lvl - 1) * 20; }
  return { lvl, into: xp - acc, need };
}
export function streak(met: (k: string) => boolean) { let k = dk(), n = 0; if (!met(k)) k = prevDay(k); while (met(k)) { n++; k = prevDay(k); } return n; }
export const waterStreak = (s: State) => streak((k) => hitOf(s, k));
export const journalStreak = (s: State) => streak((k) => !!s.jdays[k]);
export function bestStreak(s: State) {
  let best = 0, cur = 0, k = addDays(dk(), -399);
  for (let i = 0; i < 400; i++) { if (hitOf(s, k)) { cur++; best = Math.max(best, cur); } else cur = 0; k = addDays(k, 1); }
  return best;
}

/* ---------- actions (same rules as v1) ---------- */
const uid = () => Math.random().toString(36).slice(2, 10);
const code = () => Math.random().toString(36).slice(2, 8).toUpperCase();
function earn(s: State, n: number, why: string): State {
  const before = levelInfo(s.xp).lvl, next = { ...s, points: s.points + n, xp: s.xp + n };
  toast(`+${n} paw points · ${why}`);
  if (levelInfo(next.xp).lvl > before) setTimeout(() => { confetti(); toast(`Bond level ${levelInfo(next.xp).lvl}!`); }, 400);
  return next;
}
const DRINK_LINES: Record<string, string[]> = {
  water: ["P|Gulp gulp! Pure water, the classic.", "C|*happy purring* Water! My favorite."],
  cha: ["P|Cha time! Pair it with some water later, okay?", "C|Ooh, cha! Is there a biscuit for me?"],
  coffee: ["C|Coffee?! Don't get too zoomy.", "P|Coffee counts a little less, so add a glass of water too."],
  lebu: ["P|Lebu pani! So fresh.", "C|Sour! *scrunchy face* …but healthy."],
  daab: ["P|DAAB! Best hydration in Bangladesh.", "C|Can I have the malai?"],
  juice: ["P|Juicy! Vitamins and water in one.", "C|Ooh, fruity. Share?"],
  milk: ["C|Milk?! Now we're talking. *licks lips*", "P|Strong bones, happy panda."],
  lassi: ["P|Lassi! Creamy and cool.", "C|Mmm… can I lick the glass?"],
};
export const who = (s: State, k: "P" | "C") => `<span class="who">${k === "P" ? s.settings.pandaName : s.settings.catName}:</span>`;

export const actions = {
  finishWelcome: () => commit({ ...S, welcomed: true }),
  updateSettings: (p: Partial<Settings>) => commit({ ...S, settings: { ...S.settings, ...p } }),
  addDrink(id: string, mlIn: number) {
    const d = drinkById(id), k = dk(), goal = goalOf(S, k);
    const ml = Math.max(10, Math.min(2000, Math.round(mlIn)));
    const eff = Math.round(ml * d.f), before = mlOf(S, k), paid = before < goal * 1.5;
    let s: State = {
      ...S,
      dayGoal: S.dayGoal[k] ? S.dayGoal : { ...S.dayGoal, [k]: S.settings.goalMl },
      ml: { ...S.ml, [k]: before + eff },
      drinks: { ...S.drinks, [k]: { ...S.drinks[k], [id]: (S.drinks[k]?.[id] ?? 0) + ml } },
      lastDrink: Date.now(),
      undo: [...S.undo.slice(-49), { date: k, id, ml, eff, paid }],
    };
    if (paid) s = earn(s, 2, d.name.toLowerCase());
    const aw = s.awards[k] ?? {};
    if (s.ml[k] >= goal && !aw.goal) {
      s = { ...s, awards: { ...s.awards, [k]: { ...aw, goal: true } }, packs: s.packs + 1 };
      s = earn(s, 15, "daily goal!");
      confetti();
      say(`<span class="who">${s.settings.pandaName} &amp; ${s.settings.catName}:</span> YOU DID IT!! Goal complete today *victory dance*`, 9000);
    } else {
      const [w, line] = (DRINK_LINES[id] ?? DRINK_LINES.water)[Math.floor(Math.random() * 2)].split("|");
      say(`${who(s, w as "P" | "C")} ${line}`);
    }
    commit(s);
  },
  undo() {
    const k = dk(), i = S.undo.map((u) => u.date).lastIndexOf(k);
    if (i < 0) return;
    const u = S.undo[i], dr = { ...S.drinks[k] }; dr[u.id] = Math.max(0, (dr[u.id] ?? 0) - u.ml); if (!dr[u.id]) delete dr[u.id];
    commit({
      ...S, undo: S.undo.filter((_, j) => j !== i), ml: { ...S.ml, [k]: Math.max(0, mlOf(S, k) - u.eff) }, drinks: { ...S.drinks, [k]: dr },
      points: u.paid ? Math.max(0, S.points - 2) : S.points, xp: u.paid ? Math.max(0, S.xp - 2) : S.xp,
    });
    toast("Undone");
  },
  saveEntry(mood: number | null, text: string, prompt: string) {
    const k = dk();
    let s: State = { ...S, journal: [{ id: uid(), date: k, ts: Date.now(), mood, prompt, text }, ...S.journal] };
    if (!S.jdays[k]) { s = { ...s, jdays: { ...s.jdays, [k]: 1 } }; s = earn(s, 10, "journal"); } else toast("Saved");
    commit(s);
  },
  deleteEntry: (id: string) => commit({ ...S, journal: S.journal.filter((e) => e.id !== id) }),
  addTodo: (text: string) => commit({ ...S, todos: [...S.todos, { id: uid(), text, done: false, ts: Date.now() }] }),
  toggleTodo(id: string) {
    const t = S.todos.find((x) => x.id === id); if (!t) return;
    const k = dk(), aw = S.awards[k] ?? {};
    let s: State;
    if (!t.done) {
      const pay = (aw.todo ?? 0) < 30;
      s = { ...S, todos: S.todos.map((x) => (x.id === id ? { ...x, done: true, doneAt: Date.now(), doneDay: k, paid: pay } : x)), tdone: { ...S.tdone, [k]: (S.tdone[k] ?? 0) + 1 } };
      if (pay) { s = { ...s, awards: { ...s.awards, [k]: { ...aw, todo: (aw.todo ?? 0) + 3 } } }; s = earn(s, 3, "task done"); } else toast("Done!");
      if (s.todos.every((x) => x.done)) confetti();
    } else {
      const day = t.doneDay ?? k;
      s = { ...S, todos: S.todos.map((x) => (x.id === id ? { ...x, done: false, doneAt: undefined, paid: false } : x)), tdone: { ...S.tdone, [day]: Math.max(0, (S.tdone[day] ?? 1) - 1) } };
      if (t.paid) s = { ...s, points: Math.max(0, s.points - 3), xp: Math.max(0, s.xp - 3) };
    }
    commit(s);
  },
  deleteTodo: (id: string) => commit({ ...S, todos: S.todos.filter((x) => x.id !== id) }),
  clearDone: () => commit({ ...S, todos: S.todos.filter((x) => !x.done) }),
  redeem(id: string): Ticket | null {
    const c = COUPONS.find((x) => x.id === id); if (!c || S.points < c.cost) return null;
    const t: Ticket = { code: code(), couponId: c.id, title: c.title, cost: c.cost, ts: Date.now() };
    commit({ ...S, points: S.points - c.cost, redeemed: [...S.redeemed, t].slice(-100) });
    confetti();
    return t;
  },
};
