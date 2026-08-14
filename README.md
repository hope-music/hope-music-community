# Hope Music Community

A community platform for musicians and music lovers, built with Next.js.

## Stack

- **Next.js 16** (App Router) + React 19
- **Supabase** — Postgres database, RLS, Storage
- **Clerk** — authentication
- **TipTap** — rich text editor for posts
- **Tailwind CSS 4**
- **Cloudflare Workers** — production hosting (via `@opennextjs/cloudflare`)

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, used by `/api/storage/upload` and `/api/admin/*`)
- `TICKETMASTER_API_KEY` (server-only, used by `/api/sync-events/stream`)
- Clerk publishable / secret keys
- `RESEND_API_KEY` (verification emails)

> The Cloudflare Worker (production) reads `SUPABASE_SERVICE_ROLE_KEY` and
> `TICKETMASTER_API_KEY` from worker secrets, not from `wrangler.jsonc`.
> `deploy.yml` pushes `SUPABASE_SERVICE_ROLE_KEY` on every deploy.

## Database

Schema lives in `supabase/migrations/`. Apply the initial schema in
`supabase/migrations/001_initial_schema.sql` via the Supabase SQL Editor.
It is idempotent and sets up all tables, RLS, and a read-only `public_read`
policy (writes go through the service role key via the admin API routes).

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
│   └── api/                # /api/auth/*, /api/sync-events/*, /api/storage/*, /api/admin/*
├── components/             # Shared UI components
│   ├── home/               # Home page sections
│   ├── layout/             # Nav, footer, search
│   └── ...
├── lib/                    # Helpers, constants, hooks
supabase/migrations/        # SQL migrations
public/                     # Static assets
```

## Deployment

Deploy to Cloudflare Workers with `npm run deploy`. See `.github/workflows/deploy.yml`.
