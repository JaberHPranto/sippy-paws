"use client";
import { useState } from "react";
import { Tick02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
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
        <div className="prompt-row"><Mascot kind="panda" mood={mood} className="mini" /><div className="bubble" dangerouslySetInnerHTML={{ __html: `${who(s, "P")} ${line}` }} /></div>
        <form className="tform" style={{ marginTop: 10 }} onSubmit={(e) => { e.preventDefault(); if (text.trim()) { actions.addTodo(text.trim().slice(0, 140)); setText(""); } }}>
          <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a little task…" maxLength={140} autoComplete="off" />
          <button className="btn primary" type="submit">Add</button>
        </form>
        <ul className="tlist">
          {sorted.length ? sorted.map((t) => (
            <li key={t.id} className={t.done ? "done" : ""}>
              <button className="check" aria-label="toggle" onClick={() => actions.toggleTodo(t.id)}>{t.done && <Icon icon={Tick02Icon} size={16} stroke={3} />}</button>
              <span className="txt">{t.text}</span>
              <button className="x" aria-label="Delete" onClick={() => actions.deleteTodo(t.id)}><Icon icon={Cancel01Icon} size={18} /></button>
            </li>
          )) : <li className="empty" style={{ justifyContent: "center", border: 0 }}>Nothing here yet</li>}
        </ul>
        {s.todos.some((t) => t.done) && <button className="link" onClick={actions.clearDone}>Clear finished</button>}
      </div>
    </section>
  );
}
