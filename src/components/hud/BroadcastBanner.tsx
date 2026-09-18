'use client';

import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface BroadcastBannerProps {
  broadcast: string | null;
  status: string;
}

export const BroadcastBanner: React.FC<BroadcastBannerProps> = ({
  broadcast,
  status,
}) => {
  if (status === 'NETWORK_LOCKED') {
    return (
      <div className="w-full bg-proto-crimson text-proto-obsidian px-4 py-2.5 flex items-center justify-center gap-3 font-mono-cyber text-xs font-black uppercase tracking-wider shadow-lg animate-pulse">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>CRITICAL PROTOCOL LOCKOUT: ALL CIRCUITS FROZEN BY OPERATIONS DESK.</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-proto-surface0/95 border-b border-proto-surface1 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-proto-text">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="flex items-center gap-1.5 text-proto-crimson font-mono-cyber font-black shrink-0 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 text-proto-crimson" />
          DIRECTIVE:
        </span>
        <span className="truncate font-mono-cyber text-proto-text/90 font-medium">
          {broadcast || 'PROTOCOL ACTIVE: 247 AGENTS DETECTED // TRUST NO ONE. SOME AGENTS HAVE OTHER OBJECTIVES.'}
        </span>
      </div>
      <span className="text-[10px] font-mono-cyber text-proto-signal font-bold shrink-0 hidden md:inline border border-proto-signal/40 px-2 py-0.5 rounded">
        LEVEL 01 ACCESS
      </span>
    </div>
  );
};
