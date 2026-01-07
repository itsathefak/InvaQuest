"use client";

import * as React from "react";
import { type Region } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
    // Get selected region name for display
    const selectedRegion = regions.find(r => r.id === selectedRegionId);
    const displayValue = selectedRegionId === "ALL" ? "All Canada" : selectedRegion?.name || "Select Province";

    const topRegions = regions.filter((r) => r.isDefault || r.shortCode === "BC" || r.shortCode === "QC");
    const otherRegions = regions.filter((r) => !topRegions.includes(r));

    return (
        <>
            {/* Mobile: Single Dropdown */}
            <div className={cn("md:hidden", className)}>
                <Select value={selectedRegionId} onValueChange={onRegionChange}>
                    <SelectTrigger className="w-[160px] bg-slate-900/90 border-white/10 text-white shadow-lg">
                        <SelectValue placeholder="Select Province">
                            {displayValue}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                        <SelectItem value="ALL">All Canada</SelectItem>
                        {regions.map((region) => (
                            <SelectItem key={region.id} value={region.id}>
                                {region.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Desktop: Button Layout */}
            <div className={cn("hidden md:flex flex-wrap gap-2 rounded-lg bg-slate-900/80 p-2 shadow-sm backdrop-blur-md border border-white/10", className)}>
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
        </>
    );
}
