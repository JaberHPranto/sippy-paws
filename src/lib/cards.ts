// @ts-nocheck — card definitions are ported verbatim from the v1 artifact.
"use client";
import { useSyncExternalStore } from "react";
import { DropletIcon, Sofa01Icon, SparklesIcon, FavouriteIcon, PawPrintIcon } from "@hugeicons/core-free-icons";
import { mascot, sceneSVG, soloStage, ITEM } from "./mascots";
import { iconSVG, esc } from "./iconstr";
import { addDays, dk, fmtDate, pick, prevDay } from "./dates";
import { commit, confetti, getState, goalOf, hitOf, isOwner, mlOf, onAction, partnerOf, testOn, toast, waterStreak, type CardInst, type SpecialDef, type State } from "./store";
import { activeLook, realLevel, sceneNow } from "./style";
import { sfx } from "./sound";

export const RARITY = {
  common: { label: "Common", sym: "●", w: 70 }, rare: { label: "Rare", sym: "◆", w: 23 }, holo: { label: "Holo", sym: "★", w: 6 }, secret: { label: "Secret Rare", sym: "✦", w: 1 }, special: { label: "Special", sym: "♥", w: 0 },
};
export const TYPES = { hydro: { icon: DropletIcon, label: "Hydro" }, cozy: { icon: Sofa01Icon, label: "Cozy" }, charm: { icon: SparklesIcon, label: "Charm" }, love: { icon: FavouriteIcon, label: "Love" } };
export const MOMENTS = [
  {id:"goal", name:"Full Tank", r:"common", t:"hydro", kind:"duo", pm:"ecstatic", cm:"ecstatic", hint:"Hit your daily water goal", moves:[["Sip Splash",20,"A refreshing little splash."],["Bottoms Up","hydro","Hits harder the more you drank today."]], fl:"Every last drop counted today."},
  {id:"early", name:"Early Sipper", r:"common", t:"hydro", kind:"panda", mood:"happy", scene:"sky", hint:"Log a drink before 9 am", moves:[["Morning Gulp",15,"Water before cha!"],["Sunrise Glow",30,""]], fl:"Water first, then the world."},
  {id:"cha", name:"Cha Connoisseur", r:"common", t:"cozy", kind:"cat", mood:"wink", look:{hand:"teacup"}, scene:"cafe", hint:"Drink 3 cups of cha in a day", moves:[["Steam Puff",10,""],["Biscuit Dunk",30,"Biscuit not included."]], fl:"Three cups and counting."},
  {id:"daab", name:"Daab Day", r:"rare", t:"hydro", kind:"duo", pm:"happy", cm:"wink", scene:"beach", hint:"Drink 3 daabs in a day", moves:[["Coconut Crack",30,""],["Malai Munch","hydro","Scoops the soft bits too."]], fl:"Coconut-powered and unstoppable."},
  {id:"overflow", name:"Overflowing!", r:"rare", t:"hydro", kind:"panda", mood:"ecstatic", look:{aura:"bubbles"}, hint:"Reach 150% of your goal", moves:[["Fizzy Burst",40,""],["Tidal Hug","hydro","Too much water? Never heard of it."]], fl:"Went way above and beyond."},
  {id:"diary", name:"Dear Diary", r:"common", t:"cozy", kind:"cat", mood:"normal", hint:"Write a journal entry", moves:[["Ink Paw",10,""],["Heart Lighten","cozy","Feelings on paper weigh less."]], fl:"Feelings written down are lighter to carry."},
  {id:"nightowl", name:"Night Owl Notes", r:"common", t:"cozy", kind:"cat", mood:"sleepy", scene:"night", hint:"Journal after 11 pm", moves:[["Moonlit Scribble",20,""],["Yawn",10,"Time for bed, maybe?"]], fl:"Wrote under the moon."},
  {id:"busy", name:"Busy Paws", r:"rare", t:"charm", kind:"panda", mood:"happy", look:{outfit:"apron"}, hint:"Finish 5 to-dos in a day", moves:[["Check Check",30,""],["Bamboo Break","charm","A well-earned snack."]], fl:"Five tasks done before the bamboo ran out."},
  {id:"comeback", name:"Comeback Cub", r:"rare", t:"charm", kind:"panda", mood:"ecstatic", hint:"Hit your goal the day after missing it", moves:[["Bounce Back",40,""],["Never Give Up","hydro","Yesterday is yesterday."]], fl:"Missed yesterday. Crushed today."},
  {id:"perfect", name:"Perfect Day", r:"holo", t:"charm", kind:"duo", pm:"ecstatic", cm:"ecstatic", look:{aura:"sparkle"}, hint:"Goal + journal + every to-do in one day", moves:[["Triple Crown",60,""],["Flawless","charm","Water, words and every to-do."]], fl:"Today was a 10/10."},
  {id:"streak3", name:"On a Roll", r:"rare", t:"hydro", kind:"duo", pm:"happy", cm:"happy", hint:"3-day water streak", moves:[["Hat Trick",30,""],["Rolling Wave","hydro",""]], fl:"Three days, zero excuses."},
  {id:"streak7", name:"Seven-Day Legend", r:"holo", t:"hydro", kind:"duo", pm:"ecstatic", cm:"wink", look:{aura:"rainbow"}, hint:"7-day water streak", moves:[["Week Warrior",70,""],["Legendary Sip","hydro",""]], fl:"A whole week of happy kidneys."},
  {id:"streak30", name:"Monthly Marvel", r:"secret", t:"hydro", kind:"duo", pm:"ecstatic", cm:"ecstatic", look:{head:"crown", aura:"sparkle"}, scene:"rooftop", hint:"30-day water streak", moves:[["Thirty Splash",120,""],["Hydration Royalty","hydro",""]], fl:"Thirty days. Absolute royalty."},
  {id:"bond", name:"Bond Level Up", r:"holo", t:"love", kind:"duo", pm:"happy", cm:"happy", hint:"Reach a new bond level", moves:[["Paw Bump",40,""],["Best Friends","charm",""]], fl:"Closer than ever."},
  {id:"style", name:"Fashion Debut", r:"common", t:"charm", kind:"cat", mood:"wink", hint:"Wear 4+ items across Bao & Miso", moves:[["Runway Strut",20,""],["Slay","charm",""]], fl:"Dressed to impress (mostly myself)."},
  {id:"snap", name:"Say Cheese!", r:"common", t:"charm", kind:"duo", pm:"wink", cm:"happy", hint:"Snap a Lookbook photo", moves:[["Flash",20,""],["Pose Combo",30,""]], fl:"Pinned forever in the scrapbook."},
];
/* Cozy Collection: booster-pack set. pl/cl = looks. hp, st = [hydro, cozy, charm] */
export const COZY = [
  {id:"c1", name:"Bamboo Muncher", r:"common", t:"cozy", kind:"panda", mood:"happy", pl:{hand:"bamboo"}, hp:80, st:[30,60,40], moves:[["Crunch",20,""],["Second Helping",30,""]], fl:"Bamboo for breakfast, lunch and dinner."},
  {id:"c2", name:"Sunbeam Napper", r:"common", t:"cozy", kind:"cat", mood:"sleepy", cl:{}, hp:70, st:[20,80,30], moves:[["Loaf Mode",10,""],["Sunbeam Nap",30,""]], fl:"Found the warm spot. Not moving."},
  {id:"c3", name:"Lebu Pani Splash", r:"common", t:"hydro", kind:"panda", mood:"wink", pl:{hand:"bottle"}, scene:"beach", hp:90, st:[70,20,40], moves:[["Sour Squeeze",20,""],["Zesty Wave",30,""]], fl:"Lemon, salt, sugar. Perfection."},
  {id:"c4", name:"Boba Buddy", r:"common", t:"charm", kind:"cat", mood:"happy", cl:{hand:"boba"}, hp:70, st:[40,30,60], moves:[["Pearl Pop",20,""],["Big Slurp",30,""]], fl:"Extra pearls, always."},
  {id:"c5", name:"Raindrop Pals", r:"common", t:"hydro", kind:"duo", pm:"happy", cm:"happy", scene:"rain", hp:100, st:[60,40,40], moves:[["Puddle Jump",20,""],["Drizzle Dance",30,""]], fl:"Monsoon? More like fun-soon."},
  {id:"c6", name:"Sleepy Cap Bao", r:"common", t:"cozy", kind:"panda", mood:"sleepy", pl:{head:"sleepcap"}, scene:"night", hp:80, st:[20,70,40], moves:[["Snore",10,""],["Dreamy Drift",30,""]], fl:"Five more minutes…"},
  {id:"c7", name:"Froggy Miso", r:"common", t:"charm", kind:"cat", mood:"happy", cl:{head:"froghat"}, hp:70, st:[40,30,60], moves:[["Ribbit",20,""],["Lily Leap",30,""]], fl:"Definitely a frog. Do not question it."},
  {id:"c8", name:"Bottle Hugger", r:"common", t:"hydro", kind:"panda", mood:"normal", pl:{hand:"bottle"}, hp:90, st:[70,30,30], moves:[["Refill",20,""],["Squeeze Hug",30,""]], fl:"Never leaves home without it."},
  {id:"c9", name:"Chef Bao", r:"common", t:"cozy", kind:"panda", mood:"happy", pl:{head:"chef", outfit:"apron"}, scene:"cafe", hp:90, st:[30,60,50], moves:[["Stir Pot",20,""],["Taste Test",30,""]], fl:"Today's special: bamboo soup."},
  {id:"c10", name:"Scholar Miso", r:"common", t:"charm", kind:"cat", mood:"normal", cl:{face:"glasses"}, hp:70, st:[30,40,60], moves:[["Page Turn",10,""],["Big Brain",40,""]], fl:"Read 3 books. Understood the cover."},
  {id:"c11", name:"Sakura Stroll", r:"rare", t:"charm", kind:"duo", pm:"happy", cm:"wink", pl:{head:"blossom"}, cl:{head:"wreath"}, scene:"sakura", hp:120, st:[50,50,80], moves:[["Petal Storm",40,""],["Spring Breeze",50,""]], fl:"Pink skies and pinker cheeks."},
  {id:"c12", name:"Beach Day", r:"rare", t:"hydro", kind:"duo", pm:"ecstatic", cm:"ecstatic", pl:{face:"shades"}, cl:{face:"shades"}, scene:"beach", hp:130, st:[90,40,60], moves:[["Wave Rider",40,""],["Sandy Toes",50,""]], fl:"Sun's out, paws out."},
  {id:"c13", name:"Tea Café Date", r:"rare", t:"cozy", kind:"duo", pm:"happy", cm:"wink", pl:{hand:"teacup"}, cl:{hand:"teacup"}, scene:"cafe", hp:120, st:[40,90,60], moves:[["Clink",40,""],["Pinky Up",50,""]], fl:"Two cups, one table, endless gossip."},
  {id:"c14", name:"Starry Night Bao", r:"rare", t:"cozy", kind:"panda", mood:"sleepy", pl:{outfit:"pjs", head:"sleepcap"}, scene:"night", hp:110, st:[30,90,50], moves:[["Stargaze",40,""],["Moon Nap",50,""]], fl:"Counting stars instead of sheep."},
  {id:"c15", name:"Puddle Miso", r:"rare", t:"hydro", kind:"cat", mood:"happy", cl:{outfit:"raincoat"}, scene:"rain", hp:110, st:[80,40,50], moves:[["Splash Stomp",40,""],["Umbrella Twirl",50,""]], fl:"Puddles were made for jumping."},
  {id:"c16", name:"Rooftop Sunset", r:"rare", t:"charm", kind:"duo", pm:"happy", cm:"happy", pl:{neck:"scarf"}, cl:{neck:"bell"}, scene:"rooftop", hp:130, st:[50,60,90], moves:[["Golden Hour",50,""],["City Lights",40,""]], fl:"Dhaka looks soft from up here."},
  {id:"c17", name:"Kimono Miso", r:"holo", t:"charm", kind:"cat", mood:"wink", cl:{outfit:"kimono", head:"wreath"}, scene:"sakura", hp:150, st:[50,70,99], moves:[["Fan Flutter",60,""],["Blossom Bow",70,""]], fl:"Grace, elegance, and one stolen snack."},
  {id:"c18", name:"Hero Cape Bao", r:"holo", t:"hydro", kind:"panda", mood:"ecstatic", pl:{outfit:"cape", hand:"wand"}, scene:"sky", hp:160, st:[99,50,70], moves:[["Hydro Beam",70,""],["Rescue Sip",60,""]], fl:"Saving the world, one glass at a time."},
  {id:"c19", name:"Rainbow Twins", r:"holo", t:"charm", kind:"duo", pm:"ecstatic", cm:"ecstatic", pl:{aura:"rainbow"}, cl:{aura:"rainbow"}, scene:"rain", hp:170, st:[70,70,99], moves:[["Prism Hug",70,""],["After the Rain",60,""]], fl:"Every storm ends in color."},
  {id:"c20", name:"Twin Crowns", r:"secret", t:"love", kind:"duo", pm:"ecstatic", cm:"wink", pl:{head:"crown", outfit:"cape"}, cl:{head:"crown", outfit:"kimono"}, scene:"rooftop", hp:250, st:[99,99,99], moves:[["Royal Decree",100,""],["Forever Besties",120,""]], fl:"Rulers of the Kingdom of Hydration."},
];
export const MOM = Object.fromEntries(MOMENTS.map((d) => [d.id, d])), COZ = Object.fromEntries(COZY.map((d) => [d.id, d]));
export const PACK_COST = 50, DUST = 5;
const z = (n) => String(n).padStart(2, "0");

/* Live special cards from the partner (set by the backend; empty offline) */
let SPECIALS: SpecialDef[] = [];
export const setSpecials = (list: SpecialDef[]) => { SPECIALS = list || []; bump(); };
export const pendingSpecials = (s: State) => SPECIALS.filter((d) => !s.claimed[d.id]);
export const specialList = (s: State) => [...Object.values(s.claimed).map((c) => c.def).filter(Boolean), ...pendingSpecials(s)];

const lookStr = (l) => Object.values(l || {}).join(",");
const parseLook = (str) => String(str || "").split(",").filter((id) => ITEM[id] && ITEM[id].slot !== "scene").reduce((o, id) => ((o[ITEM[id].slot] = id), o), {});

/* ---------- reveal queue (ephemeral) ---------- */
type Reveal = { set: "moments" | "cozy" | "special"; inst: any; def: any };
let queue: Reveal[] = [], ver = 0;
const rsubs = new Set<() => void>();
function bump() { ver++; rsubs.forEach((f) => f()); }
export const useReveals = () => { useSyncExternalStore((cb) => { rsubs.add(cb); return () => rsubs.delete(cb); }, () => ver, () => 0); return queue; };
export const shiftReveal = () => { const r = queue.shift(); bump(); return r; };
export const clearReveals = () => { queue = []; bump(); };

function dayStats(s: State, k: string) {
  const ml = mlOf(s, k), g = goalOf(s, k), td = s.tdone[k] || 0;
  const items = Object.keys(activeLook(s, "panda")).length + Object.keys(activeLook(s, "cat")).length;
  return {
    hp: Math.min(300, Math.max(30, Math.round((30 + ml / 20) / 10) * 10)),
    st: [Math.min(99, Math.round((ml / g) * 70)), Math.min(99, (s.jdays[k] ? 40 : 0) + td * 10 + 10), Math.min(99, items * 8 + realLevel(s) * 4)],
  };
}
function mint(s: State, id: string): CardInst | null {
  const k = dk(); if (s.cards.some((c) => c.d === id && c.k === k)) return null;
  const st = dayStats(s, k);
  return { u: "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), d: id, k, t: Date.now(), p: lookStr(activeLook(s, "panda")), c: lookStr(activeLook(s, "cat")), s: sceneNow(s), h: st.hp, st: st.st };
}
/** Mint Daily Moment cards from what actually happened today. */
export function checkMoments(ctx: any = {}) {
  const s = getState(), k = dk(), ml = mlOf(s, k), g = goalOf(s, k), hit = ml >= g, h = new Date().getHours(), dr = s.drinks[k] || {};
  const st = hit ? waterStreak(s) : 0;
  const items = Object.keys(activeLook(s, "panda")).length + Object.keys(activeLook(s, "cat")).length;
  const conds = {
    goal: hit, early: ctx.drink && h < 9, cha: (dr.cha || 0) >= 450, daab: (dr.daab || 0) >= 900, overflow: ml >= g * 1.5,
    diary: !!s.jdays[k], nightowl: ctx.journal && (h >= 23 || h < 4), busy: (s.tdone[k] || 0) >= 5,
    comeback: hit && !hitOf(s, prevDay(k)) && Object.keys(s.ml).some((d) => d < k && s.ml[d] > 0),
    perfect: hit && !!s.jdays[k] && s.todos.length > 0 && s.todos.every((t) => t.done),
    streak3: st === 3, streak7: st === 7, streak30: st === 30, bond: !!ctx.level, snap: !!ctx.snap, style: ctx.style && items >= 4,
  };
  const minted = Object.entries(conds).filter(([, ok]) => ok).map(([id]) => mint(s, id)).filter(Boolean) as CardInst[];
  if (!minted.length) return;
  commit({ ...s, cards: [...s.cards, ...minted].slice(-400) });
  setTimeout(() => { minted.forEach((inst) => queue.push({ set: "moments", inst, def: MOM[inst.d] })); bump(); }, 1400);
}
onAction(checkMoments);

/* ---------- packs ---------- */
function rollRarity(minRare: boolean) {
  const pool = Object.entries(RARITY).filter(([k, v]) => v.w && (!minRare || k !== "common"));
  let n = Math.random() * pool.reduce((a, [, v]) => a + v.w, 0);
  for (const [k, v] of pool) if ((n -= v.w) < 0) return k;
  return "rare";
}
export type PackResult = { ok: true; pulls: any[]; dupes: boolean[] } | { ok: false };
export function openPack(): PackResult {
  const s = getState(), free = testOn(s), usePack = !free && s.packs > 0;
  if (!free && !usePack && s.points < PACK_COST) return { ok: false };
  const pulls = [0, 1, 2].map((i) => { const r = rollRarity(i === 2); const opts = COZY.filter((d) => d.r === r); return pick(opts.length ? opts : COZY); });
  const pc = { ...s.packCards }, dupes = pulls.map((d) => (pc[d.id] || 0) > 0);
  pulls.forEach((d) => (pc[d.id] = (pc[d.id] || 0) + 1));
  commit({ ...s, packCards: pc, packs: usePack ? s.packs - 1 : s.packs, points: free || usePack ? s.points : s.points - PACK_COST });
  return { ok: true, pulls, dupes };
}
export function recycleDupes() {
  const s = getState(), pc = { ...s.packCards }; let n = 0;
  for (const [id, c] of Object.entries(pc)) if (c > 1) { n += c - 1; pc[id] = 1; }
  if (!n) return toast("No duplicates to recycle");
  commit({ ...s, packCards: pc, points: s.points + n * DUST }); sfx("swoosh"); toast(`Recycled ${n} dupes · +${n * DUST} paw points`);
}
export function claimSpecials() {
  const s = getState(), list = pendingSpecials(s); if (!list.length) return;
  const claimed = { ...s.claimed }; list.forEach((d) => (claimed[d.id] = { t: Date.now(), def: JSON.parse(JSON.stringify(d)) }));
  commit({ ...s, claimed });
  list.forEach((d) => queue.push({ set: "special", inst: { t: Date.now() }, def: d })); bump();
}

/* ---------- binder ---------- */
export function setInfo(s: State, set: string) {
  if (set === "moments") return { list: MOMENTS, have: (d) => testOn(s) || s.cards.some((c) => c.d === d.id) };
  if (set === "cozy") return { list: COZY, have: (d) => testOn(s) || (s.packCards[d.id] || 0) > 0 };
  return { list: specialList(s), have: (d) => !!s.claimed[d.id] };
}
export function latestInst(s: State, set: string, d) {
  if (set === "moments") {
    const all = s.cards.filter((c) => c.d === d.id);
    if (all.length) return all[all.length - 1];
    if (!testOn(s)) return null;
    const st = dayStats(s, dk());
    return { d: d.id, t: Date.now(), p: lookStr(activeLook(s, "panda")), c: lookStr(activeLook(s, "cat")), s: sceneNow(s), h: st.hp, st: st.st };
  }
  if (set === "special") { const c = s.claimed[d.id]; return c && c.t ? { t: c.t } : null; }
  return null;
}

/* ---------- rendering (HTML strings, same markup as v1) ---------- */
function cardArt(set, def, inst) {
  const scene = def.scene || (inst && inst.s) || "sky";
  let pl, cl;
  if (set === "moments") { pl = Object.assign(parseLook(inst && inst.p), def.look); cl = Object.assign(parseLook(inst && inst.c), def.look); }
  else if (set === "special") { pl = parseLook(def.p); cl = parseLook(def.c); }
  else { pl = def.pl || {}; cl = def.cl || {}; }
  if (def.kind === "duo") return `<svg viewBox="0 0 300 200">${sceneSVG(scene)}<g transform="translate(52 62) scale(.82)"><g class="mc ${def.pm}">${mascot("panda", def.pm, pl)}</g></g><g transform="translate(150 62) scale(.82)"><g class="mc ${def.cm}">${mascot("cat", def.cm, cl)}</g></g></svg>`;
  return soloStage(def.kind, def.mood, def.kind === "panda" ? pl : cl, scene);
}
export function cardHTML(s: State, set: string, def, inst, big = false) {
  const R = RARITY[def.r], T = TYPES[def.t] || TYPES.charm, ic = (n = 14) => iconSVG(T.icon, n, 2);
  const list = set === "moments" ? MOMENTS : set === "cozy" ? COZY : specialList(s);
  const no = `${z(list.findIndex((d) => d.id === def.id) + 1)}/${z(list.length)}`;
  const st = inst && inst.st ? inst.st : def.st || [50, 50, 50];
  const hp = inst && inst.h ? inst.h : def.hp || 100;
  const statOf = (key) => ({ hydro: st[0], cozy: st[1], charm: st[2] })[key] ?? key;
  const who = def.kind === "duo" ? `${s.settings.pandaName} & ${s.settings.catName}` : def.kind === "panda" ? s.settings.pandaName : s.settings.catName;
  const date = inst && inst.t ? new Date(inst.t).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : set === "special" && def.ts ? fmtDate(def.ts) : set === "cozy" ? "Cozy Collection" : "";
  const pip = (v) => `<i style="width:${Math.max(6, v)}%"></i>`;
  return `<div class="pcard t-${def.t} r-${def.r} ${big ? "big" : "sm"}"><div class="pc-in">
    <div class="pc-top"><span class="pc-badge">${set === "moments" ? "MOMENT" : set === "special" ? "GIFT" : "BASIC"}</span><b class="pc-name">${esc(def.name)}</b><span class="pc-hp"><small>SIP</small>${hp}<span>${ic(16)}</span></span></div>
    <div class="pc-art">${cardArt(set, def, inst)}</div>
    <div class="pc-sub">${esc(who)} · ${T.label} type${date ? " · " + esc(date) : ""}</div>
    <div class="pc-moves">${(def.moves || []).map(([n, d, ds]) => `<div class="mv"><span class="mi">${ic(12)}</span><div class="mt"><b>${esc(n)}</b>${ds ? `<small>${esc(ds)}</small>` : ""}</div><span class="dm">${statOf(d)}</span></div>`).join("")}</div>
    <div class="pc-stats"><span>${iconSVG(DropletIcon, 11, 2.2, "#5bbcf7")}<b>${pip(st[0])}</b></span><span>${iconSVG(Sofa01Icon, 11, 2.2, "#ff8fa3")}<b>${pip(st[1])}</b></span><span>${iconSVG(SparklesIcon, 11, 2.2, "#e5a400")}<b>${pip(st[2])}</b></span></div>
    <div class="pc-fl">${esc(def.fl || "")}</div>
    <div class="pc-foot"><span>${R.sym} ${def.r === "special" ? "From " + esc(partnerOf(s)) : R.label}</span><span>${set === "moments" ? "Daily Moments" : set === "special" ? "Special Cards" : "Cozy Collection"}</span><span>${no}</span></div>
  </div><div class="holo"></div><div class="glare"></div></div>`;
}
export const cardBack = () => `<div class="pcard back"><div class="pc-in"><div class="cb-logo">${iconSVG(PawPrintIcon, 48, 1.8, "#fff")}<b>Sippy Paws</b><small>PAW CARDS</small></div></div></div>`;
export const packArt = () => `<svg viewBox="0 0 160 220"><defs><linearGradient id="pk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8fa3"/><stop offset=".5" stop-color="#ffc94d"/><stop offset="1" stop-color="#5bbcf7"/></linearGradient></defs>
  <path d="M10 14 h140 l-4 6 l4 6 l-4 6 l4 6 V194 l-4 6 l4 6 l-4 6 H14 l4 -6 l-4 -6 l4 -6 l-4 -6 V38 l-4 -6 l4 -6 l-4 -6z" fill="url(#pk)"/>
  <rect x="22" y="44" width="116" height="110" rx="12" fill="#fff" opacity=".9"/>
  <g transform="translate(26 58) scale(.46)">${mascot("panda", "happy", {})}</g><g transform="translate(80 58) scale(.46)">${mascot("cat", "wink", {})}</g>
  <text x="80" y="176" text-anchor="middle" font-family="Fredoka Variable,Fredoka,sans-serif" font-weight="700" font-size="16" fill="#fff">PAW CARDS</text>
  <text x="80" y="192" text-anchor="middle" font-family="Nunito Variable,Nunito,sans-serif" font-weight="800" font-size="9" fill="#fff">COZY COLLECTION · 3 CARDS</text>
  <text x="80" y="34" text-anchor="middle" font-family="Fredoka Variable,Fredoka,sans-serif" font-weight="700" font-size="12" fill="#fff">Sippy Paws</text></svg>`;

/* Special-card maker (owner) */
export function buildSpecial(s: State, f: { name: string; kind: string; mood: string; scene: string; move: string; fl: string }): SpecialDef {
  return { id: "sp" + Date.now().toString(36), name: f.name || "Special Moment", r: "special", t: "love", kind: f.kind, mood: f.mood, pm: f.mood, cm: f.mood === "happy" ? "wink" : f.mood, scene: f.scene,
    p: lookStr(activeLook(s, "panda")), c: lookStr(activeLook(s, "cat")), hp: 999, st: [99, 99, 99], ts: Date.now(), moves: [[f.move || "Endless Love", "∞", ""]], fl: f.fl || "Made just for you." };
}
export { isOwner, addDays };
