"use client";

import * as React from "react";
import { type SpeciesCategory } from "@/types";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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

    const selectedLabel = categories.find(c => c.value === selectedCategory)?.label || "All Types";

    return (
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className={cn("w-[160px] bg-slate-900/90 border-white/10 text-white shadow-lg", className)}>
                <SelectValue placeholder="Select Type">
                    {selectedLabel}
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-white">
                {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
