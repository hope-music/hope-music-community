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
- `SUPABASE_SERVICE_ROLE_KEY`
- Clerk publishable / secret keys
- `RESEND_API_KEY` (verification emails)

### Convex

```bash
npx convex dev
```

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
