"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, Trophy } from "lucide-react";

interface GameCardProps {
    title: string;
    description?: string;
    href: string;
    imageUrl?: string; // Optional background image
    className?: string;
    delay?: number; // Animation delay
    hideText?: boolean;
}

export function GameCard({
    title,
    description,
    href,
    imageUrl,
    className,
    delay = 0,
    hideText = false,
}: GameCardProps) {
    return (
        <Link
            href={href}
            className={cn(
                "group relative block h-full w-full overflow-hidden rounded-3xl border border-white/5 bg-slate-900 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-teal-500/50 hover:shadow-teal-500/20",
                "animate-in fade-in zoom-in-50 fill-mode-both",
                className
            )}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Background Image / Gradient */}
            <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="h-full w-full object-cover transition-opacity opacity-100 group-hover:opacity-100" // Updated opacity since image is the main content now
                    />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-900" />
                )}

                {/* Minimal Overlay - lighter if we have text in image, just for some depth? Or none?
                    If hideText is true, we probably want mostly clear view, maybe subtle gradient at bottom for the arrow?
                */}
                <div className={cn(
                    "absolute inset-0 transition-opacity duration-300",
                    hideText ? "bg-black/10 group-hover:bg-black/0" : "bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"
                )} />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-8">
                {!hideText && (
                    <div className="transform transition-all duration-300 group-hover:translate-x-2">
                        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">{title}</h3>
                        {description && (
                            <p className="text-slate-300 text-sm md:text-base max-w-[90%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 drop-shadow-sm">
                                {description}
                            </p>
                        )}
                    </div>
                )}

                {/* For a11y, if text is hidden, add screen reader only text */}
                {hideText && <span className="sr-only">{title} - {description}</span>}

                {/* Hover indicator */}
                <div className="absolute top-6 right-6 opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20">
                        <ArrowRight className="h-6 w-6 text-white" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
