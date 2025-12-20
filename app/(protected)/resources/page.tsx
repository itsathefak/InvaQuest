import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import resources from "@/data/resources.json";

export default function ResourcesPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black">
            {/* Header */}
            <div className="border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
                        Learning Resources
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Explore educational articles about invasive species, conservation, and biodiversity
                    </p>
                </div>
            </div>

            {/* Resources Grid */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.resources.map((resource) => (
                        <Link
                            key={resource.slug}
                            href={`/resources/${resource.slug}`}
                            className="group relative bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20"
                        >
                            {/* Hero Image */}
                            <div className="relative h-48 bg-slate-800 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
                                {resource.heroImage && (
                                    <Image
                                        src={resource.heroImage}
                                        alt={resource.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                )}
                                {/* Category Badge */}
                                <div className="absolute top-4 left-4 z-20">
                                    <span className="px-3 py-1 bg-primary/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                                        {resource.category}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                                    {resource.title}
                                </h2>
                                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                                    {resource.description}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {resource.readTime}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BookOpen className="h-3 w-3" />
                                        {new Date(resource.publishedDate).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric"
                                        })}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Empty State */}
                {resources.resources.length === 0 && (
                    <div className="text-center py-20">
                        <BookOpen className="h-16 w-16 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-500 mb-2">No resources yet</h3>
                        <p className="text-slate-600">Check back soon for educational content!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
