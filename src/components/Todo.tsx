"use client";
import { useState } from "react";
import { Add01Icon, Delete02Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";
import { actions, useStore } from "@/lib/store";

export function Todo() {
  const s = useStore();
  const [text, setText] = useState("");
  const open = s.todos.filter((t) => !t.done), done = s.todos.filter((t) => t.done);
  const add = () => { if (text.trim()) { actions.addTodo(text.trim()); setText(""); } };
  const row = (t: (typeof s.todos)[number]) => (
    <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm">
      <button onClick={() => actions.toggleTodo(t.id)} aria-label={t.done ? "Mark not done" : "Mark done"}
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition ${t.done ? "border-brand bg-brand text-white" : "border-black/15"}`}>
        {t.done && <Icon icon={Tick02Icon} size={16} stroke={3} />}
      </button>
      <span className={`flex-1 text-[15px] ${t.done ? "text-muted line-through" : ""}`}>{t.text}</span>
      <button onClick={() => actions.deleteTodo(t.id)} aria-label="Delete" className="text-muted"><Icon icon={Delete02Icon} size={18} /></button>
    </li>
  );
  return (
    <div className="px-5 pt-6">
      <h1 className="font-display text-2xl font-semibold">To-do</h1>
      <form onSubmit={(e) => { e.preventDefault(); add(); }} className="mt-3 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a little task…" className="flex-1 rounded-full bg-white px-4 py-3 text-[15px] shadow-sm outline-none focus:ring-2 focus:ring-brand/40" />
        <button aria-label="Add task" className="grid h-12 w-12 place-items-center rounded-full bg-brand text-white shadow-lg shadow-brand/30"><Icon icon={Add01Icon} /></button>
      </form>
      <ul className="mt-4 space-y-2">{open.map(row)}</ul>
      {!open.length && <p className="mt-8 text-center text-sm text-muted">{done.length ? "All done — Bao is proud of you." : "Nothing here yet."}</p>}
      {done.length > 0 && <><h2 className="mt-6 text-sm font-bold text-muted">Done ({done.length})</h2><ul className="mt-2 space-y-2">{done.map(row)}</ul></>}
    </div>
  );
}
