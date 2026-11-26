"use client";
import { useMemo, useRef } from "react";
import { charSVG } from "@/lib/mascots";
import type { Mood } from "@/lib/mood";

/** Bao / Miso, drawn by the v1 SVG renderer. */
export function Mascot({ kind, mood, className = "m", id, onPoke, style }: {
  kind: "panda" | "cat"; mood: Mood; className?: string; id?: string; onPoke?: () => void; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const html = useMemo(() => charSVG(kind, mood, {}), [kind, mood]);
  const poke = () => {
    const el = ref.current; if (!el) return;
    el.classList.remove("poke"); void el.offsetWidth; el.classList.add("poke");
    setTimeout(() => el.classList.remove("poke"), 650);
    onPoke?.();
  };
  return <div ref={ref} id={id} className={`${className} ${mood}`} style={style} role="button" aria-label={kind === "panda" ? "Poke the panda" : "Poke the cat"}
    onClick={poke} dangerouslySetInnerHTML={{ __html: html }} />;
}
