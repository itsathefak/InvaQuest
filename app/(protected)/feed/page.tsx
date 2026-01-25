"use client";

import * as React from "react";
import { CreatePost } from "@/components/feed/CreatePost";
import { FeedPost } from "@/components/feed/FeedPost";
import { createClient } from "@/lib/supabase/client";
import { fetchPosts, createPost } from "@/lib/feed";
import { type User, type Post } from "@/types";
import { Loader2 } from "lucide-react";

export default function FeedPage() {
    const [user, setUser] = React.useState<User | null>(null);
    const [posts, setPosts] = React.useState<Post[]>([]);
    const [loading, setLoading] = React.useState(true);

    const loadUser = async () => {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser) {
            setUser({
                id: authUser.id,
                email: authUser.email || "",
                displayName: authUser.user_metadata?.full_name || "Eco Warrior",
                avatarUrl: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
                country: "Canada",
                province: "Ontario",
                xp: authUser.user_metadata?.xp || 350,
                badges: [],
                createdAt: authUser.created_at || new Date().toISOString()
            });
        }
    };

    const loadPosts = async () => {
        const livePosts = await fetchPosts();
        setPosts(livePosts);
    };

    const loadData = async () => {
        await loadUser();
        await loadPosts();
        setLoading(false);
    };

    React.useEffect(() => {
        loadData();
    }, []);

    const handleNewPost = async (newPost: Post) => {
        try {
            // Optimistic update
            setPosts([newPost, ...posts]);
            // Persist
            await createPost(newPost.content, newPost.imageUrl, newPost.location);
            // Re-fetch ONLY posts, not user
            await loadPosts();
        } catch (e) {
            console.error("Failed to create post", e);
            alert("Failed to post. Please try again.");
        }
    };

    const handlePostDeleted = (postId: string) => {
        setPosts(current => current.filter(p => p.id !== postId));
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
        );
    }

    if (!user) {
        return <div className="p-8 text-center text-red-400">Please sign in to view the feed.</div>;
    }

    return (
        <div
            className="relative min-h-[calc(100vh-4rem)] w-full"
            style={{
                backgroundImage: 'var(--image-gradient-mesh)',
                backgroundAttachment: 'fixed'
            }}
        >
            <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Community Feed</h1>
                    <p className="text-slate-400">Share your findings and connect with fellow guardians.</p>
                </div>

                <CreatePost key={user.id} user={user} onPostCreated={handleNewPost} />

                <div className="space-y-6">
                    {posts.map(post => (
                        <FeedPost
                            key={post.id}
                            post={post}
                            currentUser={user}
                            onDelete={handlePostDeleted}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
