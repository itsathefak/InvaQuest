"use client";

import * as React from "react";
import Map, { Marker, Popup, NavigationControl, ScaleControl, GeolocateControl, type MapMouseEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { type Sighting } from "@/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";
import { SightingDetailDialog } from "@/components/map/SightingDetailDialog";

interface MapClientProps {
    sightings: Sighting[];
    className?: string;
    onSightingClick?: (sighting: Sighting) => void;
    onMapClick?: (coords: { lat: number; lng: number }) => void;
    token?: string;
    user?: { id: string } | null;
    onDataRefresh?: () => void;
}

export default function MapClient({
    sightings,
    className,
    onSightingClick,
    onMapClick,
    token,
    user,
    onDataRefresh
}: MapClientProps) {
    const [selectedSighting, setSelectedSighting] = React.useState<Sighting | null>(null);
    const [detailOpen, setDetailOpen] = React.useState(false);

    return (
        <div className={cn("relative h-full w-full overflow-hidden rounded-xl border border-white/10 shadow-inner group", className)}>
            <Map
                initialViewState={{
                    longitude: -79.3832,
                    latitude: 43.6532,
                    zoom: 5
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={token}
                onClick={(e: MapMouseEvent) => {
                    const { lng, lat } = e.lngLat;
                    onMapClick?.({ lat, lng });
                    setSelectedSighting(null);
                }}
            >
                <GeolocateControl position="top-right" />
                <NavigationControl position="top-right" />
                <ScaleControl />

                {sightings.map((sighting) => (
                    <Marker
                        key={sighting.id}
                        longitude={sighting.coordinates.lng}
                        latitude={sighting.coordinates.lat}
                        anchor="bottom"
                        onClick={(e) => {
                            e.originalEvent.stopPropagation();
                            // If it's a community sighting (status can be verified/rejected/pending), suggest full modal
                            // Assuming all map sightings here are compatible with our new flow
                            // OR we check if speciesId is null (community) vs present (official)

                            // For official data (has speciesId), we might still want small popup? 
                            // But user asked for "community sightings" modal.
                            // Let's us separate logic:

                            if (sighting.speciesId) {
                                // Official sighting -> keep small popup logic or different handling?
                                // For now, let's just create a unified experience or rely on DetailDialog handling it (it can handle basic info)
                                // But DetailDialog expects CommunitySighting structure mostly. 
                                // Let's Map it.
                                setSelectedSighting(sighting);
                            } else {
                                // Community sighting
                                setSelectedSighting(sighting);
                                setDetailOpen(true);
                            }

                            onSightingClick?.(sighting);
                        }}
                    >
                        <div className="relative group cursor-pointer transition-transform hover:scale-110">
                            <div className={cn(
                                "w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center",
                                sighting.status === 'confirmed' ? "bg-red-500" : "bg-yellow-500"
                            )}>
                                <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                        </div>
                    </Marker>
                ))}

                {/* Only show Popup for OFFICIAL sightings (speciesId present) */}
                {selectedSighting && selectedSighting.speciesId && (
                    <Popup
                        longitude={selectedSighting.coordinates.lng}
                        latitude={selectedSighting.coordinates.lat}
                        anchor="top"
                        onClose={() => setSelectedSighting(null)}
                        closeButton={true}
                        closeOnClick={false}
                        className="text-black z-50"
                        maxWidth="300px"
                    >
                        <div className="p-0 min-w-[240px] max-w-[260px]">
                            {/* Shortened popup logic for official data only */}
                            {(selectedSighting.photoUrl || selectedSighting.species?.imageKey) && (
                                <div className="w-full h-24 relative mb-2 rounded-t-md overflow-hidden bg-slate-100">
                                    <img
                                        src={selectedSighting.photoUrl || selectedSighting.species?.imageKey}
                                        alt={selectedSighting.species?.commonName || "Species"}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="px-3 pb-3">
                                <h3 className="font-bold text-base leading-tight">
                                    {selectedSighting.species?.commonName || "Unknown Species"}
                                </h3>
                                {selectedSighting.species?.scientificName && (
                                    <p className="text-xs text-slate-500 italic mb-2">
                                        {selectedSighting.species.scientificName}
                                    </p>
                                )}
                                <div className="mt-2 text-xs text-slate-500">
                                    Official Record via InvaQuest
                                </div>
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>

            {/* Community Sighting Detail Modal */}
            <SightingDetailDialog
                open={detailOpen}
                onOpenChange={(open) => {
                    setDetailOpen(open);
                    if (!open) setSelectedSighting(null);
                }}
                sighting={!selectedSighting?.speciesId ? (selectedSighting as any) : null}
                currentUserId={user?.id}
                onDelete={() => {
                    setDetailOpen(false);
                    onDataRefresh?.();
                }}
            />
        </div >
    );
}
