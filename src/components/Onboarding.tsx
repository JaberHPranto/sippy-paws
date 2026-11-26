"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft01Icon, ArrowRight01Icon, Notification03Icon, VolumeHighIcon, VolumeOffIcon, CheckmarkCircle02Icon, SparklesIcon, FavouriteIcon, DropletIcon, Moon02Icon, Sun03Icon, UserIcon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";
import { Mascot } from "./Mascot";
import { AccountForm } from "./Account";
import { InstallGuide } from "./InstallGuide";
import { DRINKS } from "@/lib/data";
import type { Mood } from "@/lib/mood";
import { enableReminders, pushSupported } from "@/lib/push";
import { useEnv } from "@/lib/platform";
import { sfx } from "@/lib/sound";
import { cloudEnabled } from "@/lib/supabase";
import { useCloud } from "@/lib/sync";
import { actions, confetti, useStore, type Settings } from "@/lib/store";

type StepId = "hello" | "name" | "buddies" | "partner" | "goal" | "rhythm" | "drinks" | "account" | "remind" | "done";
const ALL: StepId[] = ["hello", "name", "buddies", "partner", "goal", "rhythm", "drinks", "account", "remind", "done"];
const KEY = "sippypaws.onboard.step";
const hourLabel = (h: number) => (h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`);
type Pose = { pm: Mood; cm: Mood; pl?: Record<string, string>; cl?: Record<string, string>; who: "P" | "C" | "both"; say: string };

export function Onboarding() {
  const s = useStore(), st = s.settings, cloud = useCloud(), env = useEnv();
  const steps = useMemo(() => ALL.filter((x) => x !== "account" || cloudEnabled), []);
  const [i, setI] = useState(0), [dir, setDir] = useState(1);
  const [weight, setWeight] = useState(""), [remind, setRemind] = useState(""), [typing, setTyping] = useState(false);
  useEffect(() => { const v = Number(localStorage.getItem(KEY)); if (v > 0 && v < steps.length) setI(v); }, [steps.length]);
  useEffect(() => { try { localStorage.setItem(KEY, String(i)); } catch { /* ignore */ } }, [i]);
  useEffect(() => { if (steps[i] === "done") { confetti(); sfx("success"); } }, [i, steps]);
  const set = (p: Partial<Settings>) => actions.updateSettings(p);
  const step = steps[i];
  const go = (d: number) => { const n = Math.max(0, Math.min(steps.length - 1, i + d)); if (n === i) return; setDir(d); setI(n); sfx(d > 0 ? "pop" : "tap"); };
  const jump = (id: StepId) => { const n = steps.indexOf(id); if (n >= 0) { setDir(n > i ? 1 : -1); setI(n); } };
  const finish = () => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } actions.finishWelcome(); };

  const N = st.name.trim(), P = st.pandaName || "Bao", C = st.catName || "Miso";
  const goalMood: Mood = st.goalMl < 1300 ? "sad" : st.goalMl < 1800 ? "normal" : st.goalMl < 2700 ? "happy" : "ecstatic";
  const pose: Pose = ({
    hello: { pm: "ecstatic", cm: "ecstatic", who: "both", say: `Hi there! We're ${P} & ${C}. We'll help you sip, journal and tick things off.` },
    name: { pm: "happy", cm: typing || N ? "wink" : "normal", who: "P", say: N ? `${N}! What a lovely name.` : "First things first… what should we call you?" },
    buddies: { pm: "wink", cm: "happy", who: "C", say: `Want to give us nicknames? We answer to anything with snacks.` },
    partner: { pm: "happy", cm: "happy", pl: { aura: "loveaura" }, cl: { aura: "loveaura" }, who: "P", say: st.partnerName.trim() ? `${st.partnerName.trim()} can send you love coupons and special cards!` : "Is someone cheering you on? They can send you treats." },
    goal: { pm: goalMood, cm: goalMood, pl: { hand: "bottle" }, who: "P", say: st.goalMl < 1300 ? "Hmm, that's a tiny goal… we can start small!" : st.goalMl >= 2700 ? "Whoa, hydration champion!" : `${(st.goalMl / 1000).toFixed(1)} L a day sounds just right.` },
    rhythm: { pm: "normal", cm: "sleepy", who: "C", say: `I'll stay quiet before ${hourLabel(st.startHour)} and after ${hourLabel(st.endHour)}. Beauty sleep matters.` },
    drinks: { pm: "happy", cm: "wink", pl: { hand: "teacup" }, cl: { hand: "boba" }, who: "C", say: "What do you love to sip? We'll keep your favorites up front." },
    account: { pm: "wink", cm: "normal", who: "P", say: cloud.session ? "You're signed in. Your data is backed up!" : "Sign in so your journal and progress are safe, even on a new phone." },
    remind: { pm: "happy", cm: "ecstatic", who: "both", say: "Last bit! Let us tap you on the shoulder when it's time to sip." },
    done: { pm: "ecstatic", cm: "ecstatic", pl: { aura: "sparkle" }, cl: { aura: "sparkle" }, who: "both", say: `All set${N ? `, ${N}` : ""}! Let's have a cozy, well-watered day.` },
  } as Record<StepId, Pose>)[step];

  const canNext = step === "name" ? N.length > 0 : true;
  const suggestion = weight ? Math.min(4000, Math.max(1200, Math.round((+weight * 33) / 50) * 50)) : 0;
  const perDay = Math.max(1, Math.floor(((st.endHour - st.startHour + 24) % 24 || 24) * 60 / st.interval));

  return (
    <main className="ob">
      <div className="ob-top">
        <button className="icon-btn" aria-label="Back" onClick={() => go(-1)} style={{ visibility: i > 0 && step !== "done" ? "visible" : "hidden" }}><Icon icon={ArrowLeft01Icon} size={20} /></button>
        <div className="ob-prog">{steps.map((x, j) => <i key={x} className={j <= i ? "on" : ""}>{j === i && <motion.b layoutId="ob-dot" />}</i>)}</div>
        <span className="ob-count">{i + 1}/{steps.length}</span>
      </div>

      <div className={`card stage ob-stage ${pose.pm === "sad" ? "sad" : pose.pm === "ecstatic" ? "ecstatic" : ""}`}>
        <div className="ob-drops" aria-hidden>{[0, 1, 2, 3, 4, 5].map((d) => <span key={d} style={{ left: `${8 + d * 16}%`, animationDelay: `${d * 0.7}s` }} />)}</div>
        <div className="mascots">
          <motion.div key={`p-${step}`} initial={{ x: -40, y: 20, opacity: 0, rotate: -8 }} animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 16 }}>
            <Mascot kind="panda" mood={pose.pm} look={pose.pl ?? {}} />
          </motion.div>
          <motion.div key={`c-${step}`} initial={{ x: 40, y: 20, opacity: 0, rotate: 8 }} animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.08 }}>
            <Mascot kind="cat" mood={pose.cm} look={pose.cl ?? {}} />
          </motion.div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={pose.say} className={`bubble ob-bubble ${pose.who === "C" ? "r" : pose.who === "P" ? "l" : ""}`} initial={{ opacity: 0, scale: 0.9, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 500, damping: 28 }}>
            <span className="who">{pose.who === "both" ? `${P} & ${C}:` : pose.who === "P" ? `${P}:` : `${C}:`}</span> {pose.say}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait" custom={dir} initial={false}>
        <motion.div key={step} className="card ob-body" custom={dir} initial={{ x: dir * 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: dir * -60, opacity: 0 }} transition={{ type: "spring", stiffness: 380, damping: 34 }}>
          {step === "hello" && <>
            <h2 className="ob-h">Welcome to Sippy Paws</h2>
            <ul className="ob-feats">
              <li><span style={{ background: "var(--blue2)", color: "#3a9ad6" }}><Icon icon={DropletIcon} /></span>Gentle water reminders</li>
              <li><span style={{ background: "#efe6ff", color: "#8a63d2" }}><Icon icon={Moon02Icon} /></span>A private journal for your moods</li>
              <li><span style={{ background: "var(--mint2)", color: "#2f8a5f" }}><Icon icon={CheckmarkCircle02Icon} /></span>Little to-dos, one at a time</li>
              <li><span style={{ background: "var(--pink2)", color: "#e0506e" }}><Icon icon={SparklesIcon} /></span>Outfits, cards and real treats to earn</li>
            </ul>
            <p className="muted small" style={{ fontWeight: 700, margin: "12px 0 0" }}>Takes about a minute.</p>
          </>}

          {step === "name" && <>
            <h2 className="ob-h">What&apos;s your name?</h2>
            <input className="ob-input" type="text" autoFocus maxLength={24} value={st.name} placeholder="Your name" onFocus={() => setTyping(true)} onBlur={() => setTyping(false)}
              onChange={(e) => set({ name: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter" && N) go(1); }} />
            <p className="muted small" style={{ fontWeight: 700 }}>{P} and {C} will use it to cheer you on.</p>
          </>}

          {step === "buddies" && <>
            <h2 className="ob-h">Meet your buddies</h2>
            <div className="row2">
              <label className="field">The panda<input type="text" maxLength={16} value={st.pandaName} onChange={(e) => set({ pandaName: e.target.value })} /></label>
              <label className="field">The cat<input type="text" maxLength={16} value={st.catName} onChange={(e) => set({ catName: e.target.value })} /></label>
            </div>
            <p className="muted small" style={{ fontWeight: 700 }}>Tip: name the cat after your own cat. Tap them up there, they like it.</p>
          </>}

          {step === "partner" && <>
            <h2 className="ob-h">Who&apos;s cheering you on?</h2>
            <label className="field"><span style={{ display: "flex", gap: 6, alignItems: "center" }}><Icon icon={FavouriteIcon} size={16} />Their name (optional)</span>
              <input type="text" maxLength={24} value={st.partnerName} placeholder="e.g. your partner or best friend" onChange={(e) => set({ partnerName: e.target.value })} /></label>
            <p className="muted small" style={{ fontWeight: 700 }}>You&apos;ll trade paw points for real-life treats from them, like ice cream dates or a movie night. They can also send you one-of-a-kind cards.</p>
          </>}

          {step === "goal" && <>
            <h2 className="ob-h">Your daily water goal</h2>
            <div className="ob-goal">
              <div className="orb" style={{ width: 96, height: 96 }}><div className="fill" style={{ height: `${Math.min(100, ((st.goalMl - 800) / 3200) * 100)}%` }} /><div className="orb-txt"><b style={{ fontSize: 20 }}>{(st.goalMl / 1000).toFixed(1)}L</b></div></div>
              <div style={{ flex: 1 }}>
                <input type="range" min={1000} max={4000} step={100} value={st.goalMl} onChange={(e) => set({ goalMl: +e.target.value })} className="ob-range" aria-label="Daily goal in ml" style={{ ["--v" as string]: `${((st.goalMl - 1000) / 3000) * 100}%` }} />
                <div className="muted small" style={{ fontWeight: 800 }}>{st.goalMl.toLocaleString()} ml · about {Math.round(st.goalMl / st.waterMl)} glasses</div>
              </div>
            </div>
            <div className="field" style={{ marginBottom: 4 }}>Your usual glass</div>
            <div className="chips">{[150, 200, 250, 300, 350, 500].map((m) => <button key={m} className={st.waterMl === m ? "sel" : ""} onClick={() => set({ waterMl: m })}>{m} ml</button>)}</div>
            <div className="ob-help">
              <span>Not sure? A common rule of thumb is about 33 ml per kg.</span>
              <div className="tform" style={{ marginTop: 8 }}>
                <input type="number" inputMode="decimal" min={30} max={200} placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} />
                <button className="btn ghost nw" disabled={!suggestion} onClick={() => { set({ goalMl: suggestion }); sfx("chime"); }}>Use {suggestion ? `${(suggestion / 1000).toFixed(1)} L` : "it"}</button>
              </div>
              <span className="muted" style={{ fontSize: 11 }}>Just a starting point, not medical advice. Your weight isn&apos;t saved.</span>
            </div>
          </>}

          {step === "rhythm" && <>
            <h2 className="ob-h">Your daily rhythm</h2>
            <div className="row2">
              <label className="field"><span style={{ display: "flex", gap: 6, alignItems: "center" }}><Icon icon={Sun03Icon} size={16} />Nudges start</span>
                <select value={st.startHour} onChange={(e) => set({ startHour: +e.target.value })}>{Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{hourLabel(h)}</option>)}</select></label>
              <label className="field"><span style={{ display: "flex", gap: 6, alignItems: "center" }}><Icon icon={Moon02Icon} size={16} />Quiet after</span>
                <select value={st.endHour} onChange={(e) => set({ endHour: +e.target.value })}>{Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{hourLabel(h)}</option>)}</select></label>
            </div>
            <div className="field" style={{ marginBottom: 4 }}>Remind me every</div>
            <div className="chips">{[30, 45, 60, 90, 120].map((m) => <button key={m} className={st.interval === m ? "sel" : ""} onClick={() => set({ interval: m })}>{m < 60 ? `${m} min` : `${m / 60} hr${m > 60 ? "s" : ""}`.replace("1.5 hrs", "1½ hrs")}</button>)}</div>
            <p className="muted small" style={{ fontWeight: 700 }}>That&apos;s at most {perDay} gentle nudges a day, and none once you hit your goal.</p>
          </>}

          {step === "drinks" && <>
            <h2 className="ob-h">Favorite drinks</h2>
            <div className="ob-drinks">
              {DRINKS.map((d) => { const on = st.favDrinks.includes(d.id); return (
                <motion.button key={d.id} whileTap={{ scale: 0.9 }} className={`ob-drink ${on ? "on" : ""}`} style={{ ["--c" as string]: d.color }} data-sfx="tick"
                  onClick={() => set({ favDrinks: on ? st.favDrinks.filter((x) => x !== d.id) : [...st.favDrinks, d.id] })}>
                  <Icon icon={d.icon} size={24} />{d.name}
                </motion.button>
              ); })}
            </div>
            <div className="ob-sound">
              <span style={{ color: st.sound ? "var(--pink)" : "var(--muted)" }}><Icon icon={st.sound ? VolumeHighIcon : VolumeOffIcon} size={22} /></span>
              <div style={{ flex: 1 }}><b>Sound effects</b><div className="muted small" style={{ fontWeight: 700 }}>Cute little clicks and chimes</div></div>
              <button className={`ob-toggle ${st.sound ? "on" : ""}`} role="switch" aria-checked={st.sound} aria-label="Sound effects" onClick={() => { const v = !st.sound; set({ sound: v }); if (v) sfx("chime", true); }}><i /></button>
            </div>
          </>}

          {step === "account" && <>
            <h2 className="ob-h" style={{ display: "flex", gap: 8, alignItems: "center" }}><Icon icon={UserIcon} size={22} />Keep your data safe</h2>
            <AccountForm />
            {!cloud.session && <p className="muted small" style={{ fontWeight: 700 }}>You can also do this later in Settings.</p>}
          </>}

          {step === "remind" && <>
            <h2 className="ob-h">{env?.os === "desktop" ? "Install & reminders" : "Home Screen & reminders"}</h2>
            {env && <InstallGuide env={env} />}
            <div className="btns">
              <button className="btn primary" disabled={!env || (env.os === "ios" && !env.standalone) || !pushSupported()}
                onClick={async () => { const r = await enableReminders(); setRemind(r); if (r === "granted") sfx("success"); }}>
                <Icon icon={Notification03Icon} size={18} stroke={2} />{remind === "granted" ? "Reminders are on" : "Turn on reminders"}
              </button>
            </div>
            <p className="muted small" style={{ fontWeight: 700 }}>
              {env?.os === "ios" && !env.standalone ? "On iPhone, reminders unlock once you open the app from your Home Screen. You can finish setup now and turn them on later in Settings."
                : remind === "signin" ? "Sign in first (previous step or Settings) so reminders can reach this phone."
                : remind === "denied" ? "Notifications are blocked. You can allow them in your phone's settings."
                : remind === "unsupported" ? "This browser can't receive reminders." : "You can change this anytime in Settings."}
            </p>
          </>}

          {step === "done" && <>
            <h2 className="ob-h">You&apos;re all set{N ? `, ${N}` : ""}!</h2>
            <div className="ob-sum">
              <span><Icon icon={DropletIcon} size={15} />{(st.goalMl / 1000).toFixed(1)} L a day</span>
              <span><Icon icon={Sun03Icon} size={15} />{hourLabel(st.startHour)}–{hourLabel(st.endHour)}</span>
              <span><Icon icon={Notification03Icon} size={15} />every {st.interval} min</span>
              {st.partnerName.trim() && <span><Icon icon={FavouriteIcon} size={15} />treats from {st.partnerName.trim()}</span>}
              <span><Icon icon={st.sound ? VolumeHighIcon : VolumeOffIcon} size={15} />sound {st.sound ? "on" : "off"}</span>
            </div>
            <p className="muted small" style={{ fontWeight: 700 }}>Everything here can be changed later in Settings.</p>
          </>}
        </motion.div>
      </AnimatePresence>

      <div className="ob-foot">
        {step === "done" ? (
          <motion.button whileTap={{ scale: 0.97 }} className="btn pink ob-cta" onClick={finish}>Start sipping</motion.button>
        ) : (
          <motion.button whileTap={{ scale: 0.97 }} className="btn primary ob-cta" disabled={!canNext} onClick={() => go(1)}>
            {step === "hello" ? "Let's set things up" : (step === "partner" && !st.partnerName.trim()) || (step === "account" && !cloud.session) ? "Skip for now" : "Continue"}
            <Icon icon={ArrowRight01Icon} size={18} stroke={2.2} />
          </motion.button>
        )}
        {step === "hello" && cloudEnabled && <button className="link" onClick={() => jump("account")}>I already have an account</button>}
      </div>
    </main>
  );
}
