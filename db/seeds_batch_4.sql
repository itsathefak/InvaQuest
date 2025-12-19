-- Seed 6 MORE Invasive Species (Batch 4)
-- Run this in your Supabase SQL Editor AFTER seeds_batch_3.sql

-- 1. FIX CONSTRAINTS (For new categories if needed)
-- We need to ensure 'mammal' is allowed if not already covered.
DO $$
BEGIN
    -- Ensure UNIQUE constraint on scientific_name exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'invasive_species_scientific_name_key'
    ) THEN
        ALTER TABLE invasive_species 
        ADD CONSTRAINT invasive_species_scientific_name_key UNIQUE (scientific_name);
    END IF;

    -- Update CATEGORY check constraint (again, just to be safe and inclusive)
    ALTER TABLE invasive_species DROP CONSTRAINT IF EXISTS invasive_species_category_check;
    
    ALTER TABLE invasive_species 
    ADD CONSTRAINT invasive_species_category_check 
    CHECK (category IN ('plant', 'aquatic', 'insect', 'fish', 'reptile', 'amphibian', 'invertebrate', 'mammal', 'bird', 'fungi'));

EXCEPTION
    WHEN others THEN NULL;
END $$;

-- 2. CLEANUP DUPLICATES FOR THIS BATCH
DELETE FROM invasive_species a
USING invasive_species b
WHERE a.scientific_name = b.scientific_name
  AND a.id < b.id
  AND a.scientific_name IN (
    'Sus scrofa',
    'Popillia japonica',
    'Halyomorpha halys',
    'Cydalima perspectalis',
    'Aegopodium podagraria',
    'Vinca minor'
  );

-- 3. INSERT OR UPDATE
INSERT INTO public.invasive_species (
  common_name, scientific_name, category, threat_level, native_region,
  short_description, full_description, identification_features,
  ecological_impact, economic_impact,
  provinces_found, habitat_types, typical_locations,
  primary_image_url, additional_images, identification_images,
  difficulty_level, similar_native_species, fun_facts, prevention_tips,
  source_urls
) VALUES
-- 1. WILD BOAR
(
  'Wild Boar',
  'Sus scrofa',
  'mammal',
  'extreme',
  'Eurasia',
  'Destructive pig that tears up crops and habitats.',
  'Wild Boar (including feral domestic pigs) are incredibly destructive invasive mammals. They act as "rototillers," rooting up vast areas of soil, destroying crops, and damaging sensitive ecosystems. They breed rapidly and are aggressive.',
  '["Coarse dark hair", "Large tusks (males)", "Wedge-shaped head", "Long snout", "Piglets have striped coats"]'::jsonb,
  'Destroys native plant communities by rooting. Predates on ground-nesting birds, amphibians, and small mammals. Contaminates water sources with waste.',
  'Causes massive agricultural damage ($1.5B/year in US). Can transmit diseases like African Swine Fever to domestic pigs.',
  '["Ontario (sightings/control zone)", "Saskatchewan", "Alberta", "Manitoba", "Quebec"]'::jsonb,
  '["Forests", "Wetlands", "Agricultural fields"]'::jsonb,
  '["Eastern Ontario", "Interlake Region (MB)", "Rural forested areas"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/595001234/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/595001234/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/595001234/medium.jpg"]'::jsonb,
  'medium',
  '["Domestic Pig"]'::jsonb,
  '["Sows can have 2 litters of 6+ piglets per year", "Highly intelligent and adaptable", "Illegal to hunt in Ontario (hunting disperses them, making control harder)"]'::jsonb,
  '["Report sightings immediately (Squeal on Pigs program)", "Do not hunt (counter-productive)", "Secure fences"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontario.ca/page/wild-pigs"]'::jsonb
),
-- 2. JAPANESE BEETLE
(
  'Japanese Beetle',
  'Popillia japonica',
  'insect',
  'high',
  'Japan',
  'Metallic beetle that skeletonizes leaves of many plants.',
  'Japanese Beetles are a major pest of over 300 plant species. The adult beetles swarm and "skeletonize" leaves (eating tissue between veins). The larvae (grubs) live underground and destroy grass roots, ruining lawns and turf.',
  '["Metallic green head and thorax", "Copper-brown wing covers", "5 white tufts of hair along each side of abdomen", "Oval shape (~1cm long)"]'::jsonb,
  'Defoliates trees, shrubs, and roses. Grubs act as a major turf pest, destroying grassroots and attracting raccoons/skunks that dig up lawns to eat them.',
  'Costly damage to ornamental and agricultural industries (nurseries, vineyards, turf).',
  '["Ontario", "Quebec", "New Brunswick", "Nova Scotia", "PEI"]'::jsonb,
  '["Gardens", "Lawns", "Golf courses", "Parks"]'::jsonb,
  '["Niagara Region", "Hamilton", "Windsor", "Southern Ontario gardens"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/598291234/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598291234/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598291234/medium.jpg"]'::jsonb,
  'easy',
  '["False Japanese Beetle", "June Beetle"]'::jsonb,
  '["Adults release aggregation pheromones to attract more beetles", "Grubs spend 10 months underground", "First found in North America in 1916"]'::jsonb,
  '["Hand-pick beetles into soapy water", "Use nematodes for grubs", "Avoid traps (they attract more than they catch)"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontario.ca/page/japanese-beetle"]'::jsonb
),
-- 3. BROWN MARMORATED STINK BUG
(
  'Brown Marmorated Stink Bug',
  'Halyomorpha halys',
  'insect',
  'medium',
  'Asia',
  'Shield-shaped bug that damages fruit and invades homes in winter.',
  'BMSB is an agricultural pest that pierces and sucks juice from fruits and vegetables, causing corky spots and rot. It is also a major nuisance pest as adults congregate in large numbers to overwinter inside homes.',
  '["Shield shape", "Mottled brown color", "White bands on antennae", "Alternating dark/light banding on abdomen edge"]'::jsonb,
  'Damages fruit crops (apples, peaches, grapes), nuts, and vegetables. Causes "cat-facing" deformation in fruit.',
  'Significant economic threat to fruit and vegetable growers. Nuisance to homeowners.',
  '["Ontario", "British Columbia", "Quebec"]'::jsonb,
  '["Orchards", "Gardens", "Houses (in winter)", "Vines"]'::jsonb,
  '["Hamilton", "Niagara Region", "Toronto", "Okanagan Valley (BC)"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/597811122/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/597811122/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/597811122/medium.jpg"]'::jsonb,
  'medium',
  '["Native Stink Bugs"]'::jsonb,
  '["Releases a foul odor when disturbed or crushed", "Seek warm shelter in homes in fall", "Can hitchhike on vehicles to new areas"]'::jsonb,
  '["Seal cracks and windows", "Vacuum up indoors (wont crush them)", "Inspect imported goods"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontario.ca/page/brown-marmorated-stink-bug"]'::jsonb
),
-- 4. BOX TREE MOTH
(
  'Box Tree Moth',
  'Cydalima perspectalis',
  'insect',
  'high',
  'East Asia',
  'Moth whose caterpillars defoliate and kill boxwood shrubs.',
  'Box Tree Moth is a pest specifically of Boxwood (*Buxus*) shrubs. The caterpillars feed voraciously on leaves and even bark, often killing the plant within one season. They create distinctive webbing and frass (droppings) within the shrub.',
  '["Green caterpillar with black head and stripes", "Webbing on boxwood shrubs", "Adult moth has white wings with thick brown border", "Defoliated boxwoods"]'::jsonb,
  'Decimates Boxwood plants, which are widely used in gardens and historical landscapes. Loss of these shrubs impacts garden aesthetics and structure.',
  'Costs to homeowners and nurseries to replace dead boxwoods. Threatens the nursery industry.',
  '["Ontario", "Nova Scotia"]'::jsonb,
  '["Gardens", "Nurseries", "Urban landscapes"]'::jsonb,
  '["Toronto", "Niagara Region", "Windsor"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/598270987/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598270987/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598270987/medium.jpg"]'::jsonb,
  'medium',
  '["Melonworm Moth"]'::jsonb,
  '["First detected in North America in Toronto (2018)", "Can have up to 3 generations per year", "Caterpillars overwinter in webbing"]'::jsonb,
  '["Inspect boxwoods regularly", "Hand-pick caterpillars", "Apply biological insecticide (Bt)"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.inspection.gc.ca/plant-health/plant-pests-invasive-species/insects/box-tree-moth/eng/1541604113360/1541604113589"]'::jsonb
),
-- 5. GOUTWEED
(
  'Goutweed',
  'Aegopodium podagraria',
  'plant',
  'medium',
  'Eurasia',
  'Aggressive groundcover that smothers forest understory plants.',
  'Goutweed (Bishop''s Weed) is an invasive perennial often sold as a groundcover. It spreads aggressively by underground rhizomes, forming dense monocultures that shade out native woodland plants. Once established, it is extremely difficult to eradicate.',
  '["Compound leaves with 3 lobes", "Umbrellas of small white flowers", "Spreads by rhizomes", "Variegated variety has white edges (often reverts to green)"]'::jsonb,
  'Reduces biodiversity in forest understories. Competes with native groundcovers like Trilliums and Wild Ginger. Prevents tree seedling establishment.',
  'Nuisance to gardeners. Reduces value of natural woodlots.',
  '["Ontario", "Quebec", "Maritimes", "BC"]'::jsonb,
  '["Gardens", "Forest edges", "Ravines", "Roadsides"]'::jsonb,
  '["Urban ravines", "Old gardens", "Shaded woodlands"]'::jsonb,
  'https://upload.wikimedia.org/wikipedia/commons/2/26/Aegopodium_podagraria_1zz.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598263123/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598263123/medium.jpg"]'::jsonb,
  'medium',
  '["Golden Alexanders", "Honewort"]'::jsonb,
  '["Also known as ''Ground Elder''", "Brought to North America as an ornamental and medicinal herb (for gout)", "Can grow in deep shade"]'::jsonb,
  '["Do not plant", "Dig out entire root system (tiny fragments regrow)", "Smother with tarp for 2 years"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontarioinvasiveplants.ca/invasive-plants/species-profiles/goutweed/"]'::jsonb
),
-- 6. PERIWINKLE
(
  'Periwinkle',
  'Vinca minor',
  'plant',
  'medium',
  'Europe',
  'Evergreen vine that forms thick mats on forest floors.',
  'Periwinkle is a trailing evergreen vine with glossy leaves and purple flowers. It is widely planted as a groundcover but escapes into forests where it forms thick, dense mats. These mats suppress all native plants and prevent forest regeneration.',
  '["Glossy dark green evergreen leaves", "Purple (sometimes white) pinwheel flowers", "Trailing vine habit", "Opposite leaves"]'::jsonb,
  'Suppresses native wildflowers and seedlings. dense root mats alter soil structure. Reduces forest diversity.',
  'Common garden escapee that degrades natural areas.',
  '["Ontario", "Eastern Canada", "BC"]'::jsonb,
  '["Forests", "Gardens", "Roadsides"]'::jsonb,
  '["Urban forests", "Garden edges", "Cemeteries"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/598001111/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598001111/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598001111/medium.jpg"]'::jsonb,
  'easy',
  '["Partridgeberry (native groundcover)"]'::jsonb,
  '["Leaves have a waxy cuticle", "Named from Latin ''vincire'' meaning to bind or fetter", "Contains alkaloids"]'::jsonb,
  '["Plant native alternatives like Wild Ginger", "Pull vines by hand", "Mow frequently to exhaust roots"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontarioinvasiveplants.ca/invasive-plants/species-profiles/periwinkle/"]'::jsonb
)
ON CONFLICT (scientific_name) 
DO UPDATE SET
  common_name = EXCLUDED.common_name,
  category = EXCLUDED.category,
  threat_level = EXCLUDED.threat_level,
  primary_image_url = EXCLUDED.primary_image_url,
  source_urls = EXCLUDED.source_urls,
  identification_features = EXCLUDED.identification_features,
  additional_images = EXCLUDED.additional_images,
  identification_images = EXCLUDED.identification_images;

-- Final Verification for ALL species (should be 30 total now)
SELECT count(*) as total_species FROM invasive_species;
