"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, MapPin, Calendar, User as UserIcon, AlertTriangle } from "lucide-react";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { deleteCommunitySighting } from "@/lib/actions/community-sightings";
import { type CommunitySighting } from "@/lib/actions/community-sightings";
import { cn } from "@/lib/utils";

interface SightingDetailDialogProps {
    sighting: CommunitySighting | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentUserId?: string;
    onDelete?: () => void;
}

export function SightingDetailDialog({
    sighting,
    open,
    onOpenChange,
    currentUserId,
    onDelete
}: SightingDetailDialogProps) {
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = React.useState(false);

    if (!sighting) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteCommunitySighting(sighting.id);
            onOpenChange(false);
            onDelete?.();
        } catch (error) {
            console.error("Failed to delete sighting:", error);
            // Optionally show error toast here
        } finally {
            setIsDeleting(false);
            setShowDeleteAlert(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-2xl p-0 overflow-hidden">
                    {/* Image Header */}
                    <div className="relative w-full h-64 bg-slate-950">
                        {((sighting as any).photoUrl || sighting.image_url) ? (
                            <img
                                src={(sighting as any).photoUrl || sighting.image_url}
                                alt={sighting.species_name || "Sighting"}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-700">
                                <MapPin className="w-16 h-16 opacity-20" />
                            </div>
                        )}
                        <div className="absolute top-4 right-4">
                            {/* Badge removed as requested */}
                        </div>
                    </div>

                    <div className="p-6">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                {(sighting as any).speciesName || sighting.species_name || "Community Sighting"}
                            </DialogTitle>
                            <div className="text-sm text-slate-400 mt-1 flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date((sighting as any).createdAt || sighting.created_at).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {sighting.province || "Unknown Location"}
                                </span>
                            </div>
                        </DialogHeader>

                        <div className="mt-6 space-y-6">
                            {/* Description */}
                            <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                                <h4 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">Description</h4>
                                <p className="text-slate-200 leading-relaxed">
                                    {(sighting as any).notes || sighting.description || "No description provided."}
                                </p>
                            </div>

                            {/* User Info (Stubbed for now, eventually query profile) */}
                            <div className="flex items-center justify-between border-t border-white/10 pt-6">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-white/10">
                                        <AvatarFallback className="bg-slate-800 text-slate-300">
                                            <UserIcon className="w-5 h-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium text-white">Reported by</p>
                                        <p className="text-sm text-slate-200">
                                            {(sighting as any).user?.full_name || "Unknown User"}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-mono">
                                            ID: {(sighting as any).userId?.slice(0, 8) || (sighting as any).user_id?.slice(0, 8)}
                                        </p>
                                    </div>
                                </div>

                                {currentUserId === ((sighting as any).userId || (sighting as any).user_id) && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        {isDeleting ? "Deleting..." : "Delete Sighting"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
