"use server";

import { createClient } from "@/lib/supabase/server";
import { type Sighting, type Species } from "@/types";

export async function getGameChallenges(count: number = 10): Promise<Sighting[]> {
    const supabase = await createClient();

    // 1. Get IDs of all eligible system sightings
    const { data: allIds, error: idError } = await supabase
        .from('sightings')
        .select('id')
        .is('user_id', null);

    if (idError || !allIds || allIds.length === 0) {
        console.error("Error fetching sighting IDs:", idError);
        return [];
    }

    // 2. Shuffle and pick 'count' random IDs
    const shuffled = allIds.sort(() => 0.5 - Math.random());
    const selectedIds = shuffled.slice(0, count).map(x => x.id);

    // 3. Fetch full details for the selected IDs
    const { data, error } = await supabase
        .from('sightings')
        .select(`
            *,
            invasive_species:invasive_species_id (*)
        `)
        .in('id', selectedIds);

    if (error || !data) {
        console.error("Error fetching random sightings:", error);
        return [];
    }

    // 4. Map to Sighting type and Shuffle again (db fetch might reorder)
    const sightings = data.map((item: any) => {
        const speciesData = item.invasive_species;
        return {
            id: item.id,
            userId: 'system',
            speciesId: item.invasive_species_id,
            photoUrl: speciesData?.primary_image_url || '',
            coordinates: {
                lat: item.latitude,
                lng: item.longitude
            },
            country: item.country || 'Canada',
            province: item.province || 'ON',
            status: 'confirmed',
            notes: item.description,
            createdAt: item.created_at,

            species: speciesData ? {
                id: speciesData.id,
                commonName: speciesData.common_name,
                scientificName: speciesData.scientific_name,
                category: speciesData.category,
                threatLevel: speciesData.threat_level,
                primaryRegion: 'Ontario',
                regions: speciesData.provinces_found,
                country: 'Canada',
                description: speciesData.short_description,
                imageKey: speciesData.primary_image_url
            } : undefined
        } as Sighting;
    });

    return sightings.sort(() => 0.5 - Math.random());
}

export type IdentifyChallenge = {
    id: string; // species id
    imageUrl: string;
    commonName: string;
    scientificName: string;
    choices: { id: string; label: string; isCorrect: boolean }[];
};

export async function getIdentifyChallenges(count: number = 10): Promise<IdentifyChallenge[]> {
    const supabase = await createClient();

    // 1. Fetch all species with images
    const { data: allSpecies, error } = await supabase
        .from('invasive_species')
        .select('id, common_name, scientific_name, primary_image_url')
        .not('primary_image_url', 'is', null);

    if (error || !allSpecies || allSpecies.length < 4) {
        console.error("Not enough species for game:", error);
        return [];
    }

    // 2. Shuffle and pick targets
    const speciesPool = [...allSpecies].sort(() => 0.5 - Math.random());
    const targets = speciesPool.slice(0, Math.min(count, speciesPool.length));

    // 3. Construct challenges
    return targets.map(target => {
        // Pick 3 distractors
        const otherSpecies = allSpecies.filter(s => s.id !== target.id);
        const distractors = otherSpecies
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(d => ({
                id: d.id,
                label: d.common_name,
                isCorrect: false
            }));

        const correctChoice = {
            id: target.id,
            label: target.common_name,
            isCorrect: true
        };

        // Shuffle choices
        const choices = [...distractors, correctChoice].sort(() => 0.5 - Math.random());

        return {
            id: target.id,
            imageUrl: target.primary_image_url,
            commonName: target.common_name,
            scientificName: target.scientific_name,
            choices
        };
    });
}

export async function getAllSpecies(): Promise<Species[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('invasive_species')
        .select('*')
        .not('primary_image_url', 'is', null);

    if (error || !data) {
        console.error("Error fetching species:", error);
        return [];
    }

    return data.map((s: any) => ({
        id: s.id,
        commonName: s.common_name,
        scientificName: s.scientific_name,
        category: s.category,
        threatLevel: s.threat_level,
        primaryRegion: 'Ontario',
        regions: s.provinces_found,
        country: 'Canada',
        description: s.short_description,
        imageKey: s.primary_image_url,
        identificationTips: [], // Default empty
        lookAlikes: [], // Default empty
        recommendedAction: "Report immediately via the app." // Default
    }));
}
