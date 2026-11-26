"use client";
import { DropletIcon, ChartLineData01Icon, DressIcon, BookOpen01Icon, CheckmarkSquare02Icon, GiftIcon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";

export const TABS = [
  { id: "home", label: "Today", icon: DropletIcon },
  { id: "overview", label: "Stats", icon: ChartLineData01Icon },
  { id: "style", label: "Style", icon: DressIcon },
  { id: "journal", label: "Journal", icon: BookOpen01Icon },
  { id: "todo", label: "To-do", icon: CheckmarkSquare02Icon },
  { id: "rewards", label: "Gifts", icon: GiftIcon },
] as const;
export type TabId = (typeof TABS)[number]["id"];

export function TabBar({ tab, onChange }: { tab: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav className="tabs"><div className="tabs-in">
      {TABS.map((t) => (
        <button key={t.id} className={tab === t.id ? "on" : ""} onClick={() => onChange(t.id)}>
          <span><Icon icon={t.icon} size={22} stroke={tab === t.id ? 2.1 : 1.8} /></span>{t.label}
        </button>
      ))}
    </div></nav>
  );
}
