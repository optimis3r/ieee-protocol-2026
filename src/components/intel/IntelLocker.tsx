'use client';

import React from 'react';
import { AgentIntel, IntelFragment } from '@/types/database';
import { FileText, Lock, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface IntelLockerProps {
  intelList: Array<AgentIntel & { intel: IntelFragment }>;
  onOpenHypothesis: () => void;
}

export const IntelLocker: React.FC<IntelLockerProps> = ({
  intelList,
  onOpenHypothesis,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-cat-surface0">
        <div>
          <h2 className="text-lg font-bold font-mono-cyber text-cat-text flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-cat-mauve" />
            CLASSIFIED INTEL VAULT
          </h2>
          <p className="text-xs text-cat-subtext">
            Asymmetric intelligence fragments allocated to your operative clearance. Compare with peers.
          </p>
        </div>

        <button
          onClick={onOpenHypothesis}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cat-mauve text-cat-crust text-xs font-mono-cyber font-bold tracking-wider hover:bg-cat-mauve/90 transition-all shadow-md self-start sm:self-auto"
        >
          <FileText className="w-4 h-4" />
          DRAFT NETWORK TOPOLOGY (+400 PTS)
        </button>
      </div>

      {intelList.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-cat-base border border-cat-surface0 text-cat-subtext">
          <Lock className="w-8 h-8 mx-auto mb-2 opacity-50 text-cat-subtext" />
          <p className="text-sm font-mono-cyber">NO DECRYPTED INTEL IN VAULT</p>
          <p className="text-xs opacity-75 mt-1">Complete circuit nodes to unlock classified data streams.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {intelList.map(({ intel, revealed_at }, index) => {
            return (
              <div
                key={intel.id}
                className="relative rounded-2xl bg-cat-base border border-cat-surface1 p-5 shadow-lg flex flex-col justify-between overflow-hidden hover:border-cat-surface2 transition-all"
              >
                {/* Header ribbon */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono-cyber uppercase px-2 py-0.5 rounded bg-cat-surface0 text-cat-subtext border border-cat-surface1">
                      FRAGMENT #{index + 1} • {intel.id}
                    </span>
                    <h3 className="text-sm font-bold text-cat-text mt-1.5 leading-snug">
                      {intel.title}
                    </h3>
                  </div>
                  <div className="p-1.5 rounded-lg bg-cat-surface0 text-cat-mauve shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>

                {/* Content body */}
                <div className="p-3.5 rounded-xl bg-cat-mantle/70 border border-cat-surface0 font-mono-cyber text-xs text-cat-text/90 leading-relaxed my-2">
                  {intel.content}
                </div>

                {/* Footer metadata */}
                <div className="pt-3 border-t border-cat-surface0/60 flex items-center justify-between text-[10px] text-cat-subtext">
                  <span className="flex items-center gap-1 font-mono-cyber">
                    <CheckCircle2 className="w-3 h-3 text-cat-green" />
                    DECRYPTED
                  </span>
                  <span className="font-mono-cyber opacity-75">
                    {new Date(revealed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cross-Operative Cooperation Callout */}
      <div className="p-4 rounded-xl bg-cat-surface0/40 border border-cat-surface1 flex items-start gap-3 text-xs text-cat-subtext">
        <AlertTriangle className="w-5 h-5 text-cat-peach shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-cat-peach font-mono-cyber block mb-0.5">
            ASYMMETRIC INTEL DIRECTIVE:
          </span>
          No single operative possesses the entire schematic. Beware unverified fragments that contradict foundational protocols. Cross-examine findings with other archetypes to isolate disinformation.
        </div>
      </div>
    </div>
  );
};
