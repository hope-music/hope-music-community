-- Create pop_rock_events table
CREATE TABLE IF NOT EXISTS pop_rock_events (
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

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_pop_rock_events_region ON pop_rock_events(region);
CREATE INDEX IF NOT EXISTS idx_pop_rock_events_country ON pop_rock_events(country);
CREATE INDEX IF NOT EXISTS idx_pop_rock_events_event_date ON pop_rock_events(event_date);
CREATE INDEX IF NOT EXISTS idx_pop_rock_events_city ON pop_rock_events(city);
CREATE INDEX IF NOT EXISTS idx_pop_rock_events_sub_category ON pop_rock_events(sub_category);
