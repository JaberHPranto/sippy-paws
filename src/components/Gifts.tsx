"use client";
import { motion } from "motion/react";
import { DressIcon, MailLove01Icon, Ticket01Icon, PawPrintIcon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";
import { useModal } from "./Modal";
import { OwnerPanel } from "./Owner";
import { COUPON_ICONS, type Coupon } from "@/lib/data";
import { fmtDate } from "@/lib/dates";
import { useCoupons } from "@/lib/shared";
import { actions, partnerOf, useOwner, useStore, type Ticket } from "@/lib/store";

function BigTicket({ t, icon }: { t: Ticket; icon: Coupon["icon"] }) {
  const { close } = useModal(), s = useStore();
  return (
    <>
      <motion.div className="big-ticket" initial={{ scale: 0.6, rotate: -6, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 16 }}>
        <div className="e" style={{ color: "var(--pink)" }}><Icon icon={COUPON_ICONS[icon] ?? Ticket01Icon} size={54} stroke={1.6} /></div>
        <div className="t">{t.title}</div>
        <div className="code">{t.code}</div>
        <div className="muted small" style={{ fontWeight: 700, marginTop: 6 }}>Redeemed {fmtDate(t.ts)} · show this to {partnerOf(s)}</div>
      </motion.div>
      <button className="btn primary" style={{ width: "100%" }} onClick={close}>Close</button>
    </>
  );
}

export function Gifts({ go }: { go: (t: "style") => void }) {
  const s = useStore(), owner = useOwner(), coupons = useCoupons(), { open, close } = useModal();
  const iconFor = (id: string) => coupons.find((c) => c.id === id)?.icon ?? "gift";
  const tryRedeem = (c: Coupon) => {
    if (s.points < c.cost) {
      open(<><h2>{c.title}</h2><p className="muted">You need <b>{c.cost - s.points}</b> more paw points. Keep sipping!</p><button className="btn primary" style={{ width: "100%" }} onClick={close}>Okay!</button></>);
      return;
    }
    open(<><h2>Redeem {c.title}?</h2><p className="muted">This uses <b>{c.cost}</b> of your {s.points} paw points.</p>
      <div className="btns"><button className="btn ghost" onClick={close}>Not yet</button>
        <button className="btn pink" style={{ flex: 1 }} onClick={() => { const t = actions.redeem(c); if (t) open(<BigTicket t={t} icon={c.icon} />); }}>Redeem it!</button></div></>);
  };
  return (
    <section className="view">
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ color: "var(--pink)" }}><Icon icon={DressIcon} size={30} /></div>
        <div style={{ flex: 1 }}><b>Outfits &amp; level rewards</b><div className="muted small" style={{ fontWeight: 700 }}>Dress up {s.settings.pandaName} &amp; {s.settings.catName} in the Style tab</div></div>
        <button className="btn ghost" style={{ padding: "10px 12px", fontSize: 13 }} onClick={() => go("style")}>Open ›</button>
      </div>
      <div className="card">
        <h3 style={{ display: "flex", alignItems: "center" }}>Love coupons<Icon icon={MailLove01Icon} size={20} /></h3>
        <p className="muted small" style={{ marginTop: -4 }}>Spend paw points on real treats. Redeem one, then show {partnerOf(s)} the ticket.</p>
        <div className="coupons">
          {coupons.map((c) => (
            <motion.button whileTap={{ scale: 0.95, rotate: -1 }} key={c.id} className={`coupon ${s.points < c.cost ? "locked" : ""}`} onClick={() => tryRedeem(c)}>
              <span className="e"><Icon icon={COUPON_ICONS[c.icon] ?? Ticket01Icon} size={30} stroke={1.7} /></span><span className="t">{c.title}</span>
              <span className="c" style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon icon={PawPrintIcon} size={14} stroke={2.2} />{c.cost}</span>
            </motion.button>
          ))}
        </div>
      </div>
      <div className="card">
        <h3 style={{ display: "flex", alignItems: "center" }}>My tickets<Icon icon={Ticket01Icon} size={20} /></h3>
        {s.redeemed.length ? [...s.redeemed].reverse().map((r) => (
          <button key={r.code} className="ticket" style={{ width: "100%", textAlign: "left" }} onClick={() => open(<BigTicket t={r} icon={iconFor(r.couponId)} />)}>
            <span className="e"><Icon icon={COUPON_ICONS[iconFor(r.couponId)] ?? Ticket01Icon} size={24} /></span>
            <div><div>{r.title}</div><div className="meta">{fmtDate(r.ts)} · code {r.code}</div></div>
          </button>
        )) : <p className="muted small">Redeemed coupons show up here.</p>}
      </div>
      <div className="card">
        <h3 style={{ display: "flex", alignItems: "center" }}>How to earn<Icon icon={PawPrintIcon} size={20} /></h3>
        <ul className="earn">
          <li>Each drink you log: <b>+2</b></li>
          <li>Hit your daily water goal: <b>+15</b></li>
          <li>First journal entry of the day: <b>+10</b></li>
          <li>Finish a to-do: <b>+3</b> (up to 30 a day)</li>
          <li>Hit your water goal: <b>free Paw Card pack</b></li>
          <li>Spend points on coupons here, or on outfits &amp; card packs in Style</li>
        </ul>
      </div>
      {owner && <OwnerPanel />}
    </section>
  );
}
