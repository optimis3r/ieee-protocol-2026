'use client';

import React, { useState } from 'react';
import { AgentArchetype } from '@/types/database';
import { Store } from '@/lib/store';
import { soundEffects } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { X, UserPlus, Layers, Activity, Eye, Cpu, Users, CheckCircle2 } from 'lucide-react';

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
  const [archetype, setArchetype] = useState<AgentArchetype>('LOGIC');
  const [agentId, setAgentId] = useState(initialAgentId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const domains: Array<{ type: AgentArchetype; title: string; desc: string; color: string; icon: any }> = [
    {
      type: 'LOGIC',
      title: 'Logic Domain',
      desc: 'Deciphers algorithmic ciphers, Base64 packet headers, and cryptographic puzzles.',
      color: 'border-proto-logic text-proto-logic',
      icon: Layers
    },
    {
      type: 'SIGNAL',
      title: 'Signal Domain',
      desc: 'Monitors wave frequencies, antenna relays, and carrier stream telemetry.',
      color: 'border-proto-signal text-proto-signal',
      icon: Activity
    },
    {
      type: 'OBSERVATION',
      title: 'Observation Domain',
      desc: 'Explores the physical venue, locates hidden optical QR tags, and inspects checkpoints.',
      color: 'border-proto-obs text-proto-obs',
      icon: Eye
    },
    {
      type: 'SYSTEM',
      title: 'System Domain',
      desc: 'Traces memory exploits, autonomic routing daemons, and core topology schematics.',
      color: 'border-proto-system text-proto-system',
      icon: Cpu
    },
    {
      type: 'SOCIAL',
      title: 'Social Domain',
      desc: 'Executes synchronous multi-agent handshakes and cross-examines conflicting intel.',
      color: 'border-proto-social text-proto-social',
      icon: Users
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-proto-obsidian/85 backdrop-blur-md animate-in fade-in duration-200 font-mono-cyber">
      <div className="relative w-full max-w-lg bg-proto-base border border-proto-surface1 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-proto-mantle border-b border-proto-surface1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-proto-surface0 text-proto-signal">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-proto-text">
                THE PROTOCOL // OPERATIVE ENROLLMENT
              </h3>
              <p className="text-xs text-proto-subtext">
                NIT Warangal • Assign Domain • Seed Graph
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs uppercase text-proto-subtext mb-1">
              Badge Identifier / Agent ID (Auto-generated if blank)
            </label>
            <input
              type="text"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value.toUpperCase())}
              placeholder="e.g. AGT-XXXXX"
              className="w-full px-3.5 py-2 text-xs bg-proto-surface0 border border-proto-surface1 rounded-xl text-proto-text focus:outline-none focus:border-proto-signal uppercase"
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-proto-subtext mb-1">
              Operative Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Margaret Hamilton"
              className="w-full px-3.5 py-2 text-xs bg-proto-surface0 border border-proto-surface1 rounded-xl text-proto-text focus:outline-none focus:border-proto-signal"
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-proto-subtext mb-1">
              Contact / Phone / Email *
            </label>
            <input
              type="text"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. operative@nitw.ac.in"
              className="w-full px-3.5 py-2 text-xs bg-proto-surface0 border border-proto-surface1 rounded-xl text-proto-text focus:outline-none focus:border-proto-signal"
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-proto-subtext mb-2">
              Select Operative Domain (From The Protocol Poster) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {domains.map((dom) => {
                const isSelected = archetype === dom.type;
                const Icon = dom.icon;
                return (
                  <div
                    key={dom.type}
                    onClick={() => setArchetype(dom.type)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? `bg-proto-surface0 ${dom.color} border-2 shadow-md`
                        : 'bg-proto-base border-proto-surface1 hover:border-proto-surface2 text-proto-subtext'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5" />
                        {dom.title}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed font-sans">
                      {dom.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-proto-surface0 border border-proto-surface1 text-[11px] text-proto-subtext space-y-1">
            <span className="text-proto-signal font-bold block">AUTOMATED SEEDING SPEC:</span>
            <span>• 3 initial domain-tailored circuits</span><br />
            <span>• 2 authentic intel fragments</span><br />
            <span>• 1 poisoned/conflicting disinformation fragment (TRUST NO ONE)</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-proto-logic to-proto-signal text-proto-obsidian font-black text-xs tracking-wider uppercase hover:opacity-95 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            ACTIVATE OPERATIVE & SEED GRAPH
          </button>
        </form>
      </div>
    </div>
  );
};
