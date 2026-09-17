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
  ShieldAlert,
  Layers,
  Activity,
  Eye
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
        particleCount: 80,
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

  const renderDomainHeader = () => {
    switch (node.domain) {
      case 'LOGIC':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-proto-logic/15 text-proto-logic border border-proto-logic/30 text-[11px] font-mono-cyber font-bold">
            <Layers className="w-3.5 h-3.5" /> LOGIC DOMAIN
          </span>
        );
      case 'SIGNAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-proto-signal/15 text-proto-signal border border-proto-signal/30 text-[11px] font-mono-cyber font-bold">
            <Activity className="w-3.5 h-3.5" /> SIGNAL DOMAIN
          </span>
        );
      case 'OBSERVATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-proto-obs/15 text-proto-obs border border-proto-obs/30 text-[11px] font-mono-cyber font-bold">
            <Eye className="w-3.5 h-3.5" /> OBSERVATION DOMAIN
          </span>
        );
      case 'SYSTEM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-proto-system/15 text-proto-system border border-proto-system/30 text-[11px] font-mono-cyber font-bold">
            <Cpu className="w-3.5 h-3.5" /> SYSTEM DOMAIN
          </span>
        );
      case 'SOCIAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-proto-social/15 text-proto-social border border-proto-social/30 text-[11px] font-mono-cyber font-bold">
            <Users className="w-3.5 h-3.5" /> SOCIAL DOMAIN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-proto-logic/15 text-proto-logic text-[11px] font-mono-cyber font-bold">
            <Terminal className="w-3.5 h-3.5" /> PROTOCOL CIRCUIT
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-proto-obsidian/85 backdrop-blur-md animate-in fade-in duration-200 font-mono-cyber">
      <div className="relative w-full max-w-lg bg-proto-base border border-proto-surface1 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-proto-mantle border-b border-proto-surface1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-proto-subtext">
                {node.id}
              </span>
              {renderDomainHeader()}
            </div>
            <h3 className="text-base font-bold text-proto-text">
              {node.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-proto-subtext hover:text-proto-crimson hover:bg-proto-surface0 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Dynamic Scoring Ribbon */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-proto-surface0 border border-proto-surface1 text-xs">
            <div>
              <span className="text-proto-subtext text-[11px] block">BASE VALUE</span>
              <span className="font-bold text-proto-text">{node.base_points} PTS</span>
            </div>
            <div className="text-center">
              <span className="text-proto-subtext text-[11px] block">SOLVES</span>
              <span className="text-proto-logic font-bold">{globalSolves}</span>
            </div>
            <div className="text-center">
              <span className="text-proto-subtext text-[11px] block">ATTEMPTS</span>
              <span className="text-proto-crimson font-bold">{attempts}</span>
            </div>
            <div className="text-right">
              <span className="text-proto-subtext text-[11px] block">POTENTIAL REWARD</span>
              <span className="font-black text-proto-gold text-sm">
                {is_completed ? `${points_earned || node.base_points} PTS (EARNED)` : `${potentialScore} PTS`}
              </span>
            </div>
          </div>

          {/* Completed Banner */}
          {is_completed && (
            <div className="p-4 rounded-xl bg-proto-signal/15 border border-proto-signal/40 text-proto-signal flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <p className="text-xs font-black uppercase">
                  CIRCUIT ENERGIZED & ACCREDITED
                </p>
                <p className="text-[11px] opacity-90 font-sans">
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
                  ? 'bg-proto-signal/15 border-proto-signal/40 text-proto-signal'
                  : 'bg-proto-crimson/15 border-proto-crimson/40 text-proto-crimson'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Workflows */}
          {node.type === 'PHYSICAL_QR' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-proto-surface0 border border-proto-surface1 space-y-2">
                <div className="text-xs text-proto-subtext">
                  <span className="text-proto-logic font-bold">PHYSICAL LOCATION: </span>
                  {node.payload.location || 'Report to designated site coordinates.'}
                </div>
                {node.payload.sector && (
                  <div className="text-xs text-proto-subtext">
                    <span className="text-proto-logic font-bold">SECTOR: </span>
                    {node.payload.sector}
                  </div>
                )}
                {node.payload.hint && (
                  <div className="text-xs text-proto-subtext">
                    <span className="text-proto-gold font-bold">RECON HINT: </span>
                    {node.payload.hint}
                  </div>
                )}
              </div>

              {!is_completed && (
                <div className="space-y-3">
                  <button
                    onClick={() => onOpenScannerForNode(node.id)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-proto-logic to-proto-signal text-proto-obsidian font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg"
                  >
                    <Scan className="w-4 h-4" />
                    OPEN OPTICAL RETICLE FOR THIS NODE
                  </button>

                  <form onSubmit={handleVerifyKey} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder="e.g. QR-JUNCTION-7741"
                      className="flex-1 px-3 py-2 text-xs bg-proto-surface0 border border-proto-surface1 rounded-lg text-proto-text focus:outline-none focus:border-proto-logic uppercase"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-xs font-bold uppercase bg-proto-surface1 text-proto-text hover:bg-proto-surface2 rounded-lg transition-colors"
                    >
                      Verify
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {node.type === 'TERMINAL_DECRYPT' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-proto-surface0 border border-proto-surface1 space-y-3">
                <div className="flex items-center justify-between text-xs text-proto-subtext border-b border-proto-surface1 pb-2">
                  <span className="text-proto-logic font-bold">
                    ALGORITHM: {node.payload.algorithm || 'UNKNOWN CIPHER'}
                  </span>
                  <span className="text-[10px] bg-proto-surface1 px-2 py-0.5 rounded text-proto-text">
                    PACKET STREAM
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-proto-obsidian text-xs text-proto-gold break-all border border-proto-surface1">
                  {node.payload.cipher}
                </div>

                {node.payload.hint && (
                  <p className="text-xs text-proto-subtext">
                    <span className="text-proto-gold font-bold">INTEL TIP: </span>
                    {node.payload.hint}
                  </p>
                )}
              </div>

              {!is_completed && (
                <form onSubmit={handleVerifyKey} className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-proto-subtext mb-1 uppercase">
                      Submit Deciphered Payload Token:
                    </label>
                    <input
                      type="text"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder="Enter deciphered string..."
                      className="w-full px-3.5 py-2.5 text-xs bg-proto-surface0 border border-proto-surface1 rounded-xl text-proto-text focus:outline-none focus:border-proto-logic"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-proto-logic text-proto-obsidian font-black text-xs tracking-wider uppercase hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    TRANSMIT DECRYPTION KEY <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {node.type === 'DUAL_HANDSHAKE' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-proto-surface0 border border-proto-surface1 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-proto-social font-bold">
                  <Users className="w-4 h-4" />
                  SOCIAL HANDSHAKE DIRECTIVE
                </div>
                <p className="text-xs text-proto-subtext">
                  {node.payload.description}
                </p>
                {node.payload.partner_archetype && (
                  <div className="inline-block text-[11px] px-2.5 py-1 rounded bg-proto-surface1 text-proto-social border border-proto-social/30 font-bold">
                    TARGET DOMAIN REQUIREMENT: [{node.payload.partner_archetype}]
                  </div>
                )}
              </div>

              {!is_completed && (
                <form onSubmit={handleHandshake} className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-proto-subtext mb-1 uppercase">
                      Peer Operative Agent ID:
                    </label>
                    <input
                      type="text"
                      value={partnerId}
                      onChange={(e) => setPartnerId(e.target.value)}
                      placeholder="e.g. AGT-HOPPER or AGT-TURING"
                      className="w-full px-3.5 py-2.5 text-xs bg-proto-surface0 border border-proto-surface1 rounded-xl text-proto-text focus:outline-none focus:border-proto-social uppercase"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-proto-social text-proto-obsidian font-black text-xs tracking-wider uppercase hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    EXECUTE DUAL HANDSHAKE <Users className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
