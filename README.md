# Sippy Paws

A cozy self-care PWA for Rizu: hydration reminders, journal and to-dos, guided by Bao (panda) and Miso (cat).

## Stack
Next.js (App Router) + TypeScript · Serwist PWA · Hugeicons (no emoji in the UI) · Supabase (planned) · web-push (planned)

## Dev
```bash
npm install
npm run build && npm start   # service worker is disabled in `next dev`
```
`next build` runs with `--webpack` because Serwist needs webpack.

## Status
- [x] PWA shell, manifest, icons, service worker with push handlers
- [x] Welcome / install flow (iOS Home Screen + reminder permission)
- [x] Today screen (drinks, ml goal) with Hugeicons tab bar
- [x] Today, Stats, Journal, To-do, Gifts ported 1:1 from the v1 artifact (same CSS, same Bao & Miso SVGs, same point rules); emoji replaced with Hugeicons
- [x] Settings sheet (names, goal, glass size, reminder hours, sound effects on/off)
- [x] Browser-aware install guide (iOS Safari/Chrome/Firefox/Edge, Android Chrome/Samsung/Firefox, desktop) + native install prompt on Chromium
- [x] Motion (`motion/react`): tab transitions, tab pill, spring bottom sheet (swipe to close), list enter/exit, count-up, toasts
- [x] Sound effects: synthesized with Web Audio in `src/lib/sound.ts` (no audio files)
- [x] Style: Dress up, Boutique, Closet, Lookbook
- [x] Paw Cards: moments minted from real days, Cozy packs, holo tilt, specials from Pranto
- [x] Supabase: email-code sign-in, private state sync (RLS), shared coupons/specials, inbox for wishes + redemptions
- [x] Push reminders: `/api/push/send` called by Supabase pg_cron every 15 min; owner gets a push when she redeems

**Setup:** see [SETUP.md](SETUP.md). Without it, the app runs fully offline on one phone.

## Design
The look comes from the v1 artifact: `src/app/globals.css` is its stylesheet, and `src/lib/mascots.ts` is its mascot/outfit/scene SVG renderer, both ported verbatim. Keep new UI on those classes so the two stay in sync.
