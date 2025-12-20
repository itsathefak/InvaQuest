import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import uiText from "@/data/ui-text.json";
import { createClient } from "@/lib/supabase/server";
import { UserNav } from "@/components/layout/UserNav";

export default async function Home() {
  const { hero, regionDisclaimer } = uiText.landing;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Navbar Stub - In real app, use TopNav */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 h-20 flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="h-10 w-32 relative">
          <Logo className="h-full w-full" />
        </div>
        <div className="flex gap-4 items-center">
          {user ? (
            <UserNav user={user} />
          ) : (
            <>
              <Link href="/auth/login"><Button variant="ghost" className="text-white hover:bg-white/10">Log in</Button></Link>
              <Link href="/auth/register"><Button className="bg-primary hover:bg-primary/90 text-white">Sign Up</Button></Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative min-h-[110vh] flex flex-col items-center pt-20 text-center overflow-hidden pb-40">
          {/* Background Image */}
          <div className="absolute inset-0 z-0 h-[100vh]">
            <Image
              src="/background-v2.jpg"
              alt="Background"
              fill
              className="object-cover"
              quality={100}
              priority
            />
            {/* Smooth transition to dark */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-slate-950" />
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-slate-950 to-transparent" />
          </div>

          <div className="container relative z-10 mx-auto max-w-6xl px-6 pt-20 md:pt-32">
            {/* WatGuessr Style Hero Text */}
            <div className="text-left md:pl-10 mb-10">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-yellow-400 mb-4 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] uppercase">
                {hero.title}
              </h1>
              <p className="text-lg md:text-2xl text-slate-100 mb-8 font-bold italic tracking-wide text-shadow-md max-w-2xl text-white/90">
                {hero.subtitle}
              </p>
              {/* Decorative Line */}
              <div className="h-1.5 w-32 bg-gradient-to-r from-yellow-400 via-yellow-200 to-transparent rounded-full mb-12 shadow-[0_0_15px_rgba(250,204,21,0.4)]" />

              {/* Label above buttons */}
              <p className="text-xs md:text-sm font-black tracking-[0.25em] text-yellow-400/90 uppercase mb-6 ml-1 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-yellow-400/50 inline-block rounded-full"></span>
                Start Your Journey
              </p>

              {/* Slanted Hero Buttons - Refined & "Pretty" */}
              <div className="flex flex-col md:flex-row items-stretch gap-4 w-full">
                {uiText.landing.heroButtons.map((btn, i) => (
                  <Link
                    key={btn.title}
                    href={user ? btn.href : "/auth/login"}
                    className={`
                      group relative flex-1 min-h-[140px] md:min-h-[180px] overflow-hidden rounded-2xl border border-white/10
                      md:-skew-x-6 transform transition-all duration-500 hover:flex-[1.2] hover:z-20 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]
                      shadow-2xl bg-slate-900/60 backdrop-blur-md
                    `}
                  >
                    {/* Background Gradient - Elegant & Soft */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${btn.color} opacity-80 group-hover:opacity-100 transition-opacity duration-500`} />

                    {/* Glass Shine */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 opacity-60" />
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-25 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000" />

                    {/* Content - Unskewed */}
                    <div className="relative h-full w-full flex flex-col justify-center items-start pl-8 md:pl-10 text-white md:skew-x-6 py-6 transition-all">
                      <h3 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight drop-shadow-md mb-3 leading-none group-hover:scale-105 transition-transform origin-left">
                        {btn.title}
                      </h3>
                      <p className="text-xs font-medium opacity-90 leading-relaxed text-slate-100 border-l-2 border-yellow-400/50 pl-3 max-w-[90%]">
                        {btn.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <p className="mt-8 text-xs text-slate-400/60 font-medium pl-10 md:pl-12 flex items-center gap-2 mb-20">
              {regionDisclaimer} 🇨🇦
            </p>

            {/* Game Showcase - Overlapping Transition */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-30 mt-10">
              {uiText.landing.gameShowcase.map((game, i) => (
                <Link
                  key={i}
                  href={user ? game.href : `/auth/login?next=${encodeURIComponent(game.href)}`}
                  className="group relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/20 border border-white/10 hover:border-white/30"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <Image
                      src={game.image}
                      alt={game.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Gradient Overlays for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent opacity-90" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-30 mix-blend-overlay transition-opacity duration-500`} />
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end items-start text-left">
                    <div className="mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-2xl font-black text-white uppercase tracking-wide drop-shadow-md group-hover:text-yellow-400 transition-colors">
                        {game.title}
                      </h3>
                      <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${game.color} mt-2 mb-3`} />
                    </div>

                    <p className="text-slate-300 text-sm font-medium leading-relaxed opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                      {game.description}
                    </p>
                  </div>

                  {/* Play Button Indicator */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all group-hover:scale-110">
                    <span className="text-xl">▶</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        {/* Features */}
        <section className="py-20 px-6 bg-slate-950 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute -left-40 top-20 w-80 h-80 bg-primary/20 blur-[100px] rounded-full" />
          <div className="absolute -right-40 bottom-20 w-80 h-80 bg-teal-500/10 blur-[100px] rounded-full" />

          {/* Goose Mascot - Pinned to Right Edge */}
          <div className="absolute top-40 right-0 w-[180px] h-[120px] md:w-[350px] md:h-[230px] opacity-90 pointer-events-none z-0">
            <Image
              src="/mascot-goose.png"
              alt="Mascot"
              fill
              className="object-contain object-right"
            />
          </div>

          {/* Mussel Mascot - Pinned to Left Edge */}
          <div className="absolute top-[450px] left-0 w-[150px] h-[120px] md:w-[300px] md:h-[250px] opacity-90 pointer-events-none z-0">
            <Image
              src="/mascot-mussel.png"
              alt="Mussel Mascot"
              fill
              className="object-contain object-left"
            />
          </div>


          <div className="container mx-auto relative z-10">
            {/* Top Players Section */}
            <div className="mb-32 text-center relative">
              <div className="inline-block relative">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-wide uppercase relative z-10">Top Players This Week</h2>
              </div>
              <p className="text-slate-400 mb-12">Compete with other conservationists across Canada</p>

              <div className="flex flex-wrap justify-center gap-6 mb-12">
                {[
                  { rank: 1, name: "EcoGuardian", points: 2450, badge: "🥇" },
                  { rank: 2, name: "TreeHugger99", points: 2120, badge: "🥈" },
                  { rank: 3, name: "BioBlitzKing", points: 1980, badge: "🥉" },
                  { rank: 4, name: "NatureScout", points: 1850 },
                  { rank: 5, name: "GreenWarrior", points: 1720 }
                ].map((player) => (
                  <div key={player.rank} className="glass group relative flex flex-col items-center justify-center w-48 p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(6,147,136,0.2)]">
                    {player.rank <= 3 && (
                      <div className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 border border-white/10 shadow-lg text-lg animate-bounce">
                        {player.badge}
                      </div>
                    )}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 mb-4 flex items-center justify-center text-xl font-bold text-white border-2 border-white/10 group-hover:border-primary/50 transition-colors">
                      {player.name.substring(0, 1)}
                    </div>
                    <div className="text-3xl font-black text-white mb-1 flex items-baseline gap-1">
                      <span className="text-lg text-slate-500">#</span>{player.rank}
                    </div>
                    <h3 className="font-bold text-slate-200 text-sm truncate w-full mb-1">{player.name}</h3>
                    <p className="text-primary font-mono font-bold text-sm">{player.points} pts</p>
                  </div>
                ))}
              </div>

              <Link href="/leaderboard">
                <Button variant="outline" className="rounded-full px-8 border-primary/50 text-white bg-primary/10 hover:bg-primary/20 hover:border-primary transition-all uppercase tracking-widest text-xs font-bold py-6">
                  View Full Leaderboard
                </Button>
              </Link>
            </div>


            {/* Testimonials Section */}
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-16 tracking-wide uppercase">What Students Are Saying</h2>

              <div className="grid md:grid-cols-3 gap-8 text-left">
                {[
                  { quote: "I thought I knew my local parks, but InvaQuest showed me how much hidden biodiversity is right under my nose.", author: "Sarah M.", role: "Biology Student '25" },
                  { quote: "Finally a way to make hiking competitive! I've logged over 50 invasive species properly thanks to this app.", author: "James T.", role: "Environmental Sci '26" },
                  { quote: "The community features keep me coming back. Seeing my name on the leaderboard is surprisingly addictive.", author: "Priya K.", role: "Geography '24" }
                ].map((t, i) => (
                  <div key={i} className="glass p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors relative">
                    <div className="text-6xl absolute -top-4 left-6 text-primary/20 font-serif">"</div>
                    <p className="text-slate-300 mb-6 italic relative z-10 leading-relaxed min-h-[80px]">
                      {t.quote}
                    </p>
                    <div>
                      <h4 className="text-white font-bold uppercase text-sm tracking-wider">{t.author}</h4>
                      <p className="text-slate-500 text-xs font-medium mt-1">{t.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-sm text-slate-500 border-t border-white/5 bg-slate-950 z-10 relative">
        &copy; {new Date().getFullYear()} InvaQuest. Built for Canadian Ecosystems.
      </footer>
    </div>
  );
}
