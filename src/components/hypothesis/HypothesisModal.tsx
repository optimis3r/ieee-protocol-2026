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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-lg bg-[#1b1d1b] border border-[#3f453f] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d312c] bg-[#141514]">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-4 h-4 text-[#c28b28]" />
            <div>
              <h3 className="font-serif-editorial text-lg text-[#f4f1ea]">
                Topology Deduction
              </h3>
              <p className="font-mono-tabular text-[10px] text-[#c28b28] uppercase">
                Synthesize clues • +400 Flat Points
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#949e93] hover:text-[#f4f1ea] border border-[#2d312c] hover:border-[#3f453f] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Parity Explainer */}
          <div className="p-3 border border-[#2d312c] bg-[#141514] text-xs space-y-1">
            <div className="font-mono-tabular text-[10px] text-[#c28b28] uppercase font-bold">
              [PARITY DIRECTIVE // +400 CLEARANCE POINTS]
            </div>
            <p className="font-display-grotesk text-[#949e93] leading-relaxed text-[11px]">
              Operatives who correctly reconstruct the hidden architecture of The Protocol receive a flat +400 points toward the <strong>Claude Pro Prize</strong>. Beware disinformation planted in telemetry channels.
            </p>
          </div>

          {/* Feedback message */}
          {statusMsg && (
            <div
              className={`p-3 border text-xs flex items-start gap-2.5 font-mono-tabular ${
                statusMsg.type === 'success'
                  ? 'bg-[#15241b] border-[#2d9f5d] text-[#2d9f5d]'
                  : 'bg-[#251515] border-[#c93b2b] text-[#c93b2b]'
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
          <div className="space-y-1">
            <label className="block font-mono-tabular text-[10px] text-[#949e93] uppercase">
              1. What is the true origin and nature of The Protocol?
            </label>
            <input
              type="text"
              required
              value={coreOrigin}
              onChange={(e) => setCoreOrigin(e.target.value)}
              placeholder="e.g. 1994 Autonomic AI routing daemon self-assembling..."
              className="w-full px-3 py-2 text-xs bg-[#141514] border border-[#2d312c] text-[#f4f1ea] font-mono-tabular focus:outline-none focus:border-[#949e93] placeholder:text-[#949e93]/50"
            />
          </div>

          {/* Question 2: Evidence Synthesis */}
          <div className="space-y-1">
            <label className="block font-mono-tabular text-[10px] text-[#949e93] uppercase">
              2. Evidence Synthesis & Cross-Operative Correlation:
            </label>
            <textarea
              required
              rows={4}
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Synthesize intel across Logic, Signal, Observation, System, and Social domains. Explain why false rumors (like satellite or power transformers) were planted..."
              className="w-full px-3 py-2 text-xs bg-[#141514] border border-[#2d312c] text-[#f4f1ea] font-display-grotesk focus:outline-none focus:border-[#949e93] placeholder:text-[#949e93]/50"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-editorial-primary w-full py-2.5 px-4 text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>SUBMIT TOPOLOGY DEDUCTION (+400 PTS)</span>
          </button>
        </form>
      </div>
    </div>
  );
};
