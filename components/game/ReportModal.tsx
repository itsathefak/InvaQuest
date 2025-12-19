"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Camera, MapPin, Loader2 } from "lucide-react";
import speciesData from "@/data/species.json";
import { type SightingInput } from "@/lib/validations/sighting";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultSpeciesId?: string;
    defaultCoordinates?: { lat: number; lng: number };
}

export function ReportModal({ isOpen, onClose, defaultSpeciesId, defaultCoordinates }: ReportModalProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [speciesId, setSpeciesId] = useState(defaultSpeciesId || "");
    const [description, setDescription] = useState("");
    // In a real app we'd need a robust lat/lng picker or use the defaultCoordinates
    // For this MVP we will assume the User's current location or the Map click location.

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload: SightingInput = {
                speciesId,
                latitude: defaultCoordinates?.lat || 45.4215, // Fallback to Ottawa if missing
                longitude: defaultCoordinates?.lng || -75.6972,
                description,
                imageUrl: "", // Image upload omitted for Step 1
            };

            const res = await fetch("/api/sightings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to submit");

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                // ideally refresh map data here
            }, 2000);

        } catch (error) {
            console.error(error);
            alert("Error submitting report");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <Card className="w-full max-w-sm glass border-green-500/50">
                    <CardContent className="flex flex-col items-center py-10">
                        <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                            <MapPin className="h-8 w-8 text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Report Submitted!</h2>
                        <p className="text-slate-400 text-center">Thank you for helping protect our ecosystem.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md glass border-white/20 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                </button>

                <CardHeader>
                    <CardTitle className="text-white">Report Sighting</CardTitle>
                    <CardDescription>Verify the details of your observation.</CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Species</label>
                            <select
                                value={speciesId}
                                onChange={(e) => setSpeciesId(e.target.value)}
                                className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 focus:ring-primary focus:border-primary"
                                required
                            >
                                <option value="" className="bg-slate-900 text-slate-400">Select Species...</option>
                                {speciesData.map(s => (
                                    <option key={s.id} value={s.id} className="bg-slate-900">{s.commonName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Location</label>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-white/5 border border-white/10 text-slate-400 text-sm">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>{defaultCoordinates ? `${defaultCoordinates.lat.toFixed(4)}, ${defaultCoordinates.lng.toFixed(4)}` : "Current Location"}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium text-slate-300">Photo Evidence</label>
                                <span className="text-xs text-slate-500">Optional</span>
                            </div>
                            <div className="h-32 rounded-lg border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-white/10 hover:border-primary/50 transition-all">
                                <Camera className="h-8 w-8 mb-2 opacity-50" />
                                <span className="text-xs">Tap to upload photo</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Notes</label>
                            <Input
                                placeholder="Describe the environment..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </CardContent>

                    <CardFooter>
                        <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary hover:brightness-110 text-white shadow-[0_0_20px_rgba(6,147,136,0.5)]">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Submit Report
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
