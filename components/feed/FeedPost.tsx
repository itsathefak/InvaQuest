"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Share2, MoreHorizontal, Send, Trash2, Link as LinkIcon } from "lucide-react";
import { type Post, type Comment, type ReactionType, type User } from "@/types";
import { toggleReaction, addComment, deletePost } from "@/lib/feed";

interface FeedPostProps {
    post: Post;
    currentUser: User;
    onDelete?: (postId: string) => void;
}

const REACTION_ICONS: Record<ReactionType, string> = {
    native: "🌿",
    invasive: "⚠️",
    protected: "🛡️",
    curious: "🤔",
};

const REACTION_LABELS: Record<ReactionType, string> = {
    native: "Native",
    invasive: "Invasive",
    protected: "Protect",
    curious: "Curious"
};

export function FeedPost({ post: initialPost, currentUser, onDelete }: FeedPostProps) {
    const [post, setPost] = React.useState(initialPost);
    const [commentText, setCommentText] = React.useState("");
    const [showComments, setShowComments] = React.useState(false);
    const [showOptions, setShowOptions] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

    const handleReaction = async (type: ReactionType) => {
        // Optimistic Update
        setPost(prev => {
            const newReactions = { ...prev.reactions };
            if (prev.userReaction === type) {
                newReactions[type]--;
                return { ...prev, reactions: newReactions, userReaction: undefined };
            }
            if (prev.userReaction) {
                newReactions[prev.userReaction]--;
            }
            newReactions[type]++;
            return { ...prev, reactions: newReactions, userReaction: type };
        });

        // API Call
        try {
            await toggleReaction(post.id, type);
        } catch (e) {
            console.error("Reaction failed", e);
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        const tempId = Date.now().toString();
        const newComment: Comment = {
            id: tempId,
            postId: post.id,
            user: currentUser,
            content: commentText,
            createdAt: new Date().toISOString()
        };

        setPost(prev => ({
            ...prev,
            comments: [...prev.comments, newComment]
        }));
        setCommentText("");

        try {
            await addComment(post.id, newComment.content);
        } catch (e) {
            console.error("Comment failed", e);
            alert("Failed to comment");
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deletePost(post.id);
            if (onDelete) onDelete(post.id);
            else window.location.reload();
        } catch (e) {
            console.error("Delete failed", e);
            setIsDeleting(false);
            alert("Failed to delete post.");
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: `InvaQuest Post by ${post.user.displayName}`,
            text: post.content,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log("Share canceled");
            }
        } else {
            await navigator.clipboard.writeText(shareData.url);
            alert("Link copied to clipboard!");
        }
    };

    if (isDeleting) return null;

    return (
        <Card className="bg-slate-900 border-white/10 mb-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 relative">
            <CardHeader className="flex flex-row items-center gap-4 p-4 pb-2">
                <Avatar className="h-10 w-10 border border-white/10">
                    <AvatarImage src={post.user.avatarUrl} />
                    <AvatarFallback>{post.user.displayName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{post.user.displayName}</p>
                    <p className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })} • {post.user.province}
                    </p>
                </div>

                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-white"
                        onClick={() => setShowOptions(!showOptions)}
                    >
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>

                    {showOptions && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-slate-800 border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95">
                            {post.user.id === currentUser.id && (
                                <button
                                    onClick={() => {
                                        setShowDeleteDialog(true);
                                        setShowOptions(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/5 text-left"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    handleShare();
                                    setShowOptions(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 text-left"
                            >
                                <LinkIcon className="h-4 w-4" />
                                Share
                            </button>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-4">
                <p className="text-slate-200 text-sm whitespace-pre-wrap">{post.content}</p>
                {post.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-white/5 bg-black/20">
                        <img src={post.imageUrl} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />
                    </div>
                )}
            </CardContent>

            <div className="px-4 py-2 border-t border-white/5 flex gap-1 overflow-x-auto no-scrollbar">
                {(Object.keys(REACTION_ICONS) as ReactionType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => handleReaction(type)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${post.userReaction === type
                            ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                            : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                            }`}
                    >
                        <span className="text-base">{REACTION_ICONS[type]}</span>
                        <span>{post.reactions[type] || 0}</span>
                        <span className="hidden sm:inline opacity-75 ml-1">{REACTION_LABELS[type]}</span>
                    </button>
                ))}
            </div>

            <CardFooter className="flex flex-col p-0 border-t border-white/5">
                <div className="flex w-full">
                    <Button
                        variant="ghost"
                        className="flex-1 rounded-none h-12 text-slate-400 hover:text-white hover:bg-white/5 border-r border-white/5"
                        onClick={() => setShowComments(!showComments)}
                    >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {post.comments.length} Comments
                    </Button>
                    <Button
                        variant="ghost"
                        className="flex-1 rounded-none h-12 text-slate-400 hover:text-white hover:bg-white/5"
                        onClick={handleShare}
                    >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                </div>

                {showComments && (
                    <div className="w-full bg-black/20 p-4 space-y-4 animate-in fade-in">
                        {post.comments.map(comment => (
                            <div key={comment.id} className="flex gap-3 text-sm">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.user.avatarUrl} />
                                    <AvatarFallback>{comment.user.displayName[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-white/5 rounded-xl rounded-tl-none p-3">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="font-semibold text-white text-xs">{comment.user.displayName}</span>
                                        <span className="text-[10px] text-slate-500">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                                    </div>
                                    <p className="text-slate-300">{comment.content}</p>
                                </div>
                            </div>
                        ))}

                        <form onSubmit={handleComment} className="flex gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={currentUser.avatarUrl} />
                                <AvatarFallback>{currentUser.displayName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 relative">
                                <Input
                                    placeholder="Write a comment..."
                                    className="bg-slate-900 border-white/10 text-white pr-10"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-teal-500 hover:text-teal-400 disabled:opacity-50"
                                    disabled={!commentText.trim()}
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </CardFooter>

            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDelete}
                title="Delete Post"
                description="Are you sure you want to delete this post? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </Card>
    );
}
