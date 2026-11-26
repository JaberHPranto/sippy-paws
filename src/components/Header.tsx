"use client";
import { PawPrintIcon, Settings02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";
import { useStore } from "@/lib/store";
import { useModal } from "./Modal";
import { SettingsSheet } from "./Settings";

export function Header() {
  const s = useStore(), { open } = useModal();
  return (
    <header className="top">
      <div className="brand">Sippy <span>Paws</span></div>
      <div className="chip" title="Paw points"><Icon icon={PawPrintIcon} size={16} stroke={2} /> {s.points}</div>
      <button className="icon-btn" aria-label="Settings" onClick={() => open(<SettingsSheet />)}><Icon icon={Settings02Icon} size={20} /></button>
    </header>
  );
}
