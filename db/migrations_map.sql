-- Migration to support System Map Pins
-- Run this in Supabase SQL Editor

-- 1. Make user_id nullable in sightings table (for "System" sightings)
ALTER TABLE public.sightings 
ALTER COLUMN user_id DROP NOT NULL;

-- 2. Clean up any bad data if necessary (optional - skipping for safety)

-- 3. Ensure species_id is a foreign key to invasive_species(id)
-- First, we need to make sure invasive_species has a primary key (it is uuid 'id')
-- The current schema might be using 'species_id' as text (e.g. 'phragmites'). 
-- We want to link it properly. 

-- If the current 'species_id' column in 'sightings' holds scientific names or codes, 
-- we might want to standardize.
-- However, for this feature, we will assume new system sightings will use the proper UUID from invasive_species table.

-- Let's change the column type if it's not UUID, but that might break existing data.
-- Instead, let's ADD a new column 'species_uuid' foreign key, migrate data if possible, or just use it for new records.
-- ACTUALLY, simpler approach:
-- Let's check if 'species_id' typically holds arbitrary text.
-- We will ALTER it to UUID if it's empty, but unsafe if data exists.
-- Safe bet: Add a Foreign Key constraint if the type matches, otherwise leave it.

-- Let's assume we can just add a constraint if the column type allows. 
-- Schema file showed: species_id text not null
-- invasive_species.id is uuid.
-- We can't easily FK text to uuid without casting.

-- DECISION: We will add a NEW column `invasive_species_id` (UUID) that FKs to `invasive_species`.
-- We will Make `species_id` nullable (for backward compatibility) or deprecated.

ALTER TABLE public.sightings 
ADD COLUMN IF NOT EXISTS invasive_species_id uuid REFERENCES public.invasive_species(id);

-- Optional: If you want to drop the old column/constraints later.
