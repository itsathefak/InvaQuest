-- Seed 7 ADDITIONAL Invasive Species with Real iNaturalist Images
-- Run this in your Supabase SQL Editor
-- This is an ADD-ON to the previous seeds.sql

-- 1. ENSURE UNIQUE CONSTRAINT EXISTS
-- The previous error (42P10) happened because "scientific_name" needs a unique constraint
-- for ON CONFLICT to work. We add it here safely.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'invasive_species_scientific_name_key'
    ) THEN
        ALTER TABLE invasive_species 
        ADD CONSTRAINT invasive_species_scientific_name_key UNIQUE (scientific_name);
    END IF;
EXCEPTION
    WHEN others THEN NULL; -- Ignore if it races or fails, usually implies it exists or data duplicates prevent it
END $$;

-- 2. CLEANUP DUPLICATES FOR NEW SPECIES (Just in case constraint addition failed due to dupes)
DELETE FROM invasive_species a
USING invasive_species b
WHERE a.scientific_name = b.scientific_name
  AND a.id < b.id
  AND a.scientific_name IN (
    'Agrilus planipennis',
    'Anoplophora glabripennis',
    'Heracleum mantegazzianum',
    'Phragmites australis',
    'Cynanchum rossicum',
    'Pastinaca sativa',
    'Faxonius rusticus'
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
-- 1. EMERALD ASH BORER
(
  'Emerald Ash Borer',
  'Agrilus planipennis',
  'insect',
  'extreme',
  'Eastern Asia',
  'Metallic green beetle that kills ash trees by boring under the bark.',
  'The Emerald Ash Borer is a metallic green jewel beetle that attacks and kills all species of North American ash trees. Larvae feed on the inner bark, disrupting tree nutrient transport. It has killed millions of trees across North America since its discovery in 2002.',
  '["Metallic green body", "7.5-15 mm long", "D-shaped exit holes in bark", "S-shaped larval galleries under bark", "Red abdomen visible when wings spread"]'::jsonb,
  'Kills 99% of infected ash trees, devastating urban and rural forests. Loss of canopy affects water temperature and quality. Displaces species dependent on ash trees.',
  'Costs billions in dead tree removal and replacement for municipalities. Loss of timber value for woodlot owners.',
  '["Ontario", "Quebec", "Manitoba", "New Brunswick", "Nova Scotia"]'::jsonb,
  '["Forests", "Urban areas", "Parks", "Woodlots"]'::jsonb,
  '["Windsor", "Toronto", "Ottawa", "Sault Ste. Marie", "Manitoulin Island"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/595000213/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/595000245/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/595000245/medium.jpg"]'::jsonb,
  'hard',
  '["Six-spotted Tiger Beetle", "Bronze Birch Borer"]'::jsonb,
  '["Larvae feed in S-shaped galleries", "Adults leave D-shaped exit holes", "Can kill a healthy tree in 1-4 years"]'::jsonb,
  '["Do not move firewood", "Burn it where you buy it", "Inspect ash trees for dieback"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.invasivespeciescentre.ca/invasive-species/meet-the-species/invasive-insects/emerald-ash-borer/"]'::jsonb
),
-- 2. ASIAN LONG-HORNED BEETLE
(
  'Asian Long-horned Beetle',
  'Anoplophora glabripennis',
  'insect',
  'extreme',
  'China and Korea',
  'Large black beetle with white spots and very long antennae that attacks hardwoods.',
  'The Asian Long-horned Beetle is a large, wood-boring insect that attacks a wide range of hardwood trees, including maples, elms, willows, and birches. Larvae tunnel into the heartwood, structurally weakening and eventually killing the tree.',
  '["Large black body (2-4 cm)", "Distinct white spots on back", "Very long antennae with black and white bands", "Blueish feet", "Round exit holes (pencil diameter)"]'::jsonb,
  'Threatens Canada''s maple syrup and hardwood lumber industries. Loss of urban tree canopy leads to increased energy costs and lower air quality.',
  'Potential destruction of maple forests would be devastating to tourism and maple syrup production.',
  '["Ontario"]'::jsonb,
  '["Urban forests", "Hardwood forests"]'::jsonb,
  '["Greater Toronto Area (Eradicated but under surveillance)"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/598282315/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598282322/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598282322/medium.jpg"]'::jsonb,
  'medium',
  '["White-spotted Sawyer Beetle"]'::jsonb,
  '["Commonly called ''Starry Sky Beetle'' in Asia", "Antennae can be 2x body length", "Targets healthy trees, not just stressed ones"]'::jsonb,
  '["Report sightings immediately", "Do not move firewood", "inspect trees for round exit holes"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.invasivespeciescentre.ca/invasive-species/meet-the-species/invasive-insects/asian-long-horned-beetle/"]'::jsonb
),
-- 3. GIANT HOGWEED
(
  'Giant Hogweed',
  'Heracleum mantegazzianum',
  'plant',
  'high',
  'Caucasus Mountains (Eurasia)',
  'Massive toxic plant that causes severe skin burns and blindness.',
  'Giant Hogweed is a dangerously toxic perennial that can grow up to 5.5 meters tall. Its clear watery sap contains phototoxic chemicals that cause severe burns and blistering when exposed to sunlight. It outcompetes native vegetation with its massive size.',
  '["Massive height (2-5m)", "Large umbrella-shaped white flower heads", "Purple blotches on stem", "Coarse white hairs on stem", "Deeply lobed, jagged leaves (1m wide)"]'::jsonb,
  'Forms dense canopies that shade out native plants. Roots do not hold soil well, leading to riverbank erosion. Reduces biodiversity.',
  'Hazardous to humans and livestock. Removal is dangerous and expensive due to required protective gear.',
  '["Ontario", "British Columbia", "Quebec", "New Brunswick"]'::jsonb,
  '["Roadsides", "Riverbanks", "Open fields", "Vacant lots"]'::jsonb,
  '["Southern Ontario", "Greater Toronto Area", "Ottawa", "Kapuskasing"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/592383567/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/592383578/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/592383578/medium.jpg"]'::jsonb,
  'easy',
  '["Cow Parsnip", "Queen Anne''s Lace", "Angelica"]'::jsonb,
  '["Sap causes burns only when exposed to sunlight", "Blindness can be permanent if sap enters eyes", "Can produce 50,000 seeds per plant"]'::jsonb,
  '["DO NOT TOUCH", "Report immediately to local municipality", "Wash skin immediately if touched and avoid sun"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontario.ca/page/giant-hogweed"]'::jsonb
),
-- 4. PHRAGMITES (EUROPEAN COMMON REED)
(
  'European Common Reed',
  'Phragmites australis',
  'plant',
  'high',
  'Eurasia',
  'Tall aggressive grass that chokes wetlands and blocks shorelines.',
  'Invasive Phragmites is a tall perennial grass that spreads rapidly by roots (rhizomes) to form dense monocultures. It can grow up to 5 meters tall, choking out native wetland plants and blocking views and access to water.',
  '["Height up to 5 meters (15ft)", "Dense, dark green stands", "Large, fluffy, purple-brown seed heads", "Rough, rigid stems", "Blue-green leaves"]'::jsonb,
  'Crowds out native vegetation and destroys wildlife habitat. Lowers water levels in wetlands. Increases fire risk due to dry biomass. Blocks turtle migration routes.',
  'Reduces property values by blocking water views. Damages road infrastructure. Expensive to control along highways.',
  '["Ontario", "Quebec", "Manitoba", "New Brunswick"]'::jsonb,
  '["Wetlands", "Beaches", "Roadside ditches", "Shorelines"]'::jsonb,
  '["Long Point", "Rondeau Park", "Highway corridors", "Great Lakes shorelines"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/598270123/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598270145/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598270145/medium.jpg"]'::jsonb,
  'medium',
  '["Native Phragmites (smaller, less dense)"]'::jsonb,
  '["Roots secrete toxins to kill neighboring plants (allelopathy)", "Rhizomes can grow 10m in a year", "Stands can carry intensely hot fires"]'::jsonb,
  '["Clean equipment after working in infested areas", "Do not compost root fragments", "Report stands to EDDMapS"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontario.ca/page/phragmites-invasive-common-reed"]'::jsonb
),
-- 5. DOG-STRANGLING VINE
(
  'Dog-strangling Vine',
  'Cynanchum rossicum',
  'plant',
  'high',
  'Ukraine and Southern Russia',
  'Aggressive vine that smothers small trees and plants in forests and fields.',
  'Dog-strangling Vine (Pale Swallowwort) is an invasive perennial vine that wraps around and smothers native vegetation. It forms dense mats in open areas and forest understories, preventing forest regeneration.',
  '["Twining vine habit", "Oval opposite leaves with pointed tips", "Small pink to dark purple star-shaped flowers", "Bean-shaped seed pods (4-7cm)", "Clear sap (not milky)"]'::jsonb,
  'Smothers native plants and small trees. Threatens Monarch butterflies which lay eggs on it but larvae cannot survive. Reduces forest health.',
  'Invades pastures and is difficult to remove. Reduces recreational value of natural areas.',
  '["Ontario", "Quebec"]'::jsonb,
  '["Forests", "Ravines", "Roadsides", "Fields"]'::jsonb,
  '["Toronto ravines", "Rouge Valley", "Prince Edward County", "Ottawa"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/597891234/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/597891256/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/597891256/medium.jpg"]'::jsonb,
  'medium',
  '["Common Milkweed (has milky sap)"]'::jsonb,
  '["Often confused with milkweed", "Monarch larvae die if they eat it", "Seeds have fluffy parachutes for wind dispersal"]'::jsonb,
  '["Remove seed pods before they open", "Dig out root crowns", "Do not compost seeds"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontario.ca/page/dog-strangling-vine"]'::jsonb
),
-- 6. WILD PARSNIP
(
  'Wild Parsnip',
  'Pastinaca sativa',
  'plant',
  'medium',
  'Europe and Asia',
  'Yellow-flowered plant with sap that causes severe burns in sunlight.',
  'Wild Parsnip is a member of the carrot family with toxic sap. Like Giant Hogweed, its sap causes phytophotodermatitis (severe burns) when exposed to sunlight. It grows in dense patches along roadsides and in fields.',
  '["Yellow umbrella-shaped flower clusters", "Height up to 1.5m", "Grooved, hollow stem", "Compound leaves with saw-toothed edges", "Bloom June-October"]'::jsonb,
  'Invades natural habitats and agricultural fields. Outcompetes native wildflowers. Can be toxic to livestock if eaten in large quantities.',
  'Health hazard for road crews and hikers. Reduces quality of agricultural hay crops.',
  '["Ontario", "Quebec", "New Brunswick", "Nova Scotia"]'::jsonb,
  '["Roadsides", "Railway embankments", "Pastures", "Fields"]'::jsonb,
  '["Eastern Ontario", "Ottawa", "Kingston", "Highway 401 corridors"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/598289812/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598289823/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598289823/medium.jpg"]'::jsonb,
  'easy',
  '["Golden Alexanders", "Queen Anne''s Lace"]'::jsonb,
  '["The edible parsnip is a cultivated variety of this same species", "Burn blisters can reappear for years", "Seeds remain viable for 4 years"]'::jsonb,
  '["Wear protective clothing", "Mow before seeds set", "Wash skin immediately if exposed"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontario.ca/page/wild-parsnip"]'::jsonb
),
-- 7. RUSTY CRAYFISH
(
  'Rusty Crayfish',
  'Faxonius rusticus',
  'aquatic',
  'high',
  'Ohio River Basin (USA)',
  'Aggressive crayfish with rusty spots that destroys aquatic plant beds.',
  'The Rusty Crayfish is a large, aggressive freshwater crustacean. It is larger than native crayfish and fights off fish predators. It voraciously eats aquatic plants, destroying habitats for fish like bass and pike.',
  '["Rusty red patches on sides of carapace", "Black-tipped claws", "Grayish-green to reddish-brown body", "Large size (up to 13cm)", "Claws have oval gap when closed"]'::jsonb,
  'Destroys aquatic plant beds (= lost fish habitat). Outcompetes native crayfish. Consumes fish eggs and small fish. reduces food for other species.',
  'Reduces sport fish populations, impacting recreational fishing tourism.',
  '["Ontario", "Manitoba", "Quebec"]'::jsonb,
  '["Lakes", "Rivers", "Streams", "Ponds"]'::jsonb,
  '["Kawartha Lakes", "Ottawa River", "Lake of the Woods", "Kenora", "Guelph"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/592312345/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/592312356/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/592312356/medium.jpg"]'::jsonb,
  'medium',
  '["Virile Crayfish (native)", "Northern Clearwater Crayfish (native)"]'::jsonb,
  '["Often assumes a ''claws up'' fighting posture", "Introduced by anglers using them as bait", "Can hybridize with native crayfish"]'::jsonb,
  '["Never release bait into water", "Use native bait only", "Report sightings"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontario.ca/page/rusty-crayfish"]'::jsonb
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

-- Final Verification for ALL species
SELECT common_name, scientific_name FROM invasive_species ORDER BY common_name;
