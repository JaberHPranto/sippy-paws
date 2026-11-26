import {
  GlassWaterIcon, Coffee01Icon, Leaf01Icon, MilkBottleIcon, CupSodaIcon, BubbleTea01Icon,
} from "@hugeicons/core-free-icons";

export const DRINKS = [
  { id: "water", label: "Water", factor: 1, icon: GlassWaterIcon, color: "#5cc0ee" },
  { id: "cha", label: "Cha", factor: 0.9, icon: Coffee01Icon, color: "#c98f5a" },
  { id: "coffee", label: "Coffee", factor: 0.8, icon: Coffee01Icon, color: "#7a5236" },
  { id: "lebu", label: "Lebu pani", factor: 1, icon: Leaf01Icon, color: "#9ad34a" },
  { id: "juice", label: "Juice", factor: 0.9, icon: CupSodaIcon, color: "#ff9f43" },
  { id: "milk", label: "Milk", factor: 0.9, icon: MilkBottleIcon, color: "#8fa6c4" },
  { id: "lassi", label: "Lassi", factor: 0.85, icon: BubbleTea01Icon, color: "#f08fb0" },
] as const;
export type DrinkId = (typeof DRINKS)[number]["id"];
