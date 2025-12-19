import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const { difficulty } = await request.json();

        if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
            return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 });
        }

        const supabase = await createClient();

        // Fetch 15 random questions for the given difficulty
        const { data: questions, error } = await supabase
            .from('quiz_questions')
            .select('id, question, options, correct_answer, explanation, category')
            .eq('difficulty', difficulty)
            .limit(100); // Get all questions first

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
        }

        if (!questions || questions.length < 5) {
            // Fallback to static questions if DB is empty or has too few
            console.warn(`Not enough questions in DB for ${difficulty} (found ${questions?.length || 0}). Returning available or error.`);
            if (!questions || questions.length === 0) {
                return NextResponse.json({ error: 'No questions available for this difficulty.' }, { status: 404 });
            }
        }

        // Randomly select up to 15 questions, or however many we have
        const countToSelect = Math.min(questions.length, 15);
        const shuffled = questions.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, countToSelect);

        return NextResponse.json({ questions: selected });
    } catch (error) {
        console.error('Quiz start error:', error);
        return NextResponse.json(
            { error: 'Failed to start quiz' },
            { status: 500 }
        );
    }
}
