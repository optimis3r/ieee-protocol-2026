'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, initStore } from '@/lib/store';

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
    <div className="min-h-screen bg-[#141514] text-[#f4f1ea] flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Top Editorial Masthead */}
      <header className="max-w-xl w-full mx-auto rule-double pb-2.5 flex items-baseline justify-between text-xs text-[#949e93] font-mono-tabular">
        <div>
          <strong className="text-[#f4f1ea] font-display-grotesk tracking-tight">NIT WARANGAL IEEE</strong>
          <span className="mx-2">•</span>
          <span>THE PROTOCOL 2026</span>
        </div>
        <div className="text-[11px] uppercase tracking-wider text-[#c28b28] font-bold">
          TERMINAL ACCESS
        </div>
      </header>

      {/* Main Asymmetric Body */}
      <main className="max-w-xl w-full mx-auto my-auto py-6 space-y-6">
        
        {/* Editorial Title */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-serif-editorial tracking-tight text-[#f4f1ea]">
            Sign in to your operative terminal.
          </h1>
          <p className="text-xs text-[#949e93] font-display-grotesk leading-relaxed">
            Enter your Student Roll No, Call Sign, or contact phone to recall your active pass and station status.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 border border-[#c93b2b] text-[#c93b2b] text-xs font-display-grotesk bg-[#1b1d1b]">
            {errorMsg}
          </div>
        )}

        {!Store.isEventActive() && (
          <div className="border border-[#2d312c] bg-[#1b1d1b] p-3 text-xs text-[#949e93] font-display-grotesk">
            <strong className="text-[#c28b28] font-mono-tabular">NOTICE: </strong>
            The event officially commences on September 24th, 2026. Signing in will display your enrolled holding card and launch countdown.
          </div>
        )}

        <form onSubmit={handleLogin} className="border border-[#2d312c] bg-[#1b1d1b] p-5 sm:p-6 space-y-4">
          
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-[#949e93] font-mono-tabular font-bold">
              Roll No / Call Sign / Contact *
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. 23CSB01 or AGT-001"
              className="w-full px-3 py-2 text-xs bg-[#141514] border border-[#2d312c] text-[#f4f1ea] focus:outline-none focus:border-[#f4f1ea] uppercase font-mono-tabular"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 btn-editorial-primary text-xs block text-center uppercase tracking-wider font-bold cursor-pointer"
          >
            Access Operative Terminal →
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-[#949e93] font-display-grotesk pt-1">
          <span>Not yet commissioned?</span>
          <Link href="/register" className="text-[#f4f1ea] underline underline-offset-4 font-bold">
            Enlist your device here →
          </Link>
        </div>

      </main>

      {/* Editorial Footer */}
      <footer className="max-w-xl w-full mx-auto rule-hairline pt-2 flex items-center justify-between text-[10px] text-[#949e93] font-mono-tabular">
        <span>NIT WARANGAL • DEPT OF ECE</span>
        <span>SECURITY CLEARANCE GATE</span>
      </footer>
    </div>
  );
}
