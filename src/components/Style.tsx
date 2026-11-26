"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { DressIcon, ShoppingBag02Icon, WardrobeIcon, CameraIcon, Cards02Icon, DiceFaces03Icon, FloppyDiskIcon, PawPrintIcon, Clock01Icon, StarIcon, ScissorIcon, Mail01Icon, LockIcon, Tick02Icon, FavouriteIcon, Search01Icon, Cancel01Icon, Delete02Icon, } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { Icon } from "./Icon";
import { useModal } from "./Modal";
import { Cards } from "./Cards";
import { charSVG, sceneSVG, soloStage, duoStage } from "@/lib/mascots";
import { moodNow } from "@/lib/mood";
import { fmtDate } from "@/lib/dates";
import { levelInfo, partnerOf, isOwner, useStore, type Snap, type State } from "@/lib/store";
import { ALL_ITEMS, BORDERS, DUOS, DUO_ICON, ITEM_BY, POSES, SLOT_ICON, SLOT_LIST, activeLook, badges, effLevel, featured, nameOf, outfitLine, owns, priceOf, sceneNow, shopItems, slotName, style, untilMidnight, wearables, type Item } from "@/lib/style";

export type StyleView = "dress" | "shop" | "closet" | "look" | "cards";
const NAV: [StyleView, string, IconSvgElement][] = [["dress", "Dress up", DressIcon], ["shop", "Boutique", ShoppingBag02Icon], ["closet", "Closet", WardrobeIcon], ["look", "Lookbook", CameraIcon], ["cards", "Cards", Cards02Icon]];
const html = (h: string) => ({ __html: h });
const svgScene = (id: string) => `<svg viewBox="0 0 300 200">${sceneSVG(id)}</svg>`;
type K = "panda" | "cat";

export function StyleTab({ view, setView }: { view: StyleView; setView: (v: StyleView) => void }) {
  const [shopF, setShopF] = useState("all");
  const goShop = (f: string) => { setShopF(f); setView("shop"); window.scrollTo({ top: 0 }); };
  return (
    <section className="view">
      <div className="subnav">
        {NAV.map(([id, l, ic]) => (
          <button key={id} className={view === id ? "on" : ""} onClick={() => { setView(id); window.scrollTo({ top: 0 }); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <Icon icon={ic} size={15} stroke={2} />{l}
          </button>
        ))}
      </div>
      {view === "dress" && <Dress goShop={goShop} goLook={() => setView("look")} />}
      {view === "shop" && <Shop filter={shopF} setFilter={setShopF} />}
      {view === "closet" && <Closet goShop={goShop} />}
      {view === "look" && <Look goShop={goShop} />}
      {view === "cards" && <Cards />}
    </section>
  );
}

function tag(it: Item) {
  if (it.lvl) return <span className="tag lv">Lv.{it.lvl} {it.lvl >= 8 ? "Epic" : it.lvl >= 5 ? "Rare" : "Sweet"}</span>;
  if (it.free) return <span className="tag own">Starter</span>;
  return <span className="tag shop">{slotName(it.slot)}</span>;
}
function thumb(s: State, it: Item, kind: K, look?: Record<string, string>) {
  if (it.slot === "scene") return svgScene(it.id);
  return charSVG(kind, "normal", look ?? { ...activeLook(s, kind), [it.slot]: it.id });
}

function ItemCard({ it, kind, mode, goShop }: { it: Item; kind: K; mode: "dress" | "shop"; goShop?: (f: string) => void }) {
  const s = useStore(), { open } = useModal();
  const have = owns(s, it.id), eq = it.slot === "scene" ? sceneNow(s) === it.id : activeLook(s, kind)[it.slot] === it.id;
  let btn: React.ReactNode;
  if (mode === "shop") btn = have ? <button className="act owned" disabled>Owned ✓</button>
    : <button className="act buy" onClick={() => open(<BuySheet it={it} />)}><span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><Icon icon={PawPrintIcon} size={13} stroke={2.2} />{priceOf(s, it)}</span></button>;
  else if (have) btn = <button className={`act ${eq ? "unequip" : "equip"}`} onClick={() => style.equip(kind, it.id)}>{eq ? (it.slot === "scene" ? "In use" : "Unequip") : it.slot === "scene" ? "Use" : "Equip"}</button>;
  else if (it.lvl) btn = <button className="act locked" disabled style={{ display: "inline-flex", gap: 4, alignItems: "center", justifyContent: "center" }}><Icon icon={LockIcon} size={13} stroke={2.2} />Bond Lv {it.lvl}</button>;
  else btn = <button className="act buy" onClick={() => goShop?.(it.slot)} style={{ display: "inline-flex", gap: 4, alignItems: "center", justifyContent: "center" }}><Icon icon={PawPrintIcon} size={13} stroke={2.2} />{it.cost} · Boutique</button>;
  return (
    <motion.div layout className={`item ${eq ? "eq" : ""} ${have ? "" : "lock"}`}>
      {tag(it)}{eq && <span className="chk"><Icon icon={Tick02Icon} size={12} stroke={3} /></span>}
      <div className="thumb" dangerouslySetInnerHTML={html(thumb(s, it, kind))} />
      <div className="nm">{it.name}</div><div className="ds">{it.desc}</div>{btn}
    </motion.div>
  );
}

function BuySheet({ it }: { it: Item }) {
  const s = useStore(), { close, open } = useModal();
  const price = priceOf(s, it), k = s.editing;
  if (s.points < price) return <><h2>{it.name}</h2><p className="muted">You need <b>{price - s.points}</b> more paw points. Keep sipping!</p><button className="btn primary" style={{ width: "100%" }} onClick={close}>Okay!</button></>;
  const look = it.slot === "scene" ? activeLook(s, k) : { ...activeLook(s, k), [it.slot]: it.id };
  return (
    <>
      <h2>Unlock {it.name}?</h2>
      <div className="stagebox" style={{ margin: "8px 0" }} dangerouslySetInnerHTML={html(it.slot === "scene" ? svgScene(it.id) : soloStage(k, "happy", look, sceneNow(s)))} />
      <p className="muted">This uses <b>{price}</b> of your {s.points} paw points.</p>
      <div className="btns"><button className="btn ghost" onClick={close}>Not yet</button><button className="btn pink" style={{ flex: 1 }} onClick={() => { if (style.buy(it.id)) close(); else open(<BuySheet it={it} />); }}>Unlock!</button></div>
    </>
  );
}

function BondCard() {
  const s = useStore(), L = levelInfo(s.xp), lv = effLevel(s), t = isOwner();
  return (
    <div className="card"><div className="card-h">
      <div className="seg">
        <button className={s.editing === "panda" ? "on" : ""} onClick={() => style.setEditing("panda")}>{s.settings.pandaName}</button>
        <button className={s.editing === "cat" ? "on" : ""} onClick={() => style.setEditing("cat")}>{s.settings.catName}</button>
      </div>
      <span className="tag lv" style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><Icon icon={FavouriteIcon} size={12} stroke={2.2} />Bond Lv.{lv}</span></div>
      <div className="lvl" style={{ marginTop: 0 }}><span className="small muted">Warm affinity</span><div className="bar"><i style={{ width: `${t ? 100 : Math.round((L.into / L.need) * 100)}%` }} /></div><span className="small muted">{t ? "MAX" : `${L.into}/${L.need} XP`}</span></div>
    </div>
  );
}

function SlotFilters({ value, set, extra = [], scenes = false }: { value: string; set: (v: string) => void; extra?: [string, string][]; scenes?: boolean }) {
  return (
    <div className="filters">
      {extra.map(([id, l]) => <button key={id} className={value === id ? "on" : ""} onClick={() => set(id)}>{l}</button>)}
      {[...SLOT_LIST, ...(scenes ? [{ id: "scene", name: "Scenes" }] : [])].map((sl) => (
        <button key={sl.id} className={value === sl.id ? "on" : ""} onClick={() => set(sl.id)} style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><Icon icon={SLOT_ICON[sl.id]} size={13} stroke={2} />{sl.name}</button>
      ))}
    </div>
  );
}

/* ---------- Dress up ---------- */
function Dress({ goShop, goLook }: { goShop: (f: string) => void; goLook: () => void }) {
  const s = useStore(), { open } = useModal();
  const [slotF, setSlotF] = useState("all"), [line, setLine] = useState(0);
  const k = s.editing, look = activeLook(s, k), mood = s.pose && s.pose !== "auto" ? s.pose : moodNow(s);
  const list = wearables().filter((i) => slotF === "all" || i.slot === slotF);
  const ownedCount = wearables().filter((i) => owns(s, i.id)).length;
  return (
    <>
      <BondCard />
      <div className="card">
        <motion.div key={line + k + JSON.stringify(look)} className="bubble" style={{ margin: "0 0 12px" }} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} dangerouslySetInnerHTML={html(outfitLine(s, k))} />
        <div className="stagebox">
          <div className="pills">{Object.keys(look).length ? Object.entries(look).map(([sl, id]) => <span key={sl} className="pill">● {slotName(sl)}: {ITEM_BY[id].name}</span>) : <span className="pill muted">Nothing equipped yet</span>}</div>
          <motion.div key={JSON.stringify(look) + mood} className="stage-wrap" initial={{ scale: 0.97 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}
            onClick={() => setLine((n) => n + 1)} dangerouslySetInnerHTML={html(soloStage(k, mood, look, sceneNow(s)))} />
        </div>
        <div className="btns">
          <button className="btn ghost nw" onClick={style.random}><Icon icon={DiceFaces03Icon} size={16} stroke={2} />Random</button>
          <button className="btn ghost nw" onClick={goLook}><Icon icon={CameraIcon} size={16} stroke={2} />Snap</button>
          <button className="btn pink nw" style={{ flex: 1 }} onClick={() => open(<PresetSheet />)}><Icon icon={FloppyDiskIcon} size={16} stroke={2} />Save outfit</button>
        </div>
      </div>
      <div className="card">
        <div className="card-h"><h3>Pose &amp; expression</h3><span className="tag">{POSES.length} available</span></div>
        <div className="pose-row">{POSES.map(([id, l, ic]) => <button key={id} className={`pose ${(s.pose || "auto") === id ? "on" : ""}`} onClick={() => style.setPose(id)}><span><Icon icon={ic} size={22} /></span>{l}</button>)}</div>
        <p className="muted small" style={{ margin: "8px 0 0" }}>&quot;Mood&quot; follows how her water is going today.</p>
      </div>
      <div className="card">
        <div className="card-h"><h3>Wardrobe</h3><span className="tag own">{ownedCount} / {wearables().length} unlocked</span></div>
        <SlotFilters value={slotF} set={setSlotF} extra={[["all", "All items"]]} />
        <div className="items">{list.map((it) => <ItemCard key={it.id} it={it} kind={k} mode="dress" goShop={goShop} />)}</div>
      </div>
    </>
  );
}

function PresetSheet() {
  const s = useStore(), { close } = useModal(), [name, setName] = useState("");
  return (
    <>
      <h2>Save this look</h2>
      <div className="stagebox" style={{ margin: "8px 0" }} dangerouslySetInnerHTML={html(duoStage("together", sceneNow(s), activeLook(s, "panda"), activeLook(s, "cat")))} />
      <label className="field">Preset name<input type="text" maxLength={30} autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Morning tea time" /></label>
      <div className="btns"><button className="btn ghost" onClick={close}>Cancel</button><button className="btn pink" style={{ flex: 1 }} onClick={() => { style.savePreset(name.trim()); close(); }}>Save preset</button></div>
    </>
  );
}

/* ---------- Boutique ---------- */
function Shop({ filter, setFilter }: { filter: string; setFilter: (v: string) => void }) {
  const s = useStore(), { open } = useModal(), [wish, setWish] = useState("");
  const f = featured(s), k = s.editing;
  const list = shopItems().filter((i) => filter === "all" || i.slot === filter);
  const fLook = f && f.slot !== "scene" ? { ...activeLook(s, k), [f.slot]: f.id } : activeLook(s, k);
  return (
    <>
      <div className="card">
        <div className="pts-hero"><div className="pts-ic" style={{ color: "#e5a400" }}><Icon icon={PawPrintIcon} size={24} stroke={2} /></div>
          <div style={{ flex: 1 }}><div className="big">{s.points} <span className="small muted">paw points</span></div><div className="muted small" style={{ fontWeight: 700 }}>Earn more from sips, journaling &amp; to-dos</div></div>
          <span className="tag" style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><Icon icon={Clock01Icon} size={12} stroke={2.2} />{untilMidnight()}</span></div>
        <div className="muted small" style={{ fontWeight: 800, marginTop: 10, display: "flex", justifyContent: "space-between" }}><span>Daily boutique pick</span><span>{shopItems().filter((i) => !s.owned[i.id]).length} designs left to collect</span></div>
      </div>
      {f ? (
        <div className="card featured">
          <div className="card-h"><span className="tag lv" style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><Icon icon={StarIcon} size={12} stroke={2.2} />Pick of the day</span><span className="tag shop">25% off today</span></div>
          <div className="stagebox"><div dangerouslySetInnerHTML={html(f.slot === "scene" ? svgScene(f.id) : soloStage(k, "happy", fLook, sceneNow(s)))} />
            <div className="feat-lbl"><b>{f.name}</b><span>{f.desc}</span></div></div>
          <button className="btn primary" style={{ width: "100%", marginTop: 12 }} onClick={() => open(<BuySheet it={f} />)}>
            Unlock item · {priceOf(s, f)} <s style={{ opacity: 0.6 }}>{f.cost}</s>
          </button>
        </div>
      ) : <div className="card"><div className="empty">You own every design in the boutique! Ask {partnerOf(s)} for something new in the wishbox below.</div></div>}
      <div className="card">
        <div className="card-h"><h3>Boutique catalog</h3><span className="tag">{shopItems().length} designs</span></div>
        <SlotFilters value={filter} set={setFilter} extra={[["all", "All"]]} scenes />
        <div className="items">{list.map((it) => <ItemCard key={it.id} it={it} kind={k} mode="shop" />)}</div>
      </div>
      <div className="card wish">
        <div className="card-h"><h3 style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon icon={ScissorIcon} size={18} />Custom tailor wishbox</h3><span className="tag">to {partnerOf(s)}</span></div>
        <p className="muted small" style={{ marginTop: -4 }}>Have a cute outfit idea for {s.settings.pandaName} or {s.settings.catName}? Send it to {partnerOf(s)}. They might design it for real!</p>
        <input type="text" maxLength={140} value={wish} onChange={(e) => setWish(e.target.value)} placeholder="e.g. a tiny matcha beret, or a boba straw scarf" style={{ width: "100%" }} />
        <button className="btn" style={{ width: "100%", marginTop: 10, background: "var(--ink)", color: "#fff" }} onClick={() => { if (wish.trim()) { style.wish(wish.trim()); setWish(""); } }}><Icon icon={Mail01Icon} size={16} stroke={2} />Send wish to {partnerOf(s)}</button>
        {s.wishes.length > 0 && <div className="muted small" style={{ marginTop: 10, fontWeight: 700 }}>Sent: {s.wishes.slice(-3).reverse().map((w) => `“${w.text}”`).join(" · ")}</div>}
      </div>
    </>
  );
}

/* ---------- Closet ---------- */
function Closet({ goShop }: { goShop: (f: string) => void }) {
  const s = useStore(), { open } = useModal();
  const [f, setF] = useState("all"), [q, setQ] = useState("");
  const all = ALL_ITEMS.filter((i) => !i.free), have = all.filter((i) => owns(s, i.id)).length;
  const lp = activeLook(s, "panda"), lc = activeLook(s, "cat"), ql = q.toLowerCase();
  let list = ALL_ITEMS.filter((i) => owns(s, i.id));
  if (f === "panda") list = list.filter((i) => Object.values(lp).includes(i.id));
  else if (f === "cat") list = list.filter((i) => Object.values(lc).includes(i.id));
  else if (f !== "all") list = list.filter((i) => i.slot === f);
  if (ql) list = list.filter((i) => `${i.name} ${i.desc} ${i.slot}`.toLowerCase().includes(ql));
  const tile = (kind: K, look: Record<string, string>) => (
    <button className={`duo-card ${s.editing === kind ? "on" : ""}`} onClick={() => style.setEditing(kind)}>
      <span className={`tag ${kind === "panda" ? "own" : "shop"}`}>{nameOf(s, kind)}</span>
      <div className="duo-thumb" dangerouslySetInnerHTML={html(charSVG(kind, kind === "panda" ? "happy" : "wink", look))} />
      <div className="small" style={{ fontWeight: 800 }}>{Object.values(look).map((id) => ITEM_BY[id].name).slice(0, 2).join(" · ") || "No outfit yet"}</div>
    </button>
  );
  return (
    <>
      <div className="card">
        <span className="tag lv">● Cozy suite</span>
        <h3 style={{ margin: "8px 0 2px" }}>{s.settings.pandaName} &amp; {s.settings.catName}&apos;s closet</h3>
        <div className="muted small" style={{ fontWeight: 700 }}>Shared accessories, cozy caps &amp; hydration charms</div>
        <div className="lvl"><span className="small">Items collected</span><div className="bar"><i style={{ width: `${Math.round((have / all.length) * 100)}%` }} /></div><span className="small muted">{have} / {all.length}</span></div>
      </div>
      <div className="card">
        <div className="card-h"><h3>Dressing room</h3><button className="btn ghost" style={{ padding: "8px 12px", fontSize: 13 }} onClick={style.sync}><Icon icon={FavouriteIcon} size={14} stroke={2} />Sync style</button></div>
        <div className="dress-duo">{tile("panda", lp)}<span className="sync-heart" style={{ color: "var(--pink)" }}><Icon icon={FavouriteIcon} size={22} /></span>{tile("cat", lc)}</div>
        <p className="muted small" style={{ margin: "8px 0 0" }}>Tap a character to dress them. Sync copies {nameOf(s, s.editing)}&apos;s outfit onto {nameOf(s, s.editing === "panda" ? "cat" : "panda")}.</p>
      </div>
      <div className="card">
        <label style={{ position: "relative", display: "block", marginBottom: 10 }}>
          <span style={{ position: "absolute", left: 12, top: 13, color: "var(--muted)" }}><Icon icon={Search01Icon} size={18} /></span>
          <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clothes, toys & hats…" style={{ width: "100%", paddingLeft: 38 }} />
        </label>
        <SlotFilters value={f} set={setF} extra={[["all", "All"], ["panda", "On " + s.settings.pandaName], ["cat", "On " + s.settings.catName]]} scenes />
        <div className="card-h" style={{ marginTop: 4 }}><h3>Inventory</h3><span className="tag">{list.length} shown</span></div>
        {list.length ? <div className="items">{list.map((it) => it.slot === "scene" ? <ItemCard key={it.id} it={it} kind={s.editing} mode="dress" goShop={goShop} /> : <ClosetCard key={it.id} it={it} />)}</div>
          : <div className="empty">Nothing here yet. Visit the boutique or level up!</div>}
      </div>
      <div className="card">
        <div className="card-h"><h3>Saved style presets</h3><span className="tag">{s.presets.length} presets</span></div>
        {s.presets.length ? s.presets.map((p) => (
          <div key={p.id} className="preset">
            <div className="pre-th"><span dangerouslySetInnerHTML={html(charSVG("panda", "normal", p.panda))} /><span dangerouslySetInnerHTML={html(charSVG("cat", "normal", p.cat))} /></div>
            <div style={{ flex: 1, minWidth: 0 }}><b>{p.name}</b><div className="muted small">{ITEM_BY[p.scene]?.name ?? ""}</div></div>
            <button className="btn ghost" style={{ padding: "8px 10px", fontSize: 13 }} onClick={() => style.wear(p.id)}>Wear now</button>
            <button className="x" aria-label="Delete preset" onClick={() => style.delPreset(p.id)}><Icon icon={Cancel01Icon} size={18} /></button>
          </div>
        )) : <div className="muted small">Save a look from Dress Up to switch outfits in one tap.</div>}
        <button className="btn pink" style={{ width: "100%", marginTop: 12 }} onClick={() => open(<PresetSheet />)}>＋ Save current look as preset</button>
      </div>
    </>
  );
}
function ClosetCard({ it }: { it: Item }) {
  const s = useStore();
  const onP = activeLook(s, "panda")[it.slot] === it.id, onC = activeLook(s, "cat")[it.slot] === it.id;
  return (
    <motion.div layout className={`item ${onP || onC ? "eq" : ""}`}>
      <span className={`tag ${onP || onC ? "own" : ""}`}>{onP && onC ? "On both" : onP ? "On " + s.settings.pandaName : onC ? "On " + s.settings.catName : slotName(it.slot)}</span>
      <div className="thumb" dangerouslySetInnerHTML={html(thumb(s, it, s.editing))} />
      <div className="nm">{it.name}</div><div className="ds">{it.desc}</div>
      <div className="two">
        <button className={`act ${onP ? "unequip" : "equip"}`} onClick={() => style.equip("panda", it.id)}>{s.settings.pandaName} {onP ? "off" : "try"}</button>
        <button className={`act ${onC ? "unequip" : "equip"}`} onClick={() => style.equip("cat", it.id)}>{s.settings.catName} {onC ? "off" : "try"}</button>
      </div>
    </motion.div>
  );
}

/* ---------- Lookbook ---------- */
function Polaroid({ snap, onClick }: { snap: Snap; onClick?: () => void }) {
  return (
    <div className={`polaroid ${snap.border}`} onClick={onClick}>
      <div dangerouslySetInnerHTML={html(duoStage(snap.pose, snap.scene, snap.panda, snap.cat))} />
      <div className="cap">{snap.caption || DUOS[snap.pose]?.name || "Memory"}</div><div className="muted small" style={{ fontWeight: 700 }}>{fmtDate(snap.ts)}</div>
    </div>
  );
}
function Look({ goShop }: { goShop: (f: string) => void }) {
  const s = useStore(), { open, close } = useModal();
  const [pose, setPose] = useState("together"), [border, setBorder] = useState("washi"), [cap, setCap] = useState("");
  const scenes = ALL_ITEMS.filter((i) => i.slot === "scene" && owns(s, i.id));
  const preview: Snap = { id: "", ts: Date.now(), pose, scene: sceneNow(s), panda: activeLook(s, "panda"), cat: activeLook(s, "cat"), caption: cap, border };
  const bs = badges(s);
  return (
    <>
      <div className="card">
        <div className="card-h"><div><h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 6 }}><Icon icon={CameraIcon} size={20} />Memory booth</h3><div className="muted small" style={{ fontWeight: 700 }}>Snap, dress &amp; pin moments with {s.settings.pandaName} &amp; {s.settings.catName}</div></div><span className="tag lv">{s.snaps.length} keepsakes</span></div>
        <motion.div key={pose + border + preview.scene} initial={{ rotate: -2, scale: 0.97 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 16 }}><Polaroid snap={preview} /></motion.div>
        <input type="text" maxLength={40} value={cap} onChange={(e) => setCap(e.target.value)} placeholder={`Caption, e.g. Tea time with ${s.settings.pandaName} & ${s.settings.catName}`} style={{ width: "100%", marginTop: 12 }} />
        <div className="field" style={{ marginBottom: 0 }}>Scene</div>
        <div className="filters">{scenes.map((sc) => <button key={sc.id} className={sceneNow(s) === sc.id ? "on" : ""} onClick={() => style.setScene(sc.id)}>{sc.name}</button>)}<button onClick={() => goShop("scene")}>＋ more</button></div>
        <div className="field" style={{ marginBottom: 0 }}>Border dressing</div>
        <div className="filters">{BORDERS.map(([id, l]) => <button key={id} className={border === id ? "on" : ""} onClick={() => setBorder(id)}>{l}</button>)}</div>
        <div className="card-h" style={{ marginTop: 8 }}><h3 style={{ margin: 0, fontSize: 16 }}>Pose station</h3><span className="tag">Interactive</span></div>
        <div className="pose-grid">{Object.entries(DUOS).map(([id, d]) => <button key={id} className={`pose ${pose === id ? "on" : ""}`} onClick={() => setPose(id)}><span><Icon icon={DUO_ICON[id]} size={22} /></span>{d.name}<small>{d.desc}</small></button>)}</div>
        <button className="btn primary" style={{ width: "100%", marginTop: 12 }} onClick={() => { style.snap(pose, border, cap.trim()); setCap(""); }}><Icon icon={CameraIcon} size={18} stroke={2} />Snap it!</button>
      </div>
      <div className="card">
        <div className="card-h"><h3>Scrapbook keepsakes</h3><span className="tag">{s.snaps.length} saved</span></div>
        {s.snaps.length ? <div className="scrap">{s.snaps.map((sn) => (
          <motion.div key={sn.id} layout initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <Polaroid snap={sn} onClick={() => open(<><Polaroid snap={sn} /><div className="btns"><button className="btn ghost" onClick={() => { style.delSnap(sn.id); close(); }}><Icon icon={Delete02Icon} size={16} />Remove</button><button className="btn primary" onClick={close}>Close</button></div></>)} />
          </motion.div>
        ))}</div> : <div className="empty">No snapshots yet. Strike a pose above!</div>}
      </div>
      <div className="card">
        <div className="card-h"><h3>Hydration badges &amp; stickers</h3><span className="tag own">{bs.filter((b) => b[3]).length} / {bs.length}</span></div>
        <div className="badges">{bs.map(([ic, n, d, ok]) => <div key={n} className={`badge2 ${ok ? "" : "off"}`}><div className="bi" style={{ color: ok ? "var(--pink)" : undefined }}><Icon icon={ic} size={26} /></div>{n}<small>{d}</small></div>)}</div>
      </div>
    </>
  );
}
