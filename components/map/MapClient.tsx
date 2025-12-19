"use client";

import * as React from "react";
import Map, { Marker, Popup, NavigationControl, ScaleControl, GeolocateControl, type MapMouseEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { type Sighting } from "@/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";

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
                            setSelectedSighting(sighting);
                            onSightingClick?.(sighting);
                        }}
                    >
                        <div className="relative group cursor-pointer transition-transform hover:scale-110">
                            <div className={cn(
                                "w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center",
                                sighting.status === 'confirmed' ? "bg-red-500" : "bg-yellow-500"
                            )}>
                                {/* Small icon or dot */}
                                <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                        </div>
                    </Marker>
                ))}

                {selectedSighting && (
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
                            {/* Image Header */}
                            {(selectedSighting.photoUrl || selectedSighting.species?.imageKey) && (
                                <div className="w-full h-24 relative mb-2 rounded-t-md overflow-hidden bg-slate-100">
                                    <img
                                        src={selectedSighting.photoUrl || selectedSighting.species?.imageKey}
                                        alt={selectedSighting.species?.commonName || "Species"}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] uppercase font-bold shadow-sm backdrop-blur-md",
                                            selectedSighting.status === 'confirmed'
                                                ? "bg-red-500/90 text-white"
                                                : "bg-yellow-400/90 text-black"
                                        )}>
                                            {selectedSighting.status}
                                        </span>
                                    </div>
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

                                {selectedSighting.notes && (
                                    <p className="text-xs text-slate-700 mb-2 line-clamp-3">
                                        {selectedSighting.notes}
                                    </p>
                                )}

                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                            {(selectedSighting.userId === 'system') ? 'S' : 'U'}
                                        </div>
                                        <span className="text-[10px] text-slate-400 uppercase font-medium">
                                            {selectedSighting.userId === 'system' ? 'Official Record' : `User: ${selectedSighting.userId.slice(0, 6)}`}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(selectedSighting.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                {user && user.id === selectedSighting.userId && (
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (confirm("Delete this sighting?")) {
                                                const { deletePost } = await import("@/lib/feed");
                                                try {
                                                    await deletePost(selectedSighting.id);
                                                    setSelectedSighting(null);
                                                    onDataRefresh?.();
                                                } catch (err) {
                                                    console.error("Failed to delete", err);
                                                    alert("Failed to delete sighting");
                                                }
                                            }
                                        }}
                                        className="mt-3 w-full flex items-center justify-center gap-2 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Delete Sighting
                                    </button>
                                )}
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>
        </div >
    );
}
