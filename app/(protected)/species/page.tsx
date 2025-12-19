"use client";

import * as React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Search, AlertCircle, X, MapPin, AlertTriangle, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface InvasiveSpecies {
    id: string;
    common_name: string;
    scientific_name: string;
    category: string;
    threat_level: string;
    native_region: string;
    short_description: string;
    full_description: string;
    identification_features: string[];
    ecological_impact: string;
    economic_impact: string;
    primary_image_url: string;
    provinces_found: string[];
    habitat_types: string[];
    prevention_tips: string[];
    fun_facts: string[];
}

export default function SpeciesListPage() {
    const [species, setSpecies] = React.useState<InvasiveSpecies[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [searchTerm, setSearchTerm] = React.useState("");
    const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
    const [selectedThreat, setSelectedThreat] = React.useState<string>("all");

    const [selectedSpecies, setSelectedSpecies] = React.useState<InvasiveSpecies | null>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const categories = ["aquatic", "plant", "insect", "animal", "tree"];
    const threatLevels = ["low", "medium", "high", "extreme"];

    // Fetch species from API
    React.useEffect(() => {
        const fetchSpecies = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();
                if (selectedCategory !== "all") params.append("category", selectedCategory);
                if (selectedThreat !== "all") params.append("threat_level", selectedThreat);
                if (searchTerm) params.append("search", searchTerm);
                params.append("limit", "100");

                const response = await fetch(`/api/species?${params.toString()}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch species");
                }

                const data = await response.json();
                setSpecies(data.species || []);
            } catch (err) {
                console.error("Error fetching species:", err);
                setError("Failed to load species. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchSpecies, searchTerm ? 500 : 0);
        return () => clearTimeout(timer);
    }, [selectedCategory, selectedThreat, searchTerm]);

    const openSpeciesModal = (sp: InvasiveSpecies) => {
        setSelectedSpecies(sp);
        setIsModalOpen(true);
    };

    const getThreatColor = (level: string) => {
        switch (level) {
            case "extreme": return "bg-red-500/20 text-red-400 border-red-500/50";
            case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/50";
            case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
            case "low": return "bg-green-500/20 text-green-400 border-green-500/50";
            default: return "bg-slate-500/20 text-slate-400 border-slate-500/50";
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "aquatic": return "🐟";
            case "plant": return "🌿";
            case "insect": return "🐛";
            case "animal": return "🦊";
            case "tree": return "🌳";
            default: return "📍";
        }
    };

    return (
        <div className="container mx-auto px-6 py-12 md:px-12 md:py-16">
            {/* Header */}
            <div className="mb-12 space-y-6">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Invasive Species Library</h1>
                    <p className="text-slate-400 text-lg">Explore the species that threaten our Canadian ecosystems.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-6">
                    {/* Search */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search species..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500"
                        />
                    </div>

                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-12">
                        {/* Category Filter */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Species Type</h3>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    variant={selectedCategory === "all" ? "default" : "outline"}
                                    onClick={() => setSelectedCategory("all")}
                                    className="rounded-full"
                                >
                                    All
                                </Button>
                                {categories.map(cat => (
                                    <Button
                                        key={cat}
                                        size="sm"
                                        variant={selectedCategory === cat ? "default" : "outline"}
                                        onClick={() => setSelectedCategory(cat)}
                                        className="capitalize rounded-full"
                                    >
                                        {getCategoryIcon(cat)} {cat}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Threat Level Filter */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Threat Level</h3>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    variant={selectedThreat === "all" ? "default" : "outline"}
                                    onClick={() => setSelectedThreat("all")}
                                    className="rounded-full"
                                >
                                    All
                                </Button>
                                {threatLevels.map(level => (
                                    <Button
                                        key={level}
                                        size="sm"
                                        variant={selectedThreat === level ? "default" : "outline"}
                                        onClick={() => setSelectedThreat(level)}
                                        className="capitalize rounded-full"
                                    >
                                        {level}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p>Loading species...</p>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md text-center">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <p className="text-red-400 mb-2 font-semibold">Error Loading Species</p>
                        <p className="text-slate-400 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Species Grid */}
            {!isLoading && !error && (
                <>
                    <div className="mb-6 text-sm text-slate-400">
                        Showing {species.length} species
                    </div>

                    {species.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-slate-400 text-lg">No species found matching your filters.</p>
                            <Button
                                onClick={() => {
                                    setSelectedCategory("all");
                                    setSelectedThreat("all");
                                    setSearchTerm("");
                                }}
                                className="mt-4"
                                variant="outline"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {species.map((sp) => (
                                <Card
                                    key={sp.id}
                                    onClick={() => openSpeciesModal(sp)}
                                    className="h-full overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer bg-slate-900/50 border-white/10 hover:border-teal-500/50"
                                >
                                    {/* Image */}
                                    <div className="aspect-video w-full bg-slate-800 relative overflow-hidden">
                                        {sp.primary_image_url ? (
                                            <img
                                                src={sp.primary_image_url}
                                                alt={sp.common_name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-6xl">${getCategoryIcon(sp.category)}</div>`;
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-6xl">
                                                {getCategoryIcon(sp.category)}
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <Badge className={cn("capitalize border", getThreatColor(sp.threat_level))}>
                                                {sp.threat_level}
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardHeader>
                                        <CardTitle className="text-lg text-white">{sp.common_name}</CardTitle>
                                        <CardDescription className="italic text-slate-400">
                                            {sp.scientific_name}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent>
                                        <p className="line-clamp-3 text-sm text-slate-300">
                                            {sp.short_description}
                                        </p>
                                    </CardContent>

                                    <CardFooter className="flex gap-2 flex-wrap">
                                        <Badge variant="secondary" className="capitalize bg-slate-800 text-slate-300">
                                            {sp.category}
                                        </Badge>
                                        {sp.provinces_found && sp.provinces_found.length > 0 && (
                                            <Badge variant="outline" className="text-slate-400 border-slate-700">
                                                {sp.provinces_found[0]}
                                                {sp.provinces_found.length > 1 && ` +${sp.provinces_found.length - 1}`}
                                            </Badge>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Species Detail Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-white/10">
                    {selectedSpecies && (
                        <>
                            <DialogHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <DialogTitle className="text-2xl text-white mb-2">
                                            {selectedSpecies.common_name}
                                        </DialogTitle>
                                        <DialogDescription className="text-lg italic text-slate-400">
                                            {selectedSpecies.scientific_name}
                                        </DialogDescription>
                                    </div>
                                    <Badge className={cn("capitalize border", getThreatColor(selectedSpecies.threat_level))}>
                                        {selectedSpecies.threat_level} Threat
                                    </Badge>
                                </div>
                            </DialogHeader>

                            <div className="space-y-6 mt-4">
                                {/* Image */}
                                <div className="aspect-video w-full bg-slate-800 rounded-lg overflow-hidden">
                                    {selectedSpecies.primary_image_url ? (
                                        <img
                                            src={selectedSpecies.primary_image_url}
                                            alt={selectedSpecies.common_name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-8xl">${getCategoryIcon(selectedSpecies.category)}</div>`;
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-8xl">
                                            {getCategoryIcon(selectedSpecies.category)}
                                        </div>
                                    )}
                                </div>

                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-400 mb-1">Category</p>
                                        <Badge variant="secondary" className="capitalize">
                                            {getCategoryIcon(selectedSpecies.category)} {selectedSpecies.category}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 mb-1">Native Region</p>
                                        <p className="text-white">{selectedSpecies.native_region}</p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                                    <p className="text-slate-300 leading-relaxed">
                                        {selectedSpecies.full_description || selectedSpecies.short_description}
                                    </p>
                                </div>

                                {/* Identification Features */}
                                {selectedSpecies.identification_features && selectedSpecies.identification_features.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                            <Leaf className="w-5 h-5" />
                                            Identification Features
                                        </h3>
                                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                                            {selectedSpecies.identification_features.map((feature, idx) => (
                                                <li key={idx}>{feature}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Impacts */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    {selectedSpecies.ecological_impact && (
                                        <div className="bg-slate-800/50 p-4 rounded-lg">
                                            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4 text-orange-400" />
                                                Ecological Impact
                                            </h4>
                                            <p className="text-sm text-slate-300">{selectedSpecies.ecological_impact}</p>
                                        </div>
                                    )}
                                    {selectedSpecies.economic_impact && (
                                        <div className="bg-slate-800/50 p-4 rounded-lg">
                                            <h4 className="font-semibold text-white mb-2">Economic Impact</h4>
                                            <p className="text-sm text-slate-300">{selectedSpecies.economic_impact}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Location */}
                                {selectedSpecies.provinces_found && selectedSpecies.provinces_found.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                            <MapPin className="w-5 h-5" />
                                            Found In
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSpecies.provinces_found.map((province, idx) => (
                                                <Badge key={idx} variant="outline" className="text-slate-300 border-slate-700">
                                                    {province}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Habitats */}
                                {selectedSpecies.habitat_types && selectedSpecies.habitat_types.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-400 mb-2">Habitats</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSpecies.habitat_types.map((habitat, idx) => (
                                                <Badge key={idx} variant="secondary" className="bg-slate-800">
                                                    {habitat}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Prevention Tips */}
                                {selectedSpecies.prevention_tips && selectedSpecies.prevention_tips.length > 0 && (
                                    <div className="bg-teal-500/10 border border-teal-500/20 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-teal-400 mb-2">Prevention Tips</h3>
                                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                                            {selectedSpecies.prevention_tips.map((tip, idx) => (
                                                <li key={idx}>{tip}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Fun Facts */}
                                {selectedSpecies.fun_facts && selectedSpecies.fun_facts.length > 0 && (
                                    <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-purple-400 mb-2">Did You Know?</h3>
                                        <ul className="space-y-2 text-slate-300">
                                            {selectedSpecies.fun_facts.map((fact, idx) => (
                                                <li key={idx}>• {fact}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
