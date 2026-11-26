"use client";
import { useState } from "react";
import { WrenchIcon, MailLove01Icon, ScissorIcon, Ticket01Icon, Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";
import { useModal } from "./Modal";
import { TiltCard } from "./Cards";
import { COUPON_ICONS, type Coupon, type CouponIconKey } from "@/lib/data";
import { buildSpecial, cardHTML, specialList } from "@/lib/cards";
import { useCoupons } from "@/lib/shared";
import { getState, toast, useStore } from "@/lib/store";
import { ALL_ITEMS } from "@/lib/style";
import { saveShared, useCloud } from "@/lib/sync";

/** Only the owner sees this (role = owner in Supabase). */
export function OwnerPanel() {
  const s = useStore(), cloud = useCloud(), { open, close } = useModal();
  const live = useCoupons();
  const [cs, setCs] = useState<Coupon[]>(live);
  const [sp, setSp] = useState({ name: "", kind: "duo", mood: "happy", scene: "sky", move: "", fl: "" });
  const scenes = ALL_ITEMS.filter((i) => i.slot === "scene");
  const sentSpecials = specialList(s);
  const wishes = cloud.inbox.filter((m) => m.kind === "wish"), redeems = cloud.inbox.filter((m) => m.kind === "redeem");
  const upd = (i: number, p: Partial<Coupon>) => setCs(cs.map((c, j) => (j === i ? { ...c, ...p } : c)));
  const sendSpecial = async () => {
    const d = buildSpecial(getState(), sp);
    try { await saveShared("specials", [...sentSpecials.map((x) => ({ ...x })), d].slice(-60)); toast("Card sent"); setSp({ ...sp, name: "", move: "", fl: "" }); }
    catch { toast("Couldn't send the card"); }
  };
  return (
    <div className="card owner">
      <h3 style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon icon={WrenchIcon} size={18} />Owner tools</h3>
      <p className="muted small" style={{ marginTop: -4 }}>Only you (the owner) see this. Edit the coupons {s.settings.partnerName || "she"} can redeem.</p>
      {cs.map((c, i) => (
        <div className="crow" key={c.id}>
          <select className="ce" value={c.icon} onChange={(e) => upd(i, { icon: e.target.value as CouponIconKey })} style={{ width: 92 }}>
            {Object.keys(COUPON_ICONS).map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <input className="ct" type="text" value={c.title} onChange={(e) => upd(i, { title: e.target.value })} />
          <input className="cc" type="number" min={1} value={c.cost} onChange={(e) => upd(i, { cost: +e.target.value })} />
          <button className="x" aria-label="Remove coupon" onClick={() => setCs(cs.filter((_, j) => j !== i))}><Icon icon={Cancel01Icon} size={16} /></button>
        </div>
      ))}
      <div className="btns">
        <button className="btn ghost" onClick={() => setCs([...cs, { id: "c" + Date.now().toString(36), icon: "gift", title: "New treat", cost: 100 }])}><Icon icon={Add01Icon} size={16} />Add coupon</button>
        <button className="btn pink" style={{ flex: 1 }} onClick={async () => { try { await saveShared("coupons", cs.filter((c) => c.title.trim())); toast("Coupons saved"); } catch { toast("Couldn't save coupons"); } }}>Save coupons</button>
      </div>

      <h3 style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 6 }}><Icon icon={MailLove01Icon} size={18} />Make her a special card</h3>
      <p className="muted small" style={{ marginTop: -4 }}>One-of-a-kind Paw Cards only she can have. They show up in her Cards screen to unwrap.</p>
      <label className="field">Card name<input type="text" maxLength={28} value={sp.name} onChange={(e) => setSp({ ...sp, name: e.target.value })} placeholder="e.g. Late Night Call" /></label>
      <div className="row2">
        <label className="field">Who&apos;s on it<select value={sp.kind} onChange={(e) => setSp({ ...sp, kind: e.target.value })}><option value="duo">Both</option><option value="panda">{s.settings.pandaName}</option><option value="cat">{s.settings.catName}</option></select></label>
        <label className="field">Expression<select value={sp.mood} onChange={(e) => setSp({ ...sp, mood: e.target.value })}>{[["happy", "Happy"], ["ecstatic", "Cheer"], ["wink", "Wink"], ["sleepy", "Sleepy"], ["normal", "Calm"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      </div>
      <div className="row2">
        <label className="field">Backdrop<select value={sp.scene} onChange={(e) => setSp({ ...sp, scene: e.target.value })}>{scenes.map((sc) => <option key={sc.id} value={sc.id}>{sc.name}</option>)}</select></label>
        <label className="field">Move name<input type="text" maxLength={22} value={sp.move} onChange={(e) => setSp({ ...sp, move: e.target.value })} placeholder="e.g. 3 AM Giggles" /></label>
      </div>
      <label className="field">Flavor text (a little message)<input type="text" maxLength={80} value={sp.fl} onChange={(e) => setSp({ ...sp, fl: e.target.value })} placeholder="e.g. For every call that ran past midnight." /></label>
      <p className="muted small">The card uses {s.settings.pandaName} &amp; {s.settings.catName}&apos;s outfits from your Dress Up screen.</p>
      <div className="btns">
        <button className="btn ghost" style={{ flex: 1 }} onClick={() => open(<><TiltCard h={cardHTML(getState(), "special", buildSpecial(getState(), sp), { t: Date.now() }, true)} /><button className="btn primary" style={{ width: "100%", marginTop: 10 }} onClick={close}>Looks good</button></>)}>Preview</button>
        <button className="btn pink" style={{ flex: 1 }} onClick={sendSpecial}>Send to her</button>
      </div>
      {sentSpecials.length > 0 && <div className="muted small" style={{ marginTop: 10 }}>Sent so far: {sentSpecials.map((x) => x.name).join(" · ")}</div>}

      <h3 style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 6 }}><Icon icon={ScissorIcon} size={18} />Outfit wishes from her</h3>
      {wishes.length ? wishes.map((w) => <div key={w.id} className="dline"><span>“{String(w.payload.text)}”</span><span className="v small">{new Date(w.created_at).toLocaleDateString()}</span></div>) : <div className="muted small">No wishes yet.</div>}
      <h3 style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 6 }}><Icon icon={Ticket01Icon} size={18} />Redeemed so far</h3>
      {redeems.length ? redeems.map((r) => <div key={r.id} className="dline"><span>{String(r.payload.title)} · <b>{String(r.payload.code)}</b></span><span className="v small">{new Date(r.created_at).toLocaleDateString()}</span></div>) : <div className="muted small">Nothing yet.</div>}
    </div>
  );
}
