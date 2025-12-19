import { createClient } from "@/lib/supabase/client";

// XP Calculation Constants
const XP_REWARDS = {
    quiz: {
        easy: 5,
        medium: 10,
        hard: 15
    },
    perfectBonus: 50,
    maxTimeBonus: 25
};

// Level calculation (exponential growth)
export function getXPForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function calculateLevel(xp: number): number {
    let level = 1;
    let xpNeeded = 0;

    while (xp >= xpNeeded + getXPForLevel(level)) {
        xpNeeded += getXPForLevel(level);
        level++;
    }

    return level;
}

export function getLevelProgress(xp: number): {
    level: number;
    currentXP: number;
    xpForNextLevel: number;
    percentage: number;
} {
    const level = calculateLevel(xp);
    let xpForCurrentLevel = 0;

    for (let i = 1; i < level; i++) {
        xpForCurrentLevel += getXPForLevel(i);
    }

    const currentXP = xp - xpForCurrentLevel;
    const xpForNextLevel = getXPForLevel(level);
    const percentage = Math.floor((currentXP / xpForNextLevel) * 100);

    return { level, currentXP, xpForNextLevel, percentage };
}

// Calculate XP for a game session
export function calculateGameXP(
    gameType: 'quiz' | 'geoguesser' | 'identify' | 'scavenger' | 'puzzle',
    difficulty: 'easy' | 'medium' | 'hard',
    score: number,
    maxScore: number,
    timeTaken?: number,
    timeLimit?: number
): number {
    let xp = 0;

    if (gameType === 'quiz' || gameType === 'identify' || gameType === 'puzzle') {
        const xpPerQuestion = XP_REWARDS.quiz[difficulty];
        xp = score * xpPerQuestion;

        // Perfect score bonus
        if (score === maxScore) {
            xp += XP_REWARDS.perfectBonus;
        }

        // Time bonus (if completed quickly)
        if (timeTaken && timeLimit) {
            const timeRatio = timeTaken / timeLimit;
            if (timeRatio < 0.5) {
                // Completed in less than half the time
                xp += XP_REWARDS.maxTimeBonus;
            } else if (timeRatio < 0.75) {
                // Completed in less than 75% of time
                xp += Math.floor(XP_REWARDS.maxTimeBonus * 0.5);
            }
        }
    }

    return xp;
}

// Award XP to user and check for level up
export async function awardXP(
    userId: string,
    amount: number
): Promise<{ newTotalXP: number; oldLevel: number; newLevel: number; leveledUp: boolean }> {
    const supabase = createClient();

    // Get current profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', userId)
        .single();

    if (!profile) {
        throw new Error("Profile not found");
    }

    const currentXP = profile.xp || 0;
    const oldLevel = profile.level || 1;
    const newTotalXP = currentXP + amount;
    const newLevel = calculateLevel(newTotalXP);

    // Update profile
    const { error } = await supabase
        .from('profiles')
        .update({
            xp: newTotalXP,
            level: newLevel,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId);

    if (error) {
        console.error("Failed to update profile XP:", error);
    }

    return {
        newTotalXP,
        oldLevel,
        newLevel,
        leveledUp: newLevel > oldLevel
    };
}

// Record a game session
export async function recordGameSession(
    userId: string,
    gameType: 'quiz' | 'geoguesser' | 'identify' | 'scavenger' | 'puzzle',
    difficulty: 'easy' | 'medium' | 'hard',
    score: number,
    maxScore: number,
    xpEarned: number,
    durationSeconds?: number
): Promise<void> {
    const supabase = createClient();

    await supabase.from('game_sessions').insert({
        user_id: userId,
        game_type: gameType,
        difficulty,
        score,
        max_score: maxScore,
        xp_earned: xpEarned,
        duration_seconds: durationSeconds
    });
}

// Get user progress
export async function getUserProgress(userId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', userId)
        .single();

    if (error || !data) {
        return null;
    }

    return {
        total_xp: data.xp,
        current_level: data.level,
        ...getLevelProgress(data.xp)
    };
}

// Get user's game history
export async function getUserGameHistory(userId: string, limit: number = 10) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching game history:', error);
        return [];
    }

    return data || [];
}

// Badge Definitions
const BADGES = [
    { id: 'first-puzzle', name: 'Puzzle Novice', icon: '🧩', description: 'Completed your first puzzle' },
    { id: 'puzzle-master', name: 'Puzzle Master', icon: '🧠', description: 'Completed a Hard puzzle' },
    { id: 'first-win', name: 'First Victory', icon: '🏆', description: 'Won your first game' },
    { id: 'speedster', name: 'Speedster', icon: '⚡', description: 'Completed a game quickly' }
];

// Badge checking
export async function checkAndAwardBadges(
    userId: string,
    gameType: string,
    difficulty: string,
    score: number
): Promise<string[]> {
    const supabase = createClient();

    // Get current profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('badges, games_played') // Assume games_played is in profile or we count sessions
        .eq('id', userId)
        .single();

    if (!profile) return [];

    const currentBadges = (profile.badges || []) as string[];
    const newBadges: string[] = [];

    // Helper to add badge
    const award = (id: string) => {
        if (!currentBadges.includes(id)) {
            newBadges.push(id);
            currentBadges.push(id);
        }
    };

    // 1. First Win
    award('first-win');

    // 2. Game Specific
    if (gameType === 'puzzle') {
        award('first-puzzle');
        if (difficulty === 'hard') {
            award('puzzle-master');
        }
    }

    // 3. Save if new badges
    if (newBadges.length > 0) {
        const { error } = await supabase
            .from('profiles')
            .update({ badges: currentBadges })
            .eq('id', userId);

        if (error) console.error("Error saving badges:", error);
    }

    return newBadges.map(id => BADGES.find(b => b.id === id)?.name || id);
}

export function getBadgeDetails(id: string) {
    return BADGES.find(b => b.id === id);
}

export function getAllBadges() {
    return BADGES;
}
