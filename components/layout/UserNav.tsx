"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface UserNavProps {
    user: any;
}

export function UserNav({ user }: UserNavProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isOpen, setIsOpen] = useState(false);

    const fullName = user?.user_metadata?.full_name || "Eco Warrior";
    const avatarUrl = user?.user_metadata?.avatar_url;
    const defaultAvatar = "/default-avatar.png";

    // Use avatarUrl if present, otherwise default
    const displayAvatarUrl = avatarUrl ? avatarUrl : defaultAvatar;

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            {/* Trigger */}
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md cursor-pointer hover:bg-white/20 transition-colors">
                <span className="text-white font-medium text-sm hidden md:block">{fullName}</span>
                <Avatar className="h-8 w-8 ring-2 ring-primary/50 bg-slate-800">
                    <AvatarImage src={displayAvatarUrl} alt={fullName} className="object-cover" />
                    <AvatarFallback>
                        {fullName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </div>

            {/* Dropdown Content */}
            {isOpen && (
                <div className="absolute right-0 top-full w-56 pt-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-xl py-1 overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/10 mb-1">
                            <p className="text-sm font-medium text-white truncate">{fullName}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>

                        <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
                            <User className="h-4 w-4" />
                            My Profile
                        </Link>

                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
                        >
                            <LogOut className="h-4 w-4" />
                            Log Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
