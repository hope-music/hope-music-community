# Hope Music Community

A community platform for musicians and music lovers, built with Next.js.

## Stack

- **Next.js 16** (App Router) + React 19
- **Convex** — backend / database / realtime
- **Supabase** — event data (Ticketmaster imports)
- **Clerk** — authentication
- **TipTap** — rich text editor for posts
- **Tailwind CSS 4**

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`  (server-only, used by `/api/sync-events/stream`)
- `TICKETMASTER_API_KEY`        (server-only, used by `/api/sync-events/stream`)
- Clerk publishable / secret keys
- `RESEND_API_KEY` (verification emails)

> The Cloudflare Worker (production) reads `SUPABASE_SERVICE_ROLE_KEY` and
> `TICKETMASTER_API_KEY` from worker secrets, not from `wrangler.jsonc`.
> `deploy.yml` will push `SUPABASE_SERVICE_ROLE_KEY` on every deploy.

### Convex

```bash
npx convex dev
```

## Ticketmaster → Supabase sync

1. Apply the schema in `supabase/migrations/2026_08_09_stripe_clean_full_schema.sql`
   via the Supabase SQL Editor (project `uudhjhioxukvthmlcrpm`). It is
   idempotent and creates the 12 `<category>_events` tables, backfills any
   missing columns, creates indexes, and enables RLS with a single read-only
   policy (writes go through the service role key).
2. Push `SUPABASE_SERVICE_ROLE_KEY` to the Cloudflare Worker:
   ```bash
   printf '%s' "$SUPABASE_SERVICE_ROLE_KEY" | npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   ```
3. Open `/admin/sync`, hard-refresh, and click **Sync All**. The route will
   refuse to run if the service role key is missing instead of silently
   falling back to the anon key.

## Build / start

```bash
npm run build
npm start
```

## Layout

```
src/
├── app/                    # Next.js App Router
│   ├── (public routes)     # /, /performance, /news, /insights, /interaction, /hope-studio
│   ├── admin/              # /admin/* (protected)
│   └── api/                # /api/auth/*, /api/sync-events/*
├── components/             # Shared UI components
│   ├── home/               # Home page sections
│   ├── layout/             # Nav, footer, search
│   └── ...
├── lib/                    # Helpers, constants, hooks
convex/                     # Convex schema and functions
supabase/migrations/        # SQL migrations
public/                     # Static assets
```

## Deployment

Deploy to [Vercel](https://vercel.com) with Convex and Supabase connected via environment variables.
