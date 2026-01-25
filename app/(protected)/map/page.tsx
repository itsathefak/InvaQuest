"use client";

import * as React from "react";
import { MapContainer } from "@/components/map/MapContainer";
import { RegionFilter } from "@/components/map/RegionFilter";
import { SpeciesTypeFilter } from "@/components/map/SpeciesTypeFilter";
import { Button } from "@/components/ui/button";
import { ReportSightingDialog } from "@/components/map/ReportSightingDialog";
import { PlusCircle, Map as MapIcon, Users } from "lucide-react";
import regionsData from "@/data/regions.json";
import { type Region, type Sighting, type User } from "@/types";
import { createClient } from "@/lib/supabase/client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Clock } from "lucide-react";

export default function MapPage() {
    const [selectedRegionId, setSelectedRegionId] = React.useState<string>("ALL");
    const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
    const [sightings, setSightings] = React.useState<Sighting[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [mapSource, setMapSource] = React.useState<'official' | 'community'>('official');
    const [timeRange, setTimeRange] = React.useState<'all' | '30d' | '7d'>('all');
    const [currentUser, setCurrentUser] = React.useState<User | null>(null);
    const [isReportOpen, setIsReportOpen] = React.useState(false);
    const [clickedLocation, setClickedLocation] = React.useState<{ lat: number; lng: number } | undefined>(undefined);

    // Fetch user for reporting
    React.useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (profile) {
                    setCurrentUser({
                        id: user.id,
                        email: user.email || "",
                        displayName: profile.full_name || "Eco Warrior",
                        avatarUrl: profile.avatar_url,
                        country: "Canada",
                        province: profile.region || "ON",
                        xp: profile.xp || 0,
                        badges: [],
                        createdAt: new Date().toISOString()
                    });
                }
            }
        };
        fetchUser();
    }, []);

    const loadSightings = async () => {
        setLoading(true);
        try {
            const { getSightings } = await import("@/lib/actions/map-actions");
            const data = await getSightings(mapSource, timeRange);
            setSightings(data);
        } catch (err) {
            console.error("Failed to load map data", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadSightings();
    }, [mapSource, timeRange]);

    const handleSightingCreated = () => {
        setIsReportOpen(false);
        loadSightings();
    };

    const filteredSightings = sightings.filter(s => {
        const matchesRegion = selectedRegionId === "ALL" || s.province === selectedRegionId;
        const matchesCategory = selectedCategory === "all" || s.species?.category === selectedCategory;
        // If community, we might skip category filter if species is null (unless we infer it?)
        // Ideally Community posts don't have category yet unless we tag them.
        // For now, if no species, we show them if category is 'all'.
        if (!s.species) return selectedCategory === "all";

        return matchesRegion && matchesCategory;
    });

    const handleMapClick = (coords: { lat: number; lng: number }) => {
        if (mapSource === 'community' && currentUser) {
            setClickedLocation({ lat: coords.lat, lng: coords.lng });
            setIsReportOpen(true);
        }
    };

    return (
        <div className="relative h-[calc(100vh-4rem)] w-full">
            <div className="absolute left-4 top-4 z-10 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
                {/* Source Toggle */}
                <div className="pointer-events-auto bg-slate-900/90 backdrop-blur border border-white/10 p-1 rounded-lg flex items-center gap-1 w-fit shadow-lg">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMapSource('official')}
                        className={mapSource === 'official' ? "bg-teal-500/20 text-teal-400" : "text-slate-400 hover:text-white"}
                    >
                        <MapIcon className="w-4 h-4 mr-2" />
                        Official Data
                    </Button>
                    <div className="w-px h-4 bg-white/10" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMapSource('community')}
                        className={mapSource === 'community' ? "bg-purple-500/20 text-purple-400" : "text-slate-400 hover:text-white"}
                    >
                        <Users className="w-4 h-4 mr-2" />
                        Community
                    </Button>
                </div>

                {/* Filters */}
                <div className="pointer-events-auto flex flex-col md:flex-row md:flex-wrap gap-2">
                    <RegionFilter
                        regions={regionsData as Region[]}
                        selectedRegionId={selectedRegionId}
                        onRegionChange={setSelectedRegionId}
                    />

                    {mapSource === 'community' && (
                        <Select value={timeRange} onValueChange={(v: 'all' | '30d' | '7d') => setTimeRange(v)}>
                            <SelectTrigger className="w-[160px] bg-slate-900/90 border-white/10 text-white shadow-lg">
                                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                                <SelectValue placeholder="Time Range" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="30d">Last 30 Days</SelectItem>
                                <SelectItem value="7d">Last 7 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    )}

                    <SpeciesTypeFilter
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                    />
                </div>
            </div>

            {/* Report Button (Community Mode Only) */}
            {mapSource === 'community' && currentUser && (
                <div className="absolute bottom-8 right-4 z-10 pointer-events-auto">
                    <Button
                        size="lg"
                        onClick={() => setIsReportOpen(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-900/20 rounded-full h-14 px-6 animate-in slide-in-from-bottom-4"
                    >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Report Sighting
                    </Button>

                    <ReportSightingDialog
                        open={isReportOpen}
                        onOpenChange={setIsReportOpen}
                        location={clickedLocation || null}
                        onSuccess={handleSightingCreated}
                    />
                </div>
            )}

            <MapContainer
                sightings={filteredSightings}
                onMapClick={handleMapClick}
                user={currentUser}
                onDataRefresh={loadSightings}
            />
        </div>
    );
}
