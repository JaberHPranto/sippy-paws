-- Sippy Paws · Supabase schema
-- Run in Supabase → SQL Editor. Safe to re-run.

-- ── profiles: one row per account. role = 'owner' for Pranto, 'her' for Rizu ──
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  role text not null default 'her' check (role in ('her', 'owner')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'owner');
$$;

drop policy if exists "read own or owner reads all" on public.profiles;
create policy "read own or owner reads all" on public.profiles for select
  using (id = auth.uid() or public.is_owner());

-- auto-create a profile on sign-up
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── app_state: the whole app state per person (journal included). PRIVATE. ──
-- Only the person themself can read or write their row. Pranto cannot read Rizu's.
create table if not exists public.app_state (
  user_id uuid primary key references auth.users on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.app_state enable row level security;
drop policy if exists "own state" on public.app_state;
create policy "own state" on public.app_state for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── shared: things Pranto sets for her (coupons, special cards). Everyone reads, owner writes ──
create table if not exists public.shared (
  key text primary key check (key in ('coupons', 'specials')),
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.shared enable row level security;
drop policy if exists "signed-in read" on public.shared;
create policy "signed-in read" on public.shared for select using (auth.uid() is not null);
drop policy if exists "owner writes" on public.shared;
create policy "owner writes" on public.shared for all using (public.is_owner()) with check (public.is_owner());

-- ── inbox: her wishes + coupon redemptions, delivered to Pranto ──
create table if not exists public.inbox (
  id bigint generated always as identity primary key,
  from_user uuid not null references auth.users on delete cascade default auth.uid(),
  kind text not null check (kind in ('wish', 'redeem')),
  payload jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.inbox enable row level security;
drop policy if exists "insert own" on public.inbox;
create policy "insert own" on public.inbox for insert with check (from_user = auth.uid());
drop policy if exists "read own or owner" on public.inbox;
create policy "read own or owner" on public.inbox for select using (from_user = auth.uid() or public.is_owner());

-- ── push_subscriptions: one per device. Only the server (service role) sends. ──
create table if not exists public.push_subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  tz text not null default 'Asia/Dhaka',
  last_sent_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
drop policy if exists "own subs" on public.push_subscriptions;
create policy "own subs" on public.push_subscriptions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── Reminder cron: calls the app every 15 minutes (enable pg_cron + pg_net first) ──
-- Replace APP_URL and CRON_SECRET, then run once:
--
-- select cron.schedule('sippy-paws-reminders', '*/15 * * * *', $$
--   select net.http_get(
--     url := 'https://APP_URL/api/push/send',
--     headers := jsonb_build_object('Authorization', 'Bearer CRON_SECRET')
--   );
-- $$);
--
-- Make Pranto the owner (after he signs in once):
-- update public.profiles set role = 'owner' where email = 'PRANTO_EMAIL';
