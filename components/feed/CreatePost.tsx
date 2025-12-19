"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon, Send, X, Loader2 } from "lucide-react";
import { type User, type Post } from "@/types";
import { uploadPostImage } from "@/lib/feed";
import imageCompression from 'browser-image-compression';
import { LocationPicker } from "./LocationPicker";
import { useSearchParams } from "next/navigation";

interface CreatePostProps {
    user: User;
    onPostCreated: (post: Post) => void;
    initialLocation?: { latitude: number; longitude: number };
}

export function CreatePost({ user, onPostCreated, initialLocation }: CreatePostProps) {
    const [content, setContent] = React.useState("");
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [location, setLocation] = React.useState<{ latitude: number; longitude: number } | null>(initialLocation || null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isCompressing, setIsCompressing] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const searchParams = useSearchParams();

    React.useEffect(() => {
        const mission = searchParams.get("mission");
        if (mission && !content) {
            setContent(`I found a ${mission} here! 🌿`);
            setIsExpanded(true);
        }
    }, [searchParams]);

    // Update location if initialLocation changes (e.g. from Map click)
    React.useEffect(() => {
        if (initialLocation) {
            setLocation(initialLocation);
        }
    }, [initialLocation]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsCompressing(true);
            try {
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(file, options);

                setSelectedFile(compressedFile);
                const url = URL.createObjectURL(compressedFile);
                setPreviewUrl(url);
                setIsExpanded(true);
            } catch (error) {
                console.error("Compression failed:", error);
                alert("Failed to process image. Please try another one.");
            } finally {
                setIsCompressing(false);
            }
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async () => {
        if (!content.trim() && !selectedFile) return;
        setIsSubmitting(true);

        try {
            let imageUrl: string | undefined = undefined;
            if (selectedFile) {
                imageUrl = await uploadPostImage(selectedFile);
            }

            const newPost: Post = {
                id: Date.now().toString(),
                user: user,
                content: content,
                createdAt: new Date().toISOString(),
                reactions: { native: 0, invasive: 0, protected: 0, curious: 0 },
                comments: [],
                imageUrl: imageUrl,
                location: location || undefined
            };

            onPostCreated(newPost);

            setContent("");
            clearFile();
            setLocation(null);
            setIsExpanded(false);
        } catch (e) {
            console.error("Upload failed", e);
            alert("Failed to post. Check connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="bg-slate-900 border-white/10 mb-6 shadow-lg">
            <CardContent className="p-4">
                <div className="flex gap-4">
                    <Avatar className="h-10 w-10 border border-white/10 hidden sm:block">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-4">
                        <div
                            className="bg-slate-950/50 rounded-lg p-2 border border-white/5 focus-within:border-teal-500/50 transition-colors"
                        >
                            <textarea
                                placeholder={`What did you spot today, ${user.displayName.split(' ')[0]}?`}
                                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 resize-none min-h-[40px]"
                                rows={isExpanded || previewUrl ? 3 : 1}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onFocus={() => setIsExpanded(true)}
                            />

                            {/* Image Preview */}
                            {(previewUrl || isCompressing) && (
                                <div className="relative mt-2 rounded-lg overflow-hidden w-fit max-w-full">
                                    {isCompressing ? (
                                        <div className="flex items-center gap-2 text-slate-400 p-4 border border-white/10 rounded-lg">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="text-xs">Optimizing image...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <img src={previewUrl!} alt="Preview" className="max-h-40 rounded-lg border border-white/10" />
                                            <button
                                                onClick={clearFile}
                                                className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white hover:bg-black/80"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {(isExpanded || content || previewUrl) && (
                            <div className="flex justify-between items-center animate-in fade-in pt-2">
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-400 hover:text-white hover:bg-white/5"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isSubmitting || isCompressing}
                                    >
                                        <ImageIcon className="h-4 w-4 mr-2" />
                                        Photo
                                    </Button>
                                    <LocationPicker
                                        onLocationSelect={setLocation}
                                        initialHasLocation={!!initialLocation}
                                    />
                                    {initialLocation && (
                                        <span className="text-xs text-purple-400 flex items-center ml-2">
                                            Picked from Map
                                        </span>
                                    )}
                                </div>
                                <Button
                                    size="sm"
                                    className="bg-teal-600 hover:bg-teal-500 text-white min-w-[80px]"
                                    onClick={handleSubmit}
                                    disabled={(!content.trim() && !selectedFile) || isSubmitting || isCompressing}
                                >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Post
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
