'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, initStore } from '@/lib/store';
import { ROLE_DETAILS, PrimaryDomain } from '@/types/database';
import { soundEffects } from '@/lib/audio';
import { sendRegistrationWhatsAppMessages } from '@/lib/whatsapp';

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
      setErrorMsg('All fields are required.');
      return;
    }

    setIsSubmitting(true);
    initStore();

    const existing = Store.findAgentByIdentifier(rollNumber.trim());
    if (existing) {
      setErrorMsg(`Roll number '${rollNumber.trim()}' is already registered. Please sign in.`);
      setIsSubmitting(false);
      return;
    }

    soundEffects.playScanChirp();
    setAllocationStep('Connecting to The Protocol directory...');
    await new Promise(r => setTimeout(r, 300));

    setAllocationStep('Allocating operative ID & tactical cell...');
    await new Promise(r => setTimeout(r, 350));

    const { agent, token, assignedDomain } = await Store.registerAgentAsync({
      name: name.trim(),
      auth_identifier: rollNumber.trim(),
      contact: contact.trim(),
      isPreVerified: false
    });

    localStorage.setItem('ieee_agent_id', agent.agent_id);
    localStorage.setItem('ieee_agent_token', token);

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

    setTimeout(() => {
      if (Store.isEventActive()) {
        router.push('/my-badge');
      } else {
        router.push('/standby');
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#141514] text-[#f4f1ea] flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Top Editorial Masthead */}
      <header className="max-w-xl w-full mx-auto rule-double pb-2.5 flex items-baseline justify-between text-xs text-[#949e93] font-mono-tabular">
        <div>
          <strong className="text-[#f4f1ea] font-display-grotesk tracking-tight">NIT WARANGAL IEEE</strong>
          <span className="mx-2">•</span>
          <span>THE PROTOCOL 2026</span>
        </div>
        <div className="text-[11px] uppercase tracking-wider text-[#c93b2b] font-bold">
          ENLISTMENT
        </div>
      </header>

      {/* Main Asymmetric Body */}
      <main className="max-w-xl w-full mx-auto my-auto py-6 space-y-6">
        
        {/* Editorial Title */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-serif-editorial tracking-tight text-[#f4f1ea]">
            Commission your operative pass.
          </h1>
          <p className="text-xs text-[#949e93] font-display-grotesk leading-relaxed">
            Enter your student identity to receive your sequential Call Sign, physical wristband assignment, and authentication QR code.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 border border-[#c93b2b] text-[#c93b2b] text-xs font-display-grotesk bg-[#1b1d1b]">
            {errorMsg}
          </div>
        )}

        {/* Allocation Progress State */}
        {isSubmitting && (
          <div className="border border-[#2d312c] bg-[#1b1d1b] p-5 text-center space-y-3 font-display-grotesk">
            {!assignedResult ? (
              <div className="space-y-2 py-4">
                <div className="w-5 h-5 border border-[#f4f1ea] border-t-transparent animate-spin mx-auto" />
                <div className="text-xs text-[#f4f1ea] font-mono-tabular">
                  {allocationStep}
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-2">
                <div className="editorial-stamp text-[#2d9f5d] border-[#2d9f5d]">
                  COMMISSIONED: {assignedResult.agentId}
                </div>
                <div className="text-lg font-serif-editorial text-[#f4f1ea]">
                  {ROLE_DETAILS[assignedResult.domain].title} Cell
                </div>
                <div className="text-xs text-[#c28b28] font-mono-tabular">
                  Wristband ID: {assignedResult.wristbandId}
                </div>
                <div className="text-xs text-[#949e93] pt-1">
                  Transmitting pass to WhatsApp • Loading terminal...
                </div>
              </div>
            )}
          </div>
        )}

        {!isSubmitting && (
          <form onSubmit={handleSubmit} className="border border-[#2d312c] bg-[#1b1d1b] p-5 sm:p-6 space-y-4">
            
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-[#949e93] font-mono-tabular font-bold">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alan Turing"
                className="w-full px-3 py-2 text-xs bg-[#141514] border border-[#2d312c] text-[#f4f1ea] focus:outline-none focus:border-[#f4f1ea] font-display-grotesk"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-[#949e93] font-mono-tabular font-bold">
                Student Roll No / ID *
              </label>
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 23CSB01"
                className="w-full px-3 py-2 text-xs bg-[#141514] border border-[#2d312c] text-[#f4f1ea] focus:outline-none focus:border-[#f4f1ea] uppercase font-mono-tabular"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-[#949e93] font-mono-tabular font-bold">
                Phone / WhatsApp Contact *
              </label>
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 text-xs bg-[#141514] border border-[#2d312c] text-[#f4f1ea] focus:outline-none focus:border-[#f4f1ea] font-display-grotesk"
              />
            </div>

            <div className="rule-hairline pt-2" />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 btn-editorial-primary text-xs block text-center uppercase tracking-wider font-bold cursor-pointer"
            >
              Commission Operative & Mint Pass →
            </button>
          </form>
        )}

        <div className="flex items-center justify-between text-xs text-[#949e93] font-display-grotesk pt-1">
          <span>Already commissioned?</span>
          <Link href="/login" className="text-[#f4f1ea] underline underline-offset-4 font-bold">
            Sign in to existing account →
          </Link>
        </div>

      </main>

      {/* Editorial Footer */}
      <footer className="max-w-xl w-full mx-auto rule-hairline pt-2 flex items-center justify-between text-[10px] text-[#949e93] font-mono-tabular">
        <span>NIT WARANGAL • DEPT OF ECE</span>
        <span>DISPATCH DIRECTORY</span>
      </footer>
    </div>
  );
}
