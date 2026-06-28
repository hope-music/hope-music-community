-- Migration: Add missing columns to legacy performance tables
-- Context: Legacy tables were created without `genre` and `segment` columns,
-- but the bulk upsert in api/sync-events/stream sends the full event payload
-- (which includes both genre + segment from Ticketmaster). This caused sync errors
-- ("Could not find the 'genre'/'segment' column...") for these tables.

-- Add `genre` to all legacy tables
ALTER TABLE classical_events    ADD COLUMN IF NOT EXISTS genre TEXT;
ALTER TABLE electronic_events   ADD COLUMN IF NOT EXISTS genre TEXT;
ALTER TABLE dance_events        ADD COLUMN IF NOT EXISTS genre TEXT;
ALTER TABLE other_events        ADD COLUMN IF NOT EXISTS genre TEXT;
ALTER TABLE musical_events      ADD COLUMN IF NOT EXISTS genre TEXT;

-- Add `segment` to all legacy tables (Ticketmaster segment name, e.g. "Arts & Theatre")
ALTER TABLE classical_events    ADD COLUMN IF NOT EXISTS segment TEXT;
ALTER TABLE electronic_events   ADD COLUMN IF NOT EXISTS segment TEXT;
ALTER TABLE dance_events        ADD COLUMN IF NOT EXISTS segment TEXT;
ALTER TABLE other_events        ADD COLUMN IF NOT EXISTS segment TEXT;
ALTER TABLE musical_events      ADD COLUMN IF NOT EXISTS segment TEXT;

-- Add `sub_category` to all classification-based tables
-- (musical already has it; this is idempotent)
ALTER TABLE classical_events    ADD COLUMN IF NOT EXISTS sub_category TEXT;
ALTER TABLE electronic_events   ADD COLUMN IF NOT EXISTS sub_category TEXT;
ALTER TABLE dance_events        ADD COLUMN IF NOT EXISTS sub_category TEXT;
ALTER TABLE other_events        ADD COLUMN IF NOT EXISTS sub_category TEXT;