"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Cards02Icon, Recycle03Icon, MailLove01Icon, Sun03Icon, Sofa01Icon, FavouriteIcon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { Icon } from "./Icon";
import { useModal } from "./Modal";
import { COZ, COZY, DUST, MOM, MOMENTS, PACK_COST, RARITY, cardBack, cardHTML, claimSpecials, clearReveals, latestInst, openPack, packArt, pendingSpecials, recycleDupes, setInfo, shiftReveal, specialList, useReveals } from "@/lib/cards";
import { dk } from "@/lib/dates";
import { confetti, partnerOf, testOn, useStore } from "@/lib/store";
import { sfx } from "@/lib/sound";

type Set = "moments" | "cozy" | "special";
const html = (h: string) => ({ __html: h });
const z = (n: number) => String(n).padStart(2, "0");

/** A card that tilts and shines under your finger. */
export function TiltCard({ h }: { h: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>(".pcard"); if (!el) return;
    const set = (x: number, y: number) => { el.style.setProperty("--rx", `${(0.5 - y) * 16}deg`); el.style.setProperty("--ry", `${(x - 0.5) * 18}deg`); el.style.setProperty("--mx", `${x * 100}%`); el.style.setProperty("--my", `${y * 100}%`); };
    const move = (e: PointerEvent) => { const r = el.getBoundingClientRect(); set((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); el.classList.add("tilting"); };
    const leave = () => { set(0.5, 0.5); el.classList.remove("tilting"); };
    el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave); el.addEventListener("pointerup", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); el.removeEventListener("pointerup", leave); };
  }, [h]);
  return <div ref={ref} dangerouslySetInnerHTML={html(h)} />;
}

function ShowCard({ set, id, u }: { set: Set; id: string; u?: string }) {
  const s = useStore(), { close } = useModal();
  const def = set === "moments" ? MOM[id] : set === "cozy" ? COZ[id] : specialList(s).find((d) => d.id === id);
  let insts = set === "moments" ? s.cards.filter((c) => c.d === id) : [latestInst(s, set, def)];
  if (!insts.length) insts = [latestInst(s, set, def)];
  const [i, setI] = useState(() => (u ? Math.max(0, insts.findIndex((c) => (c as { u?: string } | null)?.u === u)) : insts.length - 1));
  return (
    <>
      <motion.div key={i} initial={{ rotateY: 30, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}><TiltCard h={cardHTML(s, set, def, insts[i], true)} /></motion.div>
      {insts.length > 1 && <div className="card-nav"><button className="btn ghost" disabled={i === 0} onClick={() => setI(i - 1)}>‹</button><span className="small muted" style={{ fontWeight: 800 }}>Copy {i + 1} of {insts.length}</span><button className="btn ghost" disabled={i === insts.length - 1} onClick={() => setI(i + 1)}>›</button></div>}
      <p className="muted small" style={{ textAlign: "center", margin: "6px 0" }}>Drag across the card to tilt it</p>
      <button className="btn primary" style={{ width: "100%" }} onClick={close}>Close</button>
    </>
  );
}

function PackSheet({ pulls, dupes }: { pulls: (typeof COZY)[number][]; dupes: boolean[] }) {
  const s = useStore(), { open, close } = useModal();
  const [stage, setStage] = useState<"pack" | "rip" | "cards">("pack"), [flipped, setFlipped] = useState<boolean[]>([false, false, false]);
  const rip = () => { setStage("rip"); sfx("swoosh"); setTimeout(() => setStage("cards"), 550); };
  const flip = (i: number) => {
    if (flipped[i]) { open(<ShowCard set="cozy" id={pulls[i].id} />); return; }
    const f = [...flipped]; f[i] = true; setFlipped(f);
    const big = RARITY[pulls[i].r as keyof typeof RARITY].w <= 6;
    sfx(big ? "success" : "tick"); if (big) confetti();
  };
  return (
    <div style={{ textAlign: "center" }}>
      <h2>Cozy Collection pack</h2>
      <p className="muted small" style={{ fontWeight: 800 }}>{stage === "cards" ? "Tap each card to flip it" : "Tap the pack to tear it open!"}</p>
      {stage !== "cards" ? (
        <button className={`pack ${stage === "rip" ? "rip" : ""}`} aria-label="Open pack" onClick={rip} dangerouslySetInnerHTML={html(packArt())} />
      ) : (
        <div className="pull-row">
          {pulls.map((d, i) => (
            <motion.button key={i} className={`flip ${flipped[i] ? "on" : ""}`} onClick={() => flip(i)} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.12, type: "spring", stiffness: 300, damping: 20 }}>
              <div className="flip-in"><div className="face fb" dangerouslySetInnerHTML={html(cardBack())} />
                <div className="face ff"><div dangerouslySetInnerHTML={html(cardHTML(s, "cozy", d, null))} /><span className={`dupe ${dupes[i] ? "" : "new"}`}>{dupes[i] ? "DUPE" : "NEW"}</span></div></div>
            </motion.button>
          ))}
        </div>
      )}
      {flipped.every(Boolean) && <div className="btns"><button className="btn primary" style={{ flex: 1 }} onClick={close}>Add to binder</button></div>}
    </div>
  );
}

const SETS: [Set, string, IconSvgElement][] = [["moments", "Daily Moments", Sun03Icon], ["cozy", "Cozy Collection", Sofa01Icon], ["special", "Specials", FavouriteIcon]];

export function Cards() {
  const s = useStore(), { open } = useModal(), [set, setSet] = useState<Set>("moments");
  const unclaimed = pendingSpecials(s);
  const tot = MOMENTS.length + COZY.length + specialList(s).length;
  const got = MOMENTS.filter(setInfo(s, "moments").have).length + COZY.filter(setInfo(s, "cozy").have).length + Object.keys(s.claimed).length;
  const dupes = Object.values(s.packCards).reduce((a, c) => a + Math.max(0, c - 1), 0);
  const today = s.cards.filter((c) => c.k === dk());
  const info = setInfo(s, set), have = info.list.filter(info.have).length;
  const packLabel = testOn(s) ? "Open pack (free · test)" : s.packs > 0 ? `Open free pack (${s.packs})` : `Buy pack · ${PACK_COST} paw points`;
  const buyPack = () => {
    const r = openPack();
    if (!r.ok) { open(<><h2>Not enough paw points</h2><p className="muted">A pack costs {PACK_COST}. Hit today&apos;s water goal for a free one!</p></>); return; }
    open(<PackSheet pulls={r.pulls} dupes={r.dupes} />);
  };
  return (
    <>
      <div className="card cards-hero">
        <div className="card-h"><div><h3 style={{ margin: 0, display: "flex", gap: 6, alignItems: "center" }}><Icon icon={Cards02Icon} size={20} />Paw Cards</h3><div className="muted small" style={{ fontWeight: 700 }}>Collect moments from your days with {s.settings.pandaName} &amp; {s.settings.catName}</div></div><span className="tag lv">{got} / {tot}</span></div>
        <div className="pack-row"><div className="pack mini-pack" dangerouslySetInnerHTML={html(packArt())} />
          <div style={{ flex: 1 }}><b style={{ fontFamily: "var(--fd)", fontSize: 18 }}>Cozy Collection</b><div className="muted small" style={{ fontWeight: 700 }}>3 cards per pack · 3rd card is always Rare or better. Hit your water goal for a free pack!</div>
            <motion.button whileTap={{ scale: 0.95 }} className="btn pink" style={{ width: "100%", marginTop: 10 }} onClick={buyPack}>{packLabel}</motion.button>
            {dupes > 0 && <button className="link" onClick={recycleDupes} style={{ display: "flex", gap: 4, alignItems: "center" }}><Icon icon={Recycle03Icon} size={15} />Recycle {dupes} duplicates (+{dupes * DUST} points)</button>}</div></div>
      </div>
      {unclaimed.length > 0 && (
        <motion.div className="card gift-banner" initial={{ scale: 0.95 }} animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 2.4 }}>
          <div style={{ color: "var(--pink)" }}><Icon icon={MailLove01Icon} size={30} /></div>
          <div style={{ flex: 1 }}><b>{partnerOf(s)} sent you {unclaimed.length === 1 ? "a special card" : `${unclaimed.length} special cards`}!</b><div className="small muted" style={{ fontWeight: 700 }}>One-of-a-kind. Only you have these.</div></div>
          <button className="btn pink" onClick={claimSpecials}>Open</button>
        </motion.div>
      )}
      {today.length > 0 && (
        <div className="card"><div className="card-h"><h3>Earned today</h3><span className="tag own">{today.length} new</span></div>
          <div className="card-row">{today.map((c) => <div key={c.u} className="cslot" onClick={() => open(<ShowCard set="moments" id={c.d} u={c.u} />)} dangerouslySetInnerHTML={html(cardHTML(s, "moments", MOM[c.d], c))} />)}</div></div>
      )}
      <div className="card">
        <div className="filters">{SETS.map(([id, l, ic]) => <button key={id} className={set === id ? "on" : ""} onClick={() => setSet(id)} style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><Icon icon={ic} size={13} stroke={2} />{l}</button>)}</div>
        <div className="lvl" style={{ margin: "2px 0 12px" }}><span className="small">Set progress</span><div className="bar"><i style={{ width: `${info.list.length ? Math.round((have / info.list.length) * 100) : 0}%` }} /></div><span className="small muted">{have} / {info.list.length}</span></div>
        {set === "moments" && <p className="muted small" style={{ margin: "-4px 0 10px" }}>Moment cards are minted from your real days, so every copy wears that day&apos;s outfit and stats.</p>}
        {info.list.length ? (
          <div className="binder">
            {info.list.map((d, i) => {
              if (!info.have(d)) return (
                <div key={d.id} className="cslot empty-slot"><div className="ghost-card"><span className="gc-no">#{z(i + 1)}</span><span className="gc-r">{RARITY[d.r as keyof typeof RARITY].sym} {RARITY[d.r as keyof typeof RARITY].label}</span><span className="gc-q">?</span>
                  {set === "moments" ? <span className="gc-h">{(d as { hint?: string }).hint}</span> : set === "cozy" ? <span className="gc-h">Found in packs</span> : null}</div></div>
              );
              const inst = latestInst(s, set, d), cnt = set === "moments" ? s.cards.filter((c) => c.d === d.id).length : set === "cozy" ? s.packCards[d.id] ?? 0 : 1;
              return (
                <motion.div key={d.id} className="cslot" whileTap={{ scale: 0.95 }} onClick={() => open(<ShowCard set={set} id={d.id} />)}>
                  <div dangerouslySetInnerHTML={html(cardHTML(s, set, d, inst))} />{cnt > 1 && <span className="cnt">×{cnt}</span>}
                </motion.div>
              );
            })}
          </div>
        ) : <div className="empty">No special cards yet. {partnerOf(s)} might be making one</div>}
      </div>
    </>
  );
}

/** Pops a "New Paw Card!" sheet whenever a card is minted or a special is unwrapped. */
export function RevealHost({ goCards }: { goCards: () => void }) {
  const q = useReveals(), s = useStore(), { open, close, isOpen } = useModal();
  useEffect(() => {
    if (!q.length || isOpen) return;
    const r = shiftReveal(); if (!r) return;
    const rare = r.set === "special" || RARITY[r.def.r as keyof typeof RARITY].w <= 6;
    if (rare) confetti();
    sfx(rare ? "success" : "chime");
    open(
      <div style={{ textAlign: "center" }}>
        <h2>{r.set === "special" ? `A card from ${partnerOf(s)}` : "New Paw Card!"}</h2>
        {r.set !== "special" && <p className="muted small" style={{ fontWeight: 800, margin: "0 0 10px" }}>{r.set === "moments" ? "Daily Moments" : "Cozy Collection"} · {RARITY[r.def.r as keyof typeof RARITY].label}</p>}
        <motion.div className="reveal" initial={{ rotateY: 100, scale: 0.6, opacity: 0 }} animate={{ rotateY: 0, scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 160, damping: 14 }}>
          <TiltCard h={cardHTML(s, r.set, r.def, r.inst, true)} />
        </motion.div>
        {r.set === "special"
          ? <button className="btn pink" style={{ width: "100%" }} onClick={close}>Keep it forever</button>
          : <div className="btns"><button className="btn ghost" style={{ flex: 1 }} onClick={close}>{q.length ? `Next (${q.length} more)` : "Add to binder"}</button>
              <button className="btn pink" style={{ flex: 1 }} onClick={() => { clearReveals(); close(); goCards(); }}>Open binder</button></div>}
      </div>,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.length, isOpen]);
  return null;
}
