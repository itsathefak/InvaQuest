"use client";

import * as React from "react";
import Map, { Marker, Source, Layer, type MapMouseEvent, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { type Sighting } from "@/types";
import { cn } from "@/lib/utils";

interface GeoGuesserMapProps {
    challenge: Sighting | null;
    className?: string;
    onGuessMade: (coords: { lat: number; lng: number }) => void;
    guessCoords: { lat: number; lng: number } | null;
    showResult: boolean;
}

export default function GeoGuesserMap({
    challenge,
    className,
    onGuessMade,
    guessCoords,
    showResult
}: GeoGuesserMapProps) {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    // GeoJSON for the line connecting Guess -> Actual
    const lineGeoJSON = React.useMemo(() => {
        if (!showResult || !guessCoords || !challenge) return null;
        return {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [
                    [guessCoords.lng, guessCoords.lat],
                    [challenge.coordinates.lng, challenge.coordinates.lat]
                ]
            }
        };
    }, [showResult, guessCoords, challenge]);

    const handleMapClick = (e: MapMouseEvent) => {
        if (showResult) return; // Locked after result
        const { lng, lat } = e.lngLat;
        onGuessMade({ lat, lng });
    };

    return (
        <div className={cn("relative w-full h-full rounded-xl overflow-hidden border border-white/10 shadow-2xl", className)}>
            <Map
                initialViewState={{
                    longitude: -96.0, // Center of Canada roughly
                    latitude: 55.0,
                    zoom: 3
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={token}
                onClick={handleMapClick}
                cursor={showResult ? 'default' : 'crosshair'}
            >
                <NavigationControl position="top-right" />

                {/* User's Guess Marker */}
                {guessCoords && (
                    <Marker
                        longitude={guessCoords.lng}
                        latitude={guessCoords.lat}
                        anchor="bottom"
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-xs font-bold bg-yellow-400 text-black px-1 rounded mb-1">YOU</span>
                            <div className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-white shadow-lg animate-bounce" />
                        </div>
                    </Marker>
                )}

                {/* Actual Location Marker (Only shown at result) */}
                {showResult && challenge && (
                    <Marker
                        longitude={challenge.coordinates.lng}
                        latitude={challenge.coordinates.lat}
                        anchor="bottom"
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-xs font-bold bg-green-500 text-white px-1 rounded mb-1">
                                {challenge.species?.commonName}
                            </span>
                            <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg" />
                        </div>
                    </Marker>
                )}

                {/* Connection Line */}
                {lineGeoJSON && (
                    <Source id="line-source" type="geojson" data={lineGeoJSON as any}>
                        <Layer
                            id="line-layer"
                            type="line"
                            layout={{
                                "line-join": "round",
                                "line-cap": "round"
                            }}
                            paint={{
                                "line-color": "#ffffff",
                                "line-width": 4,
                                "line-dasharray": [2, 2]
                            }}
                        />
                    </Source>
                )}
            </Map>
        </div>
    );
}
