'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, initStore } from '@/lib/store';
import { 
  AlertTriangle, 
  ArrowRight,
  LogIn,
  Clock
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier.trim()) {
      setErrorMsg('Enter your Student Roll No, Agent ID, or registered phone.');
      return;
    }

    setIsSubmitting(true);
    initStore();

    await Store.syncWithServer().catch(() => {});
    const res = Store.loginPlayer(identifier.trim());

    if (!res.success || !res.agent) {
      setErrorMsg(res.message);
      setIsSubmitting(false);
      return;
    }

    localStorage.setItem('ieee_agent_id', res.agent.agent_id);
    localStorage.setItem('ieee_agent_token', res.agent.token);

    await Store.syncAgentWithServer(res.agent.agent_id).catch(() => {});

    if (!Store.isEventActive()) {
      router.push('/standby');
      return;
    }

    const sessionStatus = Store.checkSessionStatus(res.agent.agent_id);
    if (sessionStatus.canPlay) {
      router.push('/play');
    } else {
      router.push('/my-badge');
    }
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
        <div className="text-[10px] uppercase tracking-widest text-[#eab308] font-bold">
          [AUTHENTICATION]
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-sm w-full mx-auto my-auto py-2">
        <div className="bg-[#121513] border-2 border-[#28302b] rounded-sm p-4 sm:p-5 shadow-2xl space-y-4">
          
          <div className="border-b border-[#28302b] pb-2">
            <div className="text-[9px] uppercase tracking-widest text-[#8f9e91] font-bold">
              TERMINAL CREDENTIAL VERIFICATION
            </div>
            <h1 className="text-xl font-black text-[#f1ede4] tracking-tight uppercase">
              OPERATIVE ACCESS
            </h1>
            <p className="text-[11px] text-[#8f9e91] font-mono mt-0.5">
              Input account key to recall your QR pass and circuit status.
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-[#dc2626]/10 border border-[#dc2626]/40 text-[#dc2626] text-xs flex items-center gap-2 rounded-sm">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!Store.isEventActive() && (
            <div className="p-2.5 bg-[#eab308]/10 border border-[#eab308]/40 text-[#eab308] text-xs space-y-0.5 rounded-sm font-mono">
              <div className="font-bold flex items-center gap-1.5 uppercase text-[10px]">
                <Clock className="w-3 h-3" />
                <span>NETWORK STATUS: STANDBY</span>
              </div>
              <div className="text-[9px] text-[#8f9e91]">
                Official commencement: Sept 24, 2026. Logging in displays holding countdown.
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-[10px] text-[#8f9e91] mb-1 uppercase tracking-wider font-bold">
                Student Roll No / Agent ID / Contact *
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 23CSB01 or AGT-001"
                className="w-full px-3 py-2 text-xs bg-[#0c0e0d] border border-[#28302b] rounded-sm text-[#f1ede4] focus:outline-none focus:border-[#22c55e] uppercase font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-3 rounded-sm btn-tactile-primary text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>ACCESS OPERATIVE TERMINAL</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#28302b] text-[11px] text-[#8f9e91]">
            <span>Not registered yet? </span>
            <Link href="/register" className="text-[#22c55e] hover:underline font-bold">
              Enlist device here →
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal Bottom Stamp */}
      <footer className="max-w-sm w-full mx-auto text-center text-[9px] text-[#48544c] uppercase tracking-widest pt-1">
        NIT WARANGAL • IEEE THE PROTOCOL • LOCAL TERMINAL RE-ENTRY
      </footer>
    </div>
  );
}
