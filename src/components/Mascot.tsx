"use client";
import { useMemo, useRef } from "react";
import { charSVG } from "@/lib/mascots";
import type { Mood } from "@/lib/mood";
import { sfx } from "@/lib/sound";
import { useStore } from "@/lib/store";
import { activeLook } from "@/lib/style";

/** Bao / Miso, drawn by the v1 SVG renderer, wearing their current outfit. */
export function Mascot({ kind, mood, className = "m", id, onPoke, style, look }: {
  kind: "panda" | "cat"; mood: Mood; className?: string; id?: string; onPoke?: () => void; style?: React.CSSProperties; look?: Record<string, string>;
}) {
  const s = useStore();
  const ref = useRef<HTMLDivElement>(null);
  const l = look ?? activeLook(s, kind), key = JSON.stringify(l);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const html = useMemo(() => charSVG(kind, mood, l), [kind, mood, key]);
  const poke = () => {
    const el = ref.current; if (!el) return;
    el.classList.remove("poke"); void el.offsetWidth; el.classList.add("poke");
    setTimeout(() => el.classList.remove("poke"), 650);
    sfx("squeak"); onPoke?.();
  };
  return <div ref={ref} id={id} className={`${className} ${mood}`} style={style} role="button" aria-label={kind === "panda" ? "Poke the panda" : "Poke the cat"}
    onClick={poke} dangerouslySetInnerHTML={{ __html: html }} />;
}
