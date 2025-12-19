export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuizQuestion {
    id: string;
    difficulty: Difficulty;
    question: string;
    options: string[];
    correctIndex: number;
    category: string;
}

export interface GeoGuesserLocation {
    id: string;
    imageUrl: string;
    difficulty: Difficulty;
    regionScope: 'ontario' | 'province' | 'canada';
    correctCoordinates: { lat: number; lng: number };
    hint: string;
    title: string;
}

export interface IdentifyChallengeChoices {
    id: string;
    label: string;
    isInvasive: boolean;
}

export interface IdentifyChallenge {
    id: string;
    imageUrl: string;
    choices: IdentifyChallengeChoices[];
    explanation: string;
    difficulty: Difficulty;
}

export interface ScavengerMission {
    id: string;
    title: string;
    region: string;
    difficulty: Difficulty;
    description: string;
    xpReward: number;
    requiresPhoto: boolean;
    status?: 'not_started' | 'in_progress' | 'completed';
}
