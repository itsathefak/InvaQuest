-- Seed System Locations for Map Pins (Multi-Province)
-- Run this AFTER:
-- 1. All batch seeds
-- 2. migrations_map.sql
-- 3. migrations_map_filters.sql (NEW)

-- Clear existing system sightings
DELETE FROM public.sightings WHERE user_id IS NULL;

-- 1. Define Province Coordinates CTE
WITH province_coords (code, name, lat, lng) AS (
  VALUES
    ('ON', 'Ontario', 44.0000, -79.0000), -- Central/Southern ON
    ('QC', 'Quebec', 46.0000, -72.0000), -- Southern QC (populated)
    ('BC', 'British Columbia', 50.0000, -120.0000), -- Interior/Southern BC
    ('AB', 'Alberta', 53.0000, -114.0000), -- Central AB
    ('MB', 'Manitoba', 50.0000, -98.0000), -- Southern MB
    ('SK', 'Saskatchewan', 52.0000, -106.0000), -- Southern SK
    ('NS', 'Nova Scotia', 45.0000, -63.0000),
    ('NB', 'New Brunswick', 46.5000, -66.0000),
    ('PE', 'Prince Edward Island', 46.2500, -63.0000), -- Fixed PEI abbreviation handling if needed
    ('PEI', 'Prince Edward Island', 46.2500, -63.0000), -- Handling potential variation
    ('NL', 'Newfoundland', 48.0000, -56.0000),
    ('Newfoundland', 'Newfoundland', 48.0000, -56.0000)
),
-- 2. Expand Species by Provinces Found
species_provinces AS (
  SELECT 
    s.id, 
    s.scientific_name, 
    s.common_name,
    p_name as province_found
  FROM public.invasive_species s,
  jsonb_array_elements_text(s.provinces_found) as p_name
)
-- 3. Insert Sighting for each Province Found
INSERT INTO public.sightings (
    invasive_species_id, 
    species_id, 
    latitude, 
    longitude, 
    province, 
    country, 
    verified, 
    description, 
    created_at
)
SELECT 
  sp.id,
  sp.scientific_name,
  -- Add a small random offset to lat/lng so pins don't stack perfectly if same province
  COALESCE(pc.lat, 45.0) + (random() * 2 - 1) * 0.5, 
  COALESCE(pc.lng, -80.0) + (random() * 2 - 1) * 0.5,
  
  -- Normalize Province Code if possible, or use full name
  CASE 
    WHEN sp.province_found ILIKE '%Ontario%' THEN 'ON'
    WHEN sp.province_found ILIKE '%Quebec%' THEN 'QC'
    WHEN sp.province_found ILIKE '%British Columbia%' THEN 'BC'
    WHEN sp.province_found ILIKE '%Alberta%' THEN 'AB'
    WHEN sp.province_found ILIKE '%Manitoba%' THEN 'MB'
    WHEN sp.province_found ILIKE '%Saskatchewan%' THEN 'SK'
    WHEN sp.province_found ILIKE '%Nova Scotia%' THEN 'NS'
    WHEN sp.province_found ILIKE '%New Brunswick%' THEN 'NB'
    WHEN sp.province_found ILIKE '%Prince Edward Island%' THEN 'PE'
    WHEN sp.province_found ILIKE '%Newfoundland%' THEN 'NL'
    ELSE 'ON'
  END as province_code,
  
  'Canada',
  true,
  'Official tracking location for ' || sp.common_name || ' in ' || sp.province_found,
  now()
FROM species_provinces sp
LEFT JOIN province_coords pc ON (
    sp.province_found ILIKE '%' || pc.name || '%' 
    OR sp.province_found = pc.code
)
-- Remove duplicates from the join (e.g. PEI matching twice) by DISTINCT or grouping
GROUP BY sp.id, sp.scientific_name, sp.common_name, sp.province_found, pc.lat, pc.lng;
