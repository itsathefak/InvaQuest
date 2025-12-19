"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserProgress, getLevelProgress } from "@/lib/gamification";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { Settings, Trophy, MapPin, Award, Calendar, Camera } from "lucide-react";
import { type User } from "@/types";

export default function ProfilePage() {
    const [user, setUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);

    const [recentActivity, setRecentActivity] = React.useState<any[]>([]);
    const [stats, setStats] = React.useState({ sightings: 0, verified: 0, rank: "Unranked" });

    React.useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                const { getUserGameHistory } = await import("@/lib/gamification");

                // Parallelize all requests
                const [
                    { data: profile },
                    history,
                    { count: sightingsCount },
                    { count: verifiedCount }
                ] = await Promise.all([
                    supabase.from('profiles').select('*').eq('id', authUser.id).single(),
                    getUserGameHistory(authUser.id, 5),
                    supabase.from('sightings').select('*', { count: 'exact', head: true }).eq('user_id', authUser.id),
                    supabase.from('sightings').select('*', { count: 'exact', head: true }).eq('user_id', authUser.id).eq('verified', true)
                ]);

                const userData: User = {
                    id: authUser.id,
                    email: authUser.email || "",
                    displayName: profile?.full_name || authUser.user_metadata?.full_name || "Eco Warrior",
                    avatarUrl: profile?.avatar_url || authUser.user_metadata?.avatar_url,
                    country: "Canada",
                    province: profile?.region || "Ontario",
                    xp: profile?.xp || 0,
                    badges: profile?.badges || [],
                    createdAt: authUser.created_at || new Date().toISOString()
                };
                setUser(userData);
                setRecentActivity(history);

                // Calculate Rank (Nested request, depends on profile region)
                let rankText = "Unranked";
                if (profile?.region) {
                    const { count: rankCount, error: rankError } = await supabase
                        .from('profiles')
                        .select('*', { count: 'exact', head: true })
                        .eq('region', profile.region)
                        .gt('xp', profile.xp || 0);

                    if (!rankError && rankCount !== null) {
                        rankText = `#${rankCount + 1} in ${profile.region}`;
                    }
                }

                setStats({
                    sightings: sightingsCount || 0,
                    verified: verifiedCount || 0,
                    rank: rankText
                });
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Loading profile...</div>;
    }

    if (!user) {
        return <div className="p-8 text-center text-red-400">Please sign in to view your profile.</div>;
    }

    // Calculate level info
    const levelInfo = getLevelProgress(user.xp);
    const { getAllBadges } = require("@/lib/gamification");
    const allBadges = getAllBadges();
    const earnedBadges = user.badges || [];

    return (
        <div className="container mx-auto px-6 py-10 md:py-12 max-w-7xl">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Identify & Stats */}
                <div className="w-full lg:w-1/3 space-y-8">
                    {/* User Identity Card */}
                    <Card className="bg-slate-900 border-white/10 overflow-hidden shadow-xl">
                        <div className="h-32 bg-gradient-to-r from-teal-600 to-emerald-600 relative">
                            {/* Banner or pattern could go here */}
                            <div className="absolute inset-0 bg-black/10" />
                        </div>
                        <CardContent className="relative pt-0 flex flex-col items-center text-center -mt-12">
                            <Avatar className="h-24 w-24 ring-4 ring-slate-900 bg-slate-800 shadow-lg">
                                <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                                <AvatarFallback className="text-2xl font-bold bg-slate-700 text-white">
                                    {user.displayName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <h2 className="text-2xl font-bold text-white mt-4">{user.displayName}</h2>
                            <div className="flex items-center text-slate-400 text-sm mt-1 mb-6">
                                <MapPin className="w-4 h-4 mr-1" />
                                {user.province}, {user.country}
                            </div>

                            {/* Edit Profile Button */}
                            <div className="mb-6">
                                <EditProfileDialog
                                    user={{ id: user.id, displayName: user.displayName, avatarUrl: user.avatarUrl }}
                                    trigger={
                                        <Button variant="outline" size="sm" className="bg-slate-800/50 border-white/10 hover:bg-slate-800 text-slate-300">
                                            <Settings className="w-4 h-4 mr-2" /> Edit Profile
                                        </Button>
                                    }
                                />
                            </div>

                            <div className="flex gap-2 w-full justify-center">
                                <Badge variant="secondary" className="px-3 py-1 bg-teal-500/20 text-teal-300 border-teal-500/30">
                                    Level {levelInfo.level}
                                </Badge>
                                <Badge variant="outline" className="px-3 py-1 border-white/20 text-slate-300">
                                    {stats.rank}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Card */}
                    <Card className="bg-slate-900/50 border-white/10 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-white">Quest Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* XP Bar */}
                            <div>
                                <div className="flex justify-between text-sm mb-2 text-slate-300">
                                    <span className="font-medium">XP Progress</span>
                                    <span className="text-muted-foreground">{Math.floor(levelInfo.currentXP)} / {Math.floor(levelInfo.xpForNextLevel)} XP</span>
                                </div>
                                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 shadow-[0_0_10px_rgba(20,184,166,0.5)] transition-all duration-1000"
                                        style={{ width: `${levelInfo.percentage}%` }}
                                    />
                                </div>
                                <p className="text-sm text-slate-400">{levelInfo.xpForNextLevel - levelInfo.currentXP} XP to next level</p>
                            </div>

                            {/* Numeric Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col items-center p-4 bg-slate-800/50 rounded-xl border border-white/5">
                                    <Camera className="w-5 h-5 text-teal-400 mb-2" />
                                    <span className="text-2xl font-bold text-white">{stats.sightings}</span>
                                    <span className="text-xs text-slate-400 uppercase tracking-wider">Sightings</span>
                                </div>
                                <div className="flex flex-col items-center p-4 bg-slate-800/50 rounded-xl border border-white/5">
                                    <Award className="w-5 h-5 text-yellow-400 mb-2" />
                                    <span className="text-2xl font-bold text-white">{stats.verified}</span>
                                    <span className="text-xs text-slate-400 uppercase tracking-wider">Verified</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Badges & Activity */}
                <div className="flex-1 space-y-8">
                    {/* Badges */}
                    <Card className="bg-slate-900/50 border-white/10 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                Badges & Achievements
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Unlock badges by exploring and reporting invasive species.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {allBadges.map((badge: any) => {
                                    const isUnlocked = earnedBadges.includes(badge.id);
                                    return (
                                        <div
                                            key={badge.id}
                                            className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-300 ${isUnlocked
                                                ? "bg-slate-800/80 border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.1)] scale-100 opacity-100"
                                                : "bg-slate-900/30 border-white/5 grayscale opacity-50"
                                                }`}
                                        >
                                            <div className="text-4xl mb-3 drop-shadow-lg">{badge.icon}</div>
                                            <span className={`font-semibold text-sm text-center mb-1 ${isUnlocked ? "text-white" : "text-slate-500"}`}>
                                                {badge.name}
                                            </span>
                                            <span className="text-xs text-center text-slate-500 line-clamp-2">
                                                {badge.description}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity (Mocked plan) */}
                    <Card className="bg-slate-900/50 border-white/10 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Calendar className="w-5 h-5 text-blue-400" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.length === 0 ? (
                                    <div className="text-center text-slate-500 py-4">No recent activity</div>
                                ) : (
                                    recentActivity.map((session) => (
                                        <div key={session.id} className="flex gap-4 items-start p-3 hover:bg-white/5 rounded-lg transition-colors">
                                            <div className="bg-purple-500/20 p-2 rounded-full">
                                                <Award className="w-4 h-4 text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-white">
                                                    Played <span className="text-purple-400 capitalize">{session.game_type}</span> ({session.difficulty})
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(session.completed_at).toLocaleDateString()} • {session.xp_earned} XP
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
