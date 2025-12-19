"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { type Sighting } from "@/types";
import { getGameChallenges } from "@/lib/actions/game-actions";
import GeoGuesserMap from "@/components/game/GeoGuesserMap";
import { Loader2, Timer, MapPin, Trophy, ArrowRight, RefreshCcw, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type GameState = 'menu' | 'loading' | 'playing' | 'round_result' | 'game_over';
type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG = {
    easy: { time: 60, label: "Easy", color: "text-green-400 border-green-400/30 bg-green-400/10" },
    medium: { time: 30, label: "Medium", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" },
    hard: { time: 15, label: "Hard", color: "text-red-400 border-red-400/30 bg-red-400/10" }
};

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}

export default function GeoGuesserPage() {
    const router = useRouter();
    const [gameState, setGameState] = React.useState<GameState>('menu');
    const [difficulty, setDifficulty] = React.useState<Difficulty>('easy');
    const [rounds, setRounds] = React.useState<Sighting[]>([]);
    const [currentRoundIndex, setCurrentRoundIndex] = React.useState(0);
    const [timeLeft, setTimeLeft] = React.useState(0);

    // Round State
    const [guessCoords, setGuessCoords] = React.useState<{ lat: number; lng: number } | null>(null);
    const [roundDistance, setRoundDistance] = React.useState<number | null>(null);
    const [roundScore, setRoundScore] = React.useState<number>(0);

    // Total Game State
    const [totalScore, setTotalScore] = React.useState(0);
    const [roundHistory, setRoundHistory] = React.useState<{ distance: number, score: number }[]>([]);

    const currentChallenge = rounds[currentRoundIndex];

    // Timer Logic
    React.useEffect(() => {
        if (gameState !== 'playing') return;

        if (timeLeft <= 0) {
            submitGuess(true); // Auto submit
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, timeLeft]);

    const startGame = async (diff: Difficulty) => {
        setDifficulty(diff);
        setGameState('loading');

        try {
            // Fetch 10 challenges
            const data = await getGameChallenges(10);
            if (data && data.length > 0) {
                setRounds(data);
                setCurrentRoundIndex(0);
                setTotalScore(0);
                setRoundHistory([]);
                startNewRound(diff);
            } else {
                alert("Not enough data to start game. Do you have at least 10 species locations?");
                setGameState('menu');
            }
        } catch (error) {
            console.error("Failed to start game", error);
            setGameState('menu');
        }
    };

    const startNewRound = (diff: Difficulty) => {
        setGuessCoords(null);
        setRoundDistance(null);
        setRoundScore(0);
        setTimeLeft(DIFFICULTY_CONFIG[diff].time);
        setGameState('playing');
    };

    const submitGuess = (timeout = false) => {
        if (!currentChallenge) return;

        let finalGuess = guessCoords;
        if (!finalGuess) {
            finalGuess = { lat: 0, lng: 0 }; // Penalty
        }

        const dist = getDistanceFromLatLonInKm(
            currentChallenge.coordinates.lat,
            currentChallenge.coordinates.lng,
            finalGuess.lat,
            finalGuess.lng
        );

        // Score Calculation: 5000 pts max, drops off
        let score = 0;
        if (dist < 50) score = 5000;
        else if (dist < 2000) score = Math.max(0, 5000 - Math.round(dist * 2.5));

        setRoundDistance(dist);
        setRoundScore(score);
        setRoundHistory(prev => [...prev, { distance: dist, score }]);
        setTotalScore(prev => prev + score);
        setGameState('round_result');
    };

    const handleNextRound = async () => {
        if (currentRoundIndex < rounds.length - 1) {
            setCurrentRoundIndex(prev => prev + 1);
            startNewRound(difficulty);
        } else {
            setGameState('game_over');

            // --- SYNC RESULT & BADGES ---
            try {
                // We need the user ID. 
                // In a perfect world we pass it in props or use a hook, but here we can quick-fetch or use context.
                const { createClient } = await import("@/lib/supabase/client");
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { awardXP, recordGameSession, checkAndAwardBadges } = await import("@/lib/gamification");
                    const xpEarned = Math.floor(totalScore / 100); // e.g. 50000 score -> 500 XP

                    await awardXP(user.id, xpEarned);
                    await recordGameSession(
                        user.id,
                        'geoguesser',
                        difficulty,
                        totalScore,
                        rounds.length * 5000,
                        xpEarned
                    );

                    const newBadges = await checkAndAwardBadges(user.id, 'geoguesser', difficulty, totalScore);
                    if (newBadges.length > 0) {
                        alert(`New badges unlocked: ${newBadges.join(", ")}!`);
                    }
                }
            } catch (err) {
                console.error("Game sync failed", err);
            }
        }
    };

    // UI HELPER: Get message for score
    const getScoreMessage = (km: number) => {
        if (km < 50) return { text: "PERFECT!", color: "text-emerald-400" };
        if (km < 200) return { text: "Excellent!", color: "text-green-400" };
        if (km < 500) return { text: "Good Job!", color: "text-blue-400" };
        if (km < 2000) return { text: "Not Bad", color: "text-yellow-400" };
        return { text: "Way Off...", color: "text-red-400" };
    };

    return (
        <div className="h-[calc(100vh-4rem)] w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden relative font-sans selection:bg-emerald-500/30">

            {/* --- TOP BAR --- */}
            {gameState !== 'game_over' && (
                <header className="h-16 border-b border-white/5 bg-slate-900/30 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-20">
                    <div className="flex items-center gap-6">
                        <h1 className="font-black text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            BioGuesser
                        </h1>
                        {gameState !== 'menu' && (
                            <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-slate-400">
                                Round {currentRoundIndex + 1}/{rounds.length}
                            </span>
                        )}
                    </div>

                    {gameState === 'playing' && (
                        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
                            <div className={cn("px-4 py-1.5 rounded-full border font-mono font-bold flex items-center gap-2 tabular-nums transition-colors",
                                timeLeft < 10 ? "text-red-400 border-red-500/50 bg-red-500/10 animate-pulse" : "border-white/10 bg-white/5"
                            )}>
                                <Timer className="w-4 h-4" />
                                {timeLeft}s
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total Score</p>
                            <p className="font-mono text-xl font-bold text-emerald-400 leading-none">{totalScore.toLocaleString()}</p>
                        </div>
                    </div>
                </header>
            )}

            {/* --- MAIN LAYOUT --- */}
            <main className="flex-1 relative">
                {/* MAP (Always visible, behind overlays when needed) */}
                <div className="absolute inset-0 z-0 bg-slate-900">
                    <GeoGuesserMap
                        challenge={currentChallenge}
                        guessCoords={guessCoords}
                        onGuessMade={setGuessCoords}
                        showResult={gameState === 'round_result'} // Only show line/result marker in result state
                    />
                </div>

                {/* --- MENU OVERLAY --- */}
                {gameState === 'menu' && (
                    <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                            <div className="text-center space-y-2">
                                <h2 className="text-4xl font-black tracking-tight text-white mb-2">
                                    <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">BioGuesser</span>
                                </h2>
                                <p className="text-slate-400">Identify the habitat range of 10 invasive species across Canada.</p>
                            </div>

                            <div className="space-y-3">
                                {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((diff) => (
                                    <button
                                        key={diff}
                                        onClick={() => startGame(diff)}
                                        className={cn(
                                            "w-full p-4 rounded-xl border flex items-center justify-between group hover:scale-[1.02] transition-all",
                                            DIFFICULTY_CONFIG[diff].color
                                        )}
                                    >
                                        <span className="font-bold text-lg">{DIFFICULTY_CONFIG[diff].label}</span>
                                        <span className="font-mono opacity-60 group-hover:opacity-100 transition-opacity">{DIFFICULTY_CONFIG[diff].time}s</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- GAME OVER OVERLAY --- */}
                {gameState === 'game_over' && (
                    <div className="absolute inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
                        <div className="absolute inset-0 z-0 opacity-40" style={{ backgroundImage: 'var(--image-gradient-mesh)', backgroundSize: 'cover' }} />

                        <div className="relative z-10 w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-full">

                            {/* Result Summary (Left/Top) */}
                            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center bg-gradient-to-br from-emerald-900/40 to-slate-900 border-b md:border-b-0 md:border-r border-white/5">
                                <div className="mb-6 relative">
                                    <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 rounded-full"></div>
                                    <Trophy className="w-20 h-20 text-yellow-400 relative z-10 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
                                </div>
                                <h2 className="text-3xl font-black text-white mb-1">Mission Complete</h2>
                                <p className="text-slate-400 mb-6">You've mapped them all!</p>

                                <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/10 w-full mb-6">
                                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Final Score</p>
                                    <p className="text-4xl font-mono font-black text-emerald-400">{totalScore.toLocaleString()}</p>
                                </div>

                                <div className="space-y-3 w-full">
                                    <Button
                                        onClick={() => setGameState('menu')}
                                        size="lg"
                                        className="w-full h-12 bg-white text-slate-900 hover:bg-slate-200 font-bold"
                                    >
                                        <RefreshCcw className="w-4 h-4 mr-2" /> Play Again
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="lg"
                                        className="w-full text-slate-400 hover:text-white"
                                        onClick={() => router.push('/play')}
                                    >
                                        Back to Games
                                    </Button>
                                </div>
                            </div>

                            {/* Round History (Right/Bottom) */}
                            <div className="p-8 flex-1 bg-slate-950/50 overflow-y-auto">
                                <h3 className="font-bold text-slate-400 uppercase tracking-wider text-xs mb-4">Round Breakdown</h3>
                                <div className="space-y-3">
                                    {roundHistory.map((r, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-white/5">
                                            <span className="text-slate-500 text-sm font-mono w-8">#{i + 1}</span>
                                            <div className="flex-1 px-4">
                                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full rounded-full", r.score > 4000 ? "bg-emerald-500" : r.score > 2000 ? "bg-yellow-500" : "bg-red-500")}
                                                        style={{ width: `${(r.score / 5000) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-white text-sm">{r.score}</div>
                                                <div className="text-[10px] text-slate-500">{Math.round(r.distance)}km</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* --- LOADING --- */}
                {gameState === 'loading' && (
                    <div className="absolute inset-0 z-30 bg-slate-950 flex items-center justify-center">
                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                    </div>
                )}

                {/* --- PLAYING CARD (Left Overlay) --- */}
                {(gameState === 'playing' || gameState === 'round_result') && currentChallenge && (
                    <div className="absolute top-6 left-6 w-[360px] max-w-[calc(100vw-3rem)] z-10 flex flex-col gap-4 animate-in slide-in-from-left-4 fade-in duration-300 pointer-events-none">

                        {/* Species Card */}
                        <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto">
                            <div className="aspect-[4/3] w-full relative bg-slate-800">
                                <img
                                    src={currentChallenge.photoUrl || currentChallenge.species?.imageKey}
                                    alt="Species"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                                    <h3 className="text-white font-bold text-xl leading-none">{currentChallenge.species?.commonName}</h3>
                                    <p className="text-slate-300 text-xs italic opacity-80 mt-1">{currentChallenge.species?.scientificName}</p>
                                </div>
                            </div>

                            <div className="p-4">
                                {gameState === 'playing' ? (
                                    <Button
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                                        size="lg"
                                        disabled={!guessCoords}
                                        onClick={() => submitGuess()}
                                    >
                                        {guessCoords ? "Confirm Location" : "Place Pin on Map"} <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                            <div>
                                                <div className={cn("font-black text-2xl", getScoreMessage(roundDistance || 0).color)}>
                                                    +{roundScore}
                                                </div>
                                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Points Earned</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono text-xl text-white">{Math.round(roundDistance || 0)}km</div>
                                                <div className="text-xs text-slate-500">Distance</div>
                                            </div>
                                        </div>
                                        <Button onClick={handleNextRound} className="w-full" size="lg" variant="secondary">
                                            {currentRoundIndex < rounds.length - 1 ? "Next Round" : "Finish Game"} <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Hint / Instructions */}
                        {gameState === 'playing' && !guessCoords && (
                            <div className="bg-blue-500/10 backdrop-blur-md border border-blue-500/20 text-blue-200 px-4 py-3 rounded-xl text-sm shadow-lg flex items-center gap-3">
                                <MapPin className="w-4 h-4 shrink-0" />
                                Tap the map to guess location
                            </div>
                        )}
                    </div>
                )}

            </main>
        </div>
    );
}
