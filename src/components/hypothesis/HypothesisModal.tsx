'use client';

import React, { useState } from 'react';
import { Agent } from '@/types/database';
import { Store } from '@/lib/store';
import { soundEffects } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { 
  X, 
  AlertTriangle, 
  Send, 
  FileSearch,
  ShieldCheck,
  Trophy
} from 'lucide-react';

interface HypothesisModalProps {
  isOpen: boolean;
  agent: Agent;
  onClose: () => void;
  onSuccess: () => void;
}

export const HypothesisModal: React.FC<HypothesisModalProps> = ({
  isOpen,
  agent,
  onClose,
  onSuccess,
}) => {
  const [coreOrigin, setCoreOrigin] = useState('');
  const [evidence, setEvidence] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coreOrigin.trim() || !evidence.trim()) return;

    setIsSubmitting(true);
    const res = Store.submitHypothesis(agent.agent_id, evidence.trim(), coreOrigin.trim());

    if (res.success) {
      soundEffects.playSuccessChime();
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 }
      });
      setStatusMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } else {
      soundEffects.playLockoutBuzz();
      setStatusMsg({ type: 'error', text: res.message });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-proto-obsidian/85 backdrop-blur-md animate-in fade-in duration-200 font-mono-cyber">
      <div className="relative w-full max-w-xl bg-proto-base border-2 border-proto-gold/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-proto-mantle border-b border-proto-surface1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-proto-gold/20 text-proto-gold">
              <Trophy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-proto-text">
                THE PROTOCOL TOPOLOGY DEDUCTION
              </h3>
              <p className="text-xs text-proto-gold font-bold">
                Synthesize clues • Deduce the entity • +400 Flat Points
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-proto-subtext hover:text-proto-crimson hover:bg-proto-surface0 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Parity Explainer */}
          <div className="p-4 rounded-xl bg-proto-surface0 border border-proto-surface1 text-xs space-y-2">
            <div className="flex items-center gap-2 text-proto-gold font-black">
              <FileSearch className="w-4 h-4 text-proto-gold" />
              LATE-ENTRY PARITY MECHANISM (+400 PTS)
            </div>
            <p className="text-proto-subtext leading-relaxed font-sans">
              Operatives who correctly reconstruct the hidden narrative of The Protocol receive a flat +400 points, boosting their chances to win the <strong>Claude Pro Subscription</strong>. Beware poisoned disinformation from rogue telemetry drops!
            </p>
          </div>

          {/* Feedback message */}
          {statusMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                statusMsg.type === 'success'
                  ? 'bg-proto-signal/15 border-proto-signal/40 text-proto-signal'
                  : 'bg-proto-crimson/15 border-proto-crimson/40 text-proto-crimson'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Question 1: System Origin */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-proto-text uppercase">
              1. What is the true origin and nature of The Protocol system?
            </label>
            <input
              type="text"
              required
              value={coreOrigin}
              onChange={(e) => setCoreOrigin(e.target.value)}
              placeholder="e.g. 1994 Autonomic AI routing daemon self-assembling..."
              className="w-full px-3.5 py-2.5 text-xs bg-proto-surface0 border border-proto-surface1 rounded-xl text-proto-text focus:outline-none focus:border-proto-gold placeholder:text-proto-subtext/40"
            />
          </div>

          {/* Question 2: Evidence Synthesis */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-proto-text uppercase">
              2. Evidence Synthesis & Cross-Operative Correlation:
            </label>
            <textarea
              required
              rows={4}
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Synthesize intel across Logic, Signal, Observation, System, and Social domains. Explain why false rumors (like satellite or power transformers) were planted..."
              className="w-full px-3.5 py-2.5 text-xs bg-proto-surface0 border border-proto-surface1 rounded-xl text-proto-text focus:outline-none focus:border-proto-gold placeholder:text-proto-subtext/40 font-sans"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-proto-gold to-proto-system text-proto-obsidian font-black text-xs tracking-wider uppercase hover:opacity-95 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            SUBMIT TOPOLOGY DEDUCTION (+400 PTS)
          </button>
        </form>
      </div>
    </div>
  );
};
