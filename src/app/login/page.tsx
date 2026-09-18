'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, initStore } from '@/lib/store';
import { 
  Terminal, 
  AlertTriangle, 
  UserCheck
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier.trim()) {
      setErrorMsg('Please enter your Student Roll No, Agent ID, or registered contact.');
      return;
    }

    setIsSubmitting(true);
    initStore();

    const res = Store.loginPlayer(identifier.trim(), pin.trim() || undefined);

    if (!res.success || !res.agent) {
      setErrorMsg(res.message);
      setIsSubmitting(false);
      return;
    }

    // Save session in localStorage
    localStorage.setItem('ieee_agent_id', res.agent.agent_id);
    localStorage.setItem('ieee_agent_token', res.agent.token);

    // Check if initial check-in is complete
    const sessionStatus = Store.checkSessionStatus(res.agent.agent_id);
    if (sessionStatus.canPlay) {
      router.push('/play');
    } else {
      router.push('/my-badge');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d120f] text-[#eaf2ec] flex flex-col justify-between p-4 sm:p-6 font-mono-cyber selection:bg-proto-signal selection:text-[#0d120f]">
      {/* Top Header */}
      <header className="max-w-md w-full mx-auto text-center pt-8 pb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#16201a] border border-[#23332a] text-[#8ea897] text-xs mb-3">
          <Terminal className="w-3.5 h-3.5 text-proto-signal" />
          <span>NIT WARANGAL • IEEE THE PROTOCOL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f3f7f4]">
          OPERATIVE ACCESS
        </h1>
        <p className="text-xs text-[#8ea897] font-sans mt-1">
          Log in to retrieve your personal QR pass and access your terminal.
        </p>
      </header>

      {/* Login Card */}
      <main className="max-w-md w-full mx-auto bg-[#141d17] border border-[#223027] rounded-2xl p-6 shadow-2xl space-y-5">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-proto-crimson/15 border border-proto-crimson/40 text-proto-crimson text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] text-[#8ea897] mb-1 uppercase tracking-wider">
              Student Roll No / Agent ID / Contact *
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. 23CSB01 or AGT-TURING"
              className="w-full px-3.5 py-2.5 text-xs bg-[#101713] border border-[#283b30] rounded-xl text-[#eaf2ec] focus:outline-none focus:border-proto-signal uppercase"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#8ea897] mb-1 uppercase tracking-wider">
              PIN / Passcode (Optional)
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Default: 1234"
              className="w-full px-3.5 py-2.5 text-xs bg-[#101713] border border-[#283b30] rounded-xl text-[#eaf2ec] focus:outline-none focus:border-proto-signal"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-proto-signal hover:bg-[#00e676] text-[#0a0f0d] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <UserCheck className="w-4 h-4" />
            <span>Retrieve My Badge & QR Pass</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#1b2620] text-xs text-[#7d9787]">
          <span>Not registered yet? </span>
          <Link href="/register" className="text-proto-signal hover:underline font-bold">
            Register your device here →
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
