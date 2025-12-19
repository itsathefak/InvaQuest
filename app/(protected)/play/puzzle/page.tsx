"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Timer, RefreshCw, Trophy, Target, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type Species } from "@/types";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

// Game Constants
const LEVELS = {
    EASY: { name: 'Easy', grid: 3, time: 180, bonus: 1.5 },
    MEDIUM: { name: 'Medium', grid: 4, time: 300, bonus: 2 },
    HARD: { name: 'Hard', grid: 5, time: 480, bonus: 3 }
};

type GameState = 'menu' | 'loading' | 'playing' | 'game_over';

interface Tile {
    id: number;
    currentPos: number; // 0 to (grid*grid - 1)
    correctPos: number; // 0 to (grid*grid - 1)
    isEmpty: boolean;
}

export default function PuzzlePage() {
    const [gameState, setGameState] = React.useState<GameState>('menu');
    const [difficulty, setDifficulty] = React.useState<keyof typeof LEVELS>('EASY');
    const [tiles, setTiles] = React.useState<Tile[]>([]);
    const [species, setSpecies] = React.useState<Species | null>(null);
    const [timeLeft, setTimeLeft] = React.useState(0);
    const [moves, setMoves] = React.useState(0);
    const [score, setScore] = React.useState(0);
    const [showPreview, setShowPreview] = React.useState(false);

    const gridSize = LEVELS[difficulty].grid;

    // Timer Effect
    React.useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleGameOver(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState]);

    // Initialize Game
    const startGame = async (level: keyof typeof LEVELS) => {
        setDifficulty(level);
        setGameState('loading');

        try {
            // Fetch species with a server action directly (no API route needed)
            const { getAllSpecies } = await import("@/lib/actions/game-actions");
            const allSpecies = await getAllSpecies();

            // Filter only with valid images
            const validSpecies = allSpecies.filter((s: Species) => s.imageKey && s.imageKey.startsWith('http'));

            if (validSpecies.length === 0) {
                console.error("No valid species found for puzzle.");
                setGameState('menu');
                return;
            }

            const randomSpecies = validSpecies[Math.floor(Math.random() * validSpecies.length)];
            setSpecies(randomSpecies);

            // Setup Tiles
            const size = LEVELS[level].grid;
            const totalTiles = size * size;
            const newTiles: Tile[] = Array.from({ length: totalTiles }, (_, i) => ({
                id: i,
                currentPos: i,
                correctPos: i,
                isEmpty: i === totalTiles - 1 // Last tile is empty
            }));

            // Shuffle validly
            let shuffledTiles = [...newTiles];
            let isSolvable = false;
            while (!isSolvable) {
                shuffledTiles = shuffleTiles(shuffledTiles, size);
                isSolvable = checkSolvability(shuffledTiles, size);
            }

            setTiles(shuffledTiles);
            setTimeLeft(LEVELS[level].time);
            setMoves(0);
            setScore(0);
            setGameState('playing');
        } catch (e) {
            console.error("Failed to start game", e);
            setGameState('menu');
        }
    };

    const shuffleTiles = (tiles: Tile[], size: number) => {
        // Fisher-Yates shuffle on positions, but keep ids/correctPos linked?
        // Actually easier to just shuffle the array of tiles.
        // But we need to update currentPos to match index in array
        const array = [...tiles];
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        // Update currentPos based on new index
        return array.map((t, index) => ({ ...t, currentPos: index }));
    };

    const checkSolvability = (tiles: Tile[], size: number) => {
        let inversions = 0;
        // Flatten tiles based on current order
        const flatTiles = tiles.map(t => t.correctPos).filter(id => id !== size * size - 1); // Exclude empty tile id

        for (let i = 0; i < flatTiles.length; i++) {
            for (let j = i + 1; j < flatTiles.length; j++) {
                if (flatTiles[i] > flatTiles[j]) inversions++;
            }
        }

        const emptyTileIndex = tiles.findIndex(t => t.isEmpty);
        const emptyRowFromBottom = size - Math.floor(emptyTileIndex / size);

        if (size % 2 !== 0) {
            return inversions % 2 === 0;
        } else {
            if (emptyRowFromBottom % 2 === 0) return inversions % 2 !== 0;
            else return inversions % 2 === 0;
        }
    };

    const handleTileClick = (index: number) => {
        if (gameState !== 'playing') return;

        const emptyIndex = tiles.findIndex(t => t.isEmpty);
        const size = gridSize;

        const isAdjacent =
            (index === emptyIndex - 1 && Math.floor(index / size) === Math.floor(emptyIndex / size)) || // Left
            (index === emptyIndex + 1 && Math.floor(index / size) === Math.floor(emptyIndex / size)) || // Right
            (index === emptyIndex - size) || // Up
            (index === emptyIndex + size);   // Down

        if (isAdjacent) {
            const newTiles = [...tiles];
            // Swap
            [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
            // Update currentPos is technically just index in array for rendering? 
            // The way I set it up: currentPos property is index.
            // Let's ensure consistency:
            newTiles[index].currentPos = index;
            newTiles[emptyIndex].currentPos = emptyIndex;

            setTiles(newTiles);
            setMoves(p => p + 1);

            // Check Win
            const isWin = newTiles.every(t => t.currentPos === t.correctPos);
            if (isWin) {
                handleGameOver(true);
            }
        }
    };

    const handleGameOver = async (win: boolean) => {
        setGameState('game_over');
        if (win) {
            const timeBonus = timeLeft * 10;
            const movePenalty = moves * 2;
            const finalScore = Math.max(0, 1000 + timeBonus - movePenalty);
            setScore(finalScore);

            // Award XP
            const { awardXP, recordGameSession, calculateGameXP } = await import("@/lib/gamification");
            // Standard XP calc: 50 base for easy, + bonuses
            const xpEarned = Math.floor(finalScore / 10);

            // We need userId, maybe fetch it or pass it?
            // Ideally we use a server action or client-side with auth check.
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                try {
                    await awardXP(user.id, xpEarned);
                    await recordGameSession(
                        user.id,
                        'puzzle',
                        difficulty.toLowerCase() as any,
                        finalScore,
                        2000,
                        xpEarned,
                        LEVELS[difficulty].time - timeLeft
                    );

                    // Check Badges
                    const { checkAndAwardBadges } = await import("@/lib/gamification");
                    const newBadges = await checkAndAwardBadges(
                        user.id,
                        'puzzle',
                        difficulty.toLowerCase(),
                        finalScore
                    );

                    if (newBadges.length > 0) {
                        // Ideally show a toast here
                        alert(`You earned new badges: ${newBadges.join(", ")}! 🏆`);
                    }

                } catch (err) {
                    console.error("Failed to update progress:", err);
                    alert("Game saved locally but failed to sync stats. Check console.");
                }
            }

            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#34D399', '#10B981', '#059669']
            });
        }
    };

    // Calculate background position for each tile
    const getBackgroundStyle = (tile: Tile) => {
        if (!species || tile.isEmpty) return {};
        const size = gridSize;
        const x = (tile.correctPos % size) * (100 / (size - 1));
        const y = Math.floor(tile.correctPos / size) * (100 / (size - 1));
        return {
            backgroundImage: `url(${species.imageKey})`,
            backgroundPosition: `${x}% ${y}%`,
            backgroundSize: `${size * 100}%`
        };
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-teal-500/30">
            {gameState !== 'game_over' && (
                <header className="fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        <Link href="/play" className="flex items-center text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Exit</span>
                        </Link>

                        {gameState === 'playing' && (
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Timer className="w-4 h-4 text-teal-400" />
                                    <span className="font-mono font-bold text-xl">{timeLeft}s</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-purple-400" />
                                    <span className="font-mono font-bold text-xl">{moves}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-slate-400 hover:text-white"
                                    onMouseDown={() => setShowPreview(true)}
                                    onMouseUp={() => setShowPreview(false)}
                                    onTouchStart={() => setShowPreview(true)}
                                    onTouchEnd={() => setShowPreview(false)}
                                    title="Hold to see solution"
                                >
                                    <Eye className="w-5 h-5" />
                                </Button>
                            </div>
                        )}

                        <div className="w-8" />
                    </div>
                </header>
            )}

            <main className="container mx-auto px-4 pt-24 pb-8 min-h-screen flex flex-col items-center justify-center relative">

                {/* Preview Overlay */}
                {gameState === 'playing' && showPreview && species && (
                    <div
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
                        onClick={() => setShowPreview(false)}
                    >
                        <div className="flex flex-col items-center gap-4 pointer-events-none">
                            <img
                                src={species.imageKey}
                                alt="Solution"
                                className="max-w-[90vw] max-h-[70vh] rounded-xl border-2 border-teal-500 shadow-2xl"
                            />
                            <p className="text-white font-bold bg-black/50 px-4 py-2 rounded-full">Preview Mode (Tap to Close)</p>
                        </div>
                    </div>
                )}

                {gameState === 'menu' && (
                    <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="text-center space-y-4">
                            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 pb-2">
                                Invasive Puzzle
                            </h1>
                            <p className="text-slate-400 text-lg">Unscramble the image to identify the species.</p>
                        </div>

                        <div className="grid gap-4">
                            {(Object.keys(LEVELS) as Array<keyof typeof LEVELS>).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => startGame(level)}
                                    className="group relative w-full p-6 text-left rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 hover:border-teal-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-900/20"
                                >
                                    <div className="flex items-center justify-between relative z-10">
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">
                                                {LEVELS[level].name}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">
                                                {LEVELS[level].grid}x{LEVELS[level].grid} Grid • {LEVELS[level].time}s Limit
                                            </p>
                                        </div>
                                        <div className="p-2 rounded-full bg-white/5 group-hover:bg-teal-500/20 transition-colors">
                                            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-teal-400 rotate-180 transition-transform" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {gameState === 'loading' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                        <p className="text-slate-400 animate-pulse">Shuffling tiles...</p>
                    </div>
                )}

                {gameState === 'playing' && species && (
                    <div className="w-full max-w-lg aspect-square bg-slate-900 p-2 rounded-xl border border-white/10 shadow-2xl">
                        <div
                            className="grid h-full w-full gap-1"
                            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
                        >
                            {tiles.map((tile, index) => (
                                <button
                                    key={tile.id}
                                    onClick={() => handleTileClick(index)}
                                    disabled={tile.isEmpty}
                                    className={cn(
                                        "relative w-full h-full rounded-md transition-all duration-200 overflow-hidden",
                                        tile.isEmpty ? "invisible" : "hover:brightness-110 active:scale-95"
                                    )}
                                    style={getBackgroundStyle(tile)}
                                >
                                    {/* Number hint for easier play? Optional. Keeping clean for now. */}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {gameState === 'game_over' && species && (
                    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 animate-in fade-in duration-500">
                        <div className="w-full max-w-2xl text-center space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-sm font-bold tracking-widest text-teal-500 uppercase">Puzzle Solved!</h2>
                                <h1 className="text-5xl md:text-6xl font-black text-white">
                                    {score > 0 ? "Excellent Work!" : "Time's Up!"}
                                </h1>
                            </div>

                            <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md mx-auto relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/90 z-10 pointer-events-none" />
                                <img
                                    src={species.imageKey}
                                    alt={species.commonName}
                                    className="w-full h-64 object-cover rounded-xl mb-6 group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="relative z-20 text-left">
                                    <h3 className="text-2xl font-bold text-white mb-1">{species.commonName}</h3>
                                    <p className="text-teal-400 font-mono text-sm mb-4">{species.scientificName}</p>
                                    <p className="text-slate-300 text-sm leading-relaxed">{species.description}</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button
                                    size="lg"
                                    onClick={() => setGameState('menu')}
                                    className="min-w-[200px] bg-white text-slate-950 hover:bg-slate-200"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Play Again
                                </Button>
                                <Link href="/play">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="min-w-[200px] border-white/10 hover:bg-white/5 text-slate-400 hover:text-white"
                                    >
                                        Back to Menu
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div >
    );
}
