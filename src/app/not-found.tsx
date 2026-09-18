import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Terminal, Radio } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#070b09] text-[#eaf2ec] flex flex-col justify-between p-4 sm:p-6 font-mono-cyber selection:bg-proto-signal selection:text-[#070b09] scanlines relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-proto-crimson/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-proto-logic/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between pt-4 pb-2 z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121b15] border border-[#203226] text-[10px] text-proto-crimson font-bold tracking-widest uppercase">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>NETWORK EXCEPTION</span>
        </div>
        <span className="text-[10px] text-[#55695c]">ERROR CODE: 404</span>
      </header>

      {/* Main 404 Card */}
      <main className="max-w-md w-full mx-auto my-auto z-10">
        <div className="bg-[#0f1712]/95 backdrop-blur-xl border border-[#203226] hover:border-proto-crimson/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6 text-center transition-all">
          
          <div className="w-16 h-16 rounded-2xl bg-[#1a1214] border border-proto-crimson/40 flex items-center justify-center mx-auto text-proto-crimson shadow-[0_0_25px_rgba(255,51,68,0.2)]">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-wider text-[#f3f7f4] uppercase">
              NODE NOT FOUND
            </h1>
            <p className="text-xs text-[#8ea897] font-sans leading-relaxed">
              The requested coordinate does not exist or has been severed by security countermeasures.
            </p>
          </div>

          <div className="p-3 bg-[#070b09] border border-[#203226] rounded-xl text-[11px] text-[#8ea897] flex items-center justify-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-proto-signal shrink-0" />
            <span className="truncate">COORDINATE_SEVERED // RE-ROUTE TRAFFIC</span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 px-4 py-3 bg-proto-signal text-[#070b09] font-bold text-xs rounded-xl uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Home Hub</span>
            </Link>
            <Link
              href="/leaderboard"
              className="px-4 py-3 bg-[#121b15] border border-[#203226] text-[#eaf2ec] hover:border-proto-signal/40 font-bold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center"
            >
              Leaderboard
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-[10px] text-[#55695c] z-10">
        NIT WARANGAL • IEEE STUDENT BRANCH • THE PROTOCOL
      </footer>
    </div>
  );
}
