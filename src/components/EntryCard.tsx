"use client";
import { forwardRef, useState } from "react";
import { motion } from "motion/react";
import { Delete02Icon, Note01Icon, QuoteDownIcon, Clock01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";
import { MOODS } from "@/lib/data";
import { fmtTime } from "@/lib/dates";
import type { Entry } from "@/lib/store";

function Hl({ s, q }: { s: string; q: string }) {
  if (!q) return <>{s}</>;
  const i = s.toLowerCase().indexOf(q.toLowerCase());
  return i < 0 ? <>{s}</> : <>{s.slice(0, i)}<mark>{s.slice(i, i + q.length)}</mark>{s.slice(i + q.length)}</>;
}

/** Journal entry: mood badge + label, date/time, the prompt as a quote, then her words. */
export const EntryCard = forwardRef<HTMLDivElement, { e: Entry; q?: string; onDelete?: () => void; showDate?: boolean }>(function EntryCard({ e, q = "", onDelete, showDate = true }, ref) {
  const [open, setOpen] = useState(false);
  const m = e.mood != null ? MOODS[e.mood] : null, long = e.text.length > 260;
  const d = new Date(e.ts);
  return (
    <motion.div ref={ref} layout initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: -30, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={`jcard ${long && !open ? "clamp" : ""}`} style={{ ["--c" as string]: m?.color ?? "#c9b8c2" }}>
      <div className="jc-h">
        <span className="jc-badge"><Icon icon={m?.icon ?? Note01Icon} size={24} stroke={1.9} /></span>
        <div className="jc-t">
          <b>{m?.label ?? "Note"}</b>
          <small><Icon icon={Clock01Icon} size={12} stroke={2.2} />{showDate ? `${d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · ` : ""}{fmtTime(e.ts)}</small>
        </div>
        {onDelete && <button className="jc-del" aria-label="Delete entry" onClick={onDelete}><Icon icon={Delete02Icon} size={18} /></button>}
      </div>
      {e.prompt && <div className="jc-q"><Icon icon={QuoteDownIcon} size={14} stroke={2.2} /><span><Hl s={e.prompt} q={q} /></span></div>}
      {e.text && <p className="jc-txt"><Hl s={e.text} q={q} /></p>}
      {long && <button className="link" onClick={() => setOpen(!open)}>{open ? "Show less" : "Read more"}</button>}
    </motion.div>
  );
});
