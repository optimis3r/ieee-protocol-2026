'use client';

import React, { useState } from 'react';
import { NodeItem } from '@/types/database';
import { ShieldAlert, Users, AlertTriangle, Sparkles, Scale, FileWarning, CheckCircle } from 'lucide-react';

interface RogueIntelStationProps {
  node: NodeItem;
  answerInput: string;
  setAnswerInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const RogueIntelStation: React.FC<RogueIntelStationProps> = ({
  node,
  answerInput,
  setAnswerInput,
  onSubmit,
  isSubmitting
}) => {
  const [activeTab, setActiveTab] = useState<'GAME_THEORY' | 'ROGUE_INTEL'>('GAME_THEORY');
  const [partnerId, setPartnerId] = useState('');
  const [choice, setChoice] = useState<'COOPERATE' | 'DEFECT' | null>(null);

  const coopPts = Number(node.payload.coop_points) || 40;
  const defectPts = Number(node.payload.defect_points) || 70;
  const leakText = (typeof node.payload.rogue_leak_text === 'string' && node.payload.rogue_leak_text) ||
    'TOP SECRET IEEE WARANGAL DISPATCH: All operatives proceed to Room 404 immediately. Document Stamped: 1994-09-31. Signature: NITW-COUNCIL.';
  const forgeryHint = (typeof node.payload.forgery_hint === 'string' && node.payload.forgery_hint) ||
    'Inspect the stamped calendar date closely (September has only 30 days!).';
  const forgeryCode = (typeof node.payload.forgery_code === 'string' && node.payload.forgery_code) ||
    'FORGERY_DETECTED_1994';

  const handleInspectForgery = () => {
    setAnswerInput(forgeryCode);
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex items-center gap-2 bg-[#0b130e] p-1 rounded-xl border border-[#1b2b20]">
        <button
          type="button"
          onClick={() => setActiveTab('GAME_THEORY')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'GAME_THEORY'
              ? 'bg-proto-gold/20 border border-proto-gold/40 text-proto-gold shadow-md'
              : 'text-[#8ea897] hover:text-[#eaf2ec]'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>TWO-MAN RULE (SPLIT OR STEAL)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ROGUE_INTEL')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'ROGUE_INTEL'
              ? 'bg-proto-crimson/20 border border-proto-crimson/40 text-proto-crimson shadow-md'
              : 'text-[#8ea897] hover:text-[#eaf2ec]'
          }`}
        >
          <FileWarning className="w-3.5 h-3.5" />
          <span>ROGUE INTEL (FORGERY AUDIT)</span>
        </button>
      </div>

      {/* Mode 1: Two-Man Rule Game Theory */}
      {activeTab === 'GAME_THEORY' && (
        <div className="bg-[#0b130e] border border-proto-gold/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1b2a20] pb-3">
            <div className="flex items-center gap-2 text-proto-gold text-xs font-bold uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>Two-Man Dual Tap Synchronizer</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-proto-gold/15 border border-proto-gold/30 text-proto-gold font-bold">
              GAME THEORY MATRIX
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#08110b] border border-[#1b281f] space-y-2 text-xs">
            <span className="text-[10px] text-[#7d9787] uppercase font-mono font-bold block">
              Payoff Matrix Rules:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-[#0e1b12] border border-emerald-500/30 text-emerald-400">
                <strong>Both Cooperate:</strong> +{coopPts} PTS each
              </div>
              <div className="p-2.5 rounded-lg bg-[#1a0f0d] border border-red-500/30 text-red-400">
                <strong>Defect / Sabotage:</strong> +{defectPts} PTS (Victim gets 0)
              </div>
            </div>
            <p className="text-[11px] text-[#7d9787] pt-1">
              Two operatives must synchronize at the station simultaneously. Enter your partner&apos;s Agent ID.
            </p>
          </div>

          {/* Decision Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setChoice('COOPERATE')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                choice === 'COOPERATE'
                  ? 'bg-emerald-950/70 border-emerald-400 shadow-lg'
                  : 'bg-[#0e1711] border-[#223328] hover:border-emerald-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-emerald-400 text-xs uppercase">COOPERATE</span>
                <span className="text-xs font-mono font-bold text-emerald-300">+{coopPts} PTS</span>
              </div>
              <p className="text-[10px] text-[#8ea897] mt-1">Split the bounty honorably with your peer operative.</p>
            </button>

            <button
              type="button"
              onClick={() => setChoice('DEFECT')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                choice === 'DEFECT'
                  ? 'bg-red-950/70 border-red-400 shadow-lg'
                  : 'bg-[#0e1711] border-[#223328] hover:border-red-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-red-400 text-xs uppercase">DEFECT / SABOTAGE</span>
                <span className="text-xs font-mono font-bold text-red-300">+{defectPts} PTS</span>
              </div>
              <p className="text-[10px] text-[#8ea897] mt-1">Seize maximum clearance points, leaving peer with 0.</p>
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Rogue Intel Forgery Detection */}
      {activeTab === 'ROGUE_INTEL' && (
        <div className="bg-[#0b130e] border border-proto-crimson/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1b2a20] pb-3">
            <div className="flex items-center gap-2 text-proto-crimson text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Intercepted Misinformation Node</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-proto-crimson/15 border border-proto-crimson/30 text-proto-crimson font-bold">
              COUNTER-INTEL
            </span>
          </div>

          {/* Intercepted Clipboard Document */}
          <div className="p-5 rounded-xl bg-[#090f0b] border border-[#203126] font-mono text-xs leading-relaxed space-y-2">
            <div className="text-[10px] text-red-400 uppercase font-bold border-b border-red-900/40 pb-1 flex justify-between">
              <span>LEAKED CONFIDENTIAL DISPATCH</span>
              <span>STAMP: 1994-09-31</span>
            </div>
            <p className="text-[#eaf2ec]">
              {leakText}
            </p>
            <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/30 text-[11px] text-red-300">
              <strong>Subtle Timestamp Flaw:</strong> {forgeryHint}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleInspectForgery}
              className="px-4 py-2 rounded-xl bg-proto-signal text-[#0a0f0d] font-bold text-xs uppercase flex items-center gap-1.5 shadow hover:bg-[#00e676] transition-colors cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>FLAG AS FORGED COUNTER-INTEL (+BONUS)</span>
            </button>
          </div>
        </div>
      )}

      {/* Reconnaissance Clue Banner */}
      <div className="p-4 rounded-xl bg-[#111a14] border border-[#233529] text-xs space-y-1.5">
        <div className="text-[10px] font-black text-proto-gold uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>STATION PROTOCOL OBJECTIVE:</span>
        </div>
        <p className="text-[#cad3f5] font-sans leading-relaxed">
          {node.payload.hint || 'Inspect the open confidential leak clipboard for forged timestamps, or synchronize with a peer in the Split-or-Steal chamber.'}
        </p>
      </div>

      {/* Answer / Forgery Passcode Submission Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] text-[#8ea897] uppercase mb-1.5 font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-proto-gold" />
            <span>{node.payload.prompt || 'Submit Forgery Verification Code or Game Theory Passcode:'}</span>
          </label>
          <input
            type="text"
            required
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            placeholder="e.g. FORGERY_DETECTED_1994 or HANDSHAKE CODE"
            className="w-full px-4 py-3 text-sm bg-[#09110d] border border-[#273a2e] rounded-xl text-[#f3f7f4] focus:outline-none focus:border-proto-gold font-mono uppercase tracking-wider"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !answerInput.trim()}
          className="w-full py-3.5 px-4 rounded-xl bg-proto-gold hover:bg-[#ffd000] disabled:opacity-50 text-[#0a0f0d] font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>TRANSMIT DECISION / VERIFICATION</span>
        </button>
      </form>
    </div>
  );
};
