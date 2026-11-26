"use client";
import { Share03Icon, AddSquareIcon, MoreVerticalIcon, Menu01Icon, MoreHorizontalIcon, Download04Icon, CheckmarkCircle02Icon, SafariIcon, ChromeIcon, BrowserIcon, SmartPhone01Icon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { Icon } from "./Icon";
import { type Env, useInstallPrompt } from "@/lib/platform";
import { sfx } from "@/lib/sound";

type Step = { icon: IconSvgElement; text: React.ReactNode };
const NAME: Record<string, string> = { safari: "Safari", chrome: "Chrome", firefox: "Firefox", edge: "Edge", samsung: "Samsung Internet", other: "your browser" };

function steps(env: Env): { steps: Step[]; note?: string } {
  const add: Step = { icon: AddSquareIcon, text: <>Choose <b>Add to Home Screen</b>, then tap <b>Add</b>.</> };
  const openIt: Step = { icon: SmartPhone01Icon, text: <>Open Sippy Paws from the new icon on your Home Screen.</> };
  const { os, browser } = env;
  if (os === "ios") {
    if (browser === "safari") return { steps: [{ icon: Share03Icon, text: <>Tap <b>Share</b> in the toolbar at the bottom.</> }, add, openIt] };
    if (browser === "chrome") return { steps: [{ icon: Share03Icon, text: <>Tap <b>Share</b> in the address bar at the top.</> }, add, openIt] };
    if (browser === "firefox") return { steps: [{ icon: Menu01Icon, text: <>Tap the <b>menu</b> at the bottom right, then <b>Share</b>.</> }, add, openIt] };
    if (browser === "edge") return { steps: [{ icon: MoreHorizontalIcon, text: <>Tap the <b>menu</b> at the bottom, then <b>Share</b>.</> }, add, openIt] };
    return { steps: [{ icon: SafariIcon, text: <>Open this page in <b>Safari</b>.</> }, { icon: Share03Icon, text: <>Tap <b>Share</b>.</> }, add], note: "This browser can't add apps to the Home Screen." };
  }
  if (os === "android") {
    if (browser === "firefox") return { steps: [{ icon: MoreVerticalIcon, text: <>Tap the <b>menu</b> (three dots).</> }, { icon: AddSquareIcon, text: <>Choose <b>Add to Home screen</b>, then <b>Add</b>.</> }, openIt] };
    if (browser === "samsung") return { steps: [{ icon: Menu01Icon, text: <>Tap the <b>menu</b> at the bottom right.</> }, { icon: AddSquareIcon, text: <>Choose <b>Add page to</b> → <b>Home screen</b>.</> }, openIt] };
    return { steps: [{ icon: MoreVerticalIcon, text: <>Tap the <b>menu</b> (three dots) at the top right.</> }, { icon: Download04Icon, text: <>Choose <b>Install app</b> or <b>Add to Home screen</b>.</> }, openIt] };
  }
  if (browser === "safari") return { steps: [{ icon: Share03Icon, text: <>Click <b>Share</b> in the toolbar (or the <b>File</b> menu).</> }, { icon: AddSquareIcon, text: <>Choose <b>Add to Dock</b>.</> }] };
  if (browser === "chrome" || browser === "edge") return { steps: [{ icon: Download04Icon, text: <>Click the <b>install</b> icon at the right of the address bar.</> }, { icon: AddSquareIcon, text: <>Click <b>Install</b>.</> }] };
  return { steps: [{ icon: ChromeIcon, text: <>Open this page in <b>Chrome</b>, <b>Edge</b> or <b>Safari</b> to install it.</> }], note: `${NAME[browser]} can't install web apps, but you can keep using it in a tab.` };
}

export function InstallGuide({ env }: { env: Env }) {
  const native = useInstallPrompt();
  if (env.standalone) {
    return <p className="small" style={{ color: "#2f8a5f", fontWeight: 800, display: "flex", gap: 6, alignItems: "center", margin: 0 }}><Icon icon={CheckmarkCircle02Icon} size={18} /> Installed. You&apos;re all set!</p>;
  }
  const g = steps(env);
  return (
    <>
      <div className="tag" style={{ display: "inline-flex", gap: 4, alignItems: "center", marginBottom: 10 }}>
        <Icon icon={env.browser === "safari" ? SafariIcon : env.browser === "chrome" ? ChromeIcon : BrowserIcon} size={13} stroke={2} />
        {NAME[env.browser]} on {env.os === "ios" ? "iPhone" : env.os === "android" ? "Android" : "computer"}
      </div>
      {native.can ? (
        <button className="btn pink" style={{ width: "100%" }} onClick={() => { sfx("pop"); native.install(); }}><Icon icon={Download04Icon} size={18} stroke={2} />Install Sippy Paws</button>
      ) : (
        <ol className="steps">
          {g.steps.map((s, i) => (
            <li key={i}><span className="si"><Icon icon={s.icon} /></span><span><span className="sn">{i + 1}</span>{s.text}</span></li>
          ))}
        </ol>
      )}
      {g.note && <p className="muted small" style={{ fontWeight: 700, marginBottom: 0 }}>{g.note}</p>}
    </>
  );
}
