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
    <div className="min-h-screen bg-[#141514] text-[#f4f1ea] flex flex-col justify-between selection:bg-[#c93b2b] selection:text-[#f4f1ea]">
      {/* Top Editorial Masthead */}
      <header className="w-full border-b border-[#2d312c] px-4 sm:px-8 py-3.5 bg-[#141514]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 border border-[#3f453f] hover:border-[#949e93] text-[#949e93] hover:text-[#f4f1ea] transition-colors rounded-sm"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="font-mono-tabular text-[10px] text-[#949e93] tracking-widest uppercase">
                NIT WARANGAL • THE PROTOCOL 2026
              </div>
              <div className="text-xs font-bold tracking-wider text-[#f4f1ea] uppercase">
                OFFICIAL STANDINGS REGISTRY
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/play"
              className="btn-editorial-outline px-3 py-1.5 text-xs uppercase font-mono-tabular"
            >
              HUD Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 flex-1">
        {/* IF LEADERBOARD IS HIDDEN BY OPERATIONS: SUSPENSE BLACKOUT SCREEN */}
        {!gameState.leaderboard_visible ? (
          <div className="max-w-lg mx-auto border border-[#3f453f] bg-[#1b1d1b] p-8 space-y-6">
            <div className="flex items-start justify-between">
              <span className="editorial-stamp border-[#c93b2b] text-[#c93b2b]">
                [TELEMETRY SEALED]
              </span>
              <Lock className="w-5 h-5 text-[#c93b2b]" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif-editorial text-3xl font-normal text-[#f4f1ea]">
                Standings temporarily concealed.
              </h2>
              <p className="font-display-grotesk text-xs text-[#949e93] leading-relaxed">
                Operations Desk has sealed live public standings to preserve suspense for the final reveal. Submissions and deductions remain active on your terminal until <strong>8:00 PM sharp</strong>.
              </p>
            </div>

            <div className="pt-4 border-t border-[#2d312c] flex flex-col sm:flex-row items-center gap-2.5 font-mono-tabular text-xs">
              <Link
                href="/play"
                className="btn-editorial-primary w-full sm:flex-1 py-2.5 px-4 text-center"
              >
                Access Operative HUD
              </Link>
              <Link
                href="/my-badge"
                className="btn-editorial-outline w-full sm:w-auto py-2.5 px-4 text-center"
              >
                View My Pass
              </Link>
            </div>
          </div>
        ) : (
          /* LEADERBOARD IS ON: ANONYMOUS DISPLAY (AGENT IDs + SCORES ONLY) */
          <div className="space-y-6">
            {/* Prize & Anonymity Editorial Callout */}
            <div className="border border-[#2d312c] bg-[#1b1d1b] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 border border-[#c28b28] text-[#c28b28]">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-mono-tabular text-xs font-bold text-[#c28b28] uppercase tracking-wider">
                    CLAUDE PRO PRIZE
                  </div>
                  <div className="font-display-grotesk text-xs text-[#949e93]">
                    Awarded to the top operative who solves key circuits & master topology deduction.
                  </div>
                </div>
              </div>

              <div className="font-mono-tabular text-[10px] text-[#949e93] border border-[#2d312c] px-2.5 py-1 bg-[#141514]">
                ANONYMIZED REGISTRY // IDENTIFIERS ONLY
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2d312c] pb-3">
              {/* Domain filter buttons */}
              <div className="flex flex-wrap items-center gap-1.5 font-mono-tabular text-xs">
                {['ALL', 'LOGIC', 'SIGNAL', 'OBSERVATION', 'SYSTEM', 'SOCIAL'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDomain(d)}
                    className={`px-2.5 py-1 rounded-none text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                      selectedDomain === d
                        ? 'bg-[#f4f1ea] text-[#141514] font-bold'
                        : 'text-[#949e93] hover:text-[#f4f1ea] border border-[#2d312c] hover:border-[#3f453f]'
                    }`}
                  >
                    [{d}]
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#949e93] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by Agent ID..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#1b1d1b] border border-[#2d312c] text-[#f4f1ea] font-mono-tabular focus:outline-none focus:border-[#949e93]"
                />
              </div>
            </div>

            {/* Standings Table (Tabular Editorial Ledger) */}
            <div className="border border-[#2d312c] bg-[#1b1d1b] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono-tabular">
                  <thead>
                    <tr className="border-b border-[#2d312c] bg-[#141514] text-[#949e93] text-[10px] uppercase tracking-wider">
                      <th className="py-2.5 px-4">Rank</th>
                      <th className="py-2.5 px-4">Operative Identifier</th>
                      <th className="py-2.5 px-4">Domain</th>
                      <th className="py-2.5 px-4">Active Play Time</th>
                      <th className="py-2.5 px-4 text-right">Clearance Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2d312c]">
                    {filteredAgents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-xs text-[#949e93]">
                          No operatives matched the current filter.
                        </td>
                      </tr>
                    ) : (
                      filteredAgents.map((ag, index) => {
                        const isTop1 = index === 0;
                        const isTop3 = index < 3;
                        const activeSecs = getAgentActiveSeconds(ag);
                        const domainKey = (ag.archetype as PrimaryDomain) || 'LOGIC';
                        const DomainIcon = DOMAIN_ICONS[domainKey] || Layers;

                        return (
                          <tr
                            key={ag.id}
                            className={`hover:bg-[#212421] transition-colors ${
                              isTop1 ? 'bg-[#1e1c16]' : ''
                            }`}
                          >
                            <td className="py-3 px-4 font-bold">
                              {isTop1 ? (
                                <span className="text-[#c28b28]">
                                  #01
                                </span>
                              ) : (
                                <span className={isTop3 ? 'text-[#f4f1ea] font-bold' : 'text-[#949e93]'}>
                                  #{String(index + 1).padStart(2, '0')}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-[#f4f1ea] text-xs">
                                {ag.agent_number || ag.agent_id}
                              </div>
                              <div className="text-[10px] text-[#949e93] flex items-center gap-1 mt-0.5">
                                <Ticket className="w-3 h-3 text-[#c28b28]" />
                                <span>Band: {ag.wristband_id || ag.agent_id}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 border border-[#2d312c] text-[#f4f1ea] bg-[#141514]">
                                <DomainIcon className="w-3 h-3 text-[#c28b28]" />
                                <span>{ag.archetype}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[11px] text-[#949e93] flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                <span>{formatActiveTime(activeSecs)}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-[#c28b28] text-sm">
                              {ag.score || 0} <span className="text-[10px] text-[#949e93] font-normal">PTS</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="w-full border-t border-[#2d312c] px-4 sm:px-8 py-3.5 text-xs text-[#949e93] bg-[#141514]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono-tabular text-[11px]">
          <span>NIT WARANGAL IEEE STUDENT BRANCH // THE PROTOCOL</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-[#f4f1ea]">
              Home
            </Link>
            <Link href="/play" className="hover:text-[#f4f1ea]">
              HUD
            </Link>
            <Link href="/admin" className="hover:text-[#f4f1ea]">
              Operations
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
