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
  Play,
  Trophy
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
    setActionNotice(`PROTOCOL STATE SHIFTED TO: ${newStatus}`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleDispatchBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastInput.trim()) return;

    Store.setGameState(gameState.status, broadcastInput.trim());
    soundEffects.playSuccessChime();
    setActionNotice(`PRIORITY DIRECTIVE BROADCAST TO ALL OPERATIVES`);
    setBroadcastInput('');
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleClearBroadcast = () => {
    Store.setGameState(gameState.status, null);
    soundEffects.playScanChirp();
    setActionNotice('BROADCAST CLEARED');
    setTimeout(() => setActionNotice(null), 3500);
  };

  const sortedAgents = [...agents].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="space-y-6 font-mono-cyber">
      {/* Alert Notice Banner */}
      {actionNotice && (
        <div className="p-3 rounded-xl bg-proto-logic/20 border border-proto-logic/40 text-proto-logic text-xs flex items-center gap-2 animate-in fade-in">
          <Activity className="w-4 h-4 animate-spin" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Controls: Game State Switches & Dispatcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* System State Controls */}
        <div className="lg:col-span-5 bg-proto-base border border-proto-surface1 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-proto-surface1 pb-3">
            <h3 className="text-xs font-bold uppercase text-proto-text flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-proto-system" />
              GLOBAL PROTOCOL CONTROLS
            </h3>
            <span
              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                gameState.status === 'NETWORK_ACTIVE'
                  ? 'bg-proto-signal/20 text-proto-signal border border-proto-signal/40 animate-pulse'
                  : gameState.status === 'NETWORK_LOCKED'
                  ? 'bg-proto-crimson/20 text-proto-crimson border border-proto-crimson/40 animate-pulse'
                  : 'bg-proto-gold/20 text-proto-gold border border-proto-gold/40'
              }`}
            >
              {gameState.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { status: 'STANDBY', label: 'STANDBY', icon: Activity, color: 'text-proto-gold' },
                { status: 'NETWORK_ACTIVE', label: 'ACTIVE', icon: Play, color: 'text-proto-signal' },
                { status: 'NETWORK_LOCKED', label: 'LOCKDOWN', icon: Lock, color: 'text-proto-crimson' },
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
                      ? `bg-proto-surface0 ${item.color} border-2 border-current shadow-lg`
                      : 'bg-proto-surface0/40 border-proto-surface1 hover:border-proto-surface2 text-proto-subtext'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] font-bold">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SUSPENSE BLACKOUT TOGGLE */}
          <div className="pt-3 border-t border-proto-surface1 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-proto-text flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-proto-gold" />
                PUBLIC LEADERBOARD:
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-black ${
                  gameState.leaderboard_visible
                    ? 'bg-proto-signal/20 text-proto-signal border border-proto-signal/40'
                    : 'bg-proto-crimson/20 text-proto-crimson border border-proto-crimson/40 animate-pulse'
                }`}
              >
                {gameState.leaderboard_visible ? 'PUBLIC VISIBLE' : 'BLACKOUT ACTIVE'}
              </span>
            </div>

            <button
              onClick={() => {
                const nextVal = !gameState.leaderboard_visible;
                const updated = Store.toggleLeaderboard(nextVal);
                setGameState(updated);
                soundEffects.playScanChirp();
                setActionNotice(
                  nextVal
                    ? 'PUBLIC LEADERBOARD RESTORED & VISIBLE'
                    : 'TELEMETRY BLACKOUT INITIATED: PUBLIC STANDINGS CONCEALED FOR SUSPENSE'
                );
                setTimeout(() => setActionNotice(null), 4000);
              }}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                gameState.leaderboard_visible
                  ? 'bg-proto-surface0 border-proto-crimson/60 text-proto-crimson hover:bg-proto-crimson hover:text-proto-obsidian'
                  : 'bg-gradient-to-r from-proto-logic to-proto-signal text-proto-obsidian shadow-[0_0_15px_rgba(0,255,136,0.3)]'
              }`}
            >
              {gameState.leaderboard_visible ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  INITIATE SUSPENSE BLACKOUT (CONCEAL SCORES)
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  RESTORE PUBLIC LEADERBOARD VISIBILITY
                </>
              )}
            </button>
            <p className="text-[10px] text-proto-subtext font-sans leading-tight">
              * Hide near event end to build climax. Operations console retains 100% live unredacted scores.
            </p>
          </div>
        </div>

        {/* Global Broadcast Dispatcher */}
        <div className="lg:col-span-7 bg-proto-base border border-proto-surface1 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-proto-surface1 pb-3">
            <h3 className="text-xs font-bold uppercase text-proto-text flex items-center gap-2">
              <Radio className="w-4 h-4 text-proto-system animate-pulse" />
              OPERATIONS BROADCAST DISPATCHER
            </h3>
            {gameState.global_broadcast && (
              <button
                onClick={handleClearBroadcast}
                className="text-[10px] text-proto-crimson hover:underline"
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
                placeholder="Push urgent directive to all operative HUDs simultaneously..."
                className="w-full px-3.5 py-2.5 text-xs bg-proto-surface0 border border-proto-surface1 rounded-xl text-proto-text focus:outline-none focus:border-proto-system placeholder:text-proto-subtext/40"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-proto-subtext truncate max-w-sm">
                CURRENT: {gameState.global_broadcast || 'DEFAULT DIRECTIVE'}
              </span>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-proto-system to-proto-gold text-proto-obsidian text-xs font-black uppercase tracking-wider hover:opacity-95 transition-all flex items-center gap-2 shadow"
              >
                <Send className="w-3.5 h-3.5" /> Push Directive
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Metrics Row matching Poster Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-proto-base border border-proto-surface1 shadow-lg">
          <span className="text-[11px] text-proto-subtext block uppercase">DETECTED OPERATIVES</span>
          <div className="text-2xl font-black text-proto-text mt-1 flex items-baseline gap-2">
            <span className="text-proto-system">247</span>
            <span className="text-xs text-proto-subtext font-normal">AGENTS ACTIVE</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-proto-base border border-proto-surface1 shadow-lg">
          <span className="text-[11px] text-proto-subtext block uppercase">CIRCUITS RECOVERED</span>
          <div className="text-2xl font-black text-proto-logic mt-1">
            {telemetry.completedSolves} <span className="text-xs text-proto-subtext font-normal">/ 15 CORE</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-proto-base border border-proto-surface1 shadow-lg">
          <span className="text-[11px] text-proto-subtext block uppercase">DISINFO CONTAMINATION</span>
          <div className="text-2xl font-black text-proto-crimson mt-1 flex items-center gap-2">
            <span>{telemetry.disinfoIssued}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-proto-crimson/20 text-proto-crimson font-normal">
              TRAPS DEPLOYED
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-proto-base border border-proto-surface1 shadow-lg">
          <span className="text-[11px] text-proto-subtext block uppercase">LEADER SCORE</span>
          <div className="text-2xl font-black text-proto-gold mt-1">
            {sortedAgents[0]?.score || 0} <span className="text-xs text-proto-subtext font-normal">PTS</span>
          </div>
        </div>
      </div>

      {/* Leaderboard & Node Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Leaderboard */}
        <div className="lg:col-span-8 bg-proto-base border border-proto-surface1 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-proto-surface1 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-proto-gold" />
              <h3 className="text-xs font-bold uppercase text-proto-text">
                CLAUDE PRO SUBSCRIPTION LEADERBOARD
              </h3>
            </div>
            <span className="text-[11px] text-proto-gold font-bold">
              TOP OPERATIVE WINS PRIZE
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-proto-surface1 text-proto-subtext text-[10px] uppercase">
                  <th className="pb-2">Rank</th>
                  <th className="pb-2">Operative</th>
                  <th className="pb-2">Domain</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Clearance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-proto-surface1/60">
                {sortedAgents.map((ag, index) => (
                  <tr key={ag.id} className="hover:bg-proto-surface0/40 transition-colors">
                    <td className="py-3 font-bold text-proto-subtext">
                      {index === 0 ? '👑 #1' : `#${index + 1}`}
                    </td>
                    <td className="py-3">
                      <div className="font-bold text-proto-text">{ag.name}</div>
                      <div className="text-[10px] text-proto-subtext">{ag.agent_id}</div>
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-proto-surface0 text-proto-logic border border-proto-logic/30">
                        {ag.archetype}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] ${
                          ag.is_active ? 'text-proto-signal font-bold' : 'text-proto-subtext'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            ag.is_active ? 'bg-proto-signal animate-pulse' : 'bg-proto-subtext/40'
                          }`}
                        />
                        {ag.is_active ? 'ON SITE' : 'OFF SITE'}
                      </span>
                    </td>
                    <td className="py-3 text-right font-black text-proto-gold text-sm">
                      {ag.score} PTS
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Node Solves Distribution */}
        <div className="lg:col-span-4 bg-proto-base border border-proto-surface1 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-proto-surface1 pb-3">
            <h3 className="text-xs font-bold uppercase text-proto-text flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-proto-logic" />
              SOLVE DISTRIBUTION
            </h3>
          </div>

          <div className="space-y-3">
            {Object.entries(telemetry.distribution).map(([nodeId, count]) => (
              <div key={nodeId} className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-proto-text font-bold truncate max-w-[180px]">{nodeId}</span>
                  <span className="text-proto-logic font-bold">{count} solves</span>
                </div>
                <div className="h-2 w-full bg-proto-obsidian rounded-full overflow-hidden p-0.5 border border-proto-surface1">
                  <div
                    className="h-full bg-proto-logic rounded-full transition-all shadow-[0_0_8px_#00d2ff]"
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
