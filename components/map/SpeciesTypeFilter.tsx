"use client";

import * as React from "react";
import { type SpeciesCategory } from "@/types";
import { cn } from "@/lib/utils";

interface SpeciesTypeFilterProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    className?: string;
}

export function SpeciesTypeFilter({
    selectedCategory,
    onCategoryChange,
    className,
}: SpeciesTypeFilterProps) {
    const categories: { label: string; value: string }[] = [
        { label: "All Types", value: "all" },
        { label: "Plants", value: "plant" },
        { label: "Insects", value: "insect" },
        { label: "Aquatic", value: "aquatic" },
        { label: "Mammals", value: "mammal" },
        { label: "Fungi", value: "fungus" },
        { label: "Pathogens", value: "pathogen" },
    ];

    return (
        <div className={cn("inline-flex rounded-lg bg-slate-900/80 p-2 shadow-sm backdrop-blur-md border border-white/10", className)}>
            <select
                className="h-9 rounded-md border border-white/10 bg-slate-800 px-3 py-1 text-sm text-white shadow-sm ring-offset-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
            >
                {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                        {cat.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
