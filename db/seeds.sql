-- Seed 7 Invasive Species with Real iNaturalist Images
-- Run this in your Supabase SQL Editor

-- 1. CLEANUP DUPLICATES FIRST
DELETE FROM invasive_species a
USING invasive_species b
WHERE a.scientific_name = b.scientific_name
  AND a.id < b.id;

INSERT INTO public.invasive_species (
  common_name, scientific_name, category, threat_level, native_region,
  short_description, full_description, identification_features,
  ecological_impact, economic_impact,
  provinces_found, habitat_types, typical_locations,
  primary_image_url, additional_images, identification_images,
  difficulty_level, similar_native_species, fun_facts, prevention_tips,
  source_urls
) VALUES
-- 1. ZEBRA MUSSEL
(
  'Zebra Mussel',
  'Dreissena polymorpha',
  'aquatic',
  'extreme',
  'Caspian and Black Sea regions',
  'Small striped freshwater mussel that forms dense colonies on hard surfaces.',
  'Zebra mussels are small bivalve mollusks with distinctive dark and light striped shells. They attach to hard surfaces using byssal threads and can form dense colonies that clog water intake pipes and disrupt ecosystems. Adults are typically 1-2 cm long.',
  '["Distinctive zebra-like stripes", "D-shaped shell", "Byssal threads for attachment", "Size 1-2 cm"]'::jsonb,
  'Filters massive amounts of plankton, disrupting food webs. Increases water clarity which can harm native species. Colonizes and smothers native mussels.',
  'Clogs water intake pipes, damages boats and infrastructure. Costs millions annually in Ontario for control and removal.',
  '["Ontario", "Quebec", "Manitoba"]'::jsonb,
  '["Lakes", "Rivers", "Reservoirs"]'::jsonb,
  '["Lake Erie", "Lake Ontario", "St. Lawrence River", "Lake Simcoe"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/598271580/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598271601/medium.jpg", "https://inaturalist-open-data.s3.amazonaws.com/photos/598271636/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/38802692/medium.jpg"]'::jsonb,
  'easy',
  '["Native freshwater mussels"]'::jsonb,
  '["Can survive out of water for several days", "A single female can produce 1 million eggs per year", "Arrived in ballast water from ships"]'::jsonb,
  '["Clean, drain, and dry boats", "Inspect and remove any attached mussels", "Never transport water between lakes"]'::jsonb,
  '["Photo by daviddia (CC BY-NC) via iNaturalist", "https://www.ontario.ca/page/zebra-mussels"]'::jsonb
),
-- 2. ROUND GOBY
(
  'Round Goby',
  'Neogobius melanostomus',
  'aquatic',
  'high',
  'Black and Caspian Seas',
  'Bottom-dwelling fish with distinctive black spot on dorsal fin.',
  'Round gobies are small, aggressive bottom-dwelling fish that can tolerate poor water quality. They have a distinctive fused pelvic fin forming a suction cup and a black spot on the first dorsal fin. They compete with native fish for food and habitat.',
  '["Black spot on first dorsal fin", "Fused pelvic fin (suction cup)", "Bulging eyes", "Thick lips", "Length up to 25 cm"]'::jsonb,
  'Competes with native fish for food and spawning sites. Preys on eggs and young of native species. Can tolerate poor water quality giving them advantage.',
  'Impacts commercial and recreational fisheries. Disrupts food webs affecting economically important species.',
  '["Ontario", "Quebec"]'::jsonb,
  '["Lakes", "Rivers", "Rocky bottoms"]'::jsonb,
  '["Lake Ontario", "Lake Erie", "Lake Huron", "Detroit River"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/598303345/medium.jpg',
  '[]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598303345/medium.jpg"]'::jsonb,
  'medium',
  '["Sculpin", "Darters"]'::jsonb,
  '["Can spawn up to 6 times per season", "Males guard nests aggressively", "Feed heavily on zebra mussels"]'::jsonb,
  '["Never use as live bait", "Do not release into water", "Report sightings"]'::jsonb,
  '["Photo by Don Sutherland (CC BY-NC) via iNaturalist", "https://www.ontario.ca/page/round-goby"]'::jsonb
),
-- 3. SEA LAMPREY
(
  'Sea Lamprey',
  'Petromyzon marinus',
  'aquatic',
  'extreme',
  'Atlantic Ocean',
  'Parasitic eel-like fish with sucker mouth full of teeth.',
  'Sea lampreys are parasitic fish that attach to other fish using their sucker-like mouth filled with sharp teeth. They feed on body fluids of host fish, often killing them. Adults can reach 120 cm in length.',
  '["Eel-like body", "Sucker mouth with concentric rows of teeth", "Seven gill openings", "No paired fins", "Mottled coloring"]'::jsonb,
  'Parasitizes and kills native fish including lake trout. Each lamprey can kill 40+ pounds of fish. Nearly eliminated lake trout populations in Great Lakes.',
  'Devastated commercial fisheries in 1940s-50s. Ongoing control costs millions annually.',
  '["Ontario", "Quebec", "Manitoba"]'::jsonb,
  '["Lakes", "Rivers", "Streams"]'::jsonb,
  '["Lake Ontario", "Lake Huron", "Lake Superior", "Tributary streams"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/595019872/medium.jpg',
  '[]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/595019872/medium.jpg"]'::jsonb,
  'easy',
  '["Native lamprey species"]'::jsonb,
  '["Can live in both freshwater and saltwater", "Larvae live in streams for 3-17 years", "Controlled using lampricide in spawning streams"]'::jsonb,
  '["Report sightings", "Support lamprey control programs", "Never transport between water bodies"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.glfc.org/sea-lamprey.php"]'::jsonb
),
-- 4. PURPLE LOOSESTRIFE
(
  'Purple Loosestrife',
  'Lythrum salicaria',
  'plant',
  'high',
  'Europe and Asia',
  'Tall wetland plant with distinctive purple flower spikes.',
  'Purple loosestrife is a perennial wetland plant that can grow 1-2 meters tall. It produces showy purple-magenta flower spikes and spreads aggressively through seeds and root fragments. A single plant can produce over 2 million seeds annually.',
  '["Purple-magenta flower spikes", "Square stems", "Opposite or whorled leaves", "Height 1-2 meters", "Blooms July-September"]'::jsonb,
  'Forms dense monocultures that crowd out native wetland plants. Reduces biodiversity and degrades wildlife habitat. Alters wetland hydrology.',
  'Reduces property values near wetlands. Impacts agriculture and recreation. Difficult and expensive to control.',
  '["Ontario", "Quebec", "Manitoba", "British Columbia"]'::jsonb,
  '["Wetlands", "Marshes", "Lake shores", "Stream banks"]'::jsonb,
  '["Great Lakes wetlands", "St. Lawrence River", "Ottawa River"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/598801125/medium.jpg',
  '[]'::jsonb,
  '[]'::jsonb,
  'easy',
  '["Native loosestrife species", "Fireweed"]'::jsonb,
  '["One plant can produce 2.7 million seeds", "Seeds remain viable in soil for years", "Introduced as ornamental garden plant"]'::jsonb,
  '["Do not plant in gardens", "Remove plants before they seed", "Dispose of plants in garbage, not compost"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontario.ca/page/purple-loosestrife"]'::jsonb
),
-- 5. GARLIC MUSTARD
(
  'Garlic Mustard',
  'Alliaria petiolata',
  'plant',
  'high',
  'Europe',
  'Biennial herb with garlic-scented leaves that invades forest understories.',
  'Garlic mustard is a biennial plant that forms dense stands in forest understories. First-year plants form rosettes of kidney-shaped leaves, while second-year plants produce tall flowering stalks with white flowers. Crushing the leaves releases a garlic odor.',
  '["Garlic smell when crushed", "Heart-shaped leaves with toothed edges", "White four-petaled flowers", "Height up to 1 meter", "Blooms April-June"]'::jsonb,
  'Displaces native spring wildflowers and tree seedlings. Produces chemicals that inhibit growth of other plants and fungi. Disrupts forest regeneration.',
  'Reduces forest biodiversity and ecosystem services. Expensive to control in natural areas.',
  '["Ontario", "Quebec", "Manitoba"]'::jsonb,
  '["Forests", "Forest edges", "Trails", "Disturbed areas"]'::jsonb,
  '["Southern Ontario forests", "Urban parks", "Conservation areas"]'::jsonb,
  'https://static.inaturalist.org/photos/598840922/medium.jpg',
  '[]'::jsonb,
  '[]'::jsonb,
  'medium',
  '["Native toothworts", "Other mustard family plants"]'::jsonb,
  '["One plant can produce 3000+ seeds", "Seeds remain viable for 5+ years", "Introduced for medicinal and culinary use"]'::jsonb,
  '["Pull plants before they flower", "Bag and dispose in garbage", "Monitor sites for several years"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontario.ca/page/garlic-mustard"]'::jsonb
),
-- 6. QUAGGA MUSSEL
(
  'Quagga Mussel',
  'Dreissena rostriformis bugensis',
  'aquatic',
  'extreme',
  'Dnieper River drainage of Ukraine',
  'Freshwater mussel similar to zebra mussel but rounder and often paler.',
  'Quagga mussels are invasive freshwater bivalves related to zebra mussels. They replace zebra mussels in many areas, can live in deeper, colder water, and colonize softer substrates. Their shell is rounded on the bottom, meaning they will topple over if placed on a flat surface.',
  '["Rounded bottom (will not sit flat)", "Pale, often white near hinge", "Asymmetrical shell", "Dark concentric rings on shell", "Size up to 3 cm"]'::jsonb,
  'Rapidly filters water, removing phytoplankton and food for native species. Increases water clarity, altering ecosystems. Accumulates contaminants.',
  'Fouls recreational boats, docks, and intake pipes even more aggressively than zebra mussels due to year-round activity in deep water.',
  '["Ontario", "Quebec"]'::jsonb,
  '["Deep lakes", "Rivers", "Canals", "Reservoirs"]'::jsonb,
  '["Lake Ontario", "Lake Erie", "Lake Huron", "St. Lawrence River"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/595731104/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/595731104/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/595731104/medium.jpg"]'::jsonb,
  'difficult',
  '["Zebra Mussel"]'::jsonb,
  '["Can survive at depths up to 130 meters", "Active all year round, even in winter", "Discovered in Great Lakes in 1989"]'::jsonb,
  '["Clean, drain, and dry boats", "Wash boat with hot water (140°F)", "Let boat dry for at least 5 days"]'::jsonb,
  '["Photo by blytz94 (CC BY-NC) via iNaturalist", "https://www.invasivespeciescentre.ca/invasive-species/meet-the-species/fish-and-invertebrates/quagga-mussels/"]'::jsonb
),
-- 7. SPINY WATER FLEA
(
  'Spiny Water Flea',
  'Bythotrephes longimanus',
  'aquatic',
  'high',
  'Northern Europe and Asia',
  'Tiny crustacean with a long, sharp, barbed tail spine.',
  'The spiny water flea is a predatory zooplankton. It has a single large black eye and a long tail spine with up to 3 pairs of barbs. The tail comprises about 70% of its total length. They clump together on fishing lines, looking like gelatinous blobs with black spikes.',
  '["Long barbed tail spine (70% of length)", "Single large black eye", "1-1.5 cm total length", "Clumps on fishing lines"]'::jsonb,
  'Predates heavily on native zooplankton (Daphnia), removing food for small fish. The sharp tail spine makes them difficult for small fish to eat.',
  'Fouls fishing gear by forming clumps on lines and guides, damaging reels and frustrating anglers.',
  '["Ontario", "Manitoba"]'::jsonb,
  '["Large deep lakes", "Slow-moving rivers"]'::jsonb,
  '["Great Lakes", "Lake Simcoe", "Muskoka Lakes", "Lake of the Woods"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/592878017/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/592878017/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/592878017/medium.jpg"]'::jsonb,
  'medium',
  '["Fishhook Waterflea"]'::jsonb,
  '["Reproduces asexually (cloning) in summer", "Resting eggs can survive drying and freezing", "Slightly larger than Fishhook Waterflea"]'::jsonb,
  '["Inspect fishing line and gear", "Wipe down lines with cloth", "Drain bilge and livewells"]'::jsonb,
  '["Photo by Rachel McTavish (CC BY-NC) via iNaturalist", "https://www.ontario.ca/page/spiny-water-flea"]'::jsonb
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

-- Final Verification
SELECT common_name, scientific_name, primary_image_url FROM invasive_species ORDER BY common_name;
