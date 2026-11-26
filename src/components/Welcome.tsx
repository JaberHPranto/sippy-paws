"use client";
import { useEffect, useState } from "react";
import { Notification03Icon, Share01Icon, AddSquareIcon, SmartPhone01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";
import { Bao } from "./Bao";
import { enableReminders, isIOS, isStandalone, pushSupported } from "@/lib/push";

export function Welcome({ name, onDone }: { name: string; onDone: () => void }) {
  const [standalone, setStandalone] = useState(false);
  const [ios, setIos] = useState(false);
  const [result, setResult] = useState<string>("");
  useEffect(() => { setStandalone(isStandalone()); setIos(isIOS()); }, []);

  const needInstall = ios && !standalone;

  return (
    <main className="safe-t safe-b mx-auto flex min-h-dvh max-w-md flex-col items-center px-6 text-center">
      <Bao size={150} className="bob mt-8" />
      <h1 className="mt-4 font-display text-3xl font-semibold">Hi {name}!</h1>
      <p className="mt-1 text-muted">I&apos;m Bao. I&apos;ll nudge you to sip, journal and tick things off.</p>

      <section className="mt-6 w-full rounded-3xl bg-card p-5 text-left shadow-sm">
        <h2 className="flex items-center gap-2 font-display text-lg">
          <Icon icon={SmartPhone01Icon} /> Add me to your Home Screen
        </h2>
        <ol className="mt-3 space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-water/20 text-water-d"><Icon icon={Share01Icon} size={18} /></span>
            <span>Tap the <b>Share</b> button in Safari.</span>
          </li>
          <li className="flex gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-d"><Icon icon={AddSquareIcon} size={18} /></span>
            <span>Choose <b>Add to Home Screen</b>, then open Sippy Paws from the new icon.</span>
          </li>
        </ol>
        {standalone && (
          <p className="mt-3 flex items-center gap-2 text-sm font-bold text-brand-d">
            <Icon icon={CheckmarkCircle02Icon} size={18} /> Installed — you&apos;re all set!
          </p>
        )}
      </section>

      <button
        disabled={needInstall || !pushSupported()}
        onClick={async () => setResult(await enableReminders())}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-4 font-display text-lg font-medium text-white shadow-lg shadow-brand/30 transition active:scale-[.98] disabled:opacity-40"
      >
        <Icon icon={Notification03Icon} /> Turn on reminders
      </button>
      {needInstall && <p className="mt-2 text-xs text-muted">Reminders unlock after you open me from the Home Screen icon.</p>}
      {result === "denied" && <p className="mt-2 text-xs text-muted">Notifications are off. You can enable them in Settings → Notifications.</p>}

      <button onClick={onDone} className="mt-4 mb-6 text-sm font-bold text-muted underline-offset-4 hover:underline">
        {result === "granted" ? "Let's go" : "Maybe later"}
      </button>
    </main>
  );
}
