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
      <div className="w-full bg-[#c93b2b] text-[#f4f1ea] px-4 py-2 flex items-center justify-center gap-3 font-mono-tabular text-xs font-bold uppercase tracking-wider">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>CRITICAL PROTOCOL LOCKOUT: ALL CIRCUITS FROZEN BY OPERATIONS DESK.</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#1b1d1b] border-b border-[#2d312c] px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-[#f4f1ea]">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="flex items-center gap-1.5 text-[#c93b2b] font-mono-tabular font-bold shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-[#c93b2b]" />
          DIRECTIVE:
        </span>
        <span className="truncate font-mono-tabular text-[#f4f1ea]/90 text-[11px]">
          {broadcast || 'PROTOCOL ACTIVE // TRUST NO ONE. SOME AGENTS HAVE OTHER OBJECTIVES.'}
        </span>
      </div>
      <span className="text-[10px] font-mono-tabular text-[#2d9f5d] font-bold shrink-0 hidden md:inline border border-[#2d9f5d]/40 px-2 py-0.5">
        LEVEL 01 CLEARANCE
      </span>
    </div>
  );
};
