'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { initStore, INITIAL_AGENTS } from '@/lib/store';
import { 
  Terminal, 
  ScanLine, 
  ShieldAlert, 
  Radio, 
  Cpu, 
  Users, 
  Sparkles, 
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  AlertTriangle,
  Eye,
  Activity,
  Layers
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    initStore();
  }, []);

  const handleLaunchAgent = (agentId: string) => {
    const demo = INITIAL_AGENTS.find((a) => a.agent_id === agentId);
    if (demo) {
      localStorage.setItem('ieee_agent_id', demo.agent_id);
      localStorage.setItem('ieee_agent_token', demo.token);
      router.push(`/play?agent_id=${demo.agent_id}&token=${demo.token}`);
    }
  };

  return (
    <div className="min-h-screen bg-proto-obsidian text-proto-text flex flex-col justify-between scanlines selection:bg-proto-signal selection:text-proto-obsidian">
      {/* Top Banner: NIT Warangal IEEE Student Branch */}
      <header className="w-full bg-proto-base/90 backdrop-blur-md border-b border-proto-surface1 px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-proto-surface0 border border-proto-signal/40 flex items-center justify-center text-proto-signal shadow-[0_0_12px_rgba(0,255,136,0.25)]">
              {/* Cog / IEEE Student Branch Symbol */}
              <div className="font-mono-cyber font-black text-xs tracking-tighter">NITW</div>
            </div>
            <div>
              <div className="font-mono-cyber font-black text-xs tracking-wider text-proto-text uppercase flex items-center gap-2">
                NIT WARANGAL
                <span className="text-[10px] text-proto-signal border border-proto-signal/40 px-1.5 py-0.2 rounded font-normal">
                  IEEE STUDENT BRANCH
                </span>
              </div>
              <div className="text-[10px] font-mono-cyber text-proto-subtext tracking-widest uppercase">
                CONFIDENTIAL // LEVEL 01
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/leaderboard"
              className="px-3.5 py-1.5 rounded-lg bg-proto-surface0 hover:bg-proto-surface1 text-proto-gold hover:text-proto-gold text-xs font-mono-cyber transition-all border border-proto-gold/40 flex items-center gap-1.5 shadow-[0_0_8px_rgba(255,190,59,0.15)]"
            >
              <Trophy className="w-3.5 h-3.5 text-proto-gold" />
              <span>Leaderboard</span>
            </Link>
            <Link
              href="/admin"
              className="px-3.5 py-1.5 rounded-lg bg-proto-surface0 hover:bg-proto-surface1 text-proto-subtext hover:text-proto-text text-xs font-mono-cyber transition-all border border-proto-surface1 flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-proto-system" />
              <span className="hidden sm:inline">Operations</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero & Fortress Poster Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex-1 flex flex-col items-center text-center justify-center space-y-7">
        
        {/* Pillar Header / Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-proto-surface0/90 border border-proto-signal/40 text-proto-signal text-xs font-mono-cyber shadow-sm">
          <span className="w-2 h-2 rounded-full bg-proto-signal animate-ping" />
          <span>LEARN • BUILD • CREATE • TOGETHER</span>
        </div>

        {/* Poster Epic Title: THE PROTOCOL */}
        <div className="space-y-3 max-w-3xl">
          <div className="text-xs sm:text-sm font-mono-cyber font-black tracking-[0.35em] text-proto-subtext uppercase">
            AN INTERACTIVE MYSTERY WHERE EVERY PLAYER HAS A ROLE
          </div>

          <h1 className="text-5xl sm:text-7xl font-black font-mono-cyber tracking-tight text-proto-text drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            THE{' '}
            <span className="bg-gradient-to-b from-[#ffeaa7] via-[#fdcb6e] to-[#e17055] bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(253,203,110,0.4)]">
              PROTOCOL
            </span>
          </h1>

          {/* Wooden / Stone Inscription Plaque */}
          <div className="inline-block px-6 py-2 rounded-xl bg-gradient-to-r from-[#2d2219] via-[#433422] to-[#2d2219] border-2 border-[#8c6d48] text-[#f5e6cb] font-mono-cyber font-black text-xs sm:text-sm tracking-[0.2em] shadow-xl uppercase">
            ENTER. INVESTIGATE. DECIDE.
          </div>
        </div>

        {/* The 5 Glowing Domains from the Poster */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 max-w-2xl py-2">
          <div className="px-3.5 py-1.5 rounded-lg bg-proto-base border border-proto-logic text-proto-logic text-xs font-mono-cyber font-bold flex items-center gap-2 shadow-[0_0_12px_rgba(0,210,255,0.25)]">
            <Layers className="w-3.5 h-3.5" /> LOGIC
          </div>
          <div className="px-3.5 py-1.5 rounded-lg bg-proto-base border border-proto-signal text-proto-signal text-xs font-mono-cyber font-bold flex items-center gap-2 shadow-[0_0_12px_rgba(0,255,136,0.25)]">
            <Activity className="w-3.5 h-3.5" /> SIGNAL
          </div>
          <div className="px-3.5 py-1.5 rounded-lg bg-proto-base border border-proto-obs text-proto-obs text-xs font-mono-cyber font-bold flex items-center gap-2 shadow-[0_0_12px_rgba(191,85,236,0.25)]">
            <Eye className="w-3.5 h-3.5" /> OBSERVATION
          </div>
          <div className="px-3.5 py-1.5 rounded-lg bg-proto-base border border-proto-system text-proto-system text-xs font-mono-cyber font-bold flex items-center gap-2 shadow-[0_0_12px_rgba(255,119,0,0.25)]">
            <Cpu className="w-3.5 h-3.5" /> SYSTEM
          </div>
          <div className="px-3.5 py-1.5 rounded-lg bg-proto-base border border-proto-social text-proto-social text-xs font-mono-cyber font-bold flex items-center gap-2 shadow-[0_0_12px_rgba(0,240,255,0.25)]">
            <Users className="w-3.5 h-3.5" /> SOCIAL
          </div>
        </div>

        {/* Central Glowing Beacon & Recovered Status Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
          {/* Central Beacon */}
          <div className="p-3.5 rounded-xl bg-proto-base/90 border-2 border-proto-system glow-system flex items-center justify-center gap-3 font-mono-cyber text-center">
            <div>
              <div className="text-xs font-black text-proto-system tracking-wider animate-pulse">
                PROTOCOL ACTIVE
              </div>
              <div className="text-xs text-proto-text mt-0.5">
                247 AGENTS DETECTED
              </div>
            </div>
          </div>

          {/* Recovered Fragments Widget */}
          <div className="p-3.5 rounded-xl bg-proto-base/90 border-2 border-proto-logic glow-logic flex flex-col justify-center text-left font-mono-cyber">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-proto-logic font-bold">RECOVERED: 07 / 15</span>
              <span className="text-[10px] text-proto-subtext">TELEMETRY</span>
            </div>
            {/* Segmented Cyan Bars */}
            <div className="h-3 w-full bg-proto-obsidian rounded-sm overflow-hidden p-0.5 border border-proto-logic/40">
              <div className="h-full w-[47%] progress-segments shadow-[0_0_10px_#00d2ff]" />
            </div>
          </div>
        </div>

        {/* Claude Pro Prize Banner */}
        <div className="w-full max-w-xl p-4 rounded-2xl bg-gradient-to-r from-proto-base via-proto-surface0 to-proto-base border-2 border-proto-gold glow-gold flex items-center justify-between gap-4 font-mono-cyber">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-xl bg-proto-gold/20 text-proto-gold">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-proto-gold uppercase tracking-widest block font-bold">
                WINNER GETS
              </span>
              <span className="text-lg font-black text-proto-text tracking-wide flex items-center gap-2">
                Claude Pro
                <span className="text-xs text-proto-subtext font-normal uppercase">
                  Subscription
                </span>
              </span>
            </div>
          </div>
          <div className="hidden sm:block text-right text-[11px] text-proto-subtext">
            IDEAS.<br />INVESTIGATE FURTHER.
          </div>
        </div>

        {/* Warning Banner: TRUST NO ONE */}
        <div className="w-full max-w-xl p-3.5 rounded-xl bg-proto-base border-2 border-proto-crimson glow-crimson flex items-center justify-center gap-3 text-center font-mono-cyber">
          <AlertTriangle className="w-5 h-5 text-proto-crimson shrink-0 animate-pulse" />
          <div className="text-xs">
            <span className="font-black text-proto-crimson tracking-wider mr-2">
              TRUST NO ONE.
            </span>
            <span className="text-proto-text/90">
              Some agents have other objectives.
            </span>
          </div>
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-md justify-center pt-2">
          <Link
            href="/play"
            className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-proto-logic to-proto-signal text-proto-obsidian font-black font-mono-cyber text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] flex items-center justify-center gap-2"
          >
            <span>ENTER PROTOCOL</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/scan-to-enter"
            className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-xl bg-proto-surface0 border border-proto-surface2 text-proto-text font-bold font-mono-cyber text-xs uppercase tracking-wider hover:bg-proto-surface1 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <ScanLine className="w-4 h-4 text-proto-signal" />
            <span>SCAN BADGE</span>
          </Link>
        </div>

        {/* Event Date, Time & Venue Bar */}
        <div className="w-full max-w-2xl p-3 rounded-xl bg-proto-surface0/70 border border-proto-surface1 flex flex-wrap items-center justify-around gap-4 text-xs font-mono-cyber text-proto-subtext">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-proto-logic" />
            <span>DATE: <strong className="text-proto-text">24th Sep</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-proto-signal" />
            <span>TIME: <strong className="text-proto-text">[TIME TBD]</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-proto-obs" />
            <span>VENUE: <strong className="text-proto-text">NIT Warangal Campus</strong></span>
          </div>
        </div>

        {/* Instant Demo Operatives Switcher */}
        <div className="w-full max-w-3xl pt-4 border-t border-proto-surface0 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono-cyber text-proto-subtext">
            <span>NO PRIOR EXPERIENCE REQUIRED • ALL YEARS • ALL BRANCHES • SOLO FRIENDLY</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {INITIAL_AGENTS.map((demo) => {
              const borderColors: Record<string, string> = {
                LOGIC: 'border-proto-logic text-proto-logic',
                SIGNAL: 'border-proto-signal text-proto-signal',
                OBSERVATION: 'border-proto-obs text-proto-obs',
                SYSTEM: 'border-proto-system text-proto-system',
                SOCIAL: 'border-proto-social text-proto-social',
              };
              return (
                <button
                  key={demo.agent_id}
                  onClick={() => handleLaunchAgent(demo.agent_id)}
                  className={`p-3 rounded-xl bg-proto-base border text-left transition-all hover:-translate-y-1 shadow-lg ${
                    borderColors[demo.archetype] || 'border-proto-surface1'
                  }`}
                >
                  <div className="font-mono-cyber text-xs font-bold text-proto-text truncate">
                    {demo.name}
                  </div>
                  <div className="text-[10px] font-mono-cyber font-bold opacity-90 mt-0.5">
                    [{demo.archetype}]
                  </div>
                  <div className="text-[10px] font-mono-cyber text-proto-subtext mt-1">
                    {demo.score} PTS
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer with Poster Slogans */}
      <footer className="w-full bg-proto-base border-t border-proto-surface0 px-6 py-4 text-center text-xs font-mono-cyber text-proto-subtext flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto gap-2">
        <div className="text-left">
          <span className="text-proto-text font-bold block">
            EVERYONE HAS A ROLE. NOT EVERYONE HAS THE SAME OBJECTIVE.
          </span>
          <span className="text-[11px] opacity-75">
            NIT Warangal IEEE Student Branch // The Protocol
          </span>
        </div>
        <div className="text-right text-[11px] text-proto-subtext">
          <span>COME FOR THE GAME.</span><br />
          <span className="text-proto-signal font-bold">STAY FOR WHAT YOU DISCOVER.</span>
        </div>
      </footer>
    </div>
  );
}
