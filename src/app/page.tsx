"use client";
import { useEffect, useState } from "react";
import { TabBar, type TabId } from "@/components/TabBar";
import { Today } from "@/components/Today";
import { Welcome } from "@/components/Welcome";
import { Placeholder } from "@/components/Placeholder";

const SEEN = "sippypaws.next.welcomed";

export default function Home() {
  const [ready, setReady] = useState(false);
  const [welcomed, setWelcomed] = useState(true);
  const [tab, setTab] = useState<TabId>("today");
  useEffect(() => { setWelcomed(localStorage.getItem(SEEN) === "1"); setReady(true); }, []);
  if (!ready) return null;
  if (!welcomed) return <Welcome name="Rizu" onDone={() => { localStorage.setItem(SEEN, "1"); setWelcomed(true); }} />;

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-28">
      {tab === "today" ? <Today name="Rizu" /> : <Placeholder title={tab[0].toUpperCase() + tab.slice(1)} />}
      <TabBar tab={tab} onChange={setTab} />
    </div>
  );
}
