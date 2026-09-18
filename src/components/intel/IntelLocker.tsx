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
    <div className="space-y-6 font-mono-cyber">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-proto-surface1">
        <div>
          <h2 className="text-lg font-bold text-proto-text flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-proto-obs" />
            CLASSIFIED INTEL ARCHIVE
          </h2>
          <p className="text-xs text-proto-subtext font-sans">
            Asymmetric intelligence fragments from NIT Warangal sector monoliths. Compare with other players.
          </p>
        </div>

        <button
          onClick={onOpenHypothesis}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-proto-obs to-proto-system text-proto-obsidian text-xs font-black tracking-wider hover:opacity-95 transition-all shadow-md self-start sm:self-auto"
        >
          <FileText className="w-4 h-4" />
          DRAFT TOPOLOGY HYPOTHESIS (+400 PTS)
        </button>
      </div>

      {/* Warning Box from Poster: TRUST NO ONE */}
      <div className="p-4 rounded-xl bg-proto-base border-2 border-proto-crimson glow-crimson flex items-start gap-3 text-xs">
        <AlertTriangle className="w-5 h-5 text-proto-crimson shrink-0 mt-0.5 animate-pulse" />
        <div>
          <span className="font-black text-proto-crimson block mb-0.5 tracking-wider">
            ⚠️ TRUST NO ONE. SOME AGENTS HAVE OTHER OBJECTIVES.
          </span>
          <span className="text-proto-subtext font-sans">
            Not all fragments in your possession are genuine. A rogue autonomic daemon has poisoned telemetry channels with false rumors to skew your final topology deduction. Cross-reference evidence across multiple archetypes!
          </span>
        </div>
      </div>

      {intelList.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-proto-base border border-proto-surface1 text-proto-subtext">
          <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-bold">NO DECRYPTED INTEL IN ARCHIVE</p>
          <p className="text-xs opacity-75 mt-1 font-sans">Complete circuit nodes to unlock classified data streams.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {intelList.map(({ intel, revealed_at }, index) => {
            const isDisinfo = intel.is_disinformation;
            return (
              <div
                key={intel.id}
                className={`relative rounded-2xl bg-proto-base border p-5 shadow-xl flex flex-col justify-between overflow-hidden transition-all ${
                  isDisinfo
                    ? 'border-proto-crimson/50 hover:border-proto-crimson'
                    : 'border-proto-surface1 hover:border-proto-obs'
                }`}
              >
                {/* Header ribbon */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span
                      className={`text-[10px] uppercase px-2 py-0.5 rounded border font-bold ${
                        isDisinfo
                          ? 'bg-proto-crimson/20 text-proto-crimson border-proto-crimson/40'
                          : 'bg-proto-surface0 text-proto-obs border-proto-obs/30'
                      }`}
                    >
                      FRAGMENT #{index + 1} • {intel.id}
                    </span>
                    <h3 className="text-sm font-bold text-proto-text mt-1.5 leading-snug">
                      {intel.title}
                    </h3>
                  </div>
                  <div className="p-1.5 rounded-lg bg-proto-surface0 text-proto-obs shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>

                {/* Content body */}
                <div className="p-3.5 rounded-xl bg-proto-obsidian/70 border border-proto-surface1 text-xs text-proto-text/90 leading-relaxed my-2 font-mono-cyber">
                  {intel.content}
                </div>

                {/* Footer metadata */}
                <div className="pt-3 border-t border-proto-surface1 flex items-center justify-between text-[10px] text-proto-subtext">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-proto-signal" />
                    ACQUIRED
                  </span>
                  <span className="opacity-75">
                    {new Date(revealed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Slogan from Poster */}
      <div className="p-3.5 rounded-xl bg-proto-surface0/60 border border-proto-surface1 text-center text-xs text-proto-subtext">
        <span className="text-proto-signal font-bold">IDEAS. INVESTIGATE FURTHER.</span> — Everyone has a role. Not everyone has the same objective.
      </div>
    </div>
  );
};
