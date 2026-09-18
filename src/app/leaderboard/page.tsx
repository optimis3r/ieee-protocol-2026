'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, initStore, formatActiveTime, getAgentActiveSeconds } from '@/lib/store';
import { Agent, GameState, PrimaryDomain } from '@/types/database';
import { 
  Trophy, 
  Lock, 
  ArrowLeft, 
  Search, 
  Clock, 
  Layers, 
  Activity, 
  Eye, 
  Cpu, 
  Users,
  Ticket
} from 'lucide-react';

const DOMAIN_ICONS: Record<PrimaryDomain, React.ComponentType<{ className?: string }>> = {
  LOGIC: Layers,
  SIGNAL: Activity,
  OBSERVATION: Eye,
  SYSTEM: Cpu,
  SOCIAL: Users
};

export default function LeaderboardPage() {
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window !== 'undefined') return Store.getGameState();
    return {
      id: 1,
      status: 'NETWORK_ACTIVE',
      global_broadcast: null,
      leaderboard_visible: true,
      submission_cutoff_time: '20:00',
      updated_at: new Date().toISOString()
    };
  });
  const [agents, setAgents] = useState<Agent[]>(() => {
    if (typeof window !== 'undefined') return Store.getAgents();
    return [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');

  useEffect(() => {
    initStore();

    const handleUpdate = () => {
      setGameState(Store.getGameState());
      setAgents(Store.getAgents());
    };

    window.addEventListener('ieee_store_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    const timer = setInterval(() => {
      setAgents(Store.getAgents());
    }, 5000);

    return () => {
      window.removeEventListener('ieee_store_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(timer);
    };
  }, []);

  const sortedAgents = [...agents].sort((a, b) => (b.score || 0) - (a.score || 0));
  
  const filteredAgents = sortedAgents.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      a.agent_id.toLowerCase().includes(q) ||
      (a.agent_number && a.agent_number.toLowerCase().includes(q)) ||
      (a.wristband_id && a.wristband_id.toLowerCase().includes(q));
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
            <div className="w-16 h-16 rounded-full bg-proto-crimson/20 border-2 border-proto-crimson flex items-center justify-center mx-auto text-proto-crimson shadow-[0_0_20px_rgba(255,51,68,0.3)] animate-pulse">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black tracking-widest text-proto-crimson uppercase px-3 py-1 rounded-full bg-proto-crimson/15 border border-proto-crimson/40 inline-block">
                TELEMETRY BLACKOUT INITIATED
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-proto-text uppercase tracking-tight">
                STANDINGS TEMPORARILY CONCEALED
              </h2>
              <p className="text-xs text-proto-subtext leading-relaxed font-sans max-w-md mx-auto">
                Operations Desk has sealed live public standings to preserve climactic suspense for the final reveal. Submissions and deductions remain active on your terminal until <strong>8:00 PM</strong>.
              </p>
            </div>

            <div className="pt-4 border-t border-proto-surface1 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/play"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-proto-logic to-proto-signal text-[#0a0f0d] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow"
              >
                Access Operative HUD
              </Link>
              <Link
                href="/my-badge"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-proto-surface0 border border-proto-surface1 text-proto-text font-bold text-xs uppercase hover:border-proto-surface2 transition-all"
              >
                View My Pass
              </Link>
            </div>
          </div>
        ) : (
          /* LEADERBOARD IS ON: ANONYMOUS DISPLAY (AGENT IDs + SCORES ONLY) */
          <div className="space-y-6">
            {/* Prize & Anonymity Header */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#141d17] via-proto-base to-[#141d17] border border-proto-gold/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-proto-gold/20 text-proto-gold border border-proto-gold/40">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-proto-gold uppercase flex items-center gap-1.5">
                    <span>CLAUDE PRO SUBSCRIPTION PRIZE</span>
                  </div>
                  <div className="text-[11px] text-proto-subtext font-sans">
                    Awarded to the top operative who solves key circuits & master topology deduction.
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-[#8ea897] font-mono bg-proto-surface0 px-3 py-1.5 rounded-xl border border-proto-surface1">
                🔒 ANONYMIZED STANDINGS: Agent IDs only
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Domain filter buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {['ALL', 'LOGIC', 'SIGNAL', 'OBSERVATION', 'SYSTEM', 'SOCIAL'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDomain(d)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                      selectedDomain === d
                        ? 'bg-proto-surface2 text-proto-signal border border-proto-signal/50 shadow-sm'
                        : 'bg-proto-surface0/60 text-proto-subtext hover:text-proto-text border border-proto-surface1'
                    }`}
                  >
                    {d}
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
                  placeholder="Search Agent ID (e.g. Agent 047)..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-proto-base border border-proto-surface1 rounded-xl text-proto-text focus:outline-none focus:border-proto-signal"
                />
              </div>
            </div>

            {/* Standings Table Card (ANONYMOUS: Agent IDs Only, No Names/Roll Numbers) */}
            <div className="bg-proto-base border border-proto-surface1 rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-proto-surface1 bg-proto-surface0/60 text-proto-subtext text-[10px] uppercase">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Agent Identifier</th>
                      <th className="py-3 px-4">Role Domain</th>
                      <th className="py-3 px-4">Active Play Time</th>
                      <th className="py-3 px-4 text-right">Clearance Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-proto-surface1/60">
                    {filteredAgents.map((ag, index) => {
                      const isTop1 = index === 0;
                      const isTop3 = index < 3;
                      const activeSecs = getAgentActiveSeconds(ag);
                      const domainKey = (ag.archetype as PrimaryDomain) || 'LOGIC';
                      const DomainIcon = DOMAIN_ICONS[domainKey] || Layers;

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
                              <span className={isTop3 ? 'text-proto-text font-bold' : 'text-proto-subtext'}>
                                #{index + 1}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-proto-text text-sm">
                              {ag.agent_number || ag.agent_id}
                            </div>
                            <div className="text-[10px] text-proto-subtext flex items-center gap-1 font-mono">
                              <Ticket className="w-3 h-3 text-proto-gold" />
                              <span>Band: {ag.wristband_id || ag.agent_id}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-proto-surface0 text-proto-logic border border-proto-logic/30">
                              <DomainIcon className="w-3 h-3 text-proto-signal" />
                              <span>{ag.archetype}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[11px] text-proto-subtext flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatActiveTime(activeSecs)}</span>
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
