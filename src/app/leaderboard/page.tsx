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
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-proto-logic to-proto-signal text-proto-obsidian text-xs font-black uppercase transition-all shadow-[0_0_10px_rgba(0,255,136,0.25)]"
            >
              Enter HUD
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col justify-center space-y-6">
        {/* IF LEADERBOARD IS HIDDEN BY OPERATIONS: SUSPENSE BLACKOUT SCREEN */}
        {!gameState.leaderboard_visible ? (
          <div className="max-w-2xl w-full mx-auto bg-proto-base border-2 border-proto-crimson glow-crimson rounded-2xl p-8 shadow-2xl text-center space-y-6 animate-in fade-in duration-300">
            {/* Pulsing Lock Beacon */}
            <div className="w-20 h-20 rounded-3xl bg-proto-crimson/15 border-2 border-proto-crimson/60 flex items-center justify-center mx-auto text-proto-crimson shadow-[0_0_30px_rgba(255,51,68,0.4)] animate-pulse">
              <EyeOff className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-proto-crimson/20 border border-proto-crimson/50 text-proto-crimson text-xs font-black tracking-widest">
                <AlertTriangle className="w-3.5 h-3.5" />
                TELEMETRY BLACKOUT ENGAGED
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-proto-text">
                STANDINGS CONCEALED
              </h1>
              <p className="text-xs sm:text-sm text-proto-gold font-bold tracking-wider">
                THE FINAL BATTLE ENTERS THE ZERO HOUR
              </p>
            </div>

            <div className="p-4 rounded-xl bg-proto-surface0/90 border border-proto-surface1 text-xs text-proto-subtext font-sans leading-relaxed text-left space-y-2">
              <p>
                Operations Command has placed the master leaderboard under total cryptographic blackout.
              </p>
              <p className="text-proto-text font-mono-cyber font-bold">
                ⚠️ No operative knows where they rank. Scores continue to accumulate silently in the background.
              </p>
              <p>
                Every solve, every physical QR tag, and every hypothesis deduction counts. The winner of the <strong>Claude Pro Subscription</strong> will be unsealed at the closing ceremony!
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/play"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-proto-logic to-proto-signal text-proto-obsidian font-black text-xs tracking-wider uppercase shadow-lg hover:opacity-95 transition-all"
              >
                RETURN TO OPERATIVE TERMINAL
              </Link>
            </div>
          </div>
        ) : (
          /* IF LEADERBOARD IS VISIBLE: LIVE GLOBAL RANKINGS */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Prize Callout Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-proto-base via-proto-surface0 to-proto-base border-2 border-proto-gold glow-gold flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-proto-gold/20 text-proto-gold">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-proto-gold font-black uppercase tracking-widest block">
                    GRAND PRIZE
                  </span>
                  <span className="text-lg font-black text-proto-text">
                    Claude Pro Subscription
                  </span>
                  <span className="text-xs text-proto-subtext block font-sans">
                    Awarded to the top operative on final verification.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-proto-signal">
                <Flame className="w-4 h-4 animate-bounce" />
                <span className="font-bold">LIVE TELEMETRY ACTIVE</span>
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
