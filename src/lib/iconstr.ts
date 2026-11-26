import type { IconSvgElement } from "@hugeicons/react";
const kebab = (k: string) => k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
/** Hugeicons → SVG string, for places that render HTML strings (cards, stages). */
export function iconSVG(icon: IconSvgElement, size = 16, sw = 2, color = "currentColor") {
  const body = (icon as unknown as [string, Record<string, string | number>][])
    .map(([tag, a]) => `<${tag} ${Object.entries(a).filter(([k]) => k !== "key").map(([k, v]) => `${kebab(k)}="${k === "strokeWidth" ? sw : k === "stroke" && v === "currentColor" ? color : k === "fill" && v === "currentColor" ? color : v}"`).join(" ")}/>`).join("");
  return `<svg class="hi" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
export const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
