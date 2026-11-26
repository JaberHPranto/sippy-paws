"use client";
import { useSyncExternalStore } from "react";
import { DRINKS, type DrinkId } from "./drinks";

export type Drink = { id: DrinkId; ml: number; t: number };
export type Entry = { id: string; date: string; mood: number; text: string; t: number };
export type Todo = { id: string; text: string; done: boolean; date: string };
export type Redeemed = { id: string; title: string; cost: number; t: number };

export type State = {
  v: 1;
  name: string;
  goalMl: number;
  glassMl: number;
  welcomed: boolean;
  drinks: Record<string, Drink[]>;
  journal: Entry[];
  todos: Todo[];
  points: number;
  xp: number;
  awards: Record<string, boolean>;
  redeemed: Redeemed[];
};

const KEY = "sippypaws.next.state.v1";
const initial: State = {
  v: 1, name: "Rizu", goalMl: 2000, glassMl: 250, welcomed: false,
  drinks: {}, journal: [], todos: [], points: 0, xp: 0, awards: {}, redeemed: [],
};

let state: State = initial;
let loaded = false;
const subs = new Set<() => void>();

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const uid = () => Math.random().toString(36).slice(2, 10);

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...JSON.parse(raw) };
  } catch { /* ignore */ }
}
function commit(next: State) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  subs.forEach((f) => f());
}

export function useStore(): State {
  return useSyncExternalStore(
    (cb) => { subs.add(cb); return () => { subs.delete(cb); }; },
    () => { load(); return state; },
    () => initial,
  );
}

export const effMl = (list: Drink[] = []) =>
  Math.round(list.reduce((s, l) => s + l.ml * (DRINKS.find((d) => d.id === l.id)?.factor ?? 1), 0));

export function levelInfo(xp: number) {
  let lvl = 1, need = 80, acc = 0;
  while (xp >= acc + need) { acc += need; lvl++; need = 80 + (lvl - 1) * 20; }
  return { lvl, into: xp - acc, need };
}

/** Awards points once per key (e.g. "goal:2026-11-26"). Returns true if awarded. */
function award(s: State, key: string | null, n: number): State {
  if (key && s.awards[key]) return s;
  return { ...s, points: s.points + n, xp: s.xp + n, awards: key ? { ...s.awards, [key]: true } : s.awards };
}

export const actions = {
  finishWelcome: () => commit({ ...state, welcomed: true }),
  addDrink(id: DrinkId, ml: number) {
    const k = dayKey();
    const before = effMl(state.drinks[k]);
    let s: State = { ...state, drinks: { ...state.drinks, [k]: [...(state.drinks[k] ?? []), { id, ml, t: Date.now() }] } };
    s = award(s, null, 2);
    if (before < s.goalMl && effMl(s.drinks[k]) >= s.goalMl) s = award(s, `goal:${k}`, 20);
    commit(s);
  },
  undoDrink() {
    const k = dayKey();
    const list = state.drinks[k] ?? [];
    if (!list.length) return;
    commit({ ...state, drinks: { ...state.drinks, [k]: list.slice(0, -1) }, points: Math.max(0, state.points - 2), xp: Math.max(0, state.xp - 2) });
  },
  saveEntry(mood: number, text: string, date = dayKey()) {
    let s: State = { ...state, journal: [{ id: uid(), date, mood, text, t: Date.now() }, ...state.journal] };
    s = award(s, `journal:${date}`, 10);
    commit(s);
  },
  deleteEntry: (id: string) => commit({ ...state, journal: state.journal.filter((e) => e.id !== id) }),
  addTodo: (text: string) => commit({ ...state, todos: [{ id: uid(), text, done: false, date: dayKey() }, ...state.todos] }),
  toggleTodo(id: string) {
    const t = state.todos.find((x) => x.id === id);
    if (!t) return;
    let s: State = { ...state, todos: state.todos.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) };
    if (!t.done) s = award(s, `todo:${id}`, 5);
    commit(s);
  },
  deleteTodo: (id: string) => commit({ ...state, todos: state.todos.filter((x) => x.id !== id) }),
  redeem(id: string, title: string, cost: number) {
    if (state.points < cost) return false;
    commit({ ...state, points: state.points - cost, redeemed: [{ id, title, cost, t: Date.now() }, ...state.redeemed] });
    return true;
  },
};
