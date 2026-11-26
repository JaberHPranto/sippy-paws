import {
  DropletIcon, Coffee02Icon, Coffee01Icon, CitrusIcon, DrinkIcon, SoftDrink02Icon, MilkBottleIcon, BubbleTea01Icon,
  IceCreamIcon, HandHeartIcon, Video01Icon, NoodlesIcon, FlowerIcon, GiftIcon,
  Sad01Icon, SadIcon, NeutralIcon, SmileIcon, InLoveIcon,
} from "@hugeicons/core-free-icons";

export const DRINKS = [
  { id: "water", name: "Water", icon: DropletIcon, ml: 250, f: 1, color: "#5bbcf7" },
  { id: "cha", name: "Cha", icon: Coffee02Icon, ml: 150, f: 0.9, color: "#c9a26b" },
  { id: "coffee", name: "Coffee", icon: Coffee01Icon, ml: 150, f: 0.8, color: "#8a5a3c" },
  { id: "lebu", name: "Lebu pani", icon: CitrusIcon, ml: 250, f: 1, color: "#e5bd1f" },
  { id: "daab", name: "Daab", icon: DrinkIcon, ml: 300, f: 1, color: "#4fbf8b" },
  { id: "juice", name: "Juice", icon: SoftDrink02Icon, ml: 200, f: 0.9, color: "#ff9f43" },
  { id: "milk", name: "Milk", icon: MilkBottleIcon, ml: 200, f: 0.9, color: "#a8977f" },
  { id: "lassi", name: "Lassi", icon: BubbleTea01Icon, ml: 250, f: 0.85, color: "#ff8fa3" },
] as const;
export const drinkById = (id: string) => DRINKS.find((d) => d.id === id) ?? DRINKS[0];

export const MOODS = [
  { label: "Rough", icon: Sad01Icon, color: "#8fa8d8" },
  { label: "Meh", icon: SadIcon, color: "#b9a6e3" },
  { label: "Okay", icon: NeutralIcon, color: "#bfae9c" },
  { label: "Good", icon: SmileIcon, color: "#f2b43a" },
  { label: "Great", icon: InLoveIcon, color: "#ff8fa3" },
];
/** Softer fills for calendars / bars (same as v1). */
export const MOOD_FILL = ["#8fa8d8", "#b9a6e3", "#d9cfc4", "#ffcf6e", "#ff8fa3"];

export const COUPON_ICONS = {
  icecream: IceCreamIcon, massage: HandHeartIcon, movie: Video01Icon, dinner: NoodlesIcon, flowers: FlowerIcon, gift: GiftIcon,
} as const;
export type CouponIconKey = keyof typeof COUPON_ICONS;
export type Coupon = { id: string; icon: CouponIconKey; title: string; cost: number };
export const DEFAULT_COUPONS: Coupon[] = [
  { id: "c1", icon: "icecream", title: "Ice cream date", cost: 60 },
  { id: "c2", icon: "massage", title: "20-min head massage", cost: 80 },
  { id: "c3", icon: "movie", title: "Movie night — you pick", cost: 120 },
  { id: "c4", icon: "dinner", title: "A home-cooked dinner", cost: 160 },
  { id: "c5", icon: "flowers", title: "Surprise flowers", cost: 220 },
  { id: "c6", icon: "gift", title: "Mystery gift", cost: 350 },
];

export const TIPS = [
  "Keep a bottle where you can see it. Out of sight, out of mind!",
  "Start the morning with a glass of water before your first cup of cha.",
  "Lebu pani counts too, and it tastes like summer.",
  "Feeling snacky in the afternoon? Try a glass of water first.",
  "Take a sip every time you send a message.",
  "Daab on a hot day is the best hydration hack.",
  "Cha and coffee count a little less, so pair each cup with some water.",
  "Set your bottle next to your laptop and finish it before lunch.",
  "Cold water not your thing? Warm water counts just the same.",
  "Little sips all day beat one giant chug at night.",
];

export const PROMPTS = [
  "What made you smile today?", "What's one thing you're proud of today, even a tiny one?", "How is your heart feeling right now?",
  "What's something you're looking forward to?", "Who made your day better, and how?", "What would make tomorrow a little easier?",
  "Write about a cozy moment from today.", "What's been on your mind a lot lately?", "What's one thing you'd like to let go of?",
  "If today were a weather, what would it be?", "What's a small treat you'd like to give yourself this week?",
  "What are three things you're grateful for?", "What did you learn about yourself today?", "Describe your perfect lazy Sunday.",
];

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
