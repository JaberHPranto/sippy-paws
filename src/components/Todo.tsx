"use client";
import { useState } from "react";
import { Tick02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "./Icon";
import { Mascot } from "./Mascot";
import { actions, useStore, who } from "@/lib/store";

export function Todo() {
  const s = useStore();
  const [text, setText] = useState("");
  const open = s.todos.filter((t) => !t.done).length, all = s.todos.length;
  const mood = all && !open ? "ecstatic" : open > 5 ? "sad" : all ? "happy" : "normal";
  const line = all === 0 ? "What's on your plate today? Let's keep it small and doable."
    : open === 0 ? "ALL DONE! Time to roll around like a happy panda."
    : open > 5 ? `${open} things… that's a lot. Let's pick just one to start.` : `${open} thing${open === 1 ? "" : "s"} left. One at a time!`;
  const sorted = [...s.todos].sort((a, b) => Number(a.done) - Number(b.done) || (a.done ? (b.doneAt ?? 0) - (a.doneAt ?? 0) : a.ts - b.ts));
  return (
    <section className="view">
      <div className="card">
        <div className="prompt-row"><Mascot kind="panda" mood={mood} className="mini" /><motion.div key={line} initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 26 }} className="bubble" dangerouslySetInnerHTML={{ __html: `${who(s, "P")} ${line}` }} /></div>
        <form className="tform" style={{ marginTop: 10 }} onSubmit={(e) => { e.preventDefault(); if (text.trim()) { actions.addTodo(text.trim().slice(0, 140)); setText(""); } }}>
          <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a little task…" maxLength={140} autoComplete="off" />
          <button className="btn primary" type="submit">Add</button>
        </form>
        <ul className="tlist">
          <AnimatePresence initial={false}>
          {sorted.map((t) => (
            <motion.li key={t.id} className={t.done ? "done" : ""} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}>
              <button className="check" aria-label="toggle" onClick={() => actions.toggleTodo(t.id)}>
                <AnimatePresence>{t.done && <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 600, damping: 18 }} style={{ display: "grid" }}><Icon icon={Tick02Icon} size={16} stroke={3} /></motion.span>}</AnimatePresence>
              </button>
              <span className="txt">{t.text}</span>
              <button className="x" aria-label="Delete" onClick={() => actions.deleteTodo(t.id)}><Icon icon={Cancel01Icon} size={18} /></button>
            </motion.li>
          ))}
          </AnimatePresence>
          {!sorted.length && <li className="empty" style={{ justifyContent: "center", border: 0 }}>Nothing here yet</li>}
        </ul>
        {s.todos.some((t) => t.done) && <button className="link" onClick={actions.clearDone}>Clear finished</button>}
      </div>
    </section>
  );
}
