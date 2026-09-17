'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, initStore } from '@/lib/store';
import { AgentArchetype } from '@/types/database';
import { 
  Terminal, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Activity, 
  Eye, 
  Cpu, 
  Users,
  QrCode
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [contact, setContact] = useState('');
  const [pin, setPin] = useState('');
  const [domain, setDomain] = useState<AgentArchetype>('LOGIC');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const domains: Array<{ type: AgentArchetype; title: string; desc: string; icon: any }> = [
    { type: 'LOGIC', title: 'Logic', desc: 'Analytical deciphering, Base64 & cryptographic bypass keys.', icon: Layers },
    { type: 'SIGNAL', title: 'Signal', desc: 'Wave frequencies, radio relays, and carrier telemetry.', icon: Activity },
    { type: 'OBSERVATION', title: 'Observation', desc: 'Physical venue exploration and optical sensor tags.', icon: Eye },
    { type: 'SYSTEM', title: 'System', desc: 'Memory exploits and autonomic daemon tracking.', icon: Cpu },
    { type: 'SOCIAL', title: 'Social', desc: 'Multi-agent handshakes and cross-player intel trade.', icon: Users },
  ];

  const handleSubmit = (e: React.FormEvent) => {
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

    const { agent, token } = Store.registerAgent({
      name: name.trim(),
      auth_identifier: rollNumber.trim(),
      contact: contact.trim(),
      pin: pin.trim() || '1234',
      archetype: domain,
      isPreVerified: false // Requires host QR scan at gate!
    });

    // Save session in local storage
    localStorage.setItem('ieee_agent_id', agent.agent_id);
    localStorage.setItem('ieee_agent_token', token);

    // Redirect to personal QR badge page
    router.push('/my-badge');
  };

  return (
    <div className="min-h-screen bg-[#0d120f] text-[#eaf2ec] flex flex-col justify-between p-4 sm:p-6 font-mono-cyber selection:bg-proto-signal selection:text-[#0d120f]">
      {/* Top Header */}
      <header className="max-w-md w-full mx-auto text-center pt-6 pb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#16201a] border border-[#23332a] text-[#8ea897] text-xs mb-3">
          <Terminal className="w-3.5 h-3.5 text-proto-signal" />
          <span>NIT WARANGAL • IEEE THE PROTOCOL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f3f7f4]">
          OPERATIVE ENROLLMENT
        </h1>
        <p className="text-xs text-[#8ea897] font-sans mt-1">
          Register your device to receive your personal entry QR pass.
        </p>
      </header>

      {/* Main Registration Card */}
      <main className="max-w-md w-full mx-auto bg-[#141d17] border border-[#223027] rounded-2xl p-6 shadow-2xl space-y-5">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-proto-crimson/15 border border-proto-crimson/40 text-proto-crimson text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

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
                Phone / Contact *
              </label>
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Phone or WhatsApp"
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

          <div>
            <label className="block text-[11px] text-[#8ea897] mb-1.5 uppercase tracking-wider">
              Select Your Operative Role *
            </label>
            <div className="grid grid-cols-1 gap-2">
              {domains.map((dom) => {
                const isSelected = domain === dom.type;
                const Icon = dom.icon;
                return (
                  <div
                    key={dom.type}
                    onClick={() => setDomain(dom.type)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-[#1a251e] border-proto-signal text-[#eaf2ec]'
                        : 'bg-[#101713] border-[#223027] text-[#8ea897] hover:border-[#2f4236]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-proto-signal" />
                      <div>
                        <span className="font-bold text-[#eaf2ec] block">{dom.title}</span>
                        <span className="text-[10px] text-[#7d9787] font-sans block leading-tight">{dom.desc}</span>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-proto-signal shrink-0 ml-2" />}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-proto-signal hover:bg-[#00e676] text-[#0a0f0d] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            <span>Generate Entry Badge & QR Pass</span>
          </button>
        </form>

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
