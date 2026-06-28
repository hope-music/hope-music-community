-- Migration: Reshape Performance categories from 9 to 12 sub-categories
-- Old: Musical, Opera, Classical, Music, Electronic, Pop & Rock, Performance Art, Dance, Other
-- New: Musical, Opera, Classical, Concert, Electronic, Pop, Rock, Hip-Hop/Rap, Country, Latin, Dance, Other

-- Drop removed category tables (user opted in to "drop & re-sync from scratch")
DROP TABLE IF EXISTS music_events CASCADE;
DROP TABLE IF EXISTS pop_rock_events CASCADE;
DROP TABLE IF EXISTS performance_art_events CASCADE;

-- Create new category tables
CREATE TABLE IF NOT EXISTS concert_events (
  id BIGSERIAL PRIMARY KEY,
  ticketmaster_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  event_date DATE,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pop_events (
  id BIGSERIAL PRIMARY KEY,
  ticketmaster_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  event_date DATE,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rock_events (
  id BIGSERIAL PRIMARY KEY,
  ticketmaster_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  event_date DATE,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hip_hop_rap_events (
  id BIGSERIAL PRIMARY KEY,
  ticketmaster_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  event_date DATE,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS country_events (
  id BIGSERIAL PRIMARY KEY,
  ticketmaster_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  event_date DATE,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS latin_events (
  id BIGSERIAL PRIMARY KEY,
  ticketmaster_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  event_date DATE,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for the new concert_events table
CREATE INDEX IF NOT EXISTS idx_concert_events_region ON concert_events(region);
CREATE INDEX IF NOT EXISTS idx_concert_events_country ON concert_events(country);
CREATE INDEX IF NOT EXISTS idx_concert_events_event_date ON concert_events(event_date);
CREATE INDEX IF NOT EXISTS idx_concert_events_city ON concert_events(city);

-- Indexes for the genre-based tables (pop, rock, hip_hop_rap, country, latin)
CREATE INDEX IF NOT EXISTS idx_pop_events_region ON pop_events(region);
CREATE INDEX IF NOT EXISTS idx_pop_events_country ON pop_events(country);
CREATE INDEX IF NOT EXISTS idx_pop_events_event_date ON pop_events(event_date);
CREATE INDEX IF NOT EXISTS idx_pop_events_city ON pop_events(city);
CREATE INDEX IF NOT EXISTS idx_pop_events_sub_category ON pop_events(sub_category);

CREATE INDEX IF NOT EXISTS idx_rock_events_region ON rock_events(region);
CREATE INDEX IF NOT EXISTS idx_rock_events_country ON rock_events(country);
CREATE INDEX IF NOT EXISTS idx_rock_events_event_date ON rock_events(event_date);
CREATE INDEX IF NOT EXISTS idx_rock_events_city ON rock_events(city);
CREATE INDEX IF NOT EXISTS idx_rock_events_sub_category ON rock_events(sub_category);

CREATE INDEX IF NOT EXISTS idx_hip_hop_rap_events_region ON hip_hop_rap_events(region);
CREATE INDEX IF NOT EXISTS idx_hip_hop_rap_events_country ON hip_hop_rap_events(country);
CREATE INDEX IF NOT EXISTS idx_hip_hop_rap_events_event_date ON hip_hop_rap_events(event_date);
CREATE INDEX IF NOT EXISTS idx_hip_hop_rap_events_city ON hip_hop_rap_events(city);
CREATE INDEX IF NOT EXISTS idx_hip_hop_rap_events_sub_category ON hip_hop_rap_events(sub_category);

CREATE INDEX IF NOT EXISTS idx_country_events_region ON country_events(region);
CREATE INDEX IF NOT EXISTS idx_country_events_country ON country_events(country);
CREATE INDEX IF NOT EXISTS idx_country_events_event_date ON country_events(event_date);
CREATE INDEX IF NOT EXISTS idx_country_events_city ON country_events(city);
CREATE INDEX IF NOT EXISTS idx_country_events_sub_category ON country_events(sub_category);

CREATE INDEX IF NOT EXISTS idx_latin_events_region ON latin_events(region);
CREATE INDEX IF NOT EXISTS idx_latin_events_country ON latin_events(country);
CREATE INDEX IF NOT EXISTS idx_latin_events_event_date ON latin_events(event_date);
CREATE INDEX IF NOT EXISTS idx_latin_events_city ON latin_events(city);
CREATE INDEX IF NOT EXISTS idx_latin_events_sub_category ON latin_events(sub_category);
