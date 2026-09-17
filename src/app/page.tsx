'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, initStore, INITIAL_AGENTS } from '@/lib/store';
import { Agent } from '@/types/database';
import { 
  ScanLine, 
  ShieldAlert, 
  ArrowRight,
  Calendar,
  MapPin,
  Trophy,
  ChevronDown,
  QrCode,
  UserPlus,
  LogIn,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [showDemoAgents, setShowDemoAgents] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [sessionStatus, setSessionStatus] = useState<{ valid: boolean; minutesRemaining: number }>({
    valid: false,
    minutesRemaining: 0,
  });

  useEffect(() => {
    initStore();
    const storedId = localStorage.getItem('ieee_agent_id');
    if (storedId) {
      const ag = Store.getAgentById(storedId);
      if (ag) {
        setCurrentAgent(ag);
        setSessionStatus(Store.checkSessionValidity(ag.agent_id));
      }
    }
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
    <div className="min-h-screen bg-[#0d120f] text-[#eaf2ec] flex flex-col justify-between font-mono-cyber selection:bg-proto-signal selection:text-[#0d120f]">
      {/* Refined Minimal Navbar */}
      <nav className="w-full border-b border-[#1b2620] px-4 sm:px-8 py-4 bg-[#0d120f]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#16201a] border border-[#23332a] flex items-center justify-center text-proto-signal font-bold text-xs">
              NW
            </div>
            <div>
              <div className="font-bold text-xs text-[#eaf2ec] tracking-wider">
                NIT WARANGAL
              </div>
              <div className="text-[10px] text-[#7d9787] tracking-wider uppercase">
                IEEE Student Branch
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <Link
              href="/leaderboard"
              className="px-3 py-1.5 rounded-lg bg-[#16201a] hover:bg-[#1f2d25] text-[#d4af37] border border-[#d4af37]/30 transition-colors flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Leaderboard</span>
            </Link>
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-lg bg-[#16201a] hover:bg-[#1f2d25] text-[#96af9f] hover:text-[#eaf2ec] border border-[#23332a] transition-colors flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#ff7700]" />
              <span className="hidden sm:inline">Operations</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Hero: Grounded, Clean, Professional */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14 flex-1 flex flex-col items-center text-center justify-center space-y-7">
        
        {/* Subtitle / Event Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#16201a] border border-[#23332a] text-[#8ea897] text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-proto-signal" />
          <span>Campus Alternate Reality Game • Level 01</span>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#f3f7f4]">
            THE PROTOCOL
          </h1>

          <p className="text-sm sm:text-base text-[#91a89a] max-w-lg mx-auto font-sans leading-relaxed">
            Every operative is assigned a unique role. Register on your phone, present your personal QR pass to hosts at the gate, and decrypt the campus network.
          </p>

          <div className="inline-block px-4 py-1 rounded-md bg-[#16201a] border border-[#23332a] text-[#b8cfc1] text-xs font-semibold tracking-widest uppercase">
            ENTER • INVESTIGATE • DECIDE
          </div>
        </div>

        {/* Dynamic Action Controls */}
        {currentAgent ? (
          <div className="w-full max-w-md bg-[#141d17] border border-[#23332a] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="text-left">
                <span className="text-[#8ea897] text-[10px] uppercase block">Current Operative</span>
                <span className="font-bold text-[#eaf2ec]">{currentAgent.name}</span>
                <span className="text-proto-signal text-[11px] ml-1.5">({currentAgent.agent_id})</span>
              </div>
              <div className="text-right">
                {sessionStatus.valid ? (
                  <span className="inline-flex items-center gap-1 text-proto-signal text-[11px] bg-proto-signal/15 px-2 py-0.5 rounded border border-proto-signal/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{sessionStatus.minutesRemaining}m Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-proto-crimson text-[11px] bg-proto-crimson/15 px-2 py-0.5 rounded border border-proto-crimson/30">
                    <Clock className="w-3 h-3" />
                    <span>Host Scan Required</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              {sessionStatus.valid ? (
                <Link
                  href="/play"
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-proto-signal hover:bg-[#00e676] text-[#0a0f0d] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/my-badge"
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-proto-signal hover:bg-[#00e676] text-[#0a0f0d] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Show QR Pass (Host Scan)</span>
                </Link>
              )}

              <Link
                href="/my-badge"
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-[#16201a] hover:bg-[#1f2d25] border border-[#283b30] text-[#cad8ce] font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <QrCode className="w-3.5 h-3.5 text-proto-signal" />
                <span>My Pass</span>
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-[#16201a] hover:bg-[#1f2d25] border border-[#283b30] text-[#8ea897] hover:text-[#eaf2ec] font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center"
                title="Switch Account"
              >
                Switch
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3 w-full max-w-sm">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              <Link
                href="/register"
                className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl bg-proto-signal hover:bg-[#00e676] text-[#0a0f0d] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Operative</span>
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl bg-[#16201a] hover:bg-[#1f2d25] border border-[#283b30] text-[#eaf2ec] font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-proto-signal" />
                <span>Log In (Retrieve QR)</span>
              </Link>
            </div>

            <p className="text-[11px] text-[#718a7b] font-sans">
              Personal QR pass is tied to your account. No local storage needed.
            </p>
          </div>
        )}

        {/* 5 Domains: Clean, Natural, Minimal */}
        <div className="w-full max-w-md pt-2 space-y-2">
          <span className="text-[11px] text-[#718a7b] uppercase tracking-wider block">
            Operative Roles
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: 'Logic', color: 'bg-[#00d2ff]' },
              { label: 'Signal', color: 'bg-[#00ff88]' },
              { label: 'Observation', color: 'bg-[#bf55ec]' },
              { label: 'System', color: 'bg-[#ff7700]' },
              { label: 'Social', color: 'bg-[#00f0ff]' },
            ].map((d) => (
              <span
                key={d.label}
                className="px-3 py-1 rounded-lg bg-[#141d17] border border-[#223027] text-xs text-[#cad8ce] flex items-center gap-1.5"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${d.color}`} />
                {d.label}
              </span>
            ))}
          </div>
        </div>

        {/* Clean Event Logistics Strip */}
        <div className="w-full max-w-md p-4 rounded-xl bg-[#141d17] border border-[#223027] grid grid-cols-3 gap-2 text-xs text-left">
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#718a7b] uppercase block">Date</span>
            <span className="font-semibold text-[#eaf2ec]">24th Sep</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-[#718a7b] uppercase block">Venue</span>
            <span className="font-semibold text-[#eaf2ec] truncate block">NIT Warangal</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-[#d4af37] uppercase block">Grand Prize</span>
            <span className="font-semibold text-[#eaf2ec] truncate block">Claude Pro</span>
          </div>
        </div>

        {/* Subtle Objective Note */}
        <p className="text-xs text-[#718a7b] font-sans italic">
          Trust no one. Some agents have other objectives.
        </p>

        {/* Minimal Demo Operatives Toggle for Testing */}
        <div className="w-full max-w-md pt-2 border-t border-[#1b2620]">
          <button
            onClick={() => setShowDemoAgents(!showDemoAgents)}
            className="text-xs text-[#718a7b] hover:text-[#cad8ce] inline-flex items-center gap-1 transition-colors"
          >
            <span>Test with Demo Operative</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDemoAgents ? 'rotate-180' : ''}`} />
          </button>

          {showDemoAgents && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3">
              {INITIAL_AGENTS.map((demo) => (
                <button
                  key={demo.agent_id}
                  onClick={() => handleLaunchAgent(demo.agent_id)}
                  className="p-2 rounded-lg bg-[#16201a] border border-[#23332a] hover:border-proto-signal text-left text-xs transition-colors"
                >
                  <div className="font-bold text-[#eaf2ec] truncate">{demo.name}</div>
                  <div className="text-[10px] text-[#8ea897]">{demo.archetype}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Clean, Understated Footer */}
      <footer className="w-full border-t border-[#1b2620] px-6 py-4 text-xs text-[#718a7b] max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>NIT Warangal IEEE Student Branch</span>
        <div className="flex items-center gap-4 text-[11px]">
          <Link href="/leaderboard" className="hover:text-[#eaf2ec] transition-colors">
            Leaderboard
          </Link>
          <Link href="/scan-to-enter" className="hover:text-[#eaf2ec] transition-colors">
            Badge Scanner
          </Link>
          <Link href="/admin" className="hover:text-[#eaf2ec] transition-colors">
            Operations
          </Link>
        </div>
      </footer>
    </div>
  );
}
