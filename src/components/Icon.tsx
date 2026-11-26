"use client";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";

export function Icon({
  icon,
  size = 22,
  stroke = 1.8,
  className,
}: {
  icon: IconSvgElement;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  return <HugeiconsIcon icon={icon} size={size} strokeWidth={stroke} className={className} />;
}
