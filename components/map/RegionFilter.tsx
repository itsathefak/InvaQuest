"use client";

import * as React from "react";
import { type Region } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RegionFilterProps {
    regions: Region[];
    selectedRegionId: string;
    onRegionChange: (regionId: string) => void;
    className?: string;
}

export function RegionFilter({
    regions,
    selectedRegionId,
    onRegionChange,
    className,
}: RegionFilterProps) {
    // We can group them or just list common ones.
    // For MVP: Default View (Ontario), All Canada, then dropdown for others if needed.
    // We'll simplistic "Pill" list for top regions + select.

    const topRegions = regions.filter((r) => r.isDefault || r.shortCode === "BC" || r.shortCode === "QC");
    const otherRegions = regions.filter((r) => !topRegions.includes(r));

    return (
        <div className={cn("flex flex-wrap gap-2 rounded-lg bg-slate-900/80 p-2 shadow-sm backdrop-blur-md border border-white/10", className)}>
            <Button
                variant={selectedRegionId === "ALL" ? "default" : "secondary"}
                size="sm"
                onClick={() => onRegionChange("ALL")}
            >
                All Canada
            </Button>
            {topRegions.map((region) => (
                <Button
                    key={region.id}
                    variant={selectedRegionId === region.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => onRegionChange(region.id)}
                >
                    {region.name}
                </Button>
            ))}
            <select
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={otherRegions.some(r => r.id === selectedRegionId) ? selectedRegionId : ""}
                onChange={(e) => {
                    if (e.target.value) onRegionChange(e.target.value);
                }}
            >
                <option value="" disabled>Other Provinces</option>
                {otherRegions.map((region) => (
                    <option key={region.id} value={region.id}>
                        {region.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
