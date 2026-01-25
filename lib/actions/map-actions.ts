"use server";

import { createClient } from "@/lib/supabase/server";
import { type Sighting } from "@/types";

export async function getSightings(
    source: 'official' | 'community' = 'official',
    timeRange: 'all' | '30d' | '7d' = 'all'
): Promise<Sighting[]> {
    const supabase = await createClient();

    // Calculate cutoff date if needed
    let dateCutoff: string | undefined;
    if (timeRange !== 'all') {
        const d = new Date();
        const days = timeRange === '30d' ? 30 : 7;
        d.setDate(d.getDate() - days);
        dateCutoff = d.toISOString();
    }

    // Base table depends on source
    // Official = 'sightings' table (seeded data)
    // Community = 'posts' table (user posts with location)

    if (source === 'official') {
        const { data, error } = await supabase
            .from('sightings')
            .select(`
                *,
                species:invasive_species(*)
            `)
            .eq('verified', true); // Assuming official ones are verified or we treat them as such

        if (error) {
            console.error("Error fetching official sightings:", error);
            return [];
        }

        return data.map((s: any) => ({
            id: s.id,
            userId: s.user_id || 'system',
            speciesId: s.invasive_species_id, // New column
            photoUrl: s.image_url,
            coordinates: { lat: s.latitude, lng: s.longitude },
            country: s.country || 'Canada',
            province: s.province || 'ON',
            status: 'confirmed',
            notes: s.description,
            createdAt: s.created_at,
            species: s.species ? {
                id: s.species.id,
                commonName: s.species.common_name,
                scientificName: s.species.scientific_name,
                category: s.species.category,
                threatLevel: s.species.threat_level || 'medium',
                primaryRegion: s.species.region || 'Ontario', // Fallback
                regions: s.species.regions || [],
                country: 'Canada',
                isOntarioPriority: false, // Default
                description: s.species.description || '',
                identificationTips: s.species.identification_tips || [],
                lookAlikes: s.species.look_alikes || [],
                recommendedAction: s.species.recommended_action || '',
                imageKey: s.species.primary_image_url
            } : undefined
        }));
    } else {
        // Community Sightings from new community_sightings table
        const { getCommunitySightings } = await import('./community-sightings');
        const communitySightings = await getCommunitySightings(timeRange);

        return communitySightings.map((s: any) => ({
            id: s.id,
            userId: s.user_id,
            speciesId: null,
            photoUrl: s.image_url,
            coordinates: { lat: s.latitude, lng: s.longitude },
            country: s.country || 'Canada',
            province: s.province || 'ON',
            status: s.status || 'pending',
            notes: s.description,
            createdAt: s.created_at,
            speciesName: s.species_name,
            user: s.user
        }));
    }
}
