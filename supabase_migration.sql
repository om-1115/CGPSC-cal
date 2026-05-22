-- ============================================================
-- CGPSC Daily Tracker — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. daily_entries
-- ────────────────
create table if not exists public.daily_entries (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  entry_date       date not null,
  subject_id       text not null,
  subject_name     text not null,
  subject_part     text not null check (subject_part in ('A','B')),
  completed        boolean not null default false,
  what_i_did       text,
  plan_for_tomorrow text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, entry_date, subject_id)
);

alter table public.daily_entries enable row level security;

create policy "Users read own entries"
  on public.daily_entries for select
  using (auth.uid() = user_id);

create policy "Users insert own entries"
  on public.daily_entries for insert
  with check (auth.uid() = user_id);

create policy "Users update own entries"
  on public.daily_entries for update
  using (auth.uid() = user_id);

create policy "Users delete own entries"
  on public.daily_entries for delete
  using (auth.uid() = user_id);


-- 2. resources
-- ─────────────
create table if not exists public.resources (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  file_url      text,
  link_url      text,
  resource_type text not null check (resource_type in ('pdf','link')),
  created_at    timestamptz not null default now()
);

alter table public.resources enable row level security;

create policy "Users read own resources"
  on public.resources for select
  using (auth.uid() = user_id);

create policy "Users insert own resources"
  on public.resources for insert
  with check (auth.uid() = user_id);

create policy "Users delete own resources"
  on public.resources for delete
  using (auth.uid() = user_id);


-- 3. resource_tags
-- ─────────────────
create table if not exists public.resource_tags (
  id          uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  tag_name    text not null
);

alter table public.resource_tags enable row level security;

create policy "Users read tags of own resources"
  on public.resource_tags for select
  using (
    exists (
      select 1 from public.resources r
      where r.id = resource_tags.resource_id
        and r.user_id = auth.uid()
    )
  );

create policy "Users insert tags for own resources"
  on public.resource_tags for insert
  with check (
    exists (
      select 1 from public.resources r
      where r.id = resource_tags.resource_id
        and r.user_id = auth.uid()
    )
  );

create policy "Users delete tags of own resources"
  on public.resource_tags for delete
  using (
    exists (
      select 1 from public.resources r
      where r.id = resource_tags.resource_id
        and r.user_id = auth.uid()
    )
  );


-- 4. Storage bucket — study-pdfs
-- ────────────────────────────────
insert into storage.buckets (id, name, public)
values ('study-pdfs', 'study-pdfs', false)
on conflict (id) do nothing;

create policy "Users upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'study-pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users read own files"
  on storage.objects for select
  using (
    bucket_id = 'study-pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users delete own files"
  on storage.objects for delete
  using (
    bucket_id = 'study-pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );


-- 5. Allow anonymous users (needed for signInAnonymously)
-- ─────────────────────────────────────────────────────────
-- In Supabase Dashboard → Authentication → Providers → Anonymous
-- make sure "Enable anonymous sign-ins" is ON.
-- (Cannot be done via SQL — it's a dashboard toggle.)
