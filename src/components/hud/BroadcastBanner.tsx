'use client';

import React from 'react';
import { AlertTriangle, Radio, ShieldAlert } from 'lucide-react';

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
      <div className="w-full bg-cat-red text-cat-crust px-4 py-2.5 flex items-center justify-center gap-3 font-mono-cyber text-xs font-bold uppercase tracking-wider shadow-lg animate-pulse">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>CRITICAL SYSTEM LOCKOUT: NETWORK SUSPENDED BY OPERATIONS DESK. ALL SUBMISSIONS BLOCKED.</span>
      </div>
    );
  }

  if (!broadcast) return null;

  return (
    <div className="w-full bg-cat-surface0/90 border-b border-cat-surface1 px-4 py-2 text-xs flex items-center justify-between gap-3 text-cat-text">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="flex items-center gap-1 text-cat-yellow font-mono-cyber font-bold shrink-0">
          <Radio className="w-3.5 h-3.5 animate-pulse text-cat-yellow" />
          BROADCAST:
        </span>
        <span className="truncate font-mono-cyber text-cat-text/90">
          {broadcast}
        </span>
      </div>
      <span className="text-[10px] font-mono-cyber text-cat-subtext shrink-0 hidden md:inline">
        PRIORITY 1 TELEMETRY
      </span>
    </div>
  );
};
