'use client';

import React from 'react';
import { Agent, ROLE_DETAILS, PrimaryDomain } from '@/types/database';
import { formatActiveTimeClock } from '@/lib/store';
import { 
  Trophy, 
  Clock, 
  Sparkles, 
  Users, 
  Layers, 
  ScanLine, 
  Ticket 
} from 'lucide-react';

interface StatusRibbonProps {
  agent: Agent;
  networkStatus: string;
  activeSeconds: number;
  discoveriesCount: number;
  connectionsCount: number;
  availableNodesCount: number;
  onOpenScanner: () => void;
}

export const StatusRibbon: React.FC<StatusRibbonProps> = ({
  agent,
  networkStatus,
  activeSeconds,
  discoveriesCount,
  connectionsCount,
  availableNodesCount,
  onOpenScanner,
}) => {
  const roleKey = (agent.archetype as PrimaryDomain) || 'LOGIC';
  const roleMeta = ROLE_DETAILS[roleKey] || ROLE_DETAILS.LOGIC;
  const isActive = agent.check_in_status === 'ACTIVE';

  return (
    <header className="sticky top-0 z-30 w-full bg-[#101713]/95 backdrop-blur-md border-b border-[#223027] font-mono-cyber">
      {/* Primary Telemetry Strip */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Agent ID & Wristband Callout */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#16201a] border border-[#26372d] flex items-center justify-center text-proto-signal font-black text-xs shadow-inner">
            NW
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-wider text-[#f3f7f4]">
                {agent.agent_number || agent.agent_id}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#1c2921] border border-proto-gold/40 text-proto-gold font-bold flex items-center gap-1">
                <Ticket className="w-3 h-3" />
                <span>Band: {agent.wristband_id || agent.agent_id}</span>
              </span>
            </div>
            <div className="text-[10px] text-[#8ea897] truncate max-w-[180px]">
              {agent.name}
            </div>
          </div>
        </div>

        {/* Dynamic Metric Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          {/* Active Play Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141d17] border border-[#223027]">
            {isActive ? (
              <span className="w-2 h-2 rounded-full bg-proto-signal animate-pulse" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-proto-gold" />
            )}
            <Clock className="w-3.5 h-3.5 text-[#8ea897]" />
            <div>
              <div className="text-[9px] uppercase text-[#7d9787] leading-none">
                {isActive ? 'Active Play' : 'Timer Paused'}
              </div>
              <div className={`text-xs font-black leading-tight ${isActive ? 'text-proto-signal' : 'text-proto-gold'}`}>
                {formatActiveTimeClock(activeSeconds)}
              </div>
            </div>
          </div>

          {/* Discoveries */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#141d17] border border-[#223027]">
            <Sparkles className="w-3.5 h-3.5 text-proto-obs" />
            <div>
              <div className="text-[9px] uppercase text-[#7d9787] leading-none">
                Discoveries
              </div>
              <div className="text-xs font-black text-[#f3f7f4] leading-tight">
                {discoveriesCount}
              </div>
            </div>
          </div>

          {/* Connections */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#141d17] border border-[#223027]">
            <Users className="w-3.5 h-3.5 text-proto-social" />
            <div>
              <div className="text-[9px] uppercase text-[#7d9787] leading-none">
                Connections
              </div>
              <div className="text-xs font-black text-[#f3f7f4] leading-tight">
                {connectionsCount}
              </div>
            </div>
          </div>

          {/* Available Nodes */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#141d17] border border-[#223027]">
            <Layers className="w-3.5 h-3.5 text-proto-logic" />
            <div>
              <div className="text-[9px] uppercase text-[#7d9787] leading-none">
                Circuits
              </div>
              <div className="text-xs font-black text-[#f3f7f4] leading-tight">
                {availableNodesCount} Avail
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141d17] border border-proto-gold/50 shadow-[0_0_10px_rgba(255,190,59,0.12)]">
            <Trophy className="w-4 h-4 text-proto-gold" />
            <div>
              <div className="text-[9px] uppercase text-[#8ea897] leading-none">
                Score
              </div>
              <div className="text-sm font-black text-proto-gold leading-tight">
                {agent.score} <span className="text-[10px] text-[#8ea897] font-normal">PTS</span>
              </div>
            </div>
          </div>

          {/* Scanner Button */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-proto-logic to-proto-signal text-[#0a0f0d] font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow cursor-pointer"
            title="Scan Physical Node QR or Peer Badge"
          >
            <ScanLine className="w-4 h-4" />
            <span>Scan Tag</span>
          </button>
        </div>
      </div>

      {/* Directive Ribbon */}
      <div className="bg-[#0a0f0d] border-t border-[#1b2620] px-3 sm:px-6 py-1 flex items-center justify-between text-[11px] text-[#8ea897]">
        <div className="flex items-center gap-2 truncate">
          <span className="text-proto-signal font-black">DIRECTIVE:</span>
          <span className="font-bold text-[#f3f7f4]">{roleMeta.title}</span>
          <span className="text-[#8ea897] truncate hidden xs:inline">[{roleMeta.subtitle}]</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-[10px]">
          <span>LOCKOUT: <strong className="text-[#f3f7f4]">8:00 PM</strong></span>
          <span className="hidden sm:inline opacity-40">•</span>
          <span className="hidden sm:inline">STATE: <strong className="text-proto-signal">{networkStatus}</strong></span>
        </div>
      </div>
    </header>
  );
};
