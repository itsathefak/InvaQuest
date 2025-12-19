import { Post, User } from "@/types";

// Mock Users
const USER_1: User = {
    id: "u1",
    displayName: "Alina Chen",
    email: "alina@example.com",
    country: "Canada",
    province: "BC",
    xp: 2400,
    badges: [],
    createdAt: "2023-05-12",
    avatarUrl: "https://i.pravatar.cc/150?u=alina"
};

const USER_2: User = {
    id: "u2",
    displayName: "Mark Foster",
    email: "mark@example.com",
    country: "Canada",
    province: "Ontario",
    xp: 1200,
    badges: [],
    createdAt: "2023-08-01",
    avatarUrl: "https://i.pravatar.cc/150?u=mark"
};

export const MOCK_POSTS: Post[] = [
    {
        id: "p1",
        user: USER_1,
        content: "Just spotted a huge patch of Garlic Mustard in the local park! 🌿🚫 Making sure to report it. Remember to check your shoes before leaving infected areas!",
        imageUrl: "/images/play/identify-card.png", // Reuse existing image for demo
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        reactions: {
            native: 5,
            invasive: 12,
            protected: 1,
            curious: 0
        },
        comments: [
            {
                id: "c1",
                postId: "p1",
                user: USER_2,
                content: "Great catch Alina! That stuff spreads like wildfire.",
                createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
            }
        ],
        userReaction: 'invasive'
    },
    {
        id: "p2",
        user: USER_2,
        content: "Does anyone know if this is Japanese Knotweed? Found near the creek.",
        imageUrl: "/images/play/geoguesser-card.png",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        reactions: {
            native: 0,
            invasive: 2,
            protected: 0,
            curious: 8
        },
        comments: [],
        userReaction: undefined
    }
];
