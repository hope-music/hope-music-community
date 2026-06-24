-- Migration: add city column to stage_productions
-- Run this in the Supabase SQL Editor before deploying the new code.

ALTER TABLE stage_productions
  ADD COLUMN IF NOT EXISTS city TEXT;

-- Optional: add index for faster city filtering
CREATE INDEX IF NOT EXISTS idx_stage_productions_city ON stage_productions(city);
