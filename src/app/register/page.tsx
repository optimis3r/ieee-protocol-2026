'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, initStore } from '@/lib/store';
import { ROLE_DETAILS, PrimaryDomain } from '@/types/database';
import { soundEffects } from '@/lib/audio';
import { sendRegistrationWhatsAppMessages } from '@/lib/whatsapp';
import { 
  AlertTriangle, 
  QrCode, 
  Ticket,
  MessageSquare,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [contact, setContact] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allocationStep, setAllocationStep] = useState<string | null>(null);
  const [assignedResult, setAssignedResult] = useState<{
    agentId: string;
    agentNumber: string;
    wristbandId: string;
    domain: PrimaryDomain;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !rollNumber.trim() || !contact.trim()) {
      setErrorMsg('Please complete all required enlistment fields.');
      return;
    }

    setIsSubmitting(true);
    initStore();

    // Check if roll number already registered locally
    const existing = Store.findAgentByIdentifier(rollNumber.trim());
    if (existing) {
      setErrorMsg(`Roll No '${rollNumber.trim()}' is already registered. Please log in.`);
      setIsSubmitting(false);
      return;
    }

    // Dynamic pool-balancing animation
    soundEffects.playScanChirp();
    setAllocationStep('CONNECTING TO THE PROTOCOL CORE...');
    await new Promise(r => setTimeout(r, 350));

    setAllocationStep('ANALYZING TACTICAL ROSTER DENSITY...');
    await new Promise(r => setTimeout(r, 400));

    setAllocationStep('ALLOCATING OPERATIVE ID & CELL...');
    await new Promise(r => setTimeout(r, 350));

    // Execute atomic registration with server-authoritative sequential ID
    const { agent, token, assignedDomain } = await Store.registerAgentAsync({
      name: name.trim(),
      auth_identifier: rollNumber.trim(),
      contact: contact.trim(),
      isPreVerified: false
    });

    localStorage.setItem('ieee_agent_id', agent.agent_id);
    localStorage.setItem('ieee_agent_token', token);

    // Dispatch WhatsApp messages
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
    setAssignedResult({
      agentId: agent.agent_id,
      agentNumber: agent.agent_number || agent.agent_id,
      wristbandId: agent.wristband_id || agent.agent_id,
      domain: assignedDomain
    });

    // Route to standby or badge
    setTimeout(() => {
      if (Store.isEventActive()) {
        router.push('/my-badge');
      } else {
        router.push('/standby');
      }
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-[#0c0e0d] text-[#f1ede4] flex flex-col justify-between p-3 sm:p-5 tactile-grain select-none">
      {/* Tactical Top Identifier */}
      <header className="max-w-sm w-full mx-auto flex items-center justify-between text-[11px] text-[#8f9e91] border-b border-[#28302b] pb-2">
        <div className="flex items-center gap-1.5 font-bold tracking-wider text-[#f1ede4]">
          <span>NITW</span>
          <span className="text-[#8f9e91]">/</span>
          <span>IEEE THE PROTOCOL</span>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-[#22c55e] font-bold">
          [ENLISTMENT]
        </div>
      </header>

      {/* Main Commission Docket */}
      <main className="max-w-sm w-full mx-auto my-auto py-2">
        <div className="bg-[#121513] border-2 border-[#28302b] rounded-sm p-4 sm:p-5 shadow-2xl space-y-4">
          
          <div className="border-b border-[#28302b] pb-2">
            <div className="text-[9px] uppercase tracking-widest text-[#8f9e91] font-bold">
              OFFICIAL ENLISTMENT DOCKET
            </div>
            <h1 className="text-xl font-black text-[#f1ede4] tracking-tight uppercase">
              COMMISSION OPERATIVE
            </h1>
            <p className="text-[11px] text-[#8f9e91] font-mono mt-0.5">
              Input operative credentials to generate your personal pass.
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-[#dc2626]/10 border border-[#dc2626]/40 text-[#dc2626] text-xs flex items-center gap-2 rounded-sm">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Allocation Reveal State */}
          {isSubmitting && (
            <div className="p-4 bg-[#0c0e0d] border border-[#28302b] text-center space-y-3 rounded-sm">
              {!assignedResult ? (
                <div className="space-y-2 py-3">
                  <div className="w-6 h-6 border-2 border-[#22c55e] border-t-transparent animate-spin mx-auto" />
                  <div className="text-xs font-bold text-[#22c55e] uppercase tracking-wider font-mono">
                    {allocationStep}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-1 font-mono">
                  <div className="stamp-box stamp-active text-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>COMMISSIONED: {assignedResult.agentId}</span>
                  </div>
                  <div className="text-sm font-black text-[#f1ede4]">
                    {ROLE_DETAILS[assignedResult.domain].title} Cell
                  </div>
                  <div className="text-xs text-[#eab308]">
                    WRISTBAND: {assignedResult.wristbandId}
                  </div>
                  <div className="text-[10px] text-[#8f9e91] pt-1">
                    Pass dispatched to WhatsApp • Forwarding...
                  </div>
                </div>
              )}
            </div>
          )}

          {!isSubmitting && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] text-[#8f9e91] mb-1 uppercase tracking-wider font-bold">
                  Operative Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alan Turing"
                  className="w-full px-3 py-2 text-xs bg-[#0c0e0d] border border-[#28302b] rounded-sm text-[#f1ede4] focus:outline-none focus:border-[#22c55e] font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#8f9e91] mb-1 uppercase tracking-wider font-bold">
                  Student Roll No / ID * (Account Key)
                </label>
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 23CSB01"
                  className="w-full px-3 py-2 text-xs bg-[#0c0e0d] border border-[#28302b] rounded-sm text-[#f1ede4] focus:outline-none focus:border-[#22c55e] uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#8f9e91] mb-1 uppercase tracking-wider font-bold">
                  Phone / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Contact number (e.g. 9876543210)"
                  className="w-full px-3 py-2 text-xs bg-[#0c0e0d] border border-[#28302b] rounded-sm text-[#f1ede4] focus:outline-none focus:border-[#22c55e] font-sans"
                />
              </div>

              {/* Compact Tactical Notice */}
              <div className="text-[10px] text-[#8f9e91] flex items-center justify-between border-t border-b border-[#28302b] py-1.5 font-mono">
                <span>ROLE ALLOCATION:</span>
                <span className="text-[#eab308] font-bold">[AUTOMATIC BALANCED CELL]</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-3 rounded-sm btn-tactile-primary text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>COMMISSION OPERATIVE & MINT PASS</span>
              </button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-[#28302b] text-[11px] text-[#8f9e91]">
            <span>Already commissioned? </span>
            <Link href="/login" className="text-[#22c55e] hover:underline font-bold">
              Log in here →
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal Bottom Stamp */}
      <footer className="max-w-sm w-full mx-auto text-center text-[9px] text-[#48544c] uppercase tracking-widest pt-1">
        NIT WARANGAL • IEEE STUDENT BRANCH • SECURE DISPATCH
      </footer>
    </div>
  );
}
