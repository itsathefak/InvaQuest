"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, X, Image as ImageIcon } from "lucide-react";
import { createCommunitySighting } from "@/lib/actions/community-sightings";
import { uploadPostImage } from "@/lib/feed";
import imageCompression from 'browser-image-compression';

interface ReportSightingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    location: { lat: number; lng: number } | null;
    onSuccess: () => void;
}

export function ReportSightingDialog({
    open,
    onOpenChange,
    location,
    onSuccess
}: ReportSightingDialogProps) {
    const [description, setDescription] = React.useState("");
    const [speciesName, setSpeciesName] = React.useState("");
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isCompressing, setIsCompressing] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

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
            } catch (error) {
                console.error("Compression failed:", error);
                alert("Failed to process image");
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
        if (!description.trim()) {
            alert("Please add a description");
            return;
        }

        setIsSubmitting(true);
        try {
            // Determine location: use prop or get current
            let finalLocation = location;

            if (!finalLocation) {
                // Try to get current location
                try {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });
                    finalLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                } catch (err) {
                    alert("Could not get your location. Please click a point on the map.");
                    setIsSubmitting(false);
                    return;
                }
            }

            if (!finalLocation || typeof finalLocation.lat !== 'number' || typeof finalLocation.lng !== 'number') {
                alert("Invalid location. Please select a point on the map.");
                setIsSubmitting(false);
                return;
            }

            let imageUrl: string | undefined;
            if (selectedFile) {
                imageUrl = await uploadPostImage(selectedFile);
            }

            await createCommunitySighting({
                latitude: finalLocation.lat,
                longitude: finalLocation.lng,
                description: description.trim(),
                species_name: speciesName.trim() || undefined,
                image_url: imageUrl
            });

            // Reset form
            setDescription("");
            setSpeciesName("");
            clearFile();
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error("Failed to create sighting:", error);
            alert("Failed to report sighting. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Report an Invasive Species</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Location Display */}
                    {location?.lat && location?.lng && (
                        <div className="text-xs text-slate-400">
                            📍 Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </div>
                    )}

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="image">Photo</Label>
                        {previewUrl ? (
                            <div className="relative w-full h-40 rounded-lg overflow-hidden border border-white/10">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={clearFile}
                                    className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isCompressing}
                                className="w-full h-40 border-2 border-dashed border-white/20 hover:border-primary/50 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors bg-white/5"
                            >
                                {isCompressing ? (
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                ) : (
                                    <>
                                        <ImageIcon className="h-8 w-8 text-slate-400" />
                                        <span className="text-sm text-slate-400">Click to upload photo</span>
                                    </>
                                )}
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                    {/* Species Name */}
                    <div className="space-y-2">
                        <Label htmlFor="species">Species Name (Optional)</Label>
                        <Input
                            id="species"
                            value={speciesName}
                            onChange={(e) => setSpeciesName(e.target.value)}
                            placeholder="e.g., Purple Loosestrife"
                            className="bg-slate-800 border-white/10"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what you found..."
                            rows={4}
                            className="bg-slate-800 border-white/10 resize-none"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !description.trim()}
                        className="flex-1 bg-primary hover:bg-primary/90"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Report Sighting"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
