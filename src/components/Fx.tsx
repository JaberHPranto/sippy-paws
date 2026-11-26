"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useFx } from "@/lib/store";

const COLORS = ["#ff8fa3", "#5bbcf7", "#7fd4ad", "#ffc94d", "#b48cf2"];

/** Toasts + confetti (paper shapes instead of emoji). */
export function Fx() {
  const fx = useFx();
  const [bits, setBits] = useState<{ id: number; left: number; dur: number; c: string; r: number; w: number }[]>([]);
  useEffect(() => {
    if (!fx.confetti) return;
    const now = Date.now();
    setBits(Array.from({ length: 44 }, (_, i) => ({ id: now + i, left: Math.random() * 100, dur: 1.8 + Math.random() * 1.6, c: COLORS[i % COLORS.length], r: Math.random() * 360, w: 6 + Math.random() * 6 })));
    const t = setTimeout(() => setBits([]), 3600);
    return () => clearTimeout(t);
  }, [fx.confetti]);
  return (
    <>
      <div id="toast">
        <AnimatePresence>
          {fx.toasts.map((t) => (
            <motion.div key={t.id} layout initial={{ opacity: 0, y: -14, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}>{t.text}</motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div id="confetti">
        {bits.map((b) => (
          <i key={b.id} style={{ left: `${b.left}%`, animationDuration: `${b.dur}s`, width: b.w, height: b.w * 1.6, background: b.c, borderRadius: 2, transform: `rotate(${b.r}deg)` }} />
        ))}
      </div>
    </>
  );
}
