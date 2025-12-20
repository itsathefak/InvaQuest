import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, BookOpen, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import resources from "@/data/resources.json";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
    return resources.resources.map((resource) => ({
        slug: resource.slug,
    }));
}

export default function ResourceArticlePage({ params }: { params: { slug: string } }) {
    const resource = resources.resources.find((r) => r.slug === params.slug);

    if (!resource) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black">
            {/* Hero Section */}
            <div className="relative h-96 overflow-hidden">
                {/* Hero Image */}
                <Image
                    src={resource.heroImage}
                    alt={resource.title}
                    fill
                    className="object-cover"
                    priority
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />

                {/* Content */}
                <div className="relative h-full max-w-4xl mx-auto px-6 flex flex-col justify-end pb-12">
                    {/* Back Button */}
                    <Link
                        href="/resources"
                        className="absolute top-8 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm font-medium">Back to Resources</span>
                    </Link>

                    {/* Category Badge */}
                    <div className="mb-4">
                        <span className="px-4 py-2 bg-primary/90 backdrop-blur-sm text-white text-sm font-bold rounded-full">
                            {resource.category}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">
                        {resource.title}
                    </h1>

                    {/* Meta */}
                    <div className="flex items-center gap-6 text-slate-300">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">{resource.readTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span className="text-sm">
                                {new Date(resource.publishedDate).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric"
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Article Content */}
            <article className="max-w-4xl mx-auto px-6 py-16">
                <div className="prose prose-invert prose-lg max-w-none">
                    {resource.content.map((block, index) => {
                        if (block.type === "paragraph") {
                            return (
                                <p key={index} className="text-slate-300 leading-relaxed mb-6">
                                    {block.text}
                                </p>
                            );
                        }
                        if (block.type === "heading") {
                            return (
                                <h2 key={index} className="text-3xl font-bold text-white mt-12 mb-6">
                                    {block.text}
                                </h2>
                            );
                        }
                        return null;
                    })}
                </div>

                {/* PDF Download Section */}
                {resource.pdfUrl && (
                    <div className="mt-16 p-8 bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl">
                        <div className="flex items-start gap-6">
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center">
                                    <FileText className="h-8 w-8 text-primary" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Download Full Resource
                                </h3>
                                <p className="text-slate-400 mb-4">
                                    Get the complete PDF version of this article with additional references and information.
                                </p>
                                <a
                                    href={resource.pdfUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button className="bg-primary hover:bg-primary/90 text-white">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download PDF
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Back to Resources */}
                <div className="mt-12 pt-12 border-t border-white/10">
                    <Link
                        href="/resources"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to all resources
                    </Link>
                </div>
            </article>
        </div>
    );
}
