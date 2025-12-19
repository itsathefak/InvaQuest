-- Migration: Add location context to sightings
-- Run this in Supabase SQL Editor

ALTER TABLE public.sightings
ADD COLUMN IF NOT EXISTS province text DEFAULT 'ON',
ADD COLUMN IF NOT EXISTS country text DEFAULT 'Canada';

-- Optional: Index on province for filtering speed
CREATE INDEX IF NOT EXISTS idx_sightings_province ON public.sightings(province);
