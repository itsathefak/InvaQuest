import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const threatLevel = searchParams.get('threat_level');
        const difficulty = searchParams.get('difficulty');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');

        const supabase = await createClient();
        let query = supabase
            .from('invasive_species')
            .select('*')
            .order('common_name');

        // Apply filters
        if (category) {
            query = query.eq('category', category);
        }
        if (threatLevel) {
            query = query.eq('threat_level', threatLevel);
        }
        if (difficulty) {
            query = query.eq('difficulty_level', difficulty);
        }
        if (search) {
            query = query.or(`common_name.ilike.%${search}%,scientific_name.ilike.%${search}%`);
        }

        query = query.limit(limit);

        const { data, error } = await query;

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({ error: 'Failed to fetch species' }, { status: 500 });
        }

        return NextResponse.json({ species: data || [] });
    } catch (error) {
        console.error('Species fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch species' },
            { status: 500 }
        );
    }
}
