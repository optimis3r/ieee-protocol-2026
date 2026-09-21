'use client';

import React, { useState } from 'react';
import { AgentNode, NodeItem, Agent } from '@/types/database';
import { Store, calculateDynamicScore } from '@/lib/store';
import { soundEffects } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle2, 
  Scan, 
  Users, 
  ArrowRight,
  ShieldAlert,
  Layers,
  Activity,
  Eye,
  Cpu,
  Terminal
} from 'lucide-react';

interface NodeModalProps {
  nodeItem: (AgentNode & { node: NodeItem }) | null;
  agent: Agent;
  onClose: () => void;
  onSuccess: () => void;
  onOpenScannerForNode?: (nodeId: string) => void;
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
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-[#2d312c] text-[#3a8ebd] text-[10px] font-mono-tabular">
            <Layers className="w-3 h-3" /> LOGIC
          </span>
        );
      case 'SIGNAL':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-[#2d312c] text-[#2d9f5d] text-[10px] font-mono-tabular">
            <Activity className="w-3 h-3" /> SIGNAL
          </span>
        );
      case 'OBSERVATION':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-[#2d312c] text-[#9368b7] text-[10px] font-mono-tabular">
            <Eye className="w-3 h-3" /> OBSERVATION
          </span>
        );
      case 'SYSTEM':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-[#2d312c] text-[#d96b27] text-[10px] font-mono-tabular">
            <Cpu className="w-3 h-3" /> SYSTEM
          </span>
        );
      case 'SOCIAL':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-[#2d312c] text-[#2fa596] text-[10px] font-mono-tabular">
            <Users className="w-3 h-3" /> SOCIAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-[#2d312c] text-[#949e93] text-[10px] font-mono-tabular">
            <Terminal className="w-3 h-3" /> CIRCUIT
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-lg bg-[#1b1d1b] border border-[#3f453f] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2d312c] bg-[#141514]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono-tabular text-[10px] text-[#c28b28]">
                {node.station_number || node.id}
              </span>
              {renderDomainHeader()}
            </div>
            <h3 className="font-serif-editorial text-xl text-[#f4f1ea]">
              {node.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#949e93] hover:text-[#f4f1ea] border border-[#2d312c] hover:border-[#3f453f] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 font-display-grotesk">
          {/* Dynamic Scoring Ribbon */}
          <div className="grid grid-cols-4 p-3 bg-[#141514] border border-[#2d312c] text-center font-mono-tabular">
            <div>
              <span className="text-[#949e93] text-[9px] block uppercase">BASE</span>
              <span className="font-bold text-[#f4f1ea] text-xs">{node.base_points} PTS</span>
            </div>
            <div>
              <span className="text-[#949e93] text-[9px] block uppercase">SOLVES</span>
              <span className="font-bold text-[#3a8ebd] text-xs">{globalSolves}</span>
            </div>
            <div>
              <span className="text-[#949e93] text-[9px] block uppercase">ATTEMPTS</span>
              <span className="font-bold text-[#c93b2b] text-xs">{attempts}</span>
            </div>
            <div>
              <span className="text-[#949e93] text-[9px] block uppercase">VALUE</span>
              <span className="font-bold text-[#c28b28] text-xs">
                {is_completed ? `${points_earned || node.base_points} PTS` : `${potentialScore} PTS`}
              </span>
            </div>
          </div>

          {/* Completed Banner */}
          {is_completed && (
            <div className="p-3 border border-[#2d9f5d] bg-[#15241b] text-[#2d9f5d] flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div>
                <p className="font-mono-tabular text-xs font-bold uppercase">
                  CIRCUIT SOLVED & ACCREDITED
                </p>
                <p className="text-[11px] text-[#f4f1ea]/80">
                  Operative accredited {points_earned || potentialScore} clearance points.
                </p>
              </div>
            </div>
          )}

          {/* Status Message Notification */}
          {statusMsg && (
            <div
              className={`p-3 border text-xs flex items-start gap-2.5 font-mono-tabular ${
                statusMsg.type === 'success'
                  ? 'bg-[#15241b] border-[#2d9f5d] text-[#2d9f5d]'
                  : 'bg-[#251515] border-[#c93b2b] text-[#c93b2b]'
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
            <div className="space-y-3">
              <div className="p-3 border border-[#2d312c] bg-[#141514] space-y-1.5 text-xs">
                <div>
                  <span className="font-mono-tabular text-[#949e93] uppercase block text-[10px]">Location</span>
                  <span className="text-[#f4f1ea]">{node.payload.location || 'Report to designated campus coordinates.'}</span>
                </div>
                {node.payload.sector && (
                  <div>
                    <span className="font-mono-tabular text-[#949e93] uppercase block text-[10px]">Sector</span>
                    <span className="text-[#f4f1ea]">{node.payload.sector}</span>
                  </div>
                )}
                {node.payload.hint && (
                  <div className="pt-1 border-t border-[#2d312c]">
                    <span className="font-mono-tabular text-[#c28b28] uppercase block text-[10px]">Recon Hint</span>
                    <span className="text-[#949e93] text-[11px]">{node.payload.hint}</span>
                  </div>
                )}
              </div>

              {!is_completed && (
                <div className="space-y-2">
                  <button
                    onClick={() => onOpenScannerForNode?.(node.id)}
                    className="btn-editorial-primary w-full py-2.5 px-4 text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Scan className="w-4 h-4" />
                    <span>Scan Node QR Code</span>
                  </button>

                  <form onSubmit={handleVerifyKey} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder="e.g. QR-JUNCTION-7741"
                      className="flex-1 px-3 py-2 text-xs bg-[#141514] border border-[#2d312c] text-[#f4f1ea] font-mono-tabular focus:outline-none focus:border-[#949e93] uppercase"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-editorial-outline px-4 py-2 text-xs font-bold uppercase font-mono-tabular cursor-pointer"
                    >
                      Verify
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {node.type === 'TERMINAL_DECRYPT' && (
            <div className="space-y-3">
              <div className="p-3 border border-[#2d312c] bg-[#141514] space-y-2 text-xs">
                <div className="flex items-center justify-between font-mono-tabular text-[10px] text-[#949e93] border-b border-[#2d312c] pb-1.5">
                  <span>ALGORITHM: {node.payload.algorithm || 'UNKNOWN CIPHER'}</span>
                  <span>PACKET STREAM</span>
                </div>

                <div className="p-2.5 bg-[#1b1d1b] border border-[#2d312c] font-mono-tabular text-xs text-[#c28b28] break-all">
                  {node.payload.cipher}
                </div>

                {node.payload.hint && (
                  <p className="text-[11px] text-[#949e93]">
                    <strong className="text-[#c28b28] font-mono-tabular uppercase">Tip: </strong>
                    {node.payload.hint}
                  </p>
                )}
              </div>

              {!is_completed && (
                <form onSubmit={handleVerifyKey} className="space-y-2">
                  <div>
                    <label className="block font-mono-tabular text-[10px] text-[#949e93] mb-1 uppercase">
                      Decrypted String Token:
                    </label>
                    <input
                      type="text"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder="Enter deciphered string..."
                      className="w-full px-3 py-2 text-xs bg-[#141514] border border-[#2d312c] text-[#f4f1ea] font-mono-tabular focus:outline-none focus:border-[#949e93]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-editorial-primary w-full py-2.5 px-4 text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Transmit Decryption Key</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {node.type === 'DUAL_HANDSHAKE' && (
            <div className="space-y-3">
              <div className="p-3 border border-[#2d312c] bg-[#141514] space-y-2 text-xs">
                <div className="flex items-center gap-2 font-mono-tabular text-xs text-[#2fa596] font-bold">
                  <Users className="w-4 h-4" />
                  <span>SOCIAL HANDSHAKE DIRECTIVE</span>
                </div>
                <p className="text-[11px] text-[#949e93]">
                  {node.payload.description}
                </p>
                {node.payload.partner_archetype && (
                  <div className="inline-block font-mono-tabular text-[10px] px-2 py-0.5 border border-[#2d312c] text-[#2fa596] bg-[#1b1d1b]">
                    PARTNER REQUIREMENT: [{node.payload.partner_archetype}]
                  </div>
                )}
              </div>

              {!is_completed && (
                <form onSubmit={handleHandshake} className="space-y-2">
                  <div>
                    <label className="block font-mono-tabular text-[10px] text-[#949e93] mb-1 uppercase">
                      Partner Agent ID:
                    </label>
                    <input
                      type="text"
                      value={partnerId}
                      onChange={(e) => setPartnerId(e.target.value)}
                      placeholder="e.g. AGT-002"
                      className="w-full px-3 py-2 text-xs bg-[#141514] border border-[#2d312c] text-[#f4f1ea] font-mono-tabular focus:outline-none focus:border-[#949e93] uppercase"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-editorial-primary w-full py-2.5 px-4 text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Execute Handshake</span>
                    <Users className="w-4 h-4" />
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
