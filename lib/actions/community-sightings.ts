"use server";

import { createClient } from "@/lib/supabase/server";

export interface CommunitySighting {
    id: string;
    user_id: string;
    latitude: number;
    longitude: number;
    species_name?: string;
    description: string;
    image_url?: string;
    province?: string;
    country: string;
    status: 'pending' | 'verified' | 'rejected';
    created_at: string;
}

export async function createCommunitySighting(data: {
    latitude: number;
    longitude: number;
    description: string;
    species_name?: string;
    image_url?: string;
    province?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { data: sighting, error } = await supabase
        .from('community_sightings')
        .insert({
            user_id: user.id,
            latitude: data.latitude,
            longitude: data.longitude,
            description: data.description,
            species_name: data.species_name,
            image_url: data.image_url,
            province: data.province || 'ON',
            country: 'Canada',
            status: 'pending'
        })
        .select()
        .single();

    if (error) throw error;
    return sighting;
}

export async function getCommunitySightings(
    timeRange: 'all' | '30d' | '7d' = 'all'
): Promise<CommunitySighting[]> {
    const supabase = await createClient();

    // 1. Fetch sightings
    const { data: sightings, error: sightingsError } = await supabase
        .from('community_sightings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

    if (sightingsError) {
        console.error('Error fetching community sightings:', sightingsError);
        return [];
    }

    if (!sightings || sightings.length === 0) return [];

    // 2. Fetch profiles for these users
    const userIds = Array.from(new Set(sightings.map(s => s.user_id)));

    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

    if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
    }

    // 3. Merge data
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    return sightings.map(s => ({
        ...s,
        user: profileMap.get(s.user_id) || null
    }));
}

export async function deleteCommunitySighting(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from('community_sightings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Security: only delete own sightings

    if (error) throw error;
}
