'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, initStore } from '@/lib/store';
import { ROLE_DETAILS, PrimaryDomain } from '@/types/database';
import { soundEffects } from '@/lib/audio';
import { sendRegistrationWhatsAppMessages } from '@/lib/whatsapp';
import { 
  Terminal, 
  AlertTriangle, 
  Layers, 
  Activity, 
  Eye, 
  Cpu, 
  Users, 
  QrCode, 
  ShieldAlert, 
  Sparkles, 
  Ticket,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';

const DOMAIN_ICONS: Record<PrimaryDomain, React.ComponentType<{ className?: string }>> = {
  LOGIC: Layers,
  SIGNAL: Activity,
  OBSERVATION: Eye,
  SYSTEM: Cpu,
  SOCIAL: Users
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [contact, setContact] = useState('');
  const [pin, setPin] = useState('');
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
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    initStore();

    // Check if roll number already registered
    const existing = Store.findAgentByIdentifier(rollNumber.trim());
    if (existing) {
      setErrorMsg(`Roll number / ID '${rollNumber.trim()}' is already registered. Please log in.`);
      setIsSubmitting(false);
      return;
    }

    // Dynamic pool-balancing reveal animation
    soundEffects.playScanChirp();
    setAllocationStep('CONNECTING TO THE PROTOCOL CORE...');
    await new Promise(r => setTimeout(r, 450));

    setAllocationStep('ANALYZING OPERATIVE CAPABILITIES & ROSTER DENSITY...');
    await new Promise(r => setTimeout(r, 500));

    setAllocationStep('BALANCING TACTICAL CELL POOLS...');
    await new Promise(r => setTimeout(r, 450));

    // Execute atomic registration with balanced role allocation
    const { agent, token, assignedDomain } = Store.registerAgent({
      name: name.trim(),
      auth_identifier: rollNumber.trim(),
      contact: contact.trim(),
      pin: pin.trim() || '1234',
      isPreVerified: false // Requires initial host QR check-in at desk
    });

    // Save session in local storage
    localStorage.setItem('ieee_agent_id', agent.agent_id);
    localStorage.setItem('ieee_agent_token', token);

    // Dispatch 2 WhatsApp transmissions: (1) Group Link, (2) Personal QR Pass Image [QR]/[Agent Name]
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

    // Forward to standby holding screen (or badge if already active) after brief reveal
    setTimeout(() => {
      if (Store.isEventActive()) {
        router.push('/my-badge');
      } else {
        router.push('/standby');
      }
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-[#0d120f] text-[#eaf2ec] flex flex-col justify-between p-4 sm:p-6 font-mono-cyber selection:bg-proto-signal selection:text-[#0d120f]">
      {/* Top Header */}
      <header className="max-w-md w-full mx-auto text-center pt-6 pb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#16201a] border border-[#23332a] text-[#8ea897] text-xs mb-3">
          <Terminal className="w-3.5 h-3.5 text-proto-signal" />
          <span>NIT WARANGAL • IEEE THE PROTOCOL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#f3f7f4]">
          OPERATIVE ENROLLMENT
        </h1>
        <p className="text-xs text-[#8ea897] font-sans mt-1">
          Register to receive your unique Agent ID, physical wristband, and digital QR pass.
        </p>
      </header>

      {/* Main Registration Card */}
      <main className="max-w-md w-full mx-auto bg-[#141d17] border border-[#223027] rounded-2xl p-6 shadow-2xl space-y-5">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-proto-crimson/15 border border-proto-crimson/40 text-proto-crimson text-xs flex items-start gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dynamic Allocation Reveal State */}
        {isSubmitting && (
          <div className="p-5 rounded-xl bg-[#101713] border border-proto-signal/40 text-center space-y-4 animate-in fade-in">
            {!assignedResult ? (
              <div className="space-y-3">
                <div className="w-10 h-10 border-2 border-proto-signal border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-proto-signal uppercase tracking-wider animate-pulse">
                  {allocationStep}
                </p>
                <div className="text-[10px] text-[#7d9787]">
                  Allocating starting role & initial directive from balanced pools...
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in zoom-in-95">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-proto-signal/20 text-proto-signal text-[11px] font-black border border-proto-signal/40">
                  <Sparkles className="w-3.5 h-3.5" /> DIRECTIVE LOCKED
                </div>
                <div className="text-lg font-black text-[#f3f7f4]">
                  {assignedResult.agentNumber}
                </div>
                <div className="text-xs text-proto-gold font-bold flex items-center justify-center gap-1">
                  <Ticket className="w-3.5 h-3.5" /> WRISTBAND: {assignedResult.wristbandId}
                </div>
                <div className="p-3 rounded-xl bg-[#17231c] border border-proto-signal/30 text-xs">
                  <span className="text-proto-signal font-black block text-sm">
                    {ROLE_DETAILS[assignedResult.domain].title} Operative
                  </span>
                  <span className="text-[11px] text-[#96af9f] block">
                    {ROLE_DETAILS[assignedResult.domain].subtitle}
                  </span>
                </div>

                {/* WhatsApp delivery confirmation badge */}
                <div className="p-2.5 rounded-xl bg-proto-signal/15 border border-proto-signal/40 text-proto-signal text-xs flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="font-bold text-[11px]">
                    2 WhatsApp Transmissions Dispatched: Group Link & QR Pass Pass Image
                  </span>
                </div>

                <p className="text-[10px] text-[#7d9787]">
                  {Store.isEventActive() 
                    ? 'Transitioning to your digital badge pass...' 
                    : 'Event commences Sept 24 • Forwarding to Holding Desk...'}
                </p>
              </div>
            )}
          </div>
        )}

        {!isSubmitting && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] text-[#8ea897] mb-1 uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alan Turing"
                className="w-full px-3.5 py-2.5 text-xs bg-[#101713] border border-[#283b30] rounded-xl text-[#eaf2ec] focus:outline-none focus:border-proto-signal"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#8ea897] mb-1 uppercase tracking-wider">
                Student Roll No / ID / Email * (Account Key)
              </label>
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 23CSB01 or roll number"
                className="w-full px-3.5 py-2.5 text-xs bg-[#101713] border border-[#283b30] rounded-xl text-[#eaf2ec] focus:outline-none focus:border-proto-signal uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#8ea897] mb-1 uppercase tracking-wider">
                  Phone / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Contact number"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#101713] border border-[#283b30] rounded-xl text-[#eaf2ec] focus:outline-none focus:border-proto-signal"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8ea897] mb-1 uppercase tracking-wider">
                  PIN / Passcode (Optional)
                </label>
                <input
                  type="password"
                  maxLength={8}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Default: 1234"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#101713] border border-[#283b30] rounded-xl text-[#eaf2ec] focus:outline-none focus:border-proto-signal"
                />
              </div>
            </div>

            {/* Dynamic Role Assignment Explainer */}
            <div className="p-3.5 rounded-xl bg-[#101713] border border-[#283b30] space-y-2">
              <div className="flex items-center gap-1.5 text-proto-signal text-[11px] font-bold">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>DYNAMIC ROLE ALLOCATION</span>
              </div>
              <p className="text-[10px] text-[#8ea897] leading-relaxed font-sans">
                To guarantee fair tactical parity, the system will allocate your starting role and initial node cluster from balanced pools upon submission:
              </p>
              <div className="grid grid-cols-1 gap-1 pt-1 text-[10px]">
                {(Object.entries(ROLE_DETAILS) as [PrimaryDomain, typeof ROLE_DETAILS[PrimaryDomain]][]).map(([key, item]) => {
                  const Icon = DOMAIN_ICONS[key];
                  return (
                    <div key={key} className="flex items-center gap-2 py-0.5 text-[#cad3f5]">
                      <Icon className="w-3 h-3 text-proto-signal shrink-0" />
                      <span className="font-bold">{item.title}:</span>
                      <span className="text-[#8ea897] font-sans">{item.subtitle}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-proto-signal hover:bg-[#00e676] text-[#0a0f0d] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>INITIALIZE OPERATIVE & GENERATE PASS</span>
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-[#1b2620] text-xs text-[#7d9787]">
          <span>Already registered? </span>
          <Link href="/login" className="text-proto-signal hover:underline font-bold">
            Log in here →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-md w-full mx-auto text-center py-4 text-xs text-[#7d9787]">
        NIT Warangal IEEE Student Branch // The Protocol
      </footer>
    </div>
  );
}
