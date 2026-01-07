"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Map,
    Leaf,
    Trophy,
    User,
    Award,
    Rss,
    ClipboardList,
    Menu,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileNav() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = React.useState(false);

    // All navigation items from sidebar
    const allNavItems = [
        { name: "Feed", href: "/feed", icon: Rss },
        { name: "Map", href: "/map", icon: Map },
        { name: "Species", href: "/species", icon: Leaf },
        { name: "Play", href: "/play", icon: Award },
        { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
        { name: "Resources", href: "/resources", icon: ClipboardList },
        { name: "Profile", href: "/profile", icon: User },
    ];

    // Bottom bar items (most frequently used)
    const bottomBarItems = [
        { name: "Feed", href: "/feed", icon: Rss },
        { name: "Map", href: "/map", icon: Map },
        { name: "Play", href: "/play", icon: Award },
        { name: "Profile", href: "/profile", icon: User },
    ];

    // Close drawer when route changes
    React.useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Hamburger Menu Drawer */}
            <div
                className={cn(
                    "fixed inset-0 z-50 md:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />

                {/* Drawer */}
                <div
                    className={cn(
                        "absolute left-0 top-0 bottom-0 w-72 bg-slate-950/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300",
                        isOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                        <h2 className="text-lg font-bold text-white">Menu</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-white hover:bg-white/10"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex flex-col gap-1 p-4">
                        {allNavItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-primary text-white shadow-[0_0_15px_rgba(6,147,136,0.3)]"
                                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400")} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 px-4 py-3 md:hidden pb-safe">
                <nav className="flex items-center justify-between max-w-md mx-auto">
                    {/* Hamburger Menu Button */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors text-slate-500 hover:text-slate-300"
                    >
                        <Menu className="h-6 w-6" strokeWidth={2} />
                        <span className="text-[10px] font-medium">Menu</span>
                    </button>

                    {/* Bottom Bar Navigation Items */}
                    {bottomBarItems.map((item) => {
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
        </>
    );
}
