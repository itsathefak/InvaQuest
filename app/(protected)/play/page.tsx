import { GameCard } from "@/components/play/GameCard";

export default function PlayPage() {
    return (
        <div
            className="relative h-[calc(100vh-4rem)] w-full overflow-hidden"
            style={{
                backgroundImage: 'var(--image-gradient-mesh)',
                backgroundAttachment: 'fixed'
            }}
        >
            <div className="container relative z-10 mx-auto px-4 py-8 md:px-8 md:py-12 h-full flex flex-col gap-8">
                {/* Header */}
                <div className="flex-none space-y-2">
                    <h1 className="text-4xl font-bold text-white tracking-tight">Choose Your Game Mode</h1>
                    <p className="text-slate-400 text-lg">Learn, explore, and compete while protecting Canada&apos;s ecosystems.</p>
                </div>

                {/* Grid */}
                <div className="flex-1 min-h-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full pb-4">
                        {/* 1. Quiz */}
                        <GameCard
                            title="Invasive Species Quiz"
                            description="Test your knowledge with 3 difficulty levels, from basics to expert."
                            href="/play/quiz"
                            imageUrl="/images/play/quiz-card.png"
                            delay={100}
                            hideText={true}
                        />

                        {/* 2. GeoGuesser */}
                        <GameCard
                            title="Invasive GeoGuesser"
                            description="Look at real-world scenes and pinpoint where invasive species were found."
                            href="/play/geoguesser"
                            imageUrl="/images/play/geoguesser-card.png"
                            delay={200}
                            hideText={true}
                        />

                        {/* 3. Identify */}
                        <GameCard
                            title="Identify the Invader"
                            description="Choose which plant or animal in the photo is the invasive one."
                            href="/play/identify-invader"
                            imageUrl="/images/play/identify-card.png"
                            delay={300}
                            hideText={true}
                        />

                        {/* 4. Puzzle */}
                        <GameCard
                            title="Invasive Puzzle"
                            description="Unscramble sliding tiles to reveal and identify invasive species."
                            href="/play/puzzle"
                            imageUrl="/images/play/scavenger-card.jpg"
                            delay={400}
                            hideText={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
