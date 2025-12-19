import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateGameXP, awardXP, recordGameSession, checkAndAwardBadges } from '@/lib/gamification';

export async function POST(request: NextRequest) {
    try {
        const { gameType, difficulty, score, maxScore, timeTaken, timeLimit } = await request.json();

        // Validate input
        if (!gameType || !difficulty || score === undefined || !maxScore) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!['quiz', 'geoguesser', 'identify', 'scavenger'].includes(gameType)) {
            return NextResponse.json({ error: 'Invalid game type' }, { status: 400 });
        }

        if (!['easy', 'medium', 'hard'].includes(difficulty)) {
            return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Calculate XP earned
        const xpEarned = calculateGameXP(
            gameType as any,
            difficulty as any,
            score,
            maxScore,
            timeTaken,
            timeLimit
        );

        // Award XP and check for level up
        const { newTotalXP, oldLevel, newLevel, leveledUp } = await awardXP(user.id, xpEarned);

        // Record game session
        await recordGameSession(
            user.id,
            gameType as any,
            difficulty as any,
            score,
            maxScore,
            xpEarned,
            timeTaken
        );

        // Check for new badges
        // Check for new badges
        const newBadges = await checkAndAwardBadges(user.id, gameType, difficulty, score);

        return NextResponse.json({
            xpEarned,
            totalXP: newTotalXP,
            oldLevel,
            newLevel,
            leveledUp,
            newBadges,
            perfectScore: score === maxScore
        });
    } catch (error) {
        console.error('Game submission error:', error);
        return NextResponse.json(
            { error: 'Failed to submit game results' },
            { status: 500 }
        );
    }
}
