"use client";
import { motion } from "motion/react";
import { DropletIcon, ChartLineData01Icon, DressIcon, BookOpen01Icon, CheckmarkSquare02Icon, GiftIcon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";
import { useOwner } from "@/lib/store";

const TABS = [
  { id: "home", label: "Today", icon: DropletIcon },
  { id: "overview", label: "Stats", icon: ChartLineData01Icon },
  { id: "style", label: "Style", icon: DressIcon },
  { id: "journal", label: "Journal", icon: BookOpen01Icon },
  { id: "todo", label: "To-do", icon: CheckmarkSquare02Icon },
  { id: "rewards", label: "Gifts", icon: GiftIcon },
] as const;
export type TabId = (typeof TABS)[number]["id"];

export function TabBar({ tab, onChange }: { tab: TabId; onChange: (t: TabId) => void }) {
  const owner = useOwner();
  return (
    <nav className="tabs"><div className="tabs-in">
      {TABS.filter((t) => owner || t.id !== "rewards").map((t) => {
        const on = tab === t.id;
        return (
          <button key={t.id} className={on ? "on" : ""} onClick={() => onChange(t.id)}>
            {on && <motion.i layoutId="tab-pill" className="tab-pill" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
            <motion.span animate={on ? { y: [0, -4, 0], scale: [1, 1.15, 1] } : { y: 0, scale: 1 }} transition={{ duration: 0.35 }}>
              <Icon icon={t.icon} size={22} stroke={on ? 2.1 : 1.8} />
            </motion.span>{t.label}
          </button>
        );
      })}
    </div></nav>
  );
}
