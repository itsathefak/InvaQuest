"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { type User } from "@/types";

export default function LeaderboardPage() {
    const [scope, setScope] = React.useState<"GLOBAL" | "ON">("GLOBAL");
    const [users, setUsers] = React.useState<User[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchLeaderboard = async () => {
            const supabase = createClient();

            // Fetch top 50 users by XP
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .order('xp', { ascending: false })
                .limit(50);

            if (data) {
                const mappedUsers = data.map(profile => ({
                    id: profile.id,
                    email: profile.email || "",
                    displayName: profile.full_name || "Eco Warrior",
                    avatarUrl: profile.avatar_url,
                    country: "Canada",
                    province: profile.region || "Ontario",
                    xp: profile.xp || 0,
                    badges: profile.badges || [],
                    createdAt: profile.created_at
                } as User));
                setUsers(mappedUsers);
            }
            setLoading(false);
        };
        fetchLeaderboard();
    }, []);

    // Filter based on scope
    const sortedUsers = users.filter(u => scope === "GLOBAL" || u.province === "ON");

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl"> {/* Added px-4 and max-w-5xl for padding/centering */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Leaderboard</h1> {/* Changed to text-white */}
                    <p className="text-slate-400">Top contributors protecting our ecosystems.</p>
                </div>
                <div className="flex bg-slate-900 rounded-lg p-1 border border-white/10"> {/* Darker bg */}
                    <Button
                        variant={scope === "GLOBAL" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setScope("GLOBAL")}
                        className={scope === "GLOBAL" ? "bg-teal-600 text-white hover:bg-teal-500" : "text-slate-400 hover:text-white hover:bg-white/5"}
                    >
                        All Canada
                    </Button>
                    <Button
                        variant={scope === "ON" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setScope("ON")}
                        className={scope === "ON" ? "bg-teal-600 text-white hover:bg-teal-500" : "text-slate-400 hover:text-white hover:bg-white/5"}
                    >
                        Ontario
                    </Button>
                </div>
            </div>

            <Card className="bg-slate-900 border-white/10 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">Loading leaderboard...</div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {sortedUsers.map((user, index) => (
                                <div
                                    key={user.id}
                                    className={cn(
                                        "flex items-center gap-4 p-4 hover:bg-white/5 transition-colors",
                                        index < 3 ? "bg-gradient-to-r from-teal-900/10 to-transparent" : ""
                                    )}
                                >
                                    <div className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-full font-bold shadow-sm",
                                        index === 0 ? "bg-yellow-400 text-yellow-900" :
                                            index === 1 ? "bg-slate-300 text-slate-900" :
                                                index === 2 ? "bg-amber-600 text-amber-100" : "text-slate-500 bg-slate-800"
                                    )}>
                                        {index + 1}
                                    </div>

                                    <Avatar className="h-10 w-10 border border-white/10">
                                        <AvatarImage src={user.avatarUrl} />
                                        <AvatarFallback className="bg-slate-800 text-slate-300">
                                            {user.displayName[0]}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0"> {/* min-w-0 for truncation */}
                                        <div className="font-semibold text-white truncate">{user.displayName}</div>
                                        <div className="text-xs text-slate-400 flex gap-2 items-center">
                                            <Badge variant="outline" className="text-[10px] h-5 border-white/10 text-slate-300">{user.province}</Badge>
                                            <span className="hidden sm:inline">{user.badges.length} Badges</span>
                                        </div>
                                    </div>

                                    <div className="text-right whitespace-nowrap">
                                        <div className="font-bold text-teal-400">{user.xp.toLocaleString()} XP</div>
                                    </div>
                                </div>
                            ))}
                            {sortedUsers.length === 0 && (
                                <div className="p-8 text-center text-slate-500">No players found yet. Be the first!</div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
