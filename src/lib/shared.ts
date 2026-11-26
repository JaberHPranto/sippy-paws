"use client";
import { useSyncExternalStore } from "react";
import { DEFAULT_COUPONS, type Coupon } from "./data";

/** Things the partner (owner) controls (coupons). Defaults offline; replaced from the backend when signed in. */
let coupons: Coupon[] = DEFAULT_COUPONS;
const subs = new Set<() => void>();
export const setCoupons = (c: Coupon[] | null) => { coupons = c && c.length ? c : DEFAULT_COUPONS; subs.forEach((f) => f()); };
export const useCoupons = () => useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb); }; }, () => coupons, () => DEFAULT_COUPONS);
