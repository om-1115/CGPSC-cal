# CGPSC Daily Tracker

A focused daily study tracker for CGPSC Prelims Paper 1 aspirants. Track subjects across Part A (General Studies) and Part B (Chhattisgarh GK), attach study resources, and build a streak.

Built with React 19 + TypeScript + Vite, backed by Supabase for auth, data sync, and PDF storage.

---

## Features

- **Daily checklist** — 16 subjects across Part A & Part B, with per-subject notes
- **Week & month views** — heatmap-style calendar to see study patterns at a glance
- **Resources panel** — upload PDFs (stored in Supabase Storage) or save links, tagged by subject
- **Study streak** — consecutive-day counter shown in the header
- **Magic link auth** — passwordless email sign-in via Supabase
- **Offline-first** — localStorage cache; syncs to Supabase when connected

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/cgpsc-daily-tracker.git
cd cgpsc-daily-tracker
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your Supabase project credentials:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in your Supabase dashboard → **Project Settings → API**.

### 3. Set up the database

Run the migration SQL in your Supabase **SQL Editor** (`supabase_migration.sql` in the repo root). This creates:

- `daily_entries` — per-user, per-date subject completions and notes
- `resources` — uploaded PDFs and saved links
- `resource_tags` — many-to-many tags on resources
- Row-level security policies on all tables
- `study-pdfs` storage bucket with per-user access policies

### 4. Enable Email auth in Supabase

In your Supabase dashboard:

1. Go to **Authentication → Providers → Email**
2. Enable **"Passwordless / Magic Link"** sign-ins
3. Go to **Authentication → URL Configuration**
4. Add your local dev URL to the redirect allow list: `http://localhost:5173`

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase project's `anon` public key |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |

---

## Project structure

```
src/
  components/     React components (Header, SubjectRow, Uploader, …)
  lib/            Pure helpers — dates, streak, storage, db, subjects
  types/          Shared TypeScript interfaces
  App.tsx         Root application component
  main.tsx        Entry point with Supabase auth gate
  index.css       All styles (no Tailwind utility classes in JSX)
supabase_migration.sql   Run once in Supabase SQL Editor
.env.example             Copy to .env.local and fill in credentials
```

---

## Deploy

Build and deploy to any static host (Vercel, Netlify, Cloudflare Pages, etc.):

```bash
npm run build   # outputs to dist/
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your hosting platform. Add your production URL to Supabase's redirect allow list.
