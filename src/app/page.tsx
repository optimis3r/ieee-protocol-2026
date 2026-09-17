'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { initStore, INITIAL_AGENTS } from '@/lib/store';
import { 
  Terminal, 
  ScanLine, 
  ShieldCheck, 
  Radio, 
  Cpu, 
  Users, 
  FileText, 
  ArrowRight,
  Sparkles,
  Lock
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
    <div className="min-h-screen bg-cat-mantle text-cat-text flex flex-col justify-between scanlines">
      {/* Top Navbar */}
      <nav className="w-full bg-cat-crust/90 backdrop-blur-md border-b border-cat-surface0 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cat-surface0 text-cat-sapphire border border-cat-surface1">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono-cyber font-bold text-sm tracking-wider text-cat-text block">
                IEEE PROTOCOL // ARG
              </span>
              <span className="text-[10px] font-mono-cyber text-cat-subtext">
                THE NETWORK PWA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-lg bg-cat-surface0 hover:bg-cat-surface1 text-cat-subtext hover:text-cat-text text-xs font-mono-cyber transition-colors border border-cat-surface1 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cat-green" />
              <span className="hidden sm:inline">Operations Desk</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 flex-1 flex flex-col items-center text-center justify-center space-y-8">
        {/* Top telemetry tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cat-surface0 border border-cat-surface1 text-cat-sapphire text-xs font-mono-cyber">
          <span className="w-2 h-2 rounded-full bg-cat-green animate-pulse" />
          <span>INTERACTIVE CYBERNETIC ARG EVENT</span>
        </div>

        {/* Title */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-extrabold font-mono-cyber tracking-tight text-cat-text">
            IEEE PROTOCOL: <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-cat-sapphire via-cat-mauve to-cat-green bg-clip-text text-transparent">
              THE NETWORK
            </span>
          </h1>
          <p className="text-base sm:text-lg text-cat-subtext font-mono-cyber italic">
            &ldquo;Everyone knows something, but no one knows everything.&rdquo;
          </p>
          <p className="text-xs sm:text-sm text-cat-subtext max-w-2xl mx-auto leading-relaxed font-sans">
            Operatives explore physical sensor checkpoints and digital node terminals, exchange asymmetric intelligence fragments, trigger multi-agent handshakes, and deduce the core autonomic network topology.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md justify-center">
          <Link
            href="/play"
            className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-xl bg-cat-sapphire text-cat-crust font-bold font-mono-cyber text-xs uppercase tracking-wider hover:bg-cat-sapphire/90 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span>LAUNCH AGENT HUD</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/scan-to-enter"
            className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-xl bg-cat-surface0 border border-cat-surface1 text-cat-text font-bold font-mono-cyber text-xs uppercase tracking-wider hover:bg-cat-surface1 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <ScanLine className="w-4 h-4 text-cat-green" />
            <span>SCAN BADGE</span>
          </Link>
        </div>

        {/* Instant Demo Launch Strip */}
        <div className="w-full max-w-2xl pt-6 border-t border-cat-surface0 space-y-3">
          <span className="text-xs font-mono-cyber uppercase text-cat-subtext block">
            — Instant Demo Operatives (Single-Click Test) —
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {INITIAL_AGENTS.map((demo) => {
              const colors: Record<string, string> = {
                CRYPTOGRAPHER: 'hover:border-cat-mauve text-cat-mauve',
                SIGNAL_ANALYST: 'hover:border-cat-sapphire text-cat-sapphire',
                FIELD_OPERATIVE: 'hover:border-cat-green text-cat-green',
                ARCHIVIST: 'hover:border-cat-yellow text-cat-yellow',
              };
              return (
                <button
                  key={demo.agent_id}
                  onClick={() => handleLaunchAgent(demo.agent_id)}
                  className={`p-3 rounded-xl bg-cat-base border border-cat-surface1 text-left transition-all hover:-translate-y-0.5 shadow ${colors[demo.archetype]}`}
                >
                  <div className="font-mono-cyber text-xs font-bold text-cat-text">
                    {demo.name}
                  </div>
                  <div className="text-[10px] font-mono-cyber opacity-80 mt-0.5">
                    {demo.archetype.replace('_', ' ')}
                  </div>
                  <div className="text-[10px] font-mono-cyber text-cat-subtext mt-1">
                    {demo.score} PTS
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Four Operational Archetypes Preview */}
        <div className="w-full max-w-4xl pt-6 text-left space-y-4">
          <h2 className="text-center font-mono-cyber text-xs uppercase tracking-wider text-cat-subtext">
            OPERATIONAL ARCHETYPES & ROLES
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-cat-base border border-cat-surface1 space-y-2">
              <div className="font-mono-cyber text-xs font-bold text-cat-mauve">
                CRYPTOGRAPHER
              </div>
              <p className="text-xs text-cat-subtext">
                Deciphers packet payloads, Base64/Caesar ciphers, and hex memory exploit vectors.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-cat-base border border-cat-surface1 space-y-2">
              <div className="font-mono-cyber text-xs font-bold text-cat-green">
                FIELD OPERATIVE
              </div>
              <p className="text-xs text-cat-subtext">
                Discovers physical optical tags in venue sectors and triggers perimeter sensors.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-cat-base border border-cat-surface1 space-y-2">
              <div className="font-mono-cyber text-xs font-bold text-cat-sapphire">
                SIGNAL ANALYST
              </div>
              <p className="text-xs text-cat-subtext">
                Coordinates dual-key handshakes, carrier frequency telemetry, and collaborative links.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-cat-base border border-cat-surface1 space-y-2">
              <div className="font-mono-cyber text-xs font-bold text-cat-yellow">
                ARCHIVIST
              </div>
              <p className="text-xs text-cat-subtext">
                Uncovers historical memos and isolates poisoned disinformation in topology synthesis.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-cat-crust border-t border-cat-surface0 px-6 py-4 text-center text-xs font-mono-cyber text-cat-subtext flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto gap-2">
        <span>IEEE PROTOCOL // THE NETWORK PWA v2.5</span>
        <div className="flex items-center gap-4">
          <Link href="/scan-to-enter" className="hover:text-cat-text">
            Badge Scanner
          </Link>
          <Link href="/admin" className="hover:text-cat-text">
            Admin Console
          </Link>
        </div>
      </footer>
    </div>
  );
}
