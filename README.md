# Sippy Paws

A cozy self-care PWA for Rizu: hydration reminders, journal and to-dos, guided by Bao (panda) and Miso (cat).

## Stack
Next.js (App Router) + TypeScript + Tailwind v4 · Serwist PWA · Hugeicons (no emoji in the UI) · Supabase (planned) · web-push (planned)

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
- [ ] Port Stats, Style, Journal, To-do, Gifts from the v1 artifact
- [ ] Supabase auth + RLS, `push_subscriptions`, pg_cron sender, VAPID keys
