"use client";
import { CoinsIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";
import { COUPONS } from "@/lib/coupons";
import { actions, useStore } from "@/lib/store";

export function Gifts() {
  const s = useStore();
  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Gifts</h1>
        <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-amber-600 shadow-sm"><Icon icon={CoinsIcon} size={18} /> {s.points}</span>
      </div>
      <p className="mt-1 text-sm text-muted">Trade paw points for real-life treats from Pranto.</p>
      <ul className="mt-4 space-y-3">
        {COUPONS.map((c) => {
          const can = s.points >= c.cost;
          return (
            <li key={c.id} className="flex items-center gap-3 rounded-3xl bg-card p-3 shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blush text-pink-500"><Icon icon={c.icon} size={26} /></span>
              <div className="flex-1"><p className="font-bold">{c.title}</p><p className="text-xs text-muted">{c.cost} points</p></div>
              <button disabled={!can} onClick={() => actions.redeem(c.id, c.title, c.cost)}
                className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-white disabled:bg-black/10 disabled:text-muted">Redeem</button>
            </li>
          );
        })}
      </ul>
      {s.redeemed.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display text-lg">Your coupons</h2>
          <ul className="mt-2 space-y-2">
            {s.redeemed.map((r) => (
              <li key={r.t} className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-brand/40 bg-white/70 p-3 text-sm font-bold">
                <span className="text-brand-d"><Icon icon={Tick02Icon} size={18} /></span>{r.title}
                <span className="ml-auto text-xs font-normal text-muted">{new Date(r.t).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
