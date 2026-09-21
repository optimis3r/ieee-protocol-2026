'use client';

import React from 'react';
import { Agent, ROLE_DETAILS, PrimaryDomain } from '@/types/database';
import { formatActiveTimeClock } from '@/lib/store';
import { 
  Trophy, 
  Clock, 
  ScanLine 
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
  availableNodesCount,
  onOpenScanner,
}) => {
  const roleKey = (agent.archetype as PrimaryDomain) || 'LOGIC';
  const roleMeta = ROLE_DETAILS[roleKey] || ROLE_DETAILS.LOGIC;
  const isActive = agent.check_in_status === 'ACTIVE';

  return (
    <header className="sticky top-0 z-30 w-full bg-[#1b1d1b] rule-hairline font-display-grotesk select-none shadow-md">
      {/* Primary High-Density Telemetry Strip */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-3">
        
        {/* Left: Operative ID & Wristband Tag */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span 
              className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-[#2d9f5d]' : 'bg-[#c28b28]'}`} 
              title={isActive ? 'Session Active' : 'Session Paused'}
            />
            <span className="font-bold text-xs sm:text-sm tracking-tight text-[#f4f1ea] font-mono-tabular">
              {agent.agent_id}
            </span>
          </div>

          <span className="text-[10px] text-[#c28b28] font-mono-tabular border border-[#c28b28]/40 px-1 py-0.2 shrink-0">
            {agent.wristband_id || agent.agent_id}
          </span>

          <span 
            className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.2 border uppercase font-mono-tabular"
            style={{ 
              color: roleMeta.color || '#3a8ebd', 
              borderColor: `${roleMeta.color || '#3a8ebd'}40`,
              backgroundColor: `${roleMeta.color || '#3a8ebd'}15`
            }}
          >
            {roleMeta.title}
          </span>
        </div>

        {/* Center: Live Stopwatch Timer */}
        <div className="flex items-center gap-1.5 bg-[#141514] border border-[#2d312c] px-2 py-0.5 shrink-0 font-mono-tabular">
          <Clock className="w-3 h-3 text-[#949e93]" />
          <span className={`text-xs font-bold ${isActive ? 'text-[#2d9f5d]' : 'text-[#c28b28]'}`}>
            {formatActiveTimeClock(activeSeconds)}
          </span>
        </div>

        {/* Right: Score & Tactical Scan Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Circuit Count (Desktop) */}
          <div className="hidden md:flex items-center gap-1 text-[10px] text-[#949e93] font-mono-tabular">
            <span>{availableNodesCount} CIRCUITS</span>
          </div>

          {/* Score Badge */}
          <div className="flex items-center gap-1 text-xs font-mono-tabular bg-[#141514] border border-[#2d312c] px-2 py-0.5 text-[#c28b28] font-bold">
            <Trophy className="w-3 h-3 text-[#c28b28]" />
            <span>{agent.score}</span>
            <span className="text-[9px] text-[#949e93] font-normal">PTS</span>
          </div>

          {/* Tactical Scan Action Trigger */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1 px-2.5 py-1 btn-editorial-primary text-[11px] font-bold uppercase tracking-wider cursor-pointer"
            title="Scan Physical Station QR"
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>SCAN</span>
          </button>
        </div>

      </div>

      {/* Slim 16px Tactical Sub-Strip */}
      <div className="bg-[#141514] rule-hairline px-3 sm:px-6 py-0.5 flex items-center justify-between text-[9px] text-[#949e93] font-mono-tabular">
        <div className="flex items-center gap-2 truncate">
          <span className="text-[#f4f1ea] font-bold">{agent.name}</span>
          <span className="opacity-40">•</span>
          <span className="truncate">{roleMeta.title} Cell</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span>NET: <strong className="text-[#f4f1ea]">{networkStatus}</strong></span>
        </div>
      </div>
    </header>
  );
};
