export type Region = {
    id: string;
    name: string;
    shortCode: string;
    isDefault?: boolean;
};

export type SpeciesCategory = 'plant' | 'insect' | 'aquatic' | 'fungus' | 'pathogen' | 'mammal' | 'other';
export type ThreatLevel = 'high' | 'medium' | 'emerging' | 'watch-list';

export type Species = {
    id: string;
    commonName: string;
    scientificName: string;
    category: SpeciesCategory;
    threatLevel: ThreatLevel;
    primaryRegion: string; // e.g. "Ontario"
    regions: string[]; // List of provinces/territories
    country: string; // "Canada"
    isOntarioPriority?: boolean;
    description: string;
    identificationTips: string[];
    lookAlikes: string[];
    recommendedAction: string;
    imageKey: string;
};

export type User = {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string; // from auth provider
    country: string;
    province: string;
    city?: string;
    xp: number;
    badges: string[]; // IDs of badges
    createdAt: string;
    // Computed/joined fields
    rank?: string;
};

export type SightingStatus = 'pending' | 'confirmed' | 'rejected';

export type Sighting = {
    id: string;
    userId: string;
    speciesId?: string | null; // Null if "Unknown"
    photoUrl: string; // simplified from array for MVP, or use array if needed
    coordinates: {
        lat: number;
        lng: number;
    };
    country: string;
    province: string;
    city?: string;
    status: SightingStatus;
    notes?: string;
    createdAt: string;
    // Optional join fields
    species?: Species;
    user?: User;
};

export type Badge = {
    id: string;
    name: string;
    description: string;
    threshold: number; // XP needed or count needed
    iconKey: string;
    regionScoped?: boolean; // e.g. true if only for Ontario specific
};

export type GamificationConfig = {
    xpActions: {
        sighting_submitted: number;
        sighting_confirmed: number;
        quiz_completed: number;
        // ...
    };
    badges: Badge[];
};

export type ReactionType = 'native' | 'invasive' | 'protected' | 'curious';

export type Comment = {
    id: string;
    postId: string;
    user: User;
    content: string;
    createdAt: string;
};

export type Post = {
    id: string;
    user: User;
    content: string;
    imageUrl?: string;
    location?: { latitude: number; longitude: number };
    reactions: Record<ReactionType, number>;
    comments: Comment[];
    createdAt: string;
    userReaction?: ReactionType; // Current user's reaction
};
