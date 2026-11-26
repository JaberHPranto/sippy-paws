"use client";
/** Tiny synthesized UI sounds (Web Audio, no files). Respects settings.sound. */
import { getState } from "./store";

export type Sfx = "tap" | "pop" | "drink" | "tick" | "untick" | "chime" | "success" | "del" | "squeak" | "swoosh";

let ctx: AudioContext | null = null;
function ac() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ||= new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}
function tone(c: AudioContext, f: number, dur: number, { type = "sine" as OscillatorType, gain = 0.12, to, at = 0 }: { type?: OscillatorType; gain?: number; to?: number; at?: number } = {}) {
  const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
}

const SOUNDS: Record<Sfx, (c: AudioContext) => void> = {
  tap: (c) => tone(c, 1400, 0.035, { type: "triangle", gain: 0.06, to: 900 }),
  pop: (c) => tone(c, 420, 0.09, { gain: 0.12, to: 980 }),
  drink: (c) => { tone(c, 520, 0.09, { gain: 0.14, to: 1250 }); tone(c, 380, 0.11, { gain: 0.1, to: 1000, at: 0.09 }); },
  tick: (c) => { tone(c, 880, 0.07, { type: "triangle", gain: 0.1 }); tone(c, 1320, 0.11, { type: "triangle", gain: 0.1, at: 0.06 }); },
  untick: (c) => tone(c, 700, 0.12, { type: "triangle", gain: 0.08, to: 380 }),
  chime: (c) => [660, 880, 1320].forEach((f, i) => tone(c, f, 0.28, { gain: 0.08, at: i * 0.07 })),
  success: (c) => [523, 659, 784, 1047].forEach((f, i) => tone(c, f, i === 3 ? 0.4 : 0.16, { type: "triangle", gain: 0.1, at: i * 0.08 })),
  del: (c) => tone(c, 320, 0.14, { type: "triangle", gain: 0.1, to: 110 }),
  squeak: (c) => { tone(c, 900, 0.07, { gain: 0.1, to: 1700 }); tone(c, 1700, 0.08, { gain: 0.08, to: 1100, at: 0.07 }); },
  swoosh: (c) => tone(c, 260, 0.16, { gain: 0.05, to: 620 }),
};

export function sfx(name: Sfx, force = false) {
  try {
    if (!force && !getState().settings.sound) return;
    const c = ac(); if (c) SOUNDS[name](c);
  } catch { /* never break the UI for a sound */ }
}

/** Soft tap for small controls, wired once at the app root. */
const TAP_SEL = ".tabs button,.seg button,.filters button,.cal-nav button,.chips button,.link,.wd,.hc,.cd,.mcell,.icon-btn,.btn.ghost,[data-sfx]";
export function wireTapSounds() {
  const on = (e: MouseEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>(TAP_SEL);
    if (!el || (el as HTMLButtonElement).disabled) return;
    sfx((el.dataset.sfx as Sfx) || "tap");
  };
  document.addEventListener("click", on, true);
  return () => document.removeEventListener("click", on, true);
}
