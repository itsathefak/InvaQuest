-- Seed 10 MORE Invasive Species (Batch 3) with Real iNaturalist/Gov Images
-- Run this in your Supabase SQL Editor AFTER seeds.sql and seeds_additional.sql

-- 1. FIX CONSTRAINTS (Scientific Name & Categories)
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

    -- Update CATEGORY check constraint to allow 'reptile', etc.
    -- We drop the old one and add a more inclusive one.
    ALTER TABLE invasive_species DROP CONSTRAINT IF EXISTS invasive_species_category_check;
    
    ALTER TABLE invasive_species 
    ADD CONSTRAINT invasive_species_category_check 
    CHECK (category IN ('plant', 'aquatic', 'insect', 'fish', 'reptile', 'amphibian', 'invertebrate', 'mammal', 'bird'));

EXCEPTION
    WHEN others THEN NULL; -- Ignore if race conditions
END $$;

-- 2. CLEANUP DUPLICATES FOR THIS BATCH
DELETE FROM invasive_species a
USING invasive_species b
WHERE a.scientific_name = b.scientific_name
  AND a.id < b.id
  AND a.scientific_name IN (
    'Reynoutria japonica',
    'Myriophyllum spicatum',
    'Hydrocharis morsus-ranae',
    'Butomus umbellatus',
    'Ctenopharyngodon idella',
    'Rhamnus cathartica',
    'Adelges tsugae',
    'Lymantria dispar',
    'Trachemys scripta elegans',
    'Carassius auratus'
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
-- 1. JAPANESE KNOTWEED
(
  'Japanese Knotweed',
  'Reynoutria japonica',
  'plant',
  'extreme',
  'Eastern Asia',
  'Aggressive bamboo-like plant that damages foundations and pavement.',
  'Japanese Knotweed is one of the world''s most invasive plants. It grows rapidly (up to 10cm/day) forming dense thickets of bamboo-like stems. Its powerful roots can penetrate concrete, asphalt, and building foundations, causing severe structural damage.',
  '["Bamboo-like hollow stems", "Reddish-purple speckles on stems", "Spatula/shield-shaped green leaves", "Zig-zag stem growth pattern", "Creamy white flower sprays in late summer"]'::jsonb,
  'Outcompetes all native vegetation, creating monocultures. Destroys riverbanks by increasing erosion (roots don''t hold soil well).',
  'Reduces property values significantly. In the UK, it can be difficult to get a mortgage for properties with Knotweed. Extremely expensive to eradicate.',
  '["Ontario", "British Columbia", "Quebec", "Nova Scotia", "New Brunswick", "Newfoundland"]'::jsonb,
  '["Urban areas", "Riverbanks", "Roadsides", "Rail corridors"]'::jsonb,
  '["Toronto ravines", "Don Valley", "Ottawa", "Southern Ontario towns"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/598001234/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598001256/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598001256/medium.jpg"]'::jsonb,
  'hard',
  '["Bamboo (ornamental)", "Bindweed"]'::jsonb,
  '["Can grow through 3 inches of asphalt", "Fragments as small as 0.7g can regenerate", "Roots can go 3 meters deep"]'::jsonb,
  '["Do not cut or mow (spreads fragments)", "Hire professionals for chemical control", "Do not compost"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontario.ca/page/japanese-knotweed"]'::jsonb
),
-- 2. EURASIAN WATER-MILFOIL
(
  'Eurasian Water-milfoil',
  'Myriophyllum spicatum',
  'plant',
  'high',
  'Europe, Asia, North Africa',
  'Submerged aquatic plant that forms dense mats, choking lakes.',
  'Eurasian Water-milfoil grows under water and forms thick mats on the surface. These mats shade out native plants and impede swimming, boating, and fishing. It spreads easily when boat propellers chop it into fragments, each of which can grow into a new plant.',
  '["Feather-like leaves in whorls of 4 aroun stem", "12 or more thread-like segments per leaf", "Reddish stem tips", "Collapses when removed from water"]'::jsonb,
  'Displaces native aquatic plants. Reduces oxygen levels when mats decompose, killing fish. Creates stagnant water ideal for mosquitoes.',
  'Reduces recreational value of lakes (swimming/boating impossible). Lowers waterfront property values.',
  '["Ontario", "Quebec", "British Columbia"]'::jsonb,
  '["Lakes", "Rivers", "Ponds"]'::jsonb,
  '["Kawartha Lakes", "Rideau Canal", "Lake Simcoe", "Great Lakes bays"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/598282329/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598263423/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598263423/medium.jpg"]'::jsonb,
  'medium',
  '["Northern Water-milfoil (native, has fewer leaf segments)"]'::jsonb,
  '["A single segment can start a new colony", "First discovered in Lake Erie in 1961", "Hybridizes with native milfoil"]'::jsonb,
  '["Clean, Drain, Dry boats", "Remove plant fragments from prop"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontario.ca/page/eurasian-water-milfoil"]'::jsonb
),
-- 3. EUROPEAN FROG-BIT
(
  'European Frog-bit',
  'Hydrocharis morsus-ranae',
  'plant',
  'medium',
  'Europe',
  'Floating plant looking like mini water lilies that blankets water surfaces.',
  'European Frog-bit is a free-floating aquatic plant that resembles small water lilies. It forms dense, impenetrable mats on the water surface, blocking sunlight and movement.',
  '["Heart-shaped leaves (2-5cm)", "Small white flower with 3 petals", "Free-floating (roots hang down)", "Forms dense mats"]'::jsonb,
  'Blocks sunlight from reaching submerged native plants. Reduces oxygen in water. Interferes with duck movement and fish spawning.',
  'Clogs drainage canals and irrigation pumps. Hinders swimming and boating.',
  '["Ontario", "Quebec"]'::jsonb,
  '["Slow-moving rivers", "Sheltered bays", "Ponds", "Ditches"]'::jsonb,
  '["Rideau River", "Ottawa River", "Lake Ontario shoreline", "Kawartha Lakes"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/595015789/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/597812367/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/597812367/medium.jpg"]'::jsonb,
  'easy',
  '["American Frog-bit (rare native)", "Water Shield", "White Water Lily (much larger)"]'::jsonb,
  '["Escaped from an experimental farm in Ottawa in 1939", "Produces winter buds (turions) that sink and survive winter"]'::jsonb,
  '["Clean, Drain, Dry boats", "Report sightings"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontario.ca/page/european-frog-bit"]'::jsonb
),
-- 4. FLOWERING RUSH
(
  'Flowering Rush',
  'Butomus umbellatus',
  'plant',
  'high',
  'Eurasia',
  'Shoreline plant with pink flowers that clogs canals and lake edges.',
  'Flowering Rush is a perennial aquatic plant that grows along shorelines. While its pink flowers are beautiful, it spreads aggressively underground, crowding out native species like cattails and bulrushes.',
  '["Umbrella-shaped clusters of pink flowers", "Triangular cross-section leaves", "Twisted leaf tips", "Grows in shallow water"]'::jsonb,
  'Displaces native shoreline vegetation essential for fish and wildlife. Changes water flow in canals and ditches.',
  'Clogs irrigation canals and drainage ditches. Impedes boat access to shorelines.',
  '["Ontario", "Quebec", "Manitoba", "Alberta", "British Columbia"]'::jsonb,
  '["Shorelines", "Wetlands", "River banks", "Canals"]'::jsonb,
  '["St. Lawrence River", "Lake Erie", "Lake St. Clair", "Severn River"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/598223156/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598223178/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598223178/medium.jpg"]'::jsonb,
  'medium',
  '["Bur-reed (native)"]'::jsonb,
  '["Only member of its family (Butomaceae)", "Introduced as an ornamental garden plant", "Spreads via bulbils that detach and float"]'::jsonb,
  '["Do not buy or plant in water gardens", "Remove flower heads before seed set"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontario.ca/page/flowering-rush"]'::jsonb
),
-- 5. GRASS CARP
(
  'Grass Carp',
  'Ctenopharyngodon idella',
  'aquatic',
  'extreme',
  'Eastern Asia',
  'Large invasive fish that consumes massive amounts of aquatic vegetation.',
  'Grass Carp are one of the four "cellular" Asian Carp species. They were introduced for aquatic weed control but escapees have become a major threat. They are voracious eaters, capable of consuming 40% of their body weight in plants daily, stripping wetlands bare.',
  '["Large scales with cross-hatched appearance", "No barbels (whiskers)", "Eyes sit parallel to mouth", "Short dorsal fin", "Can reach 40kg+"]'::jsonb,
  'Destroys wetlands by eating all vegetation. Removes spawning and nursery habitat for native fish. Increases water turbidity and algal blooms (digests only 50% of food).',
  'Threatens multi-billion dollar Great Lakes fishery and tourism industry.',
  '["Ontario (Great Lakes tributaries - confined/occasional)"]'::jsonb,
  '["Large rivers", "Lakes"]'::jsonb,
  '["Lake Erie basin (surveillance)", "Lake Ontario (rare)"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/585678123/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/585678145/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/585678145/medium.jpg"]'::jsonb,
  'hard',
  '["Common Carp (has barbels)", "Suckers"]'::jsonb,
  '["Can jump out of water when disturbed", "Sterile (triploid) fish are stocked in US, but diploid (fertile) ones escape", "Digests food so poorly it eutrophies the water"]'::jsonb,
  '["Do not release live fish", "Report immediately to Invasive Species Hotline", "Do not import live minnows"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.dfo-mpo.gc.ca/species-especes/profiles-profils/grasscarp-carpeherbivore-eng.html"]'::jsonb
),
-- 6. COMMON BUCKTHORN
(
  'Common Buckthorn',
  'Rhamnus cathartica',
  'plant',
  'high',
  'Eurasia',
  'Shrub/tree that dominates understories and alters soil nitrogen.',
  'Common Buckthorn is a shrub or small tree that invades forests, forming dense thickets of bamboo-like stems. It leafs out early and stays green late, shading out spring wildflowers. Its berries are a laxative to birds. It alters soil chemistry to favour itself.',
  '["Thorn at tip of twigs", "Dark green oval leaves with curved veins", "Black berries in clusters", "Orange inner bark", "Leaves stay green late into fall"]'::jsonb,
  'Alters soil nitrogen levels. Crowds out native saplings. Host for Soybean Aphid (agricultural pest) and Oat Crown Rust.',
  'Impacts forestry and agriculture (soybeans/oats). Reduces recreational access to forests.',
  '["Ontario", "Manitoba", "Saskatchewan", "Nova Scotia", "PEI"]'::jsonb,
  '["Forests", "Fields", "Roadsides"]'::jsonb,
  '["Southern Ontario woodlots", "Fence rows", "Urban parks"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/598282356/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598234589/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598234589/medium.jpg"]'::jsonb,
  'medium',
  '["Chokecherry", "Dogwood"]'::jsonb,
  '["The berries cause diarrhea in birds to spread seeds faster", "Roots produce Juglone-like toxins (allelopathy)", "First shrub to leaf out in spring"]'::jsonb,
  '["Pull small plants", "Cut and apply herbicide to stumps", "Replace with native shrubs like Dogwood"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontario.ca/page/common-buckthorn"]'::jsonb
),
-- 7. HEMLOCK WOOLLY ADELGID
(
  'Hemlock Woolly Adelgid',
  'Adelges tsugae',
  'insect',
  'extreme',
  'Japan',
  'Tiny aphid-like insect that kills hemlock trees, identified by white woolly masses.',
  'This tiny insect sucks fluids from Hemlock trees, causing needle loss and tree death within 4-15 years. It covers itself in a white, woolly, protective wax that looks like cotton swabs on the underside of branches.',
  '["White cottony masses on underside of twigs", "Tiny black insect (visible only with magnification)", "Premature needle loss", "Greyish-green tree canopy"]'::jsonb,
  'Threatens Eastern Hemlock forests, a "keystone" species. Loss of hemlocks raises stream temperatures (harming Brook Trout) and destroys winter deer habitat.',
  'Loss of timber value. Expensive to treat ornamental trees.',
  '["Ontario (isolated populations)", "Nova Scotia"]'::jsonb,
  '["Hemlock forests"]'::jsonb,
  '["Niagara Region", "Grafton", "Wainfleet", "Fort Erie"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/595011223/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/595011245/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/595011245/medium.jpg"]'::jsonb,
  'medium',
  '["Spider sacs", "Pine sap"]'::jsonb,
  '["Reproduces asexually (all are female)", "Spread by wind and birds", "Killed 90% of hemlocks in Shenandoah National Park"]'::jsonb,
  '["Do not move firewood", "Inspect hemlock trees (underside of branches)", "Use bird feeders away from hemlocks"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontario.ca/page/hemlock-woolly-adelgid"]'::jsonb
),
-- 8. SPONGY MOTH
(
  'Spongy Moth',
  'Lymantria dispar',
  'insect',
  'high',
  'Europe',
  'Caterpillar that strips leaves from millions of trees (formerly Gypsy Moth).',
  'Spongy Moth (formerly Gypsy Moth) caterpillars defoliate extensive areas of hardwood forest. Outbreaks occur every 7-10 years. The caterpillars have distinct red and blue spots. Repeated defoliation can kill trees.',
  '["Caterpillar: 5 pairs of blue spots, 6 pairs of red spots", "Egg mass: Tan/buff colored spongy mass on trunks", "Adult Male: Brown moth", "Adult Female: White moth (flightless)"]'::jsonb,
  'Defoliates millions of hectares of forest. Weakens trees, making them vulnerable to other diseases. Nuisance to homeowners (frass/droppings).',
  'Loss of timber growth. Costs for aerial spraying programs. Allergic reactions to caterpillar hairs.',
  '["Ontario", "Quebec", "New Brunswick", "Nova Scotia", "PEI"]'::jsonb,
  '["Hardwood forests (Oak, Aspen, Birch)"]'::jsonb,
  '["Southern Ontario", "Cottage Country", "Eastern Ontario"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/598299123/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598299145/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598299145/medium.jpg"]'::jsonb,
  'easy',
  '["Forest Tent Caterpillar", "Eastern Tent Caterpillar"]'::jsonb,
  '["Name changed from ''Gypsy Moth'' in 2022", "Females cannot fly (European subspecies)", "Introduced in 1869 in a failed attempt to breed hardier silk worms"]'::jsonb,
  '["Scrape egg masses off trees in winter/spring", "Burlap bands on trees to trap caterpillars", "Do not move firewood"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontario.ca/page/spongy-moth"]'::jsonb
),
-- 9. RED-EARED SLIDER
(
  'Red-eared Slider',
  'Trachemys scripta elegans',
  'reptile',
  'medium',
  'Mississippi River Basin (USA)',
  'Pet turtle released into wild that competes with native turtles.',
  'Red-eared Sliders are the most common pet turtle, often released when they get too big. They aggressively compete with native turtles (like the Painted Turtle) for basking logs and food. They can also spread diseases to native populations.',
  '["Red stripe behind each eye", "Yellow stripes on head and legs", "Top shell smooth and dark green/brown", "Bottom shell yellow with dark blotches"]'::jsonb,
  'Outcompetes native turtles for basking sites (essential for thermoregulation). Transmits respiratory diseases to native turtles.',
  'No major economic impact, but costly for rehabilitation centers dealing with released pets.',
  '["Ontario", "British Columbia", "Quebec"]'::jsonb,
  '["Urban ponds", "Wetlands", "Lakes"]'::jsonb,
  '["High Park (Toronto)", "Urban waterways in GTA", "Hamilton", "Ottawa"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/598212678/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598212690/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/598212690/medium.jpg"]'::jsonb,
  'medium',
  '["Midland Painted Turtle (native)"]'::jsonb,
  '["Most traded turtle in the world", "Can live up to 30 years", "Slides quickly into water when startled (hence ''Slider'')"]'::jsonb,
  '["Don''t release pets into the wild", "Surrender unwanted turtles to shelters", "Don''t buy them as impulse pets"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontario.ca/page/red-eared-slider"]'::jsonb
),
-- 10. GOLDFISH
(
  'Goldfish',
  'Carassius auratus',
  'aquatic',
  'high',
  'Eastern Asia',
  'Released pet fish that grow huge and destroy water quality.',
  'Released pet Goldfish can survive in poor water and grow to football size. They stir up mud on the bottom (turbidity), uproot plants, and eat fish eggs. They degrade water quality and are known carriers of diseases.',
  '["Bright orange, olive, or gold color", "Large scales", "No barbels (unlike carp)", "Can grow very large (30cm+) in wild"]'::jsonb,
  'Increases water turbidity, killing plants and algal blooms. Competes with native fish. Predates on amphibian and fish eggs.',
  'Costly to remove from stormwater ponds (dredging required). Degrades sport fishing habitats.',
  '["Ontario", "Alberta", "British Columbia"]'::jsonb,
  '["Stormwater ponds", "Lakes", "Harbours"]'::jsonb,
  '["Hamilton Harbour", "Lake Ontario waterfront", "Urban ponds everywhere"]'::jsonb,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/597845123/medium.jpg',
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/597845134/medium.jpg"]'::jsonb,
  '["https://inaturalist-open-data.s3.amazonaws.com/photos/597845134/medium.jpg"]'::jsonb,
  'medium',
  '["Carp", "Koi"]'::jsonb,
  '["Can survive in low oxygen water", "A 3,000 goldfish population was found in one storm pond", "They lose their orange color and turn olive-green in the wild"]'::jsonb,
  '["Never release fish into the wild", "Return unwanted fish to pet stores", "Bury dead fish (don''t flush)"]'::jsonb,
  '["Photo via iNaturalist (CC BY-NC)", "https://www.ontario.ca/page/goldfish"]'::jsonb
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

-- Final Verification for ALL species (should be 24 total now)
SELECT count(*) as total_species FROM invasive_species;
