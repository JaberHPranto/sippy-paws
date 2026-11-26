"use client";
import { useEffect, useState } from "react";
import { TabBar, type TabId } from "@/components/TabBar";
import { Today } from "@/components/Today";
import { Welcome } from "@/components/Welcome";
import { Placeholder } from "@/components/Placeholder";
import { Journal } from "@/components/Journal";
import { Todo } from "@/components/Todo";
import { Stats } from "@/components/Stats";
import { Gifts } from "@/components/Gifts";
import { actions, useStore } from "@/lib/store";

export default function Home() {
  const s = useStore();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<TabId>("today");
  useEffect(() => setReady(true), []);
  if (!ready) return null;
  if (!s.welcomed) return <Welcome name={s.name} onDone={actions.finishWelcome} />;

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-28">
      {tab === "today" && <Today />}
      {tab === "stats" && <Stats />}
      {tab === "journal" && <Journal />}
      {tab === "todo" && <Todo />}
      {tab === "gifts" && <Gifts />}
      {tab === "style" && <Placeholder title="Style" />}
      <TabBar tab={tab} onChange={setTab} />
    </div>
  );
}
