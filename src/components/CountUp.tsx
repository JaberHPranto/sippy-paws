"use client";
import { useEffect, useRef } from "react";
import { animate } from "motion/react";

export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null), prev = useRef(value);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const c = animate(prev.current, value, { duration: 0.7, ease: [0.2, 0.9, 0.3, 1], onUpdate: (v) => { el.textContent = Math.round(v).toLocaleString() + suffix; } });
    prev.current = value;
    return () => c.stop();
  }, [value, suffix]);
  return <span ref={ref}>{Math.round(value).toLocaleString()}{suffix}</span>;
}
