# Recovery status — performance section

This file documents what is still required on the human side (you) before the
new sync route can run end-to-end on production. The code changes are already
committed; the database needs one manual SQL run and one Cloudflare secret.

## What I changed (already done)

| File | What |
| --- | --- |
| `supabase/migrations/2026_08_09_stripe_clean_full_schema.sql` | **New.** Idempotent schema: 12 tables, default columns, RLS + `public read` SELECT-only, indexes, health-check view. |
| `supabase/migrations/2026_08_09_restore_full_schema.sql` | **Deleted.** Was untracked and never run. |
| `src/app/api/sync-events/stream/route.ts` | Writes only via service-role key; refuses to run if missing. No anon fallback. Errors surfaced to the SSE stream. Pre-sync purge is hard-aborted if it fails. |
| `src/app/performance/[category]/[slug]/page.tsx` | Reads Supabase `${category}_events` by `ticketmaster_id` slug. No more Convex lookup for stage productions. |
| `src/components/search/SearchPageClient.tsx` | Drops the always-empty `getAllPublicStageProductions` Convex query. |
| `src/lib/useSupabase.ts` | Re-implements the StageProduction hooks against Supabase. |
| `src/lib/supabase.ts` | Lazy, throw-on-misconfig clients (browser + service-role). |
| `.github/workflows/deploy.yml` | Pushes `SUPABASE_SERVICE_ROLE_KEY` to the Cloudflare Worker as a secret on every deploy. |
| `README.md` | Documents the schema and one-time secret steps. |

## What is broken on production Supabase today

Probe results using the anon key from `.env.local` on 2026-08-09:

```
musical_events      200 rows: 1 (id is UUID, has all columns)
opera_events        200 rows: 1 (returns row count via Convex path; columns inherited)
classical_events    200 rows: 630 (missing description / event_time / sub_category / source)
concert_events      200 rows: 624 (missing description / sub_category / source)
electronic_events   200 rows: 1414 (full columns)
pop_events          200 rows: 2407 (missing description)
rock_events         200 rows: 2875 (missing description)
hip_hop_rap_events  200 rows: COUNT (column list incomplete)
country_events      200 rows: 1496 (missing description)
latin_events        200 rows: 1232 (missing description)
dance_events        200 rows: 1005 (full columns)
other_events        200 rows: 0 (intentional)
```

In other words: there are ≈10k rows already synced (across 9 of the 12
tables), but the schema is inconsistent between tables. The new sync route
hits Postgres error `42703` (column does not exist) the moment it tries to
write to a table that is missing those columns.

Note: those existing rows also pre-date the publishable key being valid
(they appear to have been written through the service role from a prior
admin tool / SQL editor run, never via the broken `route.ts`).

## What you must do (≈3 minutes)

### 1. Apply the new schema migration

Open [Supabase SQL Editor](https://supabase.com/dashboard/project/uudhjhioxukvthmlcrpm/sql)
on the production project and paste the contents of
`supabase/migrations/2026_08_09_stripe_clean_full_schema.sql`. Run it.

It is safe to run multiple times. It:

- creates any of the 12 tables that are still missing
- adds `description`, `event_time`, `segment`, `genre`, `sub_category`,
  `source` to every existing table that lacks them
- turns on RLS and replaces the public-read policy with one that always
  returns `true` for `SELECT`
- creates the indexes used by the home page, listing, and search queries
- creates a `performance_table_health` view you can `SELECT *` from to verify
  every table ends up with all required columns

### 2. Push the service-role key as a Cloudflare secret

The Cloudflare Worker currently only has `TICKETMASTER_API_KEY` as a secret.
The new sync route refuses to start without `SUPABASE_SERVICE_ROLE_KEY` —
that's the only way to write through the new RLS.

After deploy.yml runs once (with the new `Push runtime secrets to
Cloudflare Worker` step), `wrangler secret list` should show both keys.
If you want to do it manually instead of waiting for the next deploy:

```bash
printf '%s' "$SUPABASE_SERVICE_ROLE_KEY" | npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

### 3. Re-run sync

Open `/admin/sync`, hard-refresh, and click **Sync All**. The route is now:

- authenticated exclusively via the service role key (no anon fallback)
- self-recursive on Ticketmaster windows so the 1000-event paging cap is
  never blown
- surfaces the first Supabase error message on each batch instead of just a
  count

If anything fails, the SSE stream shows the exact message; paste it back
and we can fix the offending table.

## What I deliberately did NOT do

- **Did not delete Convex.** It still owns admin (users / employees /
  news / insights / posts / comments / studio / stageProductions). Those
  tables never held Ticketmaster data, but I did not purge them or touch
  any other admin pages — your request was to stop touching unrelated code.
- **Did not strip the hardcoded `TICKETMASTER_API_KEY` from `wrangler.jsonc`
  nor migrate it to a Cloudflare secret.** You confirmed the key is
  permanent and the deploy.yml step uses it as a build-time / deploy-time
  env, not a runtime secret. Leaving it alone is the smallest-blast-radius
  choice.
- **Did not run `Sync All`** on your behalf. The new schema is one SQL
  editor paste away; once you run it and the service role secret is in
  place, you should see real rows flow in within a couple of minutes.
