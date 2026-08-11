-- ============================================================================
-- Hope Music Community — Stripe-clean full schema rebuild
-- Replaces 2026_08_09_restore_full_schema.sql with a single, comprehensive
-- migration that:
--   1. Creates the 12 category _events tables IF missing.
--   2. Adds missing columns (segment / genre / sub_category / event_time /
--      description / source) to any of the 12 tables that may already exist.
--   3. Creates indexes used by the home page and admin pages.
--   4. Turns on RLS and creates a single SELECT-only policy for the anon role.
--      Writes are allowed exclusively via the service_role key, which bypasses
--      RLS by definition. This avoids the 42501 permission issue that hit the
--      sync route whenever it fell back to the publishable key.
--
-- Safe to run repeatedly: every operation is idempotent.
-- Project: uudhjhioxukvthmlcrpm
-- ============================================================================

-- 1. Base tables (one per category)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS musical_events (
  id BIGSERIAL PRIMARY KEY,
  ticketmaster_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  event_time TEXT,
  image_url TEXT,
  venue TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Unknown',
  region TEXT DEFAULT 'international',
  price_min NUMERIC,
  price_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  ticket_url TEXT,
  segment TEXT,
  genre TEXT,
  sub_category TEXT,
  source TEXT DEFAULT 'ticketmaster',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opera_events (
  id BIGSERIAL PRIMARY KEY,
  ticketmaster_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  event_time TEXT,
  image_url TEXT,
  venue TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Unknown',
  region TEXT DEFAULT 'international',
  price_min NUMERIC,
  price_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  ticket_url TEXT,
  segment TEXT,
  genre TEXT,
  sub_category TEXT,
  source TEXT DEFAULT 'ticketmaster',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classical_events (
  id BIGSERIAL PRIMARY KEY,
  ticketmaster_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  event_time TEXT,
  image_url TEXT,
  venue TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Unknown',
  region TEXT DEFAULT 'international',
  price_min NUMERIC,
  price_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  ticket_url TEXT,
  segment TEXT,
  genre TEXT,
  sub_category TEXT,
  source TEXT DEFAULT 'ticketmaster',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS concert_events (
  id BIGSERIAL PRIMARY KEY,
  ticketmaster_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  event_time TEXT,
  image_url TEXT,
  venue TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Unknown',
  region TEXT DEFAULT 'international',
  price_min NUMERIC,
  price_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  ticket_url TEXT,
  segment TEXT,
  genre TEXT,
  sub_category TEXT,
  source TEXT DEFAULT 'ticketmaster',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS electronic_events (
  id BIGSERIAL PRIMARY KEY,
  ticketmaster_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  event_time TEXT,
  image_url TEXT,
  venue TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Unknown',
  region TEXT DEFAULT 'international',
  price_min NUMERIC,
  price_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  ticket_url TEXT,
  segment TEXT,
  genre TEXT,
  sub_category TEXT,
  source TEXT DEFAULT 'ticketmaster',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pop_events (
  id BIGSERIAL PRIMARY KEY,
  ticketmaster_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  event_time TEXT,
  image_url TEXT,
  venue TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Unknown',
  region TEXT DEFAULT 'international',
  price_min NUMERIC,
  price_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  ticket_url TEXT,
  segment TEXT,
  genre TEXT,
  sub_category TEXT,
  source TEXT DEFAULT 'ticketmaster',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rock_events (
  id BIGSERIAL PRIMARY KEY,
  ticketmaster_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  event_time TEXT,
  image_url TEXT,
  venue TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Unknown',
  region TEXT DEFAULT 'international',
  price_min NUMERIC,
  price_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  ticket_url TEXT,
  segment TEXT,
  genre TEXT,
  sub_category TEXT,
  source TEXT DEFAULT 'ticketmaster',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hip_hop_rap_events (
  id BIGSERIAL PRIMARY KEY,
  ticketmaster_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  event_time TEXT,
  image_url TEXT,
  venue TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Unknown',
  region TEXT DEFAULT 'international',
  price_min NUMERIC,
  price_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  ticket_url TEXT,
  segment TEXT,
  genre TEXT,
  sub_category TEXT,
  source TEXT DEFAULT 'ticketmaster',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS country_events (
  id BIGSERIAL PRIMARY KEY,
  ticketmaster_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  event_time TEXT,
  image_url TEXT,
  venue TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Unknown',
  region TEXT DEFAULT 'international',
  price_min NUMERIC,
  price_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  ticket_url TEXT,
  segment TEXT,
  genre TEXT,
  sub_category TEXT,
  source TEXT DEFAULT 'ticketmaster',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS latin_events (
  id BIGSERIAL PRIMARY KEY,
  ticketmaster_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  event_time TEXT,
  image_url TEXT,
  venue TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Unknown',
  region TEXT DEFAULT 'international',
  price_min NUMERIC,
  price_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  ticket_url TEXT,
  segment TEXT,
  genre TEXT,
  sub_category TEXT,
  source TEXT DEFAULT 'ticketmaster',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dance_events (
  id BIGSERIAL PRIMARY KEY,
  ticketmaster_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  event_time TEXT,
  image_url TEXT,
  venue TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Unknown',
  region TEXT DEFAULT 'international',
  price_min NUMERIC,
  price_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  ticket_url TEXT,
  segment TEXT,
  genre TEXT,
  sub_category TEXT,
  source TEXT DEFAULT 'ticketmaster',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS other_events (
  id BIGSERIAL PRIMARY KEY,
  ticketmaster_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  event_time TEXT,
  image_url TEXT,
  venue TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Unknown',
  region TEXT DEFAULT 'international',
  price_min NUMERIC,
  price_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  ticket_url TEXT,
  segment TEXT,
  genre TEXT,
  sub_category TEXT,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Backfill columns on any pre-existing table that did not get them
--    (the earlier 2026_06_27 migrations only created 5 of the 12 tables and
--    skipped segment/genre/sub_category on a few of them).
-- ------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'musical_events','opera_events','classical_events','concert_events',
    'electronic_events','pop_events','rock_events','hip_hop_rap_events',
    'country_events','latin_events','dance_events','other_events'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS description TEXT', t);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS event_time TEXT', t);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS segment TEXT', t);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS genre TEXT', t);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS sub_category TEXT', t);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS source TEXT', t);
    EXECUTE format('ALTER TABLE %I ALTER COLUMN source SET DEFAULT ''ticketmaster''', t);
    EXECUTE format('ALTER TABLE %I ALTER COLUMN country SET DEFAULT ''Unknown''', t);
    EXECUTE format('ALTER TABLE %I ALTER COLUMN region SET DEFAULT ''international''', t);
    EXECUTE format('ALTER TABLE %I ALTER COLUMN currency SET DEFAULT ''USD''', t);
  END LOOP;
END $$;

-- 3. Indexes — used by the home page, search, admin counts, and listing
-- ------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'musical_events','opera_events','classical_events','concert_events',
    'electronic_events','pop_events','rock_events','hip_hop_rap_events',
    'country_events','latin_events','dance_events','other_events'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_region ON %I(region)', t, t);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_country ON %I(country)', t, t);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_event_date ON %I(event_date)', t, t);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_city ON %I(city)', t, t);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_sub_category ON %I(sub_category)', t, t);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_ticketmaster_id ON %I(ticketmaster_id)', t, t);
  END LOOP;
END $$;

-- 4. Row Level Security — anon can read, only service_role can write
-- ------------------------------------------------------------
ALTER TABLE musical_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE opera_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE classical_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE concert_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE electronic_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pop_events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE rock_events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE hip_hop_rap_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE country_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE latin_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE dance_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE other_events        ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'musical_events','opera_events','classical_events','concert_events',
    'electronic_events','pop_events','rock_events','hip_hop_rap_events',
    'country_events','latin_events','dance_events','other_events'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "public read" ON %I', t);
    EXECUTE format('CREATE POLICY "public read" ON %I FOR SELECT USING (true)', t);
  END LOOP;
END $$;

-- 5. Final health-check view (used by the admin /sync page to surface row
--    counts and the presence of all required columns at a glance).
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW performance_table_health AS
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  (SELECT count(*) FROM pg_catalog.pg_attribute a
     WHERE a.attrelid = c.oid AND a.attname IN
       ('ticketmaster_id','title','event_date','image_url','venue','city',
        'state','country','region','price_min','price_max','currency',
        'ticket_url','segment','genre','sub_category','description','event_time','source')
  ) AS expected_columns_present,
  (SELECT count(*) FROM pg_catalog.pg_attribute a
     WHERE a.attrelid = c.oid AND a.attname = 'sub_category'
  ) AS has_sub_category,
  (SELECT count(*) FROM pg_catalog.pg_attribute a
     WHERE a.attrelid = c.oid AND a.attname = 'segment'
  ) AS has_segment,
  (SELECT count(*) FROM pg_catalog.pg_attribute a
     WHERE a.attrelid = c.oid AND a.attname = 'genre'
  ) AS has_genre
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname LIKE '%_events'
ORDER BY c.relname;

-- Done. 12 tables + indexes + RLS + backfill columns.
-- After this runs, push SUPABASE_SERVICE_ROLE_KEY to the Cloudflare Worker
-- (via `wrangler secret put SUPABASE_SERVICE_ROLE_KEY`) and refresh /admin/sync.
