import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('invasive_species')
            .select('*')
            .eq('id', params.id)
            .single();

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({ error: 'Species not found' }, { status: 404 });
        }

        return NextResponse.json({ species: data });
    } catch (error) {
        console.error('Species fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch species' },
            { status: 500 }
        );
    }
}
