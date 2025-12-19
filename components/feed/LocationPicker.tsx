"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, Check } from "lucide-react";

interface LocationPickerProps {
    onLocationSelect: (location: { latitude: number; longitude: number } | null) => void;
    initialHasLocation?: boolean;
}

export function LocationPicker({ onLocationSelect, initialHasLocation = false }: LocationPickerProps) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasLocation, setHasLocation] = React.useState(initialHasLocation);
    const [error, setError] = React.useState<string | null>(null);

    const handleGetLocation = () => {
        setIsLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                onLocationSelect({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setHasLocation(true);
                setIsLoading(false);
            },
            () => {
                setError("Unable to retrieve your location.");
                setIsLoading(false);
            }
        );
    };

    if (error) {
        return <span className="text-xs text-red-400">{error}</span>;
    }

    if (hasLocation) {
        return (
            <Button variant="ghost" size="sm" className="text-emerald-400 cursor-default hover:text-emerald-400 hover:bg-transparent">
                <Check className="w-4 h-4 mr-1" /> Location Added
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleGetLocation}
            disabled={isLoading}
            className="text-slate-400 hover:text-white hover:bg-white/5"
        >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MapPin className="w-4 h-4 mr-2" />}
            Add Location
        </Button>
    );
}
