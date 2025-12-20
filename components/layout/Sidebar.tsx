"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Map, Leaf, Trophy, ClipboardList, User, Award, Settings, LogOut, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export function Sidebar({ className, user }: { className?: string; user?: any }) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [isProfileHovered, setIsProfileHovered] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    React.useEffect(() => {
        if (user) {
            const fetchProfile = async () => {
                const { data } = await supabase
                    .from('profiles')
                    .select('full_name, avatar_url')
                    .eq('id', user.id)
                    .single();
                if (data) setProfile(data);
            };
            fetchProfile();

            // Subscribe to realtime changes
            const channel = supabase
                .channel('profile_changes')
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
                    (payload) => {
                        setProfile(payload.new);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push("/");
    };

    // Use profile data if available, fallback to metadata
    const fullName = profile?.full_name || user?.user_metadata?.full_name || "Eco Warrior";
    const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
    const defaultAvatar = "/default-avatar.png";
    const email = user?.email;
    const initials = fullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2);

    const displayAvatarUrl = avatarUrl ? avatarUrl : defaultAvatar;

    const navItems = [
        { name: "Feed", href: "/feed", icon: Rss },
        { name: "Map", href: "/map", icon: Map },
        { name: "Species", href: "/species", icon: Leaf },
        { name: "Play", href: "/play", icon: Award },
        { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
        { name: "Resources", href: "/resources", icon: ClipboardList },
        { name: "Profile", href: "/profile", icon: User },
    ];

    return (
        <div className={cn("flex h-full flex-col bg-slate-950/80 backdrop-blur-xl border-r border-white/10 text-slate-300", className)}>
            <div className="flex h-20 items-center px-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <Logo className="h-12 w-40" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6">
                <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main</div>
                <nav className="grid gap-2 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-white shadow-[0_0_15px_rgba(6,147,136,0.3)]"
                                        : "hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400")} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-white/10 p-4">
                <div
                    className="relative"
                    onMouseEnter={() => setIsProfileHovered(true)}
                    onMouseLeave={() => setIsProfileHovered(false)}
                >
                    {/* Hover Menu (Pops Up) */}
                    {isProfileHovered && (
                        <div className="absolute bottom-full left-0 w-full pb-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Log Out
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="rounded-xl bg-white/5 p-4 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer group">
                        <Avatar className="h-10 w-10 ring-2 ring-black bg-slate-800">
                            <AvatarImage src={displayAvatarUrl} alt={fullName} className="object-cover" />
                            <AvatarFallback className="bg-gradient-to-tr from-accent to-orange-500 text-black font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <p className="font-semibold text-white truncate text-sm">{fullName}</p>
                            <p className="text-xs text-slate-400 truncate">{email}</p>
                        </div>
                        <Settings className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                </div>
            </div>
        </div>
    );
}
