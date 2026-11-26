import { hitOf, pctOf, type State } from "@/lib/store";
export function Ring({ s, k, label }: { s: State; k: string; label: number }) {
  const p = Math.min(100, Math.round(pctOf(s, k) * 100));
  return <span className={`ring ${hitOf(s, k) ? "done" : ""}`} style={{ ["--p" as string]: p }}><b>{label}</b></span>;
}
