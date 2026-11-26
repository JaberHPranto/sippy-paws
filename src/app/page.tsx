"use client";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { TabBar, type TabId } from "@/components/TabBar";
import { Today } from "@/components/Today";
import { Stats } from "@/components/Stats";
import { Journal } from "@/components/Journal";
import { Todo } from "@/components/Todo";
import { Gifts } from "@/components/Gifts";
import { StyleSoon } from "@/components/StyleSoon";
import { Welcome } from "@/components/Welcome";
import { ModalProvider } from "@/components/Modal";
import { Fx } from "@/components/Fx";
import { actions, useStore } from "@/lib/store";

export default function Home() {
  const s = useStore();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<TabId>("home");
  useEffect(() => { setReady(true); requestAnimationFrame(() => window.scrollTo(0, 0)); }, []);
  const go = (t: TabId) => { setTab(t); window.scrollTo(0, 0); };
  if (!ready) return null;
  if (!s.welcomed) return <Welcome name={s.settings.name} onDone={actions.finishWelcome} />;
  return (
    <ModalProvider>
      <div className="app">
      <Header />
      <main>
        {tab === "home" && <Today go={go} />}
        {tab === "overview" && <Stats />}
        {tab === "style" && <StyleSoon />}
        {tab === "journal" && <Journal />}
        {tab === "todo" && <Todo />}
        {tab === "rewards" && <Gifts go={go} />}
      </main>
      <TabBar tab={tab} onChange={go} />
      <Fx />
      </div>
    </ModalProvider>
  );
}
