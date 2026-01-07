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
        <div className={cn("flex flex-col gap-2 rounded-lg bg-slate-900/80 p-2 shadow-sm backdrop-blur-md border border-white/10 w-full max-w-md", className)}>
            {/* First Row: All Canada + Top Regions */}
            <div className="grid grid-cols-3 gap-2">
                <Button
                    variant={selectedRegionId === "ALL" ? "default" : "secondary"}
                    size="sm"
                    onClick={() => onRegionChange("ALL")}
                    className="w-full whitespace-nowrap text-xs sm:text-sm"
                >
                    All Canada
                </Button>
                {topRegions.slice(0, 2).map((region) => (
                    <Button
                        key={region.id}
                        variant={selectedRegionId === region.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => onRegionChange(region.id)}
                        className="w-full whitespace-nowrap text-xs sm:text-sm"
                    >
                        {region.name}
                    </Button>
                ))}
            </div>

            {/* Second Row: Third Top Region + Other Provinces Dropdown */}
            <div className="grid grid-cols-2 gap-2">
                {topRegions[2] && (
                    <Button
                        variant={selectedRegionId === topRegions[2].id ? "default" : "outline"}
                        size="sm"
                        onClick={() => onRegionChange(topRegions[2].id)}
                        className="w-full whitespace-nowrap text-xs sm:text-sm"
                    >
                        {topRegions[2].name}
                    </Button>
                )}
                <select
                    className="h-9 rounded-md border border-input bg-background px-2 py-1 text-xs sm:text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full"
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
        </div>
    );
}
