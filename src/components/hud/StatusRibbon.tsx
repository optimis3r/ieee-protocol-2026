'use client';

import React from 'react';
import { Agent } from '@/types/database';
import { Shield, Radio, Award, ScanLine, Activity } from 'lucide-react';

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
      case 'CRYPTOGRAPHER':
        return { label: 'CRYPTOGRAPHER', color: 'bg-cat-mauve/20 text-cat-mauve border-cat-mauve/30' };
      case 'SIGNAL_ANALYST':
        return { label: 'SIGNAL ANALYST', color: 'bg-cat-sapphire/20 text-cat-sapphire border-cat-sapphire/30' };
      case 'FIELD_OPERATIVE':
        return { label: 'FIELD OPERATIVE', color: 'bg-cat-green/20 text-cat-green border-cat-green/30' };
      case 'ARCHIVIST':
        return { label: 'ARCHIVIST', color: 'bg-cat-yellow/20 text-cat-yellow border-cat-yellow/30' };
    }
  };

  const badge = getArchetypeBadge(agent.archetype);

  return (
    <header className="sticky top-0 z-30 w-full bg-cat-mantle/90 backdrop-blur-md border-b border-cat-surface0">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Agent Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cat-surface0 border border-cat-surface1 flex items-center justify-center text-cat-mauve shadow-inner">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono-cyber font-bold text-sm tracking-wider text-cat-text">
                {agent.agent_id}
              </span>
              <span
                className={`text-[10px] font-mono-cyber font-medium px-2 py-0.5 rounded-full border ${badge.color}`}
              >
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-cat-subtext truncate max-w-[180px]">
              {agent.name}
            </p>
          </div>
        </div>

        {/* Telemetry & Score */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          {/* Live Network Pulse */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cat-surface0/60 border border-cat-surface1/60 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                networkStatus === 'NETWORK_ACTIVE'
                  ? 'bg-cat-green animate-pulse'
                  : networkStatus === 'NETWORK_LOCKED'
                  ? 'bg-cat-red'
                  : 'bg-cat-yellow'
              }`}
            />
            <span className="font-mono-cyber text-[11px] text-cat-subtext">
              {networkStatus}
            </span>
            <span className="text-[10px] text-cat-subtext/60 font-mono-cyber pl-1 border-l border-cat-surface1">
              18ms
            </span>
          </div>

          {/* Clearance Score */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cat-surface0 border border-cat-surface1">
            <Award className="w-4 h-4 text-cat-yellow" />
            <div className="text-right">
              <div className="text-[10px] uppercase font-mono-cyber text-cat-subtext leading-none">
                Clearance
              </div>
              <div className="text-base font-mono-cyber font-bold text-cat-yellow leading-tight">
                {agent.score} <span className="text-[10px] font-normal text-cat-subtext">PTS</span>
              </div>
            </div>
          </div>

          {/* Quick Scanner Launcher */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cat-sapphire text-cat-crust font-semibold text-xs uppercase tracking-wider hover:bg-cat-sapphire/90 active:scale-95 transition-all shadow-md"
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
