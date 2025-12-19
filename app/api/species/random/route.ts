import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const count = parseInt(searchParams.get('count') || '1');
        const category = searchParams.get('category');
        const difficulty = searchParams.get('difficulty');

        const supabase = await createClient();

        // Get total count first
        let countQuery = supabase
            .from('invasive_species')
            .select('id', { count: 'exact', head: true });

        if (category) {
            countQuery = countQuery.eq('category', category);
        }
        if (difficulty) {
            countQuery = countQuery.eq('difficulty_level', difficulty);
        }

        const { count: totalCount } = await countQuery;

        if (!totalCount || totalCount === 0) {
            return NextResponse.json({ species: [] });
        }

        // Get random species by selecting random offsets
        const randomSpecies = [];
        const usedOffsets = new Set();

        for (let i = 0; i < Math.min(count, totalCount); i++) {
            let offset;
            do {
                offset = Math.floor(Math.random() * totalCount);
            } while (usedOffsets.has(offset));
            usedOffsets.add(offset);

            let query = supabase
                .from('invasive_species')
                .select('*')
                .range(offset, offset);

            if (category) {
                query = query.eq('category', category);
            }
            if (difficulty) {
                query = query.eq('difficulty_level', difficulty);
            }

            const { data } = await query;
            if (data && data.length > 0) {
                randomSpecies.push(data[0]);
            }
        }

        return NextResponse.json({ species: randomSpecies });
    } catch (error) {
        console.error('Random species fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch random species' },
            { status: 500 }
        );
    }
}
