import { createClient } from "@/lib/supabase/client";
import { type Post, type Comment, type ReactionType, type User } from "@/types";

export async function fetchPosts(): Promise<Post[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch posts with author info
    // Note: In a real prod app, we'd likely use a View or more complex query to aggregate reactions
    // For this MVP, we fetch posts and then fill in details or use a joined query if tables are set up right.
    // Let's assume a basic fetch first.

    const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
            *,
            user:profiles (
                id, full_name, avatar_url, province, country
            ),
            comments (
                id, content, created_at, user_id,
                user:profiles (id, full_name, avatar_url)
            ),
            reactions (
                reaction_type, user_id
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching posts:', error);
        return [];
    }

    // Transform to our Post type
    return postsData.map((p: any) => {
        // Count reactions
        const reactionCounts = { native: 0, invasive: 0, protected: 0, curious: 0 };
        let userReaction: ReactionType | undefined = undefined;

        p.reactions?.forEach((r: any) => {
            if (reactionCounts[r.reaction_type as ReactionType] !== undefined) {
                reactionCounts[r.reaction_type as ReactionType]++;
            }
            if (user && r.user_id === user.id) {
                userReaction = r.reaction_type as ReactionType;
            }
        });

        // Map User from profile
        const author: User = {
            id: p.user?.id || p.user_id,
            email: "",
            displayName: p.user?.full_name || "Eco Warrior",
            avatarUrl: p.user?.avatar_url,
            country: p.user?.country || "Canada",
            province: p.user?.province || "Ontario",
            xp: 0,
            badges: [],
            createdAt: p.created_at
        };

        return {
            id: p.id,
            user: author,
            content: p.content,
            imageUrl: p.image_url,
            createdAt: p.created_at,
            reactions: reactionCounts,
            comments: p.comments?.map((c: any) => ({
                id: c.id,
                postId: p.id,
                user: {
                    id: c.user?.id || c.user_id,
                    displayName: c.user?.full_name || "User",
                    avatarUrl: c.user?.avatar_url,
                    email: "", country: "", province: "", xp: 0, badges: [], createdAt: ""
                },
                content: c.content,
                createdAt: c.created_at
            })) || [],
            userReaction
        };
    });
}

export async function createPost(content: string, imageUrl?: string, location?: { latitude: number; longitude: number }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from('posts')
        .insert({
            user_id: user.id,
            content,
            image_url: imageUrl,
            latitude: location?.latitude,
            longitude: location?.longitude
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function addComment(postId: string, content: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from('comments')
        .insert({
            post_id: postId,
            user_id: user.id,
            content
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function toggleReaction(postId: string, type: ReactionType) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Check if exists
    const { data: existing } = await supabase
        .from('reactions')
        .select('id, reaction_type')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

    if (existing) {
        if (existing.reaction_type === type) {
            // Toggle off
            await supabase.from('reactions').delete().eq('id', existing.id);
        } else {
            // Change reaction
            await supabase.from('reactions').update({ reaction_type: type }).eq('id', existing.id);
        }
    } else {
        // Create new
        await supabase.from('reactions').insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: type
        });
    }
}
export async function uploadPostImage(file: File) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('feed-images')
        .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('feed-images')
        .getPublicUrl(fileName);

    return data.publicUrl;
}

export async function deletePost(postId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id); // Security check

    if (error) throw error;
}
