"use client";

import * as React from "react";
import dynamic from 'next/dynamic';
import { type Sighting } from "@/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const MapClient = dynamic(() => import('./MapClient'), {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-xl bg-slate-900/50" />
});

interface MapContainerProps {
    sightings?: Sighting[];
    className?: string;
    onSightingClick?: (sighting: Sighting) => void;
    onMapClick?: (coords: { lat: number; lng: number }) => void;
    user?: { id: string } | null;
    onDataRefresh?: () => void;
}

export function MapContainer({
    sightings = [],
    className,
    onSightingClick,
    onMapClick,
    user,
    onDataRefresh
}: MapContainerProps) {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    return (
        <MapClient
            sightings={sightings}
            className={className}
            onSightingClick={onSightingClick}
            onMapClick={onMapClick}
            token={token}
            user={user}
            onDataRefresh={onDataRefresh}
        />
    );
}
