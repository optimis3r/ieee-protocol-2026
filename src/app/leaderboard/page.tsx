'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, initStore } from '@/lib/store';
import { Agent, GameState } from '@/types/database';
import { 
  Trophy, 
  Lock, 
  Terminal, 
  ArrowLeft, 
  EyeOff, 
  Radio, 
  Sparkles, 
  AlertTriangle,
  Search,
  ShieldCheck,
  Flame,
  Activity
} from 'lucide-react';

export default function LeaderboardPage() {
  const [gameState, setGameState] = useState<GameState>({
    id: 1,
    status: 'NETWORK_ACTIVE',
    global_broadcast: null,
    leaderboard_visible: true,
    updated_at: new Date().toISOString()
  });
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');

  useEffect(() => {
    initStore();
    setGameState(Store.getGameState());
    setAgents(Store.getAgents());

    const handleUpdate = () => {
      setGameState(Store.getGameState());
      setAgents(Store.getAgents());
    };

    window.addEventListener('ieee_store_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('ieee_store_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const sortedAgents = [...agents].sort((a, b) => (b.score || 0) - (a.score || 0));
  
  const filteredAgents = sortedAgents.filter((a) => {
    const matchesSearch = 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.agent_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = selectedDomain === 'ALL' || a.archetype === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="min-h-screen bg-proto-obsidian text-proto-text flex flex-col justify-between scanlines font-mono-cyber selection:bg-proto-gold selection:text-proto-obsidian">
      {/* Top Navigation */}
      <header className="w-full bg-proto-base/95 backdrop-blur-md border-b border-proto-surface1 px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-proto-surface0 border border-proto-surface1 hover:border-proto-signal text-proto-subtext hover:text-proto-text transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="font-black text-xs tracking-wider text-proto-text uppercase flex items-center gap-2">
                NIT WARANGAL // THE PROTOCOL
              </div>
              <div className="text-[10px] text-proto-subtext tracking-widest uppercase">
                GLOBAL CLEARANCE LEADERBOARD
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/play"
              className="px-3.5 py-1.5 rounded-lg bg-proto-signal hover:bg-[#00e676] text-[#0a0f0d] text-xs font-bold uppercase transition-colors"
            >
              Enter HUD
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col justify-center space-y-6">
        {/* IF LEADERBOARD IS HIDDEN BY OPERATIONS: SUSPENSE BLACKOUT SCREEN */}
        {!gameState.leaderboard_visible ? (
          <div className="max-w-xl w-full mx-auto bg-[#141d17] border border-proto-crimson/50 rounded-2xl p-8 text-center space-y-5 animate-in fade-in duration-300">
            {/* Lock Icon */}
            <div className="w-16 h-16 rounded-2xl bg-proto-crimson/15 border border-proto-crimson/40 flex items-center justify-center mx-auto text-proto-crimson">
              <EyeOff className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-proto-crimson/20 border border-proto-crimson/40 text-proto-crimson text-xs font-bold tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
                TELEMETRY BLACKOUT
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#eaf2ec]">
                STANDINGS CONCEALED
              </h1>
              <p className="text-xs text-[#8ea897]">
                The competition enters the final phase.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#101713] border border-[#223027] text-xs text-[#8ea897] font-sans leading-relaxed text-left space-y-2">
              <p>
                Operations Command has placed the public leaderboard under cryptographic blackout.
              </p>
              <p className="text-[#eaf2ec] font-mono-cyber">
                Scores continue to calculate silently in the background. The winner of the <strong>Claude Pro Subscription</strong> will be announced at the closing ceremony.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/play"
                className="inline-block px-6 py-2.5 rounded-xl bg-proto-signal hover:bg-[#00e676] text-[#0a0f0d] font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Return to Terminal
              </Link>
            </div>
          </div>
        ) : (
          /* IF LEADERBOARD IS VISIBLE: LIVE GLOBAL RANKINGS */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Prize Callout Banner */}
            <div className="p-4 rounded-xl bg-[#141d17] border border-[#d4af37]/40 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#d4af37]/15 text-[#d4af37]">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-[#d4af37] font-bold uppercase tracking-wider block">
                    Grand Prize
                  </span>
                  <span className="text-base font-bold text-[#eaf2ec]">
                    Claude Pro Subscription
                  </span>
                  <span className="text-xs text-[#8ea897] block font-sans">
                    Awarded to the top operative on final verification.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-proto-signal font-semibold">
                <span className="w-2 h-2 rounded-full bg-proto-signal" />
                <span>Live Telemetry</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Domain Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {(['ALL', 'LOGIC', 'SIGNAL', 'OBSERVATION', 'SYSTEM', 'SOCIAL'] as const).map((dom) => (
                  <button
                    key={dom}
                    onClick={() => setSelectedDomain(dom)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap ${
                      selectedDomain === dom
                        ? 'bg-proto-surface1 text-proto-signal font-black shadow border border-proto-signal/40'
                        : 'text-proto-subtext hover:text-proto-text bg-proto-base border border-proto-surface1'
                    }`}
                  >
                    {dom === 'ALL' ? 'All Domains' : dom}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-proto-subtext absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Agent ID or Name..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-proto-base border border-proto-surface1 rounded-xl text-proto-text focus:outline-none focus:border-proto-signal"
                />
              </div>
            </div>

            {/* Standings Table Card */}
            <div className="bg-proto-base border border-proto-surface1 rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-proto-surface1 bg-proto-surface0/60 text-proto-subtext text-[10px] uppercase">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Operative</th>
                      <th className="py-3 px-4">Domain</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Clearance Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-proto-surface1/60">
                    {filteredAgents.map((ag, index) => {
                      const isTop1 = index === 0;
                      const isTop3 = index < 3;
                      return (
                        <tr
                          key={ag.id}
                          className={`hover:bg-proto-surface0/40 transition-colors ${
                            isTop1 ? 'bg-proto-gold/5' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-black">
                            {isTop1 ? (
                              <span className="text-proto-gold flex items-center gap-1">
                                👑 #1
                              </span>
                            ) : (
                              <span className={isTop3 ? 'text-proto-text' : 'text-proto-subtext'}>
                                #{index + 1}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-proto-text">{ag.name}</div>
                            <div className="text-[10px] text-proto-subtext">{ag.agent_id}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-proto-surface0 text-proto-logic border border-proto-logic/30">
                              {ag.archetype}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 text-[10px] ${
                                ag.is_active ? 'text-proto-signal font-bold' : 'text-proto-subtext'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  ag.is_active ? 'bg-proto-signal animate-pulse' : 'bg-proto-subtext/40'
                                }`}
                              />
                              {ag.is_active ? 'ACTIVE' : 'IDLE'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-proto-gold text-base">
                            {ag.score} <span className="text-[10px] text-proto-subtext font-normal">PTS</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-proto-base border-t border-proto-surface1 px-4 sm:px-6 py-4 text-center text-xs text-proto-subtext flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto gap-2">
        <span>NIT WARANGAL IEEE STUDENT BRANCH // THE PROTOCOL</span>
        <div className="flex items-center gap-4 text-[11px]">
          <Link href="/" className="hover:text-proto-text">
            Home Briefing
          </Link>
          <Link href="/play" className="hover:text-proto-text">
            Agent Terminal
          </Link>
          <Link href="/admin" className="hover:text-proto-text">
            Operations Console
          </Link>
        </div>
      </footer>
    </div>
  );
}
