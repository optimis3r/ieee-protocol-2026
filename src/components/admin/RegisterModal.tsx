'use client';

import React, { useState } from 'react';
import { Store } from '@/lib/store';
import { soundEffects } from '@/lib/audio';
import { sendRegistrationWhatsAppMessages } from '@/lib/whatsapp';
import confetti from 'canvas-confetti';
import { X, UserPlus, Ticket, Sparkles } from 'lucide-react';

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
  const [rollNo, setRollNo] = useState('');
  const [contact, setContact] = useState('');
  const [agentId, setAgentId] = useState(initialAgentId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) return;

    setIsSubmitting(true);

    const { agent, token } = Store.registerAgent({
      name: name.trim(),
      auth_identifier: rollNo.trim() || undefined,
      contact: contact.trim(),
      customAgentId: agentId.trim() || undefined,
      isPreVerified: true // Operations desk registration immediately verifies them IN
    });

    // Dispatch 2 WhatsApp transmissions: Group Link + Personal QR Pass
    sendRegistrationWhatsAppMessages({
      recipientPhone: contact.trim(),
      agentName: name.trim(),
      agentId: agent.agent_id,
      agentNumber: agent.agent_number,
      token
    }).catch(err => {
      console.warn('WhatsApp dispatch warning:', err);
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
              <h3 className="text-sm font-bold text-proto-text uppercase">
                OPERATIONS DESK ENROLLMENT
              </h3>
              <p className="text-xs text-proto-subtext">
                Register operative & assign balanced tactical directive.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-proto-subtext hover:text-proto-text hover:bg-proto-surface0 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="p-3 rounded-xl bg-proto-surface0 border border-proto-signal/30 text-xs flex items-center gap-2 text-proto-signal">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Automatic Balanced Pool Allocation: Starting role will be evenly selected from Logic, Signal, Observation, System, or Social.</span>
          </div>

          <div>
            <label className="block text-xs text-proto-subtext uppercase mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alan Turing"
              className="w-full px-3.5 py-2.5 text-xs bg-proto-surface0 border border-proto-surface1 rounded-xl text-proto-text focus:outline-none focus:border-proto-signal"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-proto-subtext uppercase mb-1">
                Roll No / Student ID
              </label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="e.g. 23CSB01"
                className="w-full px-3.5 py-2.5 text-xs bg-proto-surface0 border border-proto-surface1 rounded-xl text-proto-text focus:outline-none focus:border-proto-signal uppercase"
              />
            </div>

            <div>
              <label className="block text-xs text-proto-subtext uppercase mb-1">
                Phone / WhatsApp *
              </label>
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+91 98480..."
                className="w-full px-3.5 py-2.5 text-xs bg-proto-surface0 border border-proto-surface1 rounded-xl text-proto-text focus:outline-none focus:border-proto-signal"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-proto-subtext uppercase mb-1 flex items-center justify-between">
              <span>Wristband / Custom Agent ID (Optional):</span>
              <span className="text-[10px] text-proto-gold">Auto-assigned if blank</span>
            </label>
            <div className="relative">
              <Ticket className="w-4 h-4 text-proto-gold absolute left-3 top-2.5" />
              <input
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="e.g. AGT-047 (Wristband code)"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-proto-surface0 border border-proto-surface1 rounded-xl text-proto-gold font-bold focus:outline-none focus:border-proto-gold uppercase"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-proto-signal hover:bg-[#00e676] text-[#0a0f0d] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>CONFIRM CHECK-IN & ENROLL OPERATIVE</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
