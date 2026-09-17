'use client';

import React, { useState } from 'react';
import { AgentNode, NodeItem, Agent } from '@/types/database';
import { Store, calculateDynamicScore } from '@/lib/store';
import { soundEffects } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Scan, 
  Users, 
  Terminal, 
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface NodeModalProps {
  nodeItem: (AgentNode & { node: NodeItem }) | null;
  agent: Agent;
  onClose: () => void;
  onSuccess: () => void;
  onOpenScannerForNode: (nodeId: string) => void;
}

export const NodeModal: React.FC<NodeModalProps> = ({
  nodeItem,
  agent,
  onClose,
  onSuccess,
  onOpenScannerForNode,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!nodeItem) return null;

  const { node, is_completed, attempts, points_earned } = nodeItem;
  const globalSolves = Store.getNodeGlobalSolves(node.id);
  const potentialScore = calculateDynamicScore(node.base_points, globalSolves, attempts);

  const handleVerifyKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    setIsSubmitting(true);
    const res = Store.submitNodeAnswer(agent.agent_id, node.id, inputVal.trim());

    if (res.success) {
      soundEffects.playSuccessChime();
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });
      setStatusMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        onSuccess();
      }, 900);
    } else {
      soundEffects.playLockoutBuzz();
      setStatusMsg({ type: 'error', text: res.message });
    }
    setIsSubmitting(false);
  };

  const handleHandshake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId.trim()) return;

    setIsSubmitting(true);
    const res = Store.submitHandshake(agent.agent_id, partnerId.trim(), node.id);

    if (res.success) {
      soundEffects.playSuccessChime();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      setStatusMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } else {
      soundEffects.playLockoutBuzz();
      setStatusMsg({ type: 'error', text: res.message });
    }
    setIsSubmitting(false);
  };

  const renderTypeHeader = () => {
    switch (node.type) {
      case 'PHYSICAL_QR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cat-sapphire/20 text-cat-sapphire text-[11px] font-mono-cyber">
            <Scan className="w-3.5 h-3.5" /> PHYSICAL OPTICAL TAG
          </span>
        );
      case 'TERMINAL_DECRYPT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cat-mauve/20 text-cat-mauve text-[11px] font-mono-cyber">
            <Terminal className="w-3.5 h-3.5" /> CIPHER DECRYPTION
          </span>
        );
      case 'DUAL_HANDSHAKE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cat-yellow/20 text-cat-yellow text-[11px] font-mono-cyber">
            <Users className="w-3.5 h-3.5" /> DUAL OPERATIVE HANDSHAKE
          </span>
        );
      case 'DEDUCTION_HYPOTHESIS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cat-green/20 text-cat-green text-[11px] font-mono-cyber">
            <Sparkles className="w-3.5 h-3.5" /> MASTER TOPOLOGY DEDUCTION
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cat-crust/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-cat-base border border-cat-surface1 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-cat-mantle border-b border-cat-surface0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono-cyber text-xs text-cat-subtext">
                {node.id}
              </span>
              {renderTypeHeader()}
            </div>
            <h3 className="text-base font-bold text-cat-text font-mono-cyber">
              {node.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-cat-subtext hover:text-cat-red hover:bg-cat-surface0 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Dynamic Scoring Ribbon */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-cat-mantle border border-cat-surface0 text-xs">
            <div>
              <span className="text-cat-subtext text-[11px] block font-mono-cyber">BASE VALUE</span>
              <span className="font-mono-cyber font-bold text-cat-text">{node.base_points} PTS</span>
            </div>
            <div className="text-center">
              <span className="text-cat-subtext text-[11px] block font-mono-cyber">SOLVES</span>
              <span className="font-mono-cyber text-cat-sapphire font-bold">{globalSolves}</span>
            </div>
            <div className="text-center">
              <span className="text-cat-subtext text-[11px] block font-mono-cyber">ATTEMPTS</span>
              <span className="font-mono-cyber text-cat-red font-bold">{attempts}</span>
            </div>
            <div className="text-right">
              <span className="text-cat-subtext text-[11px] block font-mono-cyber">POTENTIAL REWARD</span>
              <span className="font-mono-cyber font-bold text-cat-yellow text-sm">
                {is_completed ? `${points_earned || node.base_points} PTS (EARNED)` : `${potentialScore} PTS`}
              </span>
            </div>
          </div>

          {/* Completed Banner */}
          {is_completed && (
            <div className="p-4 rounded-xl bg-cat-green/15 border border-cat-green/40 text-cat-green flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <p className="text-xs font-bold font-mono-cyber uppercase">
                  CIRCUIT ENERGIZED & VERIFIED
                </p>
                <p className="text-[11px] opacity-90">
                  Operative awarded {points_earned || potentialScore} clearance points.
                </p>
              </div>
            </div>
          )}

          {/* Status Message Notification */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                statusMsg.type === 'success'
                  ? 'bg-cat-green/15 border-cat-green/40 text-cat-green'
                  : 'bg-cat-red/15 border-cat-red/40 text-cat-red'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span className="font-mono-cyber">{statusMsg.text}</span>
            </div>
          )}

          {/* Node-Type Specific Interactive Workflows */}

          {/* 1. PHYSICAL_QR */}
          {node.type === 'PHYSICAL_QR' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cat-mantle border border-cat-surface0 space-y-2">
                <div className="text-xs text-cat-subtext font-mono-cyber">
                  <span className="text-cat-sapphire font-bold">PHYSICAL LOCATION: </span>
                  {node.payload.location || 'Report to designated site coordinates.'}
                </div>
                {node.payload.sector && (
                  <div className="text-xs text-cat-subtext font-mono-cyber">
                    <span className="text-cat-sapphire font-bold">SECTOR: </span>
                    {node.payload.sector}
                  </div>
                )}
                {node.payload.hint && (
                  <div className="text-xs text-cat-subtext font-mono-cyber">
                    <span className="text-cat-yellow font-bold">RECON HINT: </span>
                    {node.payload.hint}
                  </div>
                )}
              </div>

              {!is_completed && (
                <div className="space-y-3">
                  <button
                    onClick={() => onOpenScannerForNode(node.id)}
                    className="w-full py-3 px-4 rounded-xl bg-cat-sapphire text-cat-crust font-bold font-mono-cyber text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-cat-sapphire/90 transition-all shadow-md"
                  >
                    <Scan className="w-4 h-4" />
                    OPEN OPTICAL SCANNER FOR THIS NODE
                  </button>

                  <div className="relative flex items-center justify-center my-2">
                    <div className="border-t border-cat-surface0 w-full" />
                    <span className="bg-cat-base px-3 text-[10px] uppercase font-mono-cyber text-cat-subtext absolute">
                      or manual key entry
                    </span>
                  </div>

                  <form onSubmit={handleVerifyKey} className="flex gap-2">
                    <input
                      type="text"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder="e.g. QR-JUNCTION-7741"
                      className="flex-1 px-3 py-2 text-xs font-mono-cyber bg-cat-mantle border border-cat-surface1 rounded-lg text-cat-text focus:outline-none focus:border-cat-sapphire uppercase"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-xs font-mono-cyber font-bold uppercase bg-cat-surface1 text-cat-text hover:bg-cat-surface2 rounded-lg transition-colors"
                    >
                      Verify
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* 2. TERMINAL_DECRYPT */}
          {node.type === 'TERMINAL_DECRYPT' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cat-mantle border border-cat-surface0 space-y-3">
                <div className="flex items-center justify-between text-xs text-cat-subtext border-b border-cat-surface0 pb-2">
                  <span className="font-mono-cyber text-cat-mauve font-bold">
                    ALGORITHM: {node.payload.algorithm || 'UNKNOWN CIPHER'}
                  </span>
                  <span className="font-mono-cyber text-[10px] bg-cat-surface0 px-2 py-0.5 rounded text-cat-subtext">
                    PACKET STREAM
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-cat-crust font-mono-cyber text-xs text-cat-peach break-all border border-cat-surface0">
                  {node.payload.cipher}
                </div>

                {node.payload.hint && (
                  <p className="text-xs text-cat-subtext font-mono-cyber">
                    <span className="text-cat-yellow font-bold">INTEL TIP: </span>
                    {node.payload.hint}
                  </p>
                )}

                {node.payload.prompt && (
                  <p className="text-xs text-cat-text font-mono-cyber font-medium">
                    {node.payload.prompt}
                  </p>
                )}
              </div>

              {!is_completed && (
                <form onSubmit={handleVerifyKey} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono-cyber text-cat-subtext mb-1 uppercase">
                      Submit Deciphered Payload Token:
                    </label>
                    <input
                      type="text"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder="Enter deciphered string..."
                      className="w-full px-3.5 py-2.5 text-xs font-mono-cyber bg-cat-mantle border border-cat-surface1 rounded-xl text-cat-text focus:outline-none focus:border-cat-mauve"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-cat-mauve text-cat-crust font-bold font-mono-cyber text-xs tracking-wider uppercase hover:bg-cat-mauve/90 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    TRANSMIT DECRYPTION KEY <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 3. DUAL_HANDSHAKE */}
          {node.type === 'DUAL_HANDSHAKE' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cat-mantle border border-cat-surface0 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono-cyber text-cat-yellow font-bold">
                  <Users className="w-4 h-4" />
                  COLLABORATIVE CIRCUIT DIRECTIVE
                </div>
                <p className="text-xs text-cat-subtext font-mono-cyber">
                  {node.payload.description}
                </p>
                {node.payload.partner_archetype && (
                  <div className="inline-block text-[11px] font-mono-cyber px-2.5 py-1 rounded bg-cat-surface0 text-cat-yellow border border-cat-surface1">
                    TARGET ARCHETYPE REQUIREMENT: {node.payload.partner_archetype}
                  </div>
                )}
              </div>

              {!is_completed && (
                <form onSubmit={handleHandshake} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono-cyber text-cat-subtext mb-1 uppercase">
                      Peer Operative Agent ID:
                    </label>
                    <input
                      type="text"
                      value={partnerId}
                      onChange={(e) => setPartnerId(e.target.value)}
                      placeholder="e.g. AGT-HOPPER or AGT-TURING"
                      className="w-full px-3.5 py-2.5 text-xs font-mono-cyber bg-cat-mantle border border-cat-surface1 rounded-xl text-cat-text focus:outline-none focus:border-cat-yellow uppercase"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-cat-yellow text-cat-base font-bold font-mono-cyber text-xs tracking-wider uppercase hover:bg-cat-yellow/90 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    EXECUTE DUAL HANDSHAKE <Users className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 4. DEDUCTION_HYPOTHESIS */}
          {node.type === 'DEDUCTION_HYPOTHESIS' && (
            <div className="p-4 rounded-xl bg-cat-mantle border border-cat-surface0 space-y-3 text-xs font-mono-cyber text-cat-subtext">
              <p>
                {node.payload.description}
              </p>
              <div className="p-3 rounded-lg bg-cat-surface0/60 border border-cat-surface1 text-cat-green font-bold">
                FLAT BONUS REWARD: +400 POINTS ON ACCREDITED TOPOLOGY SYNTHESIS.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
