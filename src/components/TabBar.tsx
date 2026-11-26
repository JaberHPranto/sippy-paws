"use client";
import {
  Home01Icon, ChartLineData01Icon, Shirt01Icon, BookOpen01Icon, Task01Icon, GiftIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";

export const TABS = [
  { id: "today", label: "Today", icon: Home01Icon },
  { id: "stats", label: "Stats", icon: ChartLineData01Icon },
  { id: "style", label: "Style", icon: Shirt01Icon },
  { id: "journal", label: "Journal", icon: BookOpen01Icon },
  { id: "todo", label: "To-do", icon: Task01Icon },
  { id: "gifts", label: "Gifts", icon: GiftIcon },
] as const;
export type TabId = (typeof TABS)[number]["id"];

export function TabBar({ tab, onChange }: { tab: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav className="safe-b fixed inset-x-0 bottom-0 z-20 border-t border-black/5 bg-white/90 backdrop-blur">
      <ul className="mx-auto flex max-w-md justify-between px-2 pt-2">
        {TABS.map((t) => {
          const on = t.id === tab;
          return (
            <li key={t.id} className="flex-1">
              <button
                onClick={() => onChange(t.id)}
                aria-current={on ? "page" : undefined}
                className={`flex w-full flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-bold transition ${on ? "text-brand-d" : "text-muted"}`}
              >
                <span className={`grid h-9 w-12 place-items-center rounded-2xl transition ${on ? "bg-brand/15" : ""}`}>
                  <Icon icon={t.icon} size={22} stroke={on ? 2.2 : 1.7} />
                </span>
                {t.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
