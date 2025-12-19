"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import imageCompression from 'browser-image-compression';
import { useRouter } from "next/navigation";

interface EditProfileDialogProps {
    user: {
        id: string;
        displayName: string;
        avatarUrl?: string;
    };
    trigger?: React.ReactNode;
}

export function EditProfileDialog({ user, trigger }: EditProfileDialogProps) {
    const [open, setOpen] = React.useState(false);
    const [displayName, setDisplayName] = React.useState(user.displayName);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(user.avatarUrl || null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isCompressing, setIsCompressing] = React.useState(false);
    const router = useRouter();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsCompressing(true);
            try {
                const options = {
                    maxSizeMB: 0.5, // Aggressive compression for avatars
                    maxWidthOrHeight: 500, // standard avatar size
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(file, options);

                setSelectedFile(compressedFile);
                setPreviewUrl(URL.createObjectURL(compressedFile));
            } catch (error) {
                console.error("Compression failed:", error);
                alert("Failed to process image.");
            } finally {
                setIsCompressing(false);
            }
        }
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        const supabase = createClient();

        try {
            let avatarPath = user.avatarUrl;

            // 1. Upload new avatar if selected
            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                const filePath = `avatars/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('feed-images') // using existing bucket
                    .upload(filePath, selectedFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('feed-images')
                    .getPublicUrl(filePath);

                avatarPath = publicUrl;
            }

            // 2. Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: displayName,
                    avatar_url: avatarPath,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setOpen(false);
            router.refresh(); // Refresh server components

            // Force specific page reload if needed or just let router handle it
            // window.location.reload(); 
        } catch (error) {
            console.error("Failed to update profile:", error);
            alert("Failed to save changes.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">Edit Profile</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">

                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <Avatar className="h-24 w-24 border-2 border-white/10">
                            <AvatarImage src={previewUrl || ""} />
                            <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>

                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                id="avatar-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                            <Label
                                htmlFor="avatar-upload"
                                className={`cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-slate-800 text-white hover:bg-slate-700 ${isCompressing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isCompressing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                {isCompressing ? 'Compressing...' : 'Change Avatar'}
                            </Label>
                        </div>
                    </div>

                    {/* Name Input */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="col-span-3 bg-slate-950 border-white/10 text-white"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="submit"
                        onClick={handleSave}
                        disabled={isSubmitting || isCompressing}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
