"use client";
import { HatIcon, GlassesIcon, NecklaceIcon, TShirtIcon, BubbleTea01Icon, SparklesIcon, ImageIcon, DropletIcon, SmileIcon, Happy01Icon, PartyIcon, WinkIcon, SleepingIcon, Sad01Icon, HandHeartIcon, PartyPopperIcon, Coffee02Icon, Fire03Icon, YogaIcon, CheckmarkBadge01Icon, DrinkIcon, DressIcon, CameraIcon, FavouriteIcon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { ITEM, ITEMS, SLOTS, DUO } from "./mascots";
import { dk, k2d, pick } from "./dates";
import { actions, bestStreak, commit, confetti, getState, hitOf, levelInfo, testOn, toast, type Look, type State } from "./store";
import { sfx } from "./sound";

export type Item = { id: string; slot: string; name: string; desc: string; lvl?: number; cost?: number; free?: boolean };
export const ALL_ITEMS = ITEMS as Item[];
export const ITEM_BY = ITEM as Record<string, Item>;
export const SLOT_LIST = (SLOTS as [string, string, string][]).map(([id, name]) => ({ id, name }));
export const SLOT_ICON: Record<string, IconSvgElement> = { head: HatIcon, face: GlassesIcon, neck: NecklaceIcon, outfit: TShirtIcon, hand: BubbleTea01Icon, aura: SparklesIcon, scene: ImageIcon };
export const slotName = (id: string) => (id === "scene" ? "Scene" : SLOT_LIST.find((s) => s.id === id)?.name ?? id);

export const POSES: [string, string, IconSvgElement][] = [["auto", "Mood", DropletIcon], ["normal", "Idle", SmileIcon], ["happy", "Happy", Happy01Icon], ["ecstatic", "Cheer", PartyIcon], ["wink", "Wink", WinkIcon], ["sleepy", "Sleepy", SleepingIcon], ["sad", "Pout", Sad01Icon]];
export const DUO_ICON: Record<string, IconSvgElement> = { together: HandHeartIcon, cheers: PartyPopperIcon, nap: SleepingIcon, tea: Coffee02Icon, wink: WinkIcon, pout: Sad01Icon };
export const DUOS = DUO as Record<string, { name: string; desc: string }>;
export const BORDERS: [string, string][] = [["washi", "Washi tape"], ["stamp", "Postal stamp"], ["mint", "Mint frame"], ["plain", "Classic"]];

export const realLevel = (s: State) => levelInfo(s.xp).lvl;
export const effLevel = (s: State) => (testOn(s) ? 10 : realLevel(s));
export function owns(s: State, id: string) {
  const it = ITEM_BY[id]; if (!it) return false;
  if (it.free || testOn(s)) return true;
  if (it.lvl) return effLevel(s) >= it.lvl;
  return !!s.owned[id];
}
export function activeLook(s: State, kind: "panda" | "cat"): Look {
  const raw = s.style?.[kind] ?? {}, out: Look = {};
  for (const [slot, id] of Object.entries(raw)) if (id && owns(s, id) && ITEM_BY[id].slot === slot) out[slot] = id;
  return out;
}
export const sceneNow = (s: State) => (owns(s, s.scene) ? s.scene : "sky");
export const wearables = () => ALL_ITEMS.filter((i) => i.slot !== "scene");
export const shopItems = () => ALL_ITEMS.filter((i) => i.cost);
const dayIndex = () => Math.floor(k2d(dk()).getTime() / 864e5);
export function featured(s: State) { const pool = shopItems().filter((i) => !s.owned[i.id]); return pool.length ? pool[dayIndex() % pool.length] : null; }
export const priceOf = (s: State, it: Item) => { const f = featured(s); return f && f.id === it.id ? Math.round((it.cost ?? 0) * 0.75) : it.cost ?? 0; };
export function untilMidnight() { const n = new Date(), m = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1); const mins = Math.max(0, Math.round((m.getTime() - n.getTime()) / 60000)); return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`; }
export const nameOf = (s: State, kind: "panda" | "cat") => (kind === "panda" ? s.settings.pandaName : s.settings.catName);

export function outfitLine(s: State, kind: "panda" | "cat") {
  const look = activeLook(s, kind), items = Object.values(look).map((id) => ITEM_BY[id].name), N = s.settings.name;
  const who = `<span class="who">${nameOf(s, kind)}:</span>`;
  if (!items.length) return `${who} I'm feeling a little plain today… dress me up, ${N}?`;
  const one = pick(items);
  return `${who} ` + pick(kind === "panda"
    ? [`I feel so fancy in my ${one}!`, `Does the ${one} make me look extra fluffy?`, `${N}, take a photo of me in this ${one}!`]
    : [`Does this ${one} compliment my whiskers, ${N}?`, `I look purr-fect in my ${one}.`, `The ${one}? Very me. Very chic.`]);
}

export function badges(s: State): [IconSvgElement, string, string, boolean][] {
  const daab = Object.values(s.drinks).reduce((a, d) => a + (d.daab ?? 0), 0);
  const tdone = Object.values(s.tdone).reduce((a, b) => a + b, 0);
  return [
    [DropletIcon, "100% Full", "First goal hit", Object.keys(s.ml).some((k) => hitOf(s, k))],
    [Fire03Icon, "7-Day Run", "7-day streak", bestStreak(s) >= 7],
    [YogaIcon, "Calm Mind", "5 journal days", Object.keys(s.jdays).length >= 5],
    [CheckmarkBadge01Icon, "Busy Bee", "10 to-dos done", tdone >= 10],
    [DrinkIcon, "Daab Lover", "3 L of daab", daab >= 3000],
    [DressIcon, "Fashionista", "Own 10 items", ALL_ITEMS.filter((i) => !i.free && i.slot !== "scene" && !i.lvl && s.owned[i.id]).length >= 10],
    [CameraIcon, "Shutterbug", "First snapshot", s.snaps.length >= 1],
    [FavouriteIcon, "Best Buds", "Bond level 5", realLevel(s) >= 5],
  ];
}

/* ---------- actions ---------- */
const S = getState;
const set = (p: Partial<State>) => commit({ ...S(), ...p });
export const style = {
  setEditing: (k: "panda" | "cat") => set({ editing: k }),
  setPose: (p: string) => set({ pose: p }),
  setScene: (id: string) => { if (owns(S(), id)) { sfx("pop"); set({ scene: id }); } },
  setTest: (on: boolean) => { set({ test: on }); toast(on ? "Everything unlocked (just for you)" : "Test mode off"); },
  equip(kind: "panda" | "cat", id: string) {
    const s = S(), it = ITEM_BY[id]; if (!it || !owns(s, id)) return;
    sfx("pop");
    if (it.slot === "scene") { set({ scene: id }); return; }
    const cur = { ...s.style[kind] };
    if (cur[it.slot] === id) delete cur[it.slot]; else cur[it.slot] = id;
    set({ style: { ...s.style, [kind]: cur } });
    actions.emit({ style: true });
  },
  random() {
    const s = S(), k = s.editing, look: Look = {};
    for (const { id: slot } of SLOT_LIST) { const opts = ALL_ITEMS.filter((i) => i.slot === slot && owns(s, i.id)); if (opts.length && Math.random() < 0.7) look[slot] = pick(opts).id; }
    sfx("swoosh"); set({ style: { ...s.style, [k]: look } }); actions.emit({ style: true });
  },
  sync() { const s = S(), other = s.editing === "panda" ? "cat" : "panda"; set({ style: { ...s.style, [other]: { ...activeLook(s, s.editing) } } }); sfx("chime"); toast("Twinning!"); },
  buy(id: string): boolean {
    const s = S(), it = ITEM_BY[id]; if (!it || owns(s, id)) return false;
    const price = priceOf(s, it), free = testOn(s);
    if (!free && s.points < price) return false;
    const k = s.editing;
    const next: Partial<State> = { owned: { ...s.owned, [id]: Date.now() }, points: free ? s.points : s.points - price };
    if (it.slot === "scene") next.scene = id; else next.style = { ...s.style, [k]: { ...s.style[k], [it.slot]: id } };
    set(next); confetti(); sfx("success"); toast(`${it.name} unlocked!`);
    return true;
  },
  wish(text: string) { const s = S(); set({ wishes: [...s.wishes, { text, ts: Date.now() }].slice(-50) }); sfx("chime"); toast("Wish sent to Pranto"); },
  savePreset(name: string) {
    const s = S();
    set({ presets: [{ id: "p" + Date.now().toString(36), name: name || `Look #${s.presets.length + 1}`, panda: activeLook(s, "panda"), cat: activeLook(s, "cat"), scene: sceneNow(s) }, ...s.presets].slice(0, 8) });
    sfx("chime"); toast("Look saved");
  },
  wear(id: string) { const s = S(), p = s.presets.find((x) => x.id === id); if (!p) return; set({ style: { panda: { ...p.panda }, cat: { ...p.cat } }, scene: owns(s, p.scene) ? p.scene : s.scene }); sfx("swoosh"); toast(`Wearing “${p.name}”`); },
  delPreset: (id: string) => { sfx("del"); set({ presets: S().presets.filter((x) => x.id !== id) }); },
  snap(pose: string, border: string, caption: string) {
    const s = S();
    set({ snaps: [{ id: "s" + Date.now().toString(36), ts: Date.now(), pose, scene: sceneNow(s), panda: activeLook(s, "panda"), cat: activeLook(s, "cat"), caption, border }, ...s.snaps].slice(0, 40) });
    confetti(); sfx("success"); toast("Pinned to your scrapbook"); actions.emit({ snap: true });
  },
  delSnap: (id: string) => { sfx("del"); set({ snaps: S().snaps.filter((x) => x.id !== id) }); },
};
