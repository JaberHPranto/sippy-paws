"use client";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { TabBar, type TabId } from "@/components/TabBar";
import { Today } from "@/components/Today";
import { Stats } from "@/components/Stats";
import { Journal } from "@/components/Journal";
import { Todo } from "@/components/Todo";
import { Gifts } from "@/components/Gifts";
import { StyleTab, type StyleView } from "@/components/Style";
import { RevealHost } from "@/components/Cards";
import { Onboarding } from "@/components/Onboarding";
import { ModalProvider } from "@/components/Modal";
import { Fx } from "@/components/Fx";
import { useOwner, useStore } from "@/lib/store";
import { wireTapSounds } from "@/lib/sound";
import { useSyncEngine } from "@/lib/sync";
import { AnimatePresence, MotionConfig, motion } from "motion/react";

export default function Home() {
  const s = useStore(), owner = useOwner();
  useSyncEngine();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<TabId>("home");
  const [sv, setSv] = useState<StyleView>("dress");
  useEffect(() => { setReady(true); requestAnimationFrame(() => window.scrollTo(0, 0)); return wireTapSounds(); }, []);
  // Gifts is experimental and owner-only; fall back to Today if the role goes away (sign out).
  const view: TabId = tab === "rewards" && !owner ? "home" : tab;
  const go = (t: TabId) => { if (t === view) return; setTab(t); window.scrollTo({ top: 0 }); };
  if (!ready) return null;
  if (!s.welcomed) return <MotionConfig reducedMotion="user"><Onboarding /><Fx /></MotionConfig>;
  return (
    <MotionConfig reducedMotion="user">
    <ModalProvider>
      <div className="app">
      <Header />
      <main>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18, ease: "easeOut" }}>
            {view === "home" && <Today go={go} />}
            {view === "overview" && <Stats />}
            {view === "style" && <StyleTab view={sv} setView={setSv} />}
            {view === "journal" && <Journal />}
            {view === "todo" && <Todo />}
            {view === "rewards" && <Gifts go={(t) => { setSv("dress"); go(t); }} />}
          </motion.div>
        </AnimatePresence>
      </main>
      <TabBar tab={view} onChange={go} />
      <Fx />
      <RevealHost goCards={() => { setSv("cards"); go("style"); }} />
      </div>
    </ModalProvider>
    </MotionConfig>
  );
}
