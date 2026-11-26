/** Pure reminder logic (no I/O) so it can be unit-tested. */
export type RemindState = {
  settings?: { name?: string; pandaName?: string; catName?: string; goalMl?: number; remind?: boolean; interval?: number; startHour?: number; endHour?: number };
  ml?: Record<string, number>; dayGoal?: Record<string, number>; lastDrink?: number;
};

function localParts(now: Date, tz: string) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const p = Object.fromEntries(f.formatToParts(now).map((x) => [x.type, x.value]));
  return { day: `${p.year}-${p.month}-${p.day}`, hour: +p.hour + +p.minute / 60 };
}

export function decide(st: RemindState, now: Date, tz: string, lastSentAt: number | null): { title: string; body: string } | null {
  const s = { name: "friend", pandaName: "Bao", catName: "Miso", goalMl: 2000, remind: true, interval: 60, startHour: 9, endHour: 22, ...st.settings };
  if (!s.name) s.name = "friend";
  if (!s.remind) return null;
  const { day, hour } = localParts(now, tz);
  const inHours = s.startHour <= s.endHour ? hour >= s.startHour && hour < s.endHour : hour >= s.startHour || hour < s.endHour;
  if (!inHours) return null;
  const goal = st.dayGoal?.[day] || s.goalMl, ml = st.ml?.[day] || 0;
  if (ml >= goal) return null;
  const last = Math.max(st.lastDrink || 0, lastSentAt || 0);
  if (now.getTime() - last < s.interval * 60_000) return null;
  const left = Math.round(goal - ml), pct = ml / goal;
  const span = s.endHour > s.startHour ? (hour - s.startHour) / (s.endHour - s.startHour) : 0.5;
  const behind = pct < span - 0.25, late = s.endHour - hour <= 1.5;
  const lines = late
    ? [[s.catName, `${left} ml to go before bed. One more glass with me?`], [s.pandaName, `Almost bedtime, ${s.name}. A few sips and we're there!`]]
    : behind
      ? [[s.catName, `Mrrp… my bowl is empty and so is yours. ${left} ml to go.`], [s.pandaName, `${s.name}, I'm so thirsty. Drink with me?`]]
      : pct === 0
        ? [[s.pandaName, `Good ${hour < 12 ? "morning" : "day"}, ${s.name}! Let's start with a glass of water.`], [s.catName, "Psst… water first, then the world."]]
        : [[s.pandaName, `Sip break! ${left} ml left today.`], [s.catName, `A little drink would make me purr, ${s.name}.`]];
  const [who, body] = lines[Math.floor(now.getTime() / 60_000) % lines.length];
  return { title: who, body };
}
