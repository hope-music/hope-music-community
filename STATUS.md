# Status — back-end migration to Supabase

This file documents the completed cutover from Convex to Supabase. There is
no Convex code, dependency, configuration, or runtime reference in this
repository any more — `convex/`, `convex.json`, `src/lib/convex.ts`,
`src/types/convex.d.ts`, and the `convex` npm package have all been
removed.

## Runtime data path

| Concern | Where it lives now |
| --- | --- |
| Reads (news, insights, posts, users, services, stage productions) | `src/lib/api.ts` hooks → anon Supabase client → RLS `public_read` |
| Image uploads | `/api/storage/upload` route handler → Supabase Storage (service role) |
| Admin writes (news, insights, users) | `/api/admin/{news,insights,users}` route handlers → service role |
| Posts / comments writes | TODO — `createPost` / `createComment` etc. in `src/lib/api.ts` throw a clear `notImplemented` error until the corresponding admin API routes are added |

## Server-only protection

- `src/lib/supabase-admin.ts` exports a lazy `Proxy` — the service-role
  client is only constructed on first use, and module import from the
  browser does not throw. Direct calls from the browser will fail at the
  call site.
- The `convex.json` and `wrangler.jsonc` `NEXT_PUBLIC_CONVEX_URL` /
  `NEXT_PUBLIC_CONVEX_SITE_URL` vars were removed; Cloudflare workers
  no longer inject them.

## Deployment

The GitHub Actions deploy workflow (`/.github/workflows/deploy.yml`) no
longer runs `convex codegen` or `convex deploy`. Only the
`opennextjs-cloudflare` build + deploy steps remain.
