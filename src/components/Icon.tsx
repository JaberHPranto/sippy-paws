"use client";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

export function Icon({ icon, size = 20, stroke = 1.8, color }: { icon: IconSvgElement; size?: number; stroke?: number; color?: string }) {
  return <HugeiconsIcon icon={icon} size={size} strokeWidth={stroke} color={color ?? "currentColor"} className="hi" />;
}
