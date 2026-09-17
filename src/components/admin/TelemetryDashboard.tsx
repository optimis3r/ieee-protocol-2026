'use client';

import React, { useState, useEffect } from 'react';
import { Store } from '@/lib/store';
import { Agent, GameStatus, GameState } from '@/types/database';
import { soundEffects } from '@/lib/audio';
import { 
  Activity, 
  Users, 
  Radio, 
  ShieldAlert, 
  Award, 
  Send, 
  AlertTriangle, 
  BarChart3, 
  CheckCircle2,
  Lock,
  Play
} from 'lucide-react';

export const TelemetryDashboard: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(Store.getGameState());
  const [agents, setAgents] = useState<Agent[]>(Store.getAgents());
  const [telemetry, setTelemetry] = useState(Store.getTelemetry());
  const [broadcastInput, setBroadcastInput] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const refreshDashboard = () => {
    setGameState(Store.getGameState());
    setAgents(Store.getAgents());
    setTelemetry(Store.getTelemetry());
  };

  useEffect(() => {
    refreshDashboard();

    const handleUpdate = () => {
      refreshDashboard();
    };

    window.addEventListener('ieee_store_update', handleUpdate);
    return () => window.removeEventListener('ieee_store_update', handleUpdate);
  }, []);

  const handleStateChange = (newStatus: GameStatus) => {
    const updated = Store.setGameState(newStatus);
    setGameState(updated);
    soundEffects.playScanChirp();
    setActionNotice(`SYSTEM STATE SHIFTED TO: ${newStatus}`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleDispatchBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastInput.trim()) return;

    Store.setGameState(gameState.status, broadcastInput.trim());
    soundEffects.playSuccessChime();
    setActionNotice(`PRIORITY BROADCAST DISPATCHED TO ALL OPERATIVES`);
    setBroadcastInput('');
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleClearBroadcast = () => {
    Store.setGameState(gameState.status, null);
    soundEffects.playScanChirp();
    setActionNotice('BROADCAST CLEARED');
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Sort leaderboard descending by score
  const sortedAgents = [...agents].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="space-y-6">
      {/* Alert Notice Banner */}
      {actionNotice && (
        <div className="p-3 rounded-xl bg-cat-sapphire/20 border border-cat-sapphire/40 text-cat-sapphire text-xs font-mono-cyber flex items-center gap-2 animate-in fade-in">
          <Activity className="w-4 h-4 animate-spin" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Controls: Game State Switches & Dispatcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* System State Controls */}
        <div className="lg:col-span-5 bg-cat-base border border-cat-surface1 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-cat-surface0 pb-3">
            <h3 className="font-mono-cyber text-xs font-bold uppercase text-cat-text flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cat-mauve" />
              GLOBAL NETWORK STATE CONTROL
            </h3>
            <span
              className={`text-[10px] font-mono-cyber font-bold px-2 py-0.5 rounded-full ${
                gameState.status === 'NETWORK_ACTIVE'
                  ? 'bg-cat-green/20 text-cat-green'
                  : gameState.status === 'NETWORK_LOCKED'
                  ? 'bg-cat-red/20 text-cat-red animate-pulse'
                  : 'bg-cat-yellow/20 text-cat-yellow'
              }`}
            >
              {gameState.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { status: 'STANDBY', label: 'STANDBY', icon: Activity, color: 'text-cat-yellow' },
                { status: 'NETWORK_ACTIVE', label: 'ACTIVE', icon: Play, color: 'text-cat-green' },
                { status: 'NETWORK_LOCKED', label: 'LOCKDOWN', icon: Lock, color: 'text-cat-red' },
              ] as const
            ).map((item) => {
              const isCurrent = gameState.status === item.status;
              const Icon = item.icon;
              return (
                <button
                  key={item.status}
                  onClick={() => handleStateChange(item.status)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    isCurrent
                      ? `bg-cat-surface0 ${item.color} border-2 border-current shadow-lg`
                      : 'bg-cat-mantle border-cat-surface0 hover:border-cat-surface1 text-cat-subtext'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] font-mono-cyber font-bold">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] font-mono-cyber text-cat-subtext leading-relaxed">
            * <strong className="text-cat-red">LOCKDOWN</strong> freezes all client-side decode and handshake submissions instantly via real-time telemetry.
          </p>
        </div>

        {/* Global Broadcast Dispatcher */}
        <div className="lg:col-span-7 bg-cat-base border border-cat-surface1 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-cat-surface0 pb-3">
            <h3 className="font-mono-cyber text-xs font-bold uppercase text-cat-text flex items-center gap-2">
              <Radio className="w-4 h-4 text-cat-yellow animate-pulse" />
              OPERATIONS BROADCAST DISPATCHER
            </h3>
            {gameState.global_broadcast && (
              <button
                onClick={handleClearBroadcast}
                className="text-[10px] font-mono-cyber text-cat-red hover:underline"
              >
                Clear Broadcast
              </button>
            )}
          </div>

          <form onSubmit={handleDispatchBroadcast} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={broadcastInput}
                onChange={(e) => setBroadcastInput(e.target.value)}
                placeholder="Type urgent directive to push to all operative HUDs simultaneously..."
                className="w-full px-3.5 py-2.5 text-xs font-mono-cyber bg-cat-mantle border border-cat-surface1 rounded-xl text-cat-text focus:outline-none focus:border-cat-yellow placeholder:text-cat-subtext/40"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono-cyber text-cat-subtext truncate max-w-sm">
                CURRENT: {gameState.global_broadcast || 'NONE'}
              </span>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cat-yellow text-cat-crust text-xs font-mono-cyber font-bold uppercase tracking-wider hover:bg-cat-yellow/90 transition-colors flex items-center gap-2 shadow"
              >
                <Send className="w-3.5 h-3.5" /> Push Directive
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-cat-base border border-cat-surface1 shadow-lg">
          <span className="text-[11px] font-mono-cyber text-cat-subtext block">ACTIVE OPERATIVES</span>
          <div className="text-2xl font-bold font-mono-cyber text-cat-text mt-1 flex items-baseline gap-2">
            <span className="text-cat-green">{telemetry.activeAgents}</span>
            <span className="text-xs text-cat-subtext font-normal">/ {telemetry.totalAgents} TOTAL</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-cat-base border border-cat-surface1 shadow-lg">
          <span className="text-[11px] font-mono-cyber text-cat-subtext block">CIRCUIT SOLVES</span>
          <div className="text-2xl font-bold font-mono-cyber text-cat-sapphire mt-1">
            {telemetry.completedSolves} <span className="text-xs text-cat-subtext font-normal">VERIFIED</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-cat-base border border-cat-surface1 shadow-lg">
          <span className="text-[11px] font-mono-cyber text-cat-subtext block">DISINFO CONTAMINATION</span>
          <div className="text-2xl font-bold font-mono-cyber text-cat-peach mt-1 flex items-center gap-2">
            <span>{telemetry.disinfoIssued}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cat-peach/20 text-cat-peach font-normal">
              TRAPS ACTIVE
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-cat-base border border-cat-surface1 shadow-lg">
          <span className="text-[11px] font-mono-cyber text-cat-subtext block">TOP SCORE</span>
          <div className="text-2xl font-bold font-mono-cyber text-cat-yellow mt-1">
            {sortedAgents[0]?.score || 0} <span className="text-xs text-cat-subtext font-normal">PTS</span>
          </div>
        </div>
      </div>

      {/* Leaderboard & Node Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Leaderboard */}
        <div className="lg:col-span-8 bg-cat-base border border-cat-surface1 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-cat-surface0 pb-3">
            <h3 className="font-mono-cyber text-xs font-bold uppercase text-cat-text flex items-center gap-2">
              <Award className="w-4 h-4 text-cat-yellow" />
              LIVE CLEARANCE LEADERBOARD
            </h3>
            <span className="text-[11px] font-mono-cyber text-cat-subtext">
              DYNAMIC SCORING ACTIVE
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-cyber">
              <thead>
                <tr className="border-b border-cat-surface0 text-cat-subtext text-[10px] uppercase">
                  <th className="pb-2">Rank</th>
                  <th className="pb-2">Operative</th>
                  <th className="pb-2">Archetype</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Clearance Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cat-surface0/60">
                {sortedAgents.map((ag, index) => (
                  <tr key={ag.id} className="hover:bg-cat-mantle/40 transition-colors">
                    <td className="py-3 font-bold text-cat-subtext">
                      {index === 0 ? '👑 1' : `#${index + 1}`}
                    </td>
                    <td className="py-3">
                      <div className="font-bold text-cat-text">{ag.name}</div>
                      <div className="text-[10px] text-cat-subtext">{ag.agent_id}</div>
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cat-surface0 text-cat-mauve">
                        {ag.archetype}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] ${
                          ag.is_active ? 'text-cat-green' : 'text-cat-subtext'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            ag.is_active ? 'bg-cat-green animate-pulse' : 'bg-cat-subtext/40'
                          }`}
                        />
                        {ag.is_active ? 'ACTIVE' : 'IDLE'}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-cat-yellow text-sm">
                      {ag.score} PTS
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Node Solves Distribution */}
        <div className="lg:col-span-4 bg-cat-base border border-cat-surface1 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-cat-surface0 pb-3">
            <h3 className="font-mono-cyber text-xs font-bold uppercase text-cat-text flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cat-sapphire" />
              SOLVE DISTRIBUTION
            </h3>
          </div>

          <div className="space-y-3">
            {Object.entries(telemetry.distribution).map(([nodeId, count]) => (
              <div key={nodeId} className="space-y-1 font-mono-cyber text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-cat-text font-bold truncate max-w-[180px]">{nodeId}</span>
                  <span className="text-cat-sapphire">{count} solves</span>
                </div>
                <div className="h-2 w-full bg-cat-mantle rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cat-sapphire rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (count / Math.max(1, telemetry.totalAgents)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
