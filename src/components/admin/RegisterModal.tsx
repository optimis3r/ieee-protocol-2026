'use client';

import React, { useState } from 'react';
import { AgentArchetype } from '@/types/database';
import { Store } from '@/lib/store';
import { soundEffects } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { X, UserPlus, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (agentId: string) => void;
  initialAgentId?: string;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialAgentId,
}) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [archetype, setArchetype] = useState<AgentArchetype>('FIELD_OPERATIVE');
  const [agentId, setAgentId] = useState(initialAgentId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const archetypes: Array<{ type: AgentArchetype; title: string; desc: string; color: string }> = [
    {
      type: 'CRYPTOGRAPHER',
      title: 'Cryptographer',
      desc: 'Specializes in cipher decryption, frequency analysis, and mathematical bypass keys.',
      color: 'border-cat-mauve text-cat-mauve',
    },
    {
      type: 'FIELD_OPERATIVE',
      title: 'Field Operative',
      desc: 'Performs physical recon, locates optical tags in venue sectors, and triggers local sensors.',
      color: 'border-cat-green text-cat-green',
    },
    {
      type: 'SIGNAL_ANALYST',
      title: 'Signal Analyst',
      desc: 'Monitors packet anomalies, telemetry frequencies, and collaborative handshake links.',
      color: 'border-cat-sapphire text-cat-sapphire',
    },
    {
      type: 'ARCHIVIST',
      title: 'Archivist',
      desc: 'Uncovers historical IEEE draft memos, systemic provenance, and narrative topology clues.',
      color: 'border-cat-yellow text-cat-yellow',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) return;

    setIsSubmitting(true);

    const { agent } = Store.registerAgent({
      name: name.trim(),
      contact: contact.trim(),
      archetype,
      customAgentId: agentId.trim() || undefined,
    });

    soundEffects.playSuccessChime();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });

    setIsSubmitting(false);
    onSuccess(agent.agent_id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cat-crust/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-cat-base border border-cat-surface1 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-cat-mantle border-b border-cat-surface0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cat-surface0 text-cat-green">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-cat-text font-mono-cyber">
                RAPID OPERATIVE ENROLLMENT
              </h3>
              <p className="text-xs text-cat-subtext font-mono-cyber">
                Seed initial node graph & asymmetric intel fragments
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Badge / Agent ID */}
          <div>
            <label className="block text-xs font-mono-cyber uppercase text-cat-subtext mb-1">
              Badge Identifier / Agent ID (Auto-generated if empty)
            </label>
            <input
              type="text"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value.toUpperCase())}
              placeholder="e.g. AGT-XXXXX"
              className="w-full px-3.5 py-2 text-xs font-mono-cyber bg-cat-mantle border border-cat-surface1 rounded-xl text-cat-text focus:outline-none focus:border-cat-green uppercase"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-mono-cyber uppercase text-cat-subtext mb-1">
              Operative Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Margaret Hamilton"
              className="w-full px-3.5 py-2 text-xs font-mono-cyber bg-cat-mantle border border-cat-surface1 rounded-xl text-cat-text focus:outline-none focus:border-cat-green"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-xs font-mono-cyber uppercase text-cat-subtext mb-1">
              Contact / Phone / Email *
            </label>
            <input
              type="text"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. m.hamilton@mit.ieee"
              className="w-full px-3.5 py-2 text-xs font-mono-cyber bg-cat-mantle border border-cat-surface1 rounded-xl text-cat-text focus:outline-none focus:border-cat-green"
            />
          </div>

          {/* Archetype Selector */}
          <div>
            <label className="block text-xs font-mono-cyber uppercase text-cat-subtext mb-2">
              Select Operational Archetype *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {archetypes.map((arch) => {
                const isSelected = archetype === arch.type;
                return (
                  <div
                    key={arch.type}
                    onClick={() => setArchetype(arch.type)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? `bg-cat-surface0 ${arch.color} border-2 shadow-md`
                        : 'bg-cat-mantle border-cat-surface0 hover:border-cat-surface1 text-cat-subtext'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono-cyber text-xs font-bold mb-1">
                      <span>{arch.title}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed font-sans">
                      {arch.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seeding note */}
          <div className="p-3 rounded-xl bg-cat-mantle border border-cat-surface0 text-[11px] font-mono-cyber text-cat-subtext space-y-1">
            <span className="text-cat-green font-bold block">AUTOMATED SEEDING SPEC:</span>
            <span>• 3 initial archetype-tailored circuits</span><br />
            <span>• 2 verified authentic intel fragments</span><br />
            <span>• 1 poisoned/conflicting disinformation fragment</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-cat-green text-cat-crust font-bold font-mono-cyber text-xs tracking-wider uppercase hover:bg-cat-green/90 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            ACTIVATE OPERATIVE & SEED GRAPH
          </button>
        </form>
      </div>
    </div>
  );
};
