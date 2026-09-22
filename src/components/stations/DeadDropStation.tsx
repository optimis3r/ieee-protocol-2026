'use client';

import React from 'react';
import { NodeItem } from '@/types/database';
import { MessageSquare, Mail, ShieldAlert, Sparkles, User, CheckCircle } from 'lucide-react';

interface DeadDropStationProps {
  node: NodeItem;
  answerInput: string;
  setAnswerInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const DeadDropStation: React.FC<DeadDropStationProps> = ({
  node,
  answerInput,
  setAnswerInput,
  onSubmit,
  isSubmitting
}) => {
  const handlerDesc = (typeof node.payload.handler_description === 'string' && node.payload.handler_description) ||
    'Volunteer operative wearing IEEE black lanyard with blue gel pen in chest pocket.';
  const passphrase = (typeof node.payload.verbal_passphrase === 'string' && node.payload.verbal_passphrase) ||
    'The packet dropped at midnight';

  return (
    <div className="space-y-6">
      {/* Field Handler Dossier & Reconnaissance Deck */}
      <div className="bg-[#0b130e] border border-cyan-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1b2a20] pb-3">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>Field Handler Reconnaissance Profile</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold">
            HUMINT PROTOCOL
          </span>
        </div>

        {/* Visual Markings Checklist */}
        <div className="p-4 rounded-xl bg-[#08120d] border border-cyan-500/20 space-y-2">
          <div className="text-[10px] text-[#7d9787] uppercase font-mono font-bold">
            Physical Visual Recognition Markers:
          </div>
          <p className="text-sm text-[#eaf2ec] font-bold">
            {handlerDesc}
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
              ✓ Lanyard Identifier
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
              ✓ Pocket Pen Marker
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
              ✓ Mingling Among Attendees
            </span>
          </div>
        </div>

        {/* Verbal Passphrase Box */}
        <div className="p-4 rounded-xl bg-[#06100a] border border-[#1b2a20] space-y-2">
          <div className="text-[10px] text-cyan-400 font-mono font-bold uppercase flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Verbal Authentication Passphrase:</span>
          </div>
          <div className="p-3 rounded-xl bg-[#040805] border border-cyan-500/40 text-center">
            <span className="text-base sm:text-lg font-black text-cyan-200 font-mono tracking-wider italic">
              &ldquo;{passphrase}&rdquo;
            </span>
          </div>
          <p className="text-[11px] text-[#7d9787]">
            Approach the handler discreetly. Utter this exact passphrase to receive the sealed envelope containing the clearance bypass token.
          </p>
        </div>
      </div>

      {/* Reconnaissance Clue Banner */}
      <div className="p-4 rounded-xl bg-[#111a14] border border-[#233529] text-xs space-y-1.5">
        <div className="text-[10px] font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>HUMINT ENGAGEMENT RULES:</span>
        </div>
        <p className="text-[#cad3f5] font-sans leading-relaxed">
          {node.payload.hint || 'Locate the designated volunteer handler in the attendee crowd. Utter the secret verbal passphrase to receive the sealed physical envelope.'}
        </p>
      </div>

      {/* Sealed Envelope Code Submission Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] text-[#8ea897] uppercase mb-1.5 font-bold flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span>{node.payload.prompt || 'Submit the clearance bypass code found inside the sealed envelope:'}</span>
          </label>
          <input
            type="text"
            required
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            placeholder="e.g. ENVELOPE-DROP-9081"
            className="w-full px-4 py-3 text-sm bg-[#09110d] border border-[#273a2e] rounded-xl text-[#f3f7f4] focus:outline-none focus:border-cyan-400 font-mono uppercase tracking-wider"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !answerInput.trim()}
          className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[#0a0f0d] font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle className="w-4 h-4" />
          <span>AUTHENTICATE DEAD DROP ENVELOPE CODE</span>
        </button>
      </form>
    </div>
  );
};
