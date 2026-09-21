'use client';

import React from 'react';
import { Agent, ROLE_DETAILS, PrimaryDomain } from '@/types/database';
import { formatActiveTimeClock } from '@/lib/store';
import { 
  Trophy, 
  Clock, 
  Sparkles, 
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
  availableNodesCount,
  onOpenScanner,
}) => {
  const roleKey = (agent.archetype as PrimaryDomain) || 'LOGIC';
  const roleMeta = ROLE_DETAILS[roleKey] || ROLE_DETAILS.LOGIC;
  const isActive = agent.check_in_status === 'ACTIVE';

  return (
    <header className="sticky top-0 z-30 w-full bg-[#121513] border-b-2 border-[#28302b] font-mono-cyber select-none shadow-md">
      {/* Primary High-Density Telemetry Strip */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-5 py-2 flex items-center justify-between gap-2">
        
        {/* Left: Operative ID & Wristband Tag */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span 
              className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-[#22c55e]' : 'bg-[#eab308]'}`} 
              title={isActive ? 'Session Active' : 'Session Paused'}
            />
            <span className="font-black text-xs sm:text-sm tracking-wider text-[#f1ede4]">
              {agent.agent_id}
            </span>
          </div>

          <span className="text-[10px] text-[#eab308] font-bold border border-[#eab308]/40 px-1 py-0.2 rounded-sm shrink-0 font-mono">
            {agent.wristband_id || agent.agent_id}
          </span>

          <span 
            className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-sm border uppercase"
            style={{ 
              color: roleMeta.color || '#38bdf8', 
              borderColor: `${roleMeta.color || '#38bdf8'}40`,
              backgroundColor: `${roleMeta.color || '#38bdf8'}10`
            }}
          >
            {roleMeta.title}
          </span>
        </div>

        {/* Center: Live Stopwatch Timer */}
        <div className="flex items-center gap-1.5 bg-[#0c0e0d] border border-[#28302b] px-2 py-1 rounded-sm shrink-0">
          <Clock className="w-3 h-3 text-[#8f9e91]" />
          <span className={`text-xs font-mono font-black ${isActive ? 'text-[#22c55e]' : 'text-[#eab308]'}`}>
            {formatActiveTimeClock(activeSeconds)}
          </span>
        </div>

        {/* Right: Score & Tactical Scan Action */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Circuit Count (Tablet / Desktop) */}
          <div className="hidden md:flex items-center gap-1 text-[10px] text-[#8f9e91]">
            <Layers className="w-3 h-3 text-[#38bdf8]" />
            <span>{availableNodesCount} AVAIL</span>
          </div>

          {/* Score Badge */}
          <div className="flex items-center gap-1 text-xs font-mono bg-[#0c0e0d] border border-[#eab308]/40 px-2 py-1 rounded-sm text-[#eab308] font-black">
            <Trophy className="w-3 h-3 text-[#eab308]" />
            <span>{agent.score}</span>
            <span className="text-[9px] text-[#8f9e91] font-normal">PTS</span>
          </div>

          {/* Tactical Scan Action Trigger */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-sm btn-tactile-primary text-[11px] font-black uppercase tracking-wider cursor-pointer"
            title="Scan Physical Station QR"
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span className="text-[10px] sm:text-xs">SCAN</span>
          </button>
        </div>

      </div>

      {/* Slim 18px Tactical Sub-Strip */}
      <div className="bg-[#0c0e0d] border-t border-[#28302b] px-2.5 sm:px-5 py-0.5 flex items-center justify-between text-[9px] text-[#8f9e91] font-mono">
        <div className="flex items-center gap-2 truncate">
          <span className="text-[#22c55e] font-bold">CELL:</span>
          <span className="text-[#f1ede4] truncate">{roleMeta.title} ({roleMeta.subtitle})</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span>NET: <strong className="text-[#f1ede4]">{networkStatus}</strong></span>
        </div>
      </div>
    </header>
  );
};
