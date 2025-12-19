"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Map, Leaf, Trophy, User, Award, Home, Rss } from "lucide-react";

export function MobileNav() {
    const pathname = usePathname();

    const navItems = [
        { name: "Feed", href: "/feed", icon: Rss },
        { name: "Map", href: "/map", icon: Map },
        { name: "Play", href: "/play", icon: Award },
        { name: "Species", href: "/species", icon: Leaf },
        { name: "Profile", href: "/profile", icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 px-6 py-4 md:hidden pb-safe">
            <nav className="flex items-center justify-between">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors",
                                isActive ? "text-primary" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <item.icon className={cn("h-6 w-6", isActive && "fill-current/20")} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
