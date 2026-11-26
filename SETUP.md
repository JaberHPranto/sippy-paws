# Setting up Sippy Paws (cloud sync + reminders)

Without these steps the app still works fully on one phone (data in local storage, no push reminders).
With them: her data is backed up and syncs, reminders arrive even when the app is closed, and you get
the owner tools (coupon editor, special cards, her wishes and redemptions).

About 20 minutes, all free tiers.

## 1. Supabase
1. Create a project at supabase.com (region: Singapore is closest to Dhaka).
2. **SQL Editor** → paste `supabase/schema.sql` → Run.
3. **Authentication → Providers → Email**: keep Email on. Turn **Confirm email** on.
4. **Authentication → Email Templates → Magic Link**: make the body show the code, e.g.
   ```html
   <h2>Your Sippy Paws code</h2>
   <p style="font-size:28px;letter-spacing:6px"><b>{{ .Token }}</b></p>
   ```
   The app signs in with this 6-digit code, not a link, because on iPhone a link would open Safari
   instead of the installed app.
5. **Database → Extensions**: enable `pg_cron` and `pg_net` (needed in step 4).

## 2. Keys
```bash
npx web-push generate-vapid-keys   # gives a public + private key
openssl rand -hex 24               # CRON_SECRET
```
Copy `.env.example` to `.env.local` and fill everything in (Supabase keys are under Project Settings → API).

## 3. Deploy (Vercel)
1. Import `JaberHPranto/sippy-paws` at vercel.com/new. Framework: Next.js (detected).
2. Add every variable from `.env.local` under **Settings → Environment Variables**.
3. Deploy. Note the URL, e.g. `https://sippy-paws.vercel.app`.
4. In Supabase **Authentication → URL Configuration**, set Site URL to that address.

## 4. Reminder schedule
In the Supabase SQL Editor (replace both placeholders):
```sql
select cron.schedule('sippy-paws-reminders', '*/15 * * * *', $$
  select net.http_get(
    url := 'https://YOUR-APP.vercel.app/api/push/send',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR_CRON_SECRET')
  );
$$);
```
Every 15 minutes the app checks each phone: inside her nudge hours, goal not reached yet, and at least
"remind every" minutes since her last drink or last nudge. Then Bao or Miso sends one notification.

## 5. Accounts
1. Open the app, **Settings → Account & sync**, sign in with your email.
2. Make yourself the owner (SQL Editor):
   ```sql
   update public.profiles set role = 'owner' where email = 'you@example.com';
   ```
   Reopen the app: the **For Pranto only** panel appears at the bottom of Gifts.
3. Rizu signs in on her iPhone with her email.
4. Once both accounts exist, turn **off** new sign-ups (Authentication → Providers → Email → Allow new users to sign up), so nobody else can make an account.

## 6. On her iPhone
1. Open the URL in Safari → Share → **Add to Home Screen**.
2. Open Sippy Paws **from the Home Screen icon**, sign in, then **Turn on reminders**.
   iOS only allows notifications for web apps opened from the Home Screen (iOS 16.4+).
3. Ringer on to hear the sound effects. iPhone mutes web audio on silent.

## Privacy
- `app_state` (her water, journal, outfits) is readable **only by her** (row-level security). Your owner
  role can't read it.
- You can read: her outfit wishes and coupon redemptions (`inbox`), nothing else.
- Coupons and special cards (`shared`) are written by you and read by both.
