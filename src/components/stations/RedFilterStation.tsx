'use client';

import React, { useState } from 'react';
import { NodeItem } from '@/types/database';
import { Eye, Grid, Sparkles, KeyRound } from 'lucide-react';

interface RedFilterStationProps {
  node: NodeItem;
  answerInput: string;
  setAnswerInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const RedFilterStation: React.FC<RedFilterStationProps> = ({
  node,
  answerInput,
  setAnswerInput,
  onSubmit,
  isSubmitting
}) => {
  const [activeTab, setActiveTab] = useState<'RED_FILTER' | 'CARDAN_GRILLE'>('RED_FILTER');
  const [isFilterEngaged, setIsFilterEngaged] = useState(false);
  const [grilleOffset, setGrilleOffset] = useState(0);

  const opticalPin = (typeof node.payload.optical_pin === 'string' && node.payload.optical_pin) || '8492';
  const cardanDirective = (typeof node.payload.cardan_directive === 'string' && node.payload.cardan_directive) || 'STRIKE AT DUSK';
  const denseBlock = (typeof node.payload.grille_text === 'string' && node.payload.grille_text) || 'S 9 T 4 R I 2 K E 8 A T 0 D U S K 1 9 7 2';

  // Cardan tokens split into grid
  const letters = denseBlock.split(' ').filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 bg-[#0b130e] p-1 rounded-xl border border-[#1b2b20]">
        <button
          type="button"
          onClick={() => setActiveTab('RED_FILTER')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'RED_FILTER'
              ? 'bg-red-950/70 border border-red-500/50 text-red-400 shadow-md'
              : 'text-[#8ea897] hover:text-[#eaf2ec]'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>OPTICAL RED FILTER (650nm)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CARDAN_GRILLE')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'CARDAN_GRILLE'
              ? 'bg-amber-950/70 border border-amber-500/50 text-amber-400 shadow-md'
              : 'text-[#8ea897] hover:text-[#eaf2ec]'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>SLOTTED CARDAN GRILLE</span>
        </button>
      </div>

      {/* Mode 1: Optical Red Filter Simulation */}
      {activeTab === 'RED_FILTER' && (
        <div className="bg-[#0b130e] border border-red-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1b2a20] pb-3">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
              Chromatic Camouflage Placard
            </span>
            <button
              type="button"
              onClick={() => setIsFilterEngaged(!isFilterEngaged)}
              className={`text-xs px-3.5 py-1.5 rounded-xl border font-bold uppercase transition-all cursor-pointer ${
                isFilterEngaged
                  ? 'bg-red-600 text-white shadow-lg border-red-400'
                  : 'bg-[#152219] border-[#293d30] text-[#8ea897] hover:text-[#eaf2ec]'
              }`}
            >
              {isFilterEngaged ? 'RED FILTER: ENGAGED' : 'ENGAGE RED FILTER SHEET'}
            </button>
          </div>

          {/* Poster Surface */}
          <div className="relative p-8 rounded-xl border border-[#233529] overflow-hidden min-h-[160px] flex items-center justify-center select-none bg-[#050906]">
            {/* Background noise lines */}
            <div className="absolute inset-0 flex flex-wrap opacity-40">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1/3 h-10 border-t border-r rotate-6"
                  style={{
                    borderColor: i % 2 === 0 ? '#38bdf8' : '#22c55e'
                  }}
                />
              ))}
            </div>

            {/* Hidden PIN text with chromatic noise */}
            <div className="relative text-3xl sm:text-5xl font-black tracking-[0.3em] font-mono z-10">
              {isFilterEngaged ? (
                <span className="text-white drop-shadow-[0_0_15px_rgba(239,68,68,0.9)] animate-in fade-in duration-300">
                  {opticalPin}
                </span>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-[#0284c7] line-through blur-[1px]">8</span>
                  <span className="text-[#10b981] blur-[1px]">4</span>
                  <span className="text-[#06b6d4] line-through blur-[1px]">9</span>
                  <span className="text-[#14b8a6] blur-[1px]">2</span>
                </div>
              )}
            </div>

            {/* Red transparency overlay */}
            {isFilterEngaged && (
              <div className="absolute inset-0 bg-red-600/75 mix-blend-multiply backdrop-blur-[0.5px] pointer-events-none transition-all duration-300" />
            )}
          </div>

          <p className="text-[11px] text-[#7d9787] text-center">
            {isFilterEngaged
              ? 'Cyan & green chromatic noise cancelled by the red spectrum pass. Hidden 4-digit PIN is revealed!'
              : 'Looking through a physical red transparency cancels cyan noise to expose the underlying 4-digit PIN.'}
          </p>
        </div>
      )}

      {/* Mode 2: Cardan Grille Aperture Alignment */}
      {activeTab === 'CARDAN_GRILLE' && (
        <div className="bg-[#0b130e] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1b2a20] pb-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Aperture Card Alignment Grid
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#8ea897] uppercase">Slide Aperture Card:</span>
              <button
                type="button"
                onClick={() => setGrilleOffset(grilleOffset === 0 ? 1 : 0)}
                className="px-3 py-1 text-xs rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold hover:bg-amber-500/30 transition-colors"
              >
                {grilleOffset === 0 ? 'ALIGN TO SECRET APERTURE' : 'RESET POSITION'}
              </button>
            </div>
          </div>

          {/* Letter Matrix with Cardan Overlay */}
          <div className="p-4 rounded-xl bg-[#070d09] border border-[#1b2a20] space-y-3">
            <div className="text-[10px] text-[#7d9787] uppercase">Dense Text Block:</div>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 font-mono text-center">
              {letters.map((char, idx) => {
                const isRevealed = grilleOffset === 1 && idx % 2 === 0;
                return (
                  <div
                    key={idx}
                    className={`h-9 flex items-center justify-center rounded-lg font-black text-sm transition-all duration-300 border ${
                      isRevealed
                        ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)] scale-105'
                        : grilleOffset === 1
                        ? 'opacity-20 bg-transparent border-transparent text-[#55695c]'
                        : 'bg-[#101913] border-[#223327] text-[#cad3f5]'
                    }`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>

            {grilleOffset === 1 && (
              <div className="mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs flex items-center justify-between">
                <span className="text-amber-400 font-bold uppercase">Decoded Directive:</span>
                <span className="font-mono font-black text-amber-200 text-sm tracking-widest">{cardanDirective}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reconnaissance Clue Banner */}
      <div className="p-4 rounded-xl bg-[#111a14] border border-[#233529] text-xs space-y-1.5">
        <div className="text-[10px] font-black text-proto-logic uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>OPTICS / TACTILE DIRECTIVE:</span>
        </div>
        <p className="text-[#cad3f5] font-sans leading-relaxed">
          {node.payload.hint || 'Look through the physical red optical transparency sheet to cancel chromatic noise, or slide the slotted Cardan card over the dense text block.'}
        </p>
      </div>

      {/* Answer Submission Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] text-[#8ea897] uppercase mb-1.5 font-bold flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-proto-logic" />
            <span>{node.payload.prompt || 'Submit the 4-digit optical PIN or decoded directive sentence:'}</span>
          </label>
          <input
            type="text"
            required
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            placeholder="e.g. 8492 or STRIKE AT DUSK"
            className="w-full px-4 py-3 text-sm bg-[#09110d] border border-[#273a2e] rounded-xl text-[#f3f7f4] focus:outline-none focus:border-proto-logic font-mono uppercase tracking-wider"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !answerInput.trim()}
          className="w-full py-3.5 px-4 rounded-xl bg-proto-logic hover:bg-[#2fd9ff] disabled:opacity-50 text-[#0a0f0d] font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>TRANSMIT DECODED BYPASS CODE</span>
        </button>
      </form>
    </div>
  );
};
