"use client";

export function BackgroundAnimation() {
    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
            <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-secondary/30 blur-[100px] animate-pulse delay-700" />
            <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] rounded-full bg-accent/10 blur-[140px] animate-pulse delay-1000" />
        </div>
    );
}
