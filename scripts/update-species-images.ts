/**
 * Script to fetch and update species images from iNaturalist
 * Run with: npx tsx scripts/update-species-images.ts
 */

import { fetchSpeciesImage, fetchSpeciesImages } from '../lib/species-images';

// Sample species to fetch images for
const speciesList = [
    { name: 'Zebra Mussel', scientific: 'Dreissena polymorpha' },
    { name: 'Round Goby', scientific: 'Neogobius melanostomus' },
    { name: 'Sea Lamprey', scientific: 'Petromyzon marinus' },
    { name: 'Quagga Mussel', scientific: 'Dreissena rostriformis bugensis' },
    { name: 'Spiny Water Flea', scientific: 'Bythotrephes longimanus' },
    { name: 'Purple Loosestrife', scientific: 'Lythrum salicaria' },
    { name: 'Garlic Mustard', scientific: 'Alliaria petiolata' },
    { name: 'Emerald Ash Borer', scientific: 'Agrilus planipennis' },
    { name: 'Asian Long-horned Beetle', scientific: 'Anoplophora glabripennis' },
    { name: 'Giant Hogweed', scientific: 'Heracleum mantegazzianum' },
];

async function updateSpeciesImages() {
    console.log('🔍 Fetching species images from iNaturalist...\n');

    const results = [];

    for (const species of speciesList) {
        console.log(`Fetching: ${species.name} (${species.scientific})`);

        const imageData = await fetchSpeciesImage(species.scientific, 'medium');

        if (imageData) {
            console.log(`  ✅ Found image: ${imageData.url.substring(0, 60)}...`);
            console.log(`  📝 ${imageData.attribution}\n`);

            results.push({
                common_name: species.name,
                scientific_name: species.scientific,
                image_url: imageData.url,
                attribution: imageData.attribution,
                license: imageData.license_code
            });
        } else {
            console.log(`  ❌ No image found\n`);
        }

        // Rate limiting: wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n📊 Summary:');
    console.log(`Total species: ${speciesList.length}`);
    console.log(`Images found: ${results.length}`);
    console.log(`Success rate: ${Math.round((results.length / speciesList.length) * 100)}%`);

    console.log('\n📋 SQL UPDATE statements:\n');

    for (const result of results) {
        console.log(`-- ${result.common_name}`);
        console.log(`UPDATE invasive_species SET`);
        console.log(`  primary_image_url = '${result.image_url}',`);
        console.log(`  source_urls = jsonb_build_array('${result.attribution}')`);
        console.log(`WHERE scientific_name = '${result.scientific_name}';\n`);
    }
}

// Run the script
updateSpeciesImages().catch(console.error);
