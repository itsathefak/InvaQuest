"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { IdentifyChallenge, getIdentifyChallenges } from "@/lib/actions/game-actions";
import { Loader2, Timer, AlertTriangle, ArrowRight, RefreshCcw, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti"; // Assumed available or will degrade gracefully if not installed, but usually requires install. I'll skip actual import if not sure, but visual effects can be done with CSS.
// Actually, I'll stick to CSS effects to avoid dependency issues for now.

type GameState = 'menu' | 'loading' | 'playing' | 'round_result' | 'game_over';
type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG = {
    easy: { time: 20, label: "Easy", color: "text-green-400 border-green-400/30 bg-green-400/10" },
    medium: { time: 10, label: "Medium", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" },
    hard: { time: 5, label: "Hard", color: "text-red-400 border-red-400/30 bg-red-400/10" }
};

export default function IdentifyPage() {
    const [gameState, setGameState] = React.useState<GameState>('menu');
    const [difficulty, setDifficulty] = React.useState<Difficulty>('easy');
    const [challenges, setChallenges] = React.useState<IdentifyChallenge[]>([]);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [timeLeft, setTimeLeft] = React.useState(0);

    // Round State
    const [selectedChoiceId, setSelectedChoiceId] = React.useState<string | null>(null);
    const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
    const [roundScore, setRoundScore] = React.useState(0);

    // Game Stats
    const [totalScore, setTotalScore] = React.useState(0);
    const [roundHistory, setRoundHistory] = React.useState<{ score: number, correct: boolean }[]>([]);

    const currentChallenge = challenges[currentIndex];

    // Timer
    React.useEffect(() => {
        if (gameState !== 'playing') return;

        if (timeLeft <= 0) {
            handleTimeUp();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((p) => p - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, timeLeft]);

    const startGame = async (diff: Difficulty) => {
        setDifficulty(diff);
        setGameState('loading');
        try {
            const data = await getIdentifyChallenges(10);
            if (data && data.length > 0) {
                setChallenges(data);
                setCurrentIndex(0);
                setTotalScore(0);
                setRoundHistory([]);
                startNewRound(diff);
            } else {
                alert("Not enough species data.");
                setGameState('menu');
            }
        } catch (e) {
            console.error(e);
            setGameState('menu');
        }
    };

    const startNewRound = (diff: Difficulty) => {
        setSelectedChoiceId(null);
        setIsCorrect(null);
        setRoundScore(0);
        setTimeLeft(DIFFICULTY_CONFIG[diff].time);
        setGameState('playing');
    };

    const handleChoice = (choiceId: string, isCorrectChoice: boolean) => {
        if (selectedChoiceId) return; // Prevent double click

        setSelectedChoiceId(choiceId);
        setIsCorrect(isCorrectChoice);

        // Scoring: Base 1000 * (TimeLeft / TotalTime)
        // Only if correct
        let score = 0;
        if (isCorrectChoice) {
            const maxTime = DIFFICULTY_CONFIG[difficulty].time;
            const timeFactor = Math.max(0.1, timeLeft / maxTime);
            score = Math.round(1000 * timeFactor);
        }

        setRoundScore(score);
        setTotalScore(p => p + score);
        setRoundHistory(prev => [...prev, { score, correct: isCorrectChoice }]);
        setGameState('round_result');
    };

    const handleTimeUp = () => {
        if (selectedChoiceId) return;
        setSelectedChoiceId("TIMEOUT");
        setIsCorrect(false);
        setRoundScore(0);
        setRoundHistory(prev => [...prev, { score: 0, correct: false }]);
        setGameState('round_result');
    };

    const handleNext = () => {
        if (currentIndex < challenges.length - 1) {
            setCurrentIndex(p => p + 1);
            startNewRound(difficulty);
        } else {
            setGameState('game_over');
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden relative font-sans selection:bg-rose-500/30">
            {/* --- HEADER --- */}
            {gameState !== 'game_over' && (
                <header className="h-16 border-b border-white/5 bg-slate-900/30 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-20">
                    <div className="flex items-center gap-6">
                        <h1 className="font-black text-xl tracking-tight bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
                            Identify Invader
                        </h1>
                        {gameState !== 'menu' && (
                            <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-slate-400">
                                Round {currentIndex + 1}/{challenges.length}
                            </span>
                        )}
                    </div>

                    {gameState === 'playing' && (
                        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                            <div className={cn("px-6 py-2 rounded-full border border-white/10 bg-white/5 font-mono text-xl font-bold transition-all",
                                timeLeft <= 5 ? "text-red-400 border-red-500/30 bg-red-500/10 scale-110 animate-pulse" : "text-white"
                            )}>
                                {timeLeft}s
                            </div>
                        </div>
                    )}

                    <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total Score</p>
                        <p className="font-mono text-xl font-bold text-rose-400 leading-none">{totalScore.toLocaleString()}</p>
                    </div>
                </header>
            )}

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 relative flex items-center justify-center p-6">

                {/* MENU */}
                {gameState === 'menu' && (
                    <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="text-center space-y-2">
                            <div className="mx-auto w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-4 -rotate-3">
                                <AlertTriangle className="w-8 h-8 text-rose-400" />
                            </div>
                            <h2 className="text-4xl font-black tracking-tight text-white mb-2">
                                <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">Identify Invader</span>
                            </h2>
                            <p className="text-slate-400">Spot the invasive species correctly before time runs out.</p>
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
                )}

                {/* LOADING */}
                {gameState === 'loading' && <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />}

                {/* GAMEPLAY */}
                {(gameState === 'playing' || gameState === 'round_result') && currentChallenge && (
                    <div className="w-full max-w-5xl h-full flex flex-col md:flex-row gap-8">

                        {/* Image Section */}
                        <div className="flex-1 rounded-3xl overflow-hidden relative shadow-2xl bg-black border border-white/10 group">
                            <img
                                src={currentChallenge.imageUrl}
                                alt="Species"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                            {/* Overlay Result */}
                            {gameState === 'round_result' && (
                                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6 animate-in fade-in duration-300">
                                    {isCorrect ? (
                                        <CheckCircle2 className="w-24 h-24 text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)] animate-in zoom-in spin-in-12 duration-500" />
                                    ) : (
                                        <XCircle className="w-24 h-24 text-red-400 drop-shadow-[0_0_20px_rgba(248,113,113,0.5)] animate-in zoom-in duration-300" />
                                    )}

                                    <div className="text-center">
                                        <h3 className={cn("text-3xl font-black mb-1", isCorrect ? "text-green-400" : "text-red-400")}>
                                            {isCorrect ? "Correct!" : "Time's Up / Wrong!"}
                                        </h3>
                                        <p className="text-slate-400 text-lg">It was <span className="text-white font-bold">{currentChallenge.commonName}</span></p>
                                        {isCorrect && <p className="text-xl font-mono text-rose-400 mt-2">+{roundScore} pts</p>}
                                    </div>

                                    <Button onClick={handleNext} size="lg" className="h-14 px-8 text-lg bg-white text-black hover:bg-slate-200">
                                        Next Challenge <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Options Section */}
                        <div className="w-full md:w-[320px] shrink-0 flex flex-col gap-3 justify-center">
                            <div className="mb-2">
                                <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">Select Species</h3>
                                <div className="h-1 w-12 bg-rose-500 rounded-full" />
                            </div>

                            {currentChallenge.choices.map((choice) => {
                                // Determine styling based on state
                                let btnStyle = "bg-slate-900 border-white/10 hover:bg-slate-800 text-slate-200";

                                if (gameState === 'round_result') {
                                    if (choice.isCorrect) btnStyle = "bg-green-500/20 border-green-500 text-green-400"; // Always show correct answer
                                    else if (selectedChoiceId === choice.id && !choice.isCorrect) btnStyle = "bg-red-500/20 border-red-500 text-red-400"; // Show wrong selection
                                    else btnStyle = "opacity-30 bg-slate-900 border-transparent"; // Dim others
                                }

                                return (
                                    <button
                                        key={choice.id}
                                        disabled={gameState !== 'playing'}
                                        onClick={() => handleChoice(choice.id, choice.isCorrect)}
                                        className={cn(
                                            "w-full p-4 rounded-xl border text-left font-bold transition-all duration-200 relative overflow-hidden group",
                                            btnStyle,
                                            gameState === 'playing' && "hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] active:scale-[0.98]"
                                        )}
                                    >
                                        {choice.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* GAME OVER */}
                {gameState === 'game_over' && (
                    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4" style={{ backgroundImage: 'var(--image-gradient-mesh)', backgroundAttachment: 'fixed', backgroundSize: 'cover' }}>
                        <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center p-12 text-center animate-in zoom-in-95 fade-in duration-300">
                            <div className="mb-6 relative">
                                <div className="absolute inset-0 bg-rose-500 blur-3xl opacity-20 rounded-full"></div>
                                <Trophy className="w-24 h-24 text-yellow-400 relative z-10 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]" />
                            </div>

                            <h2 className="text-4xl font-black text-white mb-2">Quiz Complete!</h2>
                            <p className="text-slate-400 mb-8 max-w-md mx-auto">You've tested your knowledge against the invasive species database.</p>

                            <div className="bg-slate-950 p-6 rounded-2xl border border-white/10 w-full mb-8">
                                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">Final Score</p>
                                <p className="text-5xl font-mono font-black text-rose-400 mb-4">{totalScore.toLocaleString()}</p>

                                <div className="flex justify-center gap-1 h-3 rounded-full overflow-hidden bg-slate-900">
                                    {roundHistory.map((r, i) => (
                                        <div key={i} className={cn("flex-1", r.correct ? "bg-green-500" : "bg-red-500")} />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 mt-2 font-mono">Accuracy: {roundHistory.filter(r => r.correct).length}/10</p>
                            </div>

                            <Button
                                onClick={() => setGameState('menu')}
                                size="lg"
                                className="w-full h-14 bg-white text-black hover:bg-slate-200 font-bold text-lg"
                            >
                                <RefreshCcw className="w-5 h-5 mr-2" /> Play Again
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

