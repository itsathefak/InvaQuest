/**
 * Service for fetching species images from iNaturalist API
 */

interface iNaturalistPhoto {
    url: string;
    license_code: string;
    attribution: string;
}

interface iNaturalistObservation {
    photos: Array<{
        url: string;
        license_code: string;
    }>;
    user: {
        name: string;
        login: string;
    };
}

interface iNaturalistResponse {
    results: iNaturalistObservation[];
    total_results: number;
}

/**
 * Fetch species image from iNaturalist by scientific name
 * @param scientificName - Scientific name of the species (e.g., "Dreissena polymorpha")
 * @param size - Image size: 'square', 'small', 'medium', 'large', 'original' (default: 'medium')
 * @returns Image data with URL and attribution, or null if not found
 */
export async function fetchSpeciesImage(
    scientificName: string,
    size: 'square' | 'small' | 'medium' | 'large' | 'original' = 'medium'
): Promise<iNaturalistPhoto | null> {
    try {
        // Encode the scientific name for URL
        const encodedName = encodeURIComponent(scientificName);

        // Build API URL with filters for quality photos
        const apiUrl = `https://api.inaturalist.org/v1/observations?` +
            `taxon_name=${encodedName}` +
            `&per_page=5` +                    // Get 5 observations
            `&quality_grade=research` +        // Only research-grade observations
            `&photos=true` +                   // Must have photos
            `&order=desc` +                    // Most recent first
            `&order_by=votes`;                 // Prioritize highly-voted observations

        const response = await fetch(apiUrl);

        if (!response.ok) {
            console.error(`iNaturalist API error: ${response.status}`);
            return null;
        }

        const data: iNaturalistResponse = await response.json();

        // Check if we have results with photos
        if (data.results && data.results.length > 0) {
            const observation = data.results[0];

            if (observation.photos && observation.photos.length > 0) {
                const photo = observation.photos[0];

                // Replace 'square' in URL with desired size
                const imageUrl = photo.url.replace('square', size);

                // Create attribution string
                const attribution = `Photo by ${observation.user.name} (${photo.license_code || 'All Rights Reserved'}) via iNaturalist`;

                return {
                    url: imageUrl,
                    license_code: photo.license_code || 'all-rights-reserved',
                    attribution
                };
            }
        }

        console.log(`No images found for ${scientificName}`);
        return null;

    } catch (error) {
        console.error(`Error fetching image for ${scientificName}:`, error);
        return null;
    }
}

/**
 * Fetch multiple images for a species
 * @param scientificName - Scientific name of the species
 * @param count - Number of images to fetch (default: 3)
 * @param size - Image size
 * @returns Array of image data
 */
export async function fetchSpeciesImages(
    scientificName: string,
    count: number = 3,
    size: 'square' | 'small' | 'medium' | 'large' | 'original' = 'medium'
): Promise<iNaturalistPhoto[]> {
    try {
        const encodedName = encodeURIComponent(scientificName);

        const apiUrl = `https://api.inaturalist.org/v1/observations?` +
            `taxon_name=${encodedName}` +
            `&per_page=${count}` +
            `&quality_grade=research` +
            `&photos=true` +
            `&order=desc` +
            `&order_by=votes`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            return [];
        }

        const data: iNaturalistResponse = await response.json();
        const images: iNaturalistPhoto[] = [];

        for (const observation of data.results || []) {
            if (observation.photos && observation.photos.length > 0) {
                const photo = observation.photos[0];
                const imageUrl = photo.url.replace('square', size);
                const attribution = `Photo by ${observation.user.name} (${photo.license_code || 'All Rights Reserved'}) via iNaturalist`;

                images.push({
                    url: imageUrl,
                    license_code: photo.license_code || 'all-rights-reserved',
                    attribution
                });
            }
        }

        return images;

    } catch (error) {
        console.error(`Error fetching images for ${scientificName}:`, error);
        return [];
    }
}

/**
 * Test function to verify API connectivity
 */
export async function testINaturalistAPI() {
    console.log('Testing iNaturalist API...');

    const testSpecies = 'Dreissena polymorpha'; // Zebra Mussel
    const result = await fetchSpeciesImage(testSpecies);

    if (result) {
        console.log('✅ API test successful!');
        console.log('Image URL:', result.url);
        console.log('Attribution:', result.attribution);
        return true;
    } else {
        console.log('❌ API test failed - no image found');
        return false;
    }
}
