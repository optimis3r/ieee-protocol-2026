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
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2d312c]">
        <div>
          <h2 className="font-serif-editorial text-2xl text-[#f4f1ea] flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#c28b28]" />
            Classified Intel Archive
          </h2>
          <p className="font-display-grotesk text-xs text-[#949e93] mt-0.5">
            Asymmetric intelligence fragments recovered from campus station monoliths.
          </p>
        </div>

        <button
          onClick={onOpenHypothesis}
          className="btn-editorial-primary inline-flex items-center gap-2 px-3.5 py-2 text-xs self-start sm:self-auto cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>DRAFT HYPOTHESIS (+400 PTS)</span>
        </button>
      </div>

      {/* Disinformation Warning Strip */}
      <div className="p-3.5 border border-[#c93b2b] bg-[#1c1615] flex items-start gap-3 text-xs">
        <AlertTriangle className="w-4 h-4 text-[#c93b2b] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-mono-tabular font-bold text-[#c93b2b] block tracking-wider text-[11px]">
            [OPERATIONAL DIRECTIVE: TRUST NO ONE]
          </span>
          <p className="font-display-grotesk text-[#f4f1ea]/90 text-[11px] leading-relaxed">
            Not all fragments in circulation are genuine. A rogue autonomic daemon has planted disinformation to skew the final topology deduction. Cross-reference evidence with other archetypes before submitting.
          </p>
        </div>
      </div>

      {intelList.length === 0 ? (
        <div className="p-8 text-center border border-[#2d312c] bg-[#1b1d1b] text-[#949e93]">
          <Lock className="w-6 h-6 mx-auto mb-2 text-[#949e93] opacity-60" />
          <p className="font-mono-tabular text-xs font-bold text-[#f4f1ea] uppercase">NO DECRYPTED INTEL IN ARCHIVE</p>
          <p className="font-display-grotesk text-xs text-[#949e93] mt-1">Complete circuit stations to unlock classified data fragments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {intelList.map(({ intel, revealed_at }, index) => {
            const isDisinfo = intel.is_disinformation;
            return (
              <div
                key={intel.id}
                className={`border p-4 bg-[#1b1d1b] flex flex-col justify-between transition-colors ${
                  isDisinfo
                    ? 'border-[#c93b2b]/60'
                    : 'border-[#2d312c] hover:border-[#3f453f]'
                }`}
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`font-mono-tabular text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 ${
                        isDisinfo
                          ? 'border border-[#c93b2b] text-[#c93b2b] bg-[#141514]'
                          : 'border border-[#2d312c] text-[#c28b28] bg-[#141514]'
                      }`}
                    >
                      FRAGMENT #{String(index + 1).padStart(2, '0')} // {intel.id}
                    </span>
                    <FileText className="w-3.5 h-3.5 text-[#949e93] shrink-0" />
                  </div>

                  <h3 className="font-display-grotesk text-xs font-bold text-[#f4f1ea] mt-1">
                    {intel.title}
                  </h3>

                  {/* Body */}
                  <div className="p-3 bg-[#141514] border border-[#2d312c] text-xs text-[#f4f1ea]/90 leading-relaxed my-2.5 font-mono-tabular">
                    {intel.content}
                  </div>
                </div>

                {/* Footer metadata */}
                <div className="pt-2.5 border-t border-[#2d312c] flex items-center justify-between font-mono-tabular text-[10px] text-[#949e93]">
                  <span className="flex items-center gap-1 text-[#2d9f5d]">
                    <CheckCircle2 className="w-3 h-3" />
                    ACQUIRED
                  </span>
                  <span>
                    {new Date(revealed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slogan strip */}
      <div className="p-3 border border-[#2d312c] bg-[#141514] text-center font-mono-tabular text-[11px] text-[#949e93]">
        <span className="text-[#c28b28] font-bold">DISPATCH:</span> Everyone has a role. Not everyone has the same objective.
      </div>
    </div>
  );
};
