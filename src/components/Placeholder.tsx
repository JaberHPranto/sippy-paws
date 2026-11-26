import { Bao } from "./Bao";
export function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center px-8 pt-20 text-center">
      <Bao mood="sleepy" size={120} />
      <h2 className="mt-4 font-display text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted">Coming soon — being ported from the first version.</p>
    </div>
  );
}
