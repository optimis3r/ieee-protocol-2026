'use client';

import React, { useState } from 'react';
import { Agent } from '@/types/database';
import { Store } from '@/lib/store';
import { soundEffects } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  FileSearch,
  ShieldCheck
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cat-crust/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-cat-base border border-cat-mauve/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-cat-mantle border-b border-cat-surface0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cat-mauve/20 text-cat-mauve">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-cat-text font-mono-cyber">
                MASTER TOPOLOGY DEDUCTION ENGINE
              </h3>
              <p className="text-xs text-cat-subtext font-mono-cyber">
                Synthesize clues • Deduce the core entity • Grant +400 Flat Points
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-cat-subtext hover:text-cat-red hover:bg-cat-surface0 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Parity Explainer */}
          <div className="p-4 rounded-xl bg-cat-mantle border border-cat-surface0 text-xs font-mono-cyber space-y-2">
            <div className="flex items-center gap-2 text-cat-yellow font-bold">
              <FileSearch className="w-4 h-4 text-cat-yellow" />
              LATE-ENTRY PARITY MECHANISM (+400 PTS)
            </div>
            <p className="text-cat-subtext leading-relaxed">
              Operatives who correctly reconstruct the hidden narrative of the IEEE Protocol receive a flat +400 points. Beware poisoned disinformation planted in conflicting intel drops.
            </p>
          </div>

          {/* Feedback message */}
          {statusMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-mono-cyber flex items-start gap-2.5 ${
                statusMsg.type === 'success'
                  ? 'bg-cat-green/15 border-cat-green/40 text-cat-green'
                  : 'bg-cat-red/15 border-cat-red/40 text-cat-red'
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
            <label className="block text-xs font-mono-cyber font-bold text-cat-text uppercase">
              1. What is the true origin and nature of the IEEE Protocol system?
            </label>
            <input
              type="text"
              required
              value={coreOrigin}
              onChange={(e) => setCoreOrigin(e.target.value)}
              placeholder="e.g. Autonomic AI routing daemon, 1994 legacy network..."
              className="w-full px-3.5 py-2.5 text-xs font-mono-cyber bg-cat-mantle border border-cat-surface1 rounded-xl text-cat-text focus:outline-none focus:border-cat-mauve placeholder:text-cat-subtext/40"
            />
          </div>

          {/* Question 2: Evidence Synthesis */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono-cyber font-bold text-cat-text uppercase">
              2. Evidence Synthesis & Cross-Operative Correlation:
            </label>
            <textarea
              required
              rows={4}
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Explain how your intel fragments corroborate the central AI simulation and why conflicting rumors (such as satellite uplink or transformer sabotage) are false..."
              className="w-full px-3.5 py-2.5 text-xs font-mono-cyber bg-cat-mantle border border-cat-surface1 rounded-xl text-cat-text focus:outline-none focus:border-cat-mauve placeholder:text-cat-subtext/40"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-cat-mauve text-cat-crust font-bold font-mono-cyber text-xs tracking-wider uppercase hover:bg-cat-mauve/90 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            SUBMIT TOPOLOGY DEDUCTION (+400 PTS)
          </button>
        </form>
      </div>
    </div>
  );
};
