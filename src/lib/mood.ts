import { dk, fmtMl } from "./dates";
import { type State, goalOf, mlOf, pctOf, hitOf, who, nameOf } from "./store";

export type Mood = "normal" | "happy" | "ecstatic" | "sad" | "wink" | "sleepy";

const inActiveHours = (s: State, d = new Date()) => {
  const h = d.getHours(), { startHour: a, endHour: e } = s.settings;
  return a <= e ? h >= a && h < e : h >= a || h < e;
};
const activeFraction = (s: State) => {
  const { startHour: a, endHour: e } = s.settings; if (a >= e) return 0.5;
  const d = new Date(), h = d.getHours() + d.getMinutes() / 60;
  return Math.min(1, Math.max(0, (h - a) / (e - a)));
};
const overdue = (s: State) =>
  s.settings.remind && inActiveHours(s) && Date.now() - Math.max(s.lastDrink, Date.now() - 1) >= s.settings.interval * 60000;

/** ecstatic = goal done · happy = on track / just drank · sad = behind · normal = in between */
export function moodNow(s: State): Mood {
  const k = dk(), p = pctOf(s, k);
  if (p >= 1) return "ecstatic";
  if (Date.now() - s.lastDrink < 8 * 60000) return "happy";
  const h = new Date().getHours();
  if (h < s.settings.startHour) return "normal";
  if (h >= s.settings.endHour) return "sad";
  const exp = activeFraction(s);
  if (overdue(s) || p < exp - 0.25) return "sad";
  if (p >= exp - 0.05) return "happy";
  return "normal";
}
export const moodForDay = (s: State, k: string): Mood =>
  k === dk() ? moodNow(s) : hitOf(s, k) ? "ecstatic" : pctOf(s, k) >= 0.6 ? "normal" : "sad";

export function defaultLine(s: State, seed: number) {
  const N = nameOf(s), k = dk(), left = Math.max(0, goalOf(s, k) - mlOf(s, k)), h = new Date().getHours();
  const P = who(s, "P"), C = who(s, "C");
  const p = <T,>(a: T[]) => a[seed % a.length];
  switch (moodNow(s)) {
    case "ecstatic": return p([`${P} WE DID IT, ${N}!! Goal complete! *happy panda rolls*`, `${C} Purr-fectly hydrated! I'm doing zoomies for you.`, `${P} Look at us! Fully hydrated and fabulous.`]);
    case "sad": return h >= s.settings.endHour
      ? p([`${C} We didn't make it today… One more sip before bed?`, `${P} *sniff* ${fmtMl(left)} short today. Tomorrow we try again, okay?`])
      : p([`${C} Mrrp… my bowl is empty and so is yours. ${fmtMl(left)} to go…`, `${P} ${N}… I'm so thirsty I could cry. Drink with me?`, `${C} *sad meow* We're falling behind… just one glass?`]);
    case "happy": return p([`${P} Yay, we're on track! ${fmtMl(left)} left.`, `${C} *happy tail swish* Keep it up, ${N}!`, `${P} Sip sip hooray!`]);
    default:
      if (h < 11) return p([`${P} Good morning, ${N}! Let's start with a glass of water.`, `${C} *stretches* Morning! Water first, then the world.`]);
      return p([`${P} ${fmtMl(left)} to go, ${N}. A few sips will make me dance.`, `${C} Psst… a little drink would make me purr.`]);
  }
}
export const POKES = {
  panda: ["Hehe, that tickles!", "Boop! Bamboo break?", "*rolls over* Again, again!", "I'm not chubby, I'm fluffy."],
  cat: ["Mrrrow? Pet me more.", "*purrrrr*", "Hey! I was napping.", "If I fits, I sits."],
};
