'use client';

import React from 'react';
import { Agent } from '@/types/database';
import { Shield, Radio, Award, ScanLine, Activity, Trophy } from 'lucide-react';

interface StatusRibbonProps {
  agent: Agent;
  networkStatus: string;
  onOpenScanner: () => void;
}

export const StatusRibbon: React.FC<StatusRibbonProps> = ({
  agent,
  networkStatus,
  onOpenScanner,
}) => {
  const getArchetypeBadge = (archetype: Agent['archetype']) => {
    switch (archetype) {
      case 'LOGIC':
      case 'CRYPTOGRAPHER':
        return { label: 'LOGIC', color: 'bg-proto-logic/15 text-proto-logic border-proto-logic shadow-[0_0_10px_rgba(0,210,255,0.2)]' };
      case 'SIGNAL':
      case 'SIGNAL_ANALYST':
        return { label: 'SIGNAL', color: 'bg-proto-signal/15 text-proto-signal border-proto-signal shadow-[0_0_10px_rgba(0,255,136,0.2)]' };
      case 'OBSERVATION':
      case 'FIELD_OPERATIVE':
        return { label: 'OBSERVATION', color: 'bg-proto-obs/15 text-proto-obs border-proto-obs shadow-[0_0_10px_rgba(191,85,236,0.2)]' };
      case 'SYSTEM':
      case 'ARCHIVIST':
        return { label: 'SYSTEM', color: 'bg-proto-system/15 text-proto-system border-proto-system shadow-[0_0_10px_rgba(255,119,0,0.2)]' };
      case 'SOCIAL':
        return { label: 'SOCIAL', color: 'bg-proto-social/15 text-proto-social border-proto-social shadow-[0_0_10px_rgba(0,240,255,0.2)]' };
    }
  };

  const badge = getArchetypeBadge(agent.archetype);

  return (
    <header className="sticky top-0 z-30 w-full bg-proto-base/95 backdrop-blur-md border-b border-proto-surface1">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Agent Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-proto-surface0 border border-proto-surface1 flex items-center justify-center text-proto-signal shadow-inner">
            <div className="font-mono-cyber font-black text-xs">NITW</div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono-cyber font-bold text-sm tracking-wider text-proto-text">
                {agent.agent_id}
              </span>
              <span
                className={`text-[10px] font-mono-cyber font-black px-2.5 py-0.5 rounded border ${badge.color}`}
              >
                [{badge.label}]
              </span>
            </div>
            <p className="text-xs text-proto-subtext truncate max-w-[180px]">
              {agent.name}
            </p>
          </div>
        </div>

        {/* Telemetry & Score */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          {/* Active Agents Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-proto-surface0 border border-proto-system/40 text-xs">
            <span className="w-2 h-2 rounded-full bg-proto-system animate-pulse" />
            <span className="font-mono-cyber text-[11px] text-proto-system font-bold">
              247 DETECTED
            </span>
            <span className="text-[10px] text-proto-subtext/80 font-mono-cyber pl-1 border-l border-proto-surface1">
              18ms
            </span>
          </div>

          {/* Clearance Score */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-proto-surface0 border border-proto-gold/50 shadow-[0_0_12px_rgba(255,190,59,0.15)]">
            <Trophy className="w-4 h-4 text-proto-gold" />
            <div className="text-right">
              <div className="text-[10px] uppercase font-mono-cyber text-proto-subtext leading-none">
                Score
              </div>
              <div className="text-base font-mono-cyber font-black text-proto-gold leading-tight">
                {agent.score} <span className="text-[10px] font-normal text-proto-subtext">PTS</span>
              </div>
            </div>
          </div>

          {/* Quick Scanner Launcher */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-proto-logic to-proto-signal text-proto-obsidian font-black text-xs uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all shadow-md"
            title="Scan Badge or Node QR"
          >
            <ScanLine className="w-4 h-4" />
            <span className="hidden sm:inline">Sensor</span>
          </button>
        </div>
      </div>
    </header>
  );
};
