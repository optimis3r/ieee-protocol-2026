'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Lock, 
  User, 
  KeyRound, 
  ArrowRight, 
  Terminal, 
  AlertTriangle,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { soundEffects } from '@/lib/audio';

export default function AdminLoginPage() {
  const router = useRouter();
  const [agentName, setAgentName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanAgent = agentName.trim();
    const cleanPass = password.trim();

    if (!cleanAgent || !cleanPass) {
      setErrorMsg('Please enter both Agent-Name and Password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName: cleanAgent, password: cleanPass })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.token) {
        soundEffects.playSuccessChime();
        sessionStorage.setItem('ieee_admin_auth', 'true');
        sessionStorage.setItem('ieee_admin_agent', data.agentName || cleanAgent);
        sessionStorage.setItem('ieee_admin_token', data.token);

        setTimeout(() => {
          router.push('/admin');
        }, 300);
      } else {
        soundEffects.playLockoutBuzz();
        setErrorMsg(data.error || 'AUTHENTICATION REJECTED: Invalid credentials.');
        setIsSubmitting(false);
      }
    } catch {
      soundEffects.playLockoutBuzz();
      setErrorMsg('NETWORK ERROR: Failed to reach security service.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b09] text-[#eaf2ec] flex flex-col justify-between p-4 sm:p-6 font-mono-cyber selection:bg-proto-signal selection:text-[#070b09] scanlines relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-proto-signal/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-proto-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between pt-4 pb-2 z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-[#8ea897] hover:text-proto-signal transition-colors p-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Home Hub</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121b15] border border-[#203226] text-[10px] text-proto-signal font-bold tracking-widest uppercase">
          <Terminal className="w-3 h-3" />
          <span>OPERATIONS GATEWAY</span>
        </div>
      </header>

      {/* Login Card */}
      <main className="max-w-md w-full mx-auto my-auto z-10">
        <div className="bg-[#0f1712]/95 backdrop-blur-xl border border-[#203226] hover:border-proto-signal/50 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6 transition-all">
          
          {/* Header & Crest */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#142018] border border-proto-signal/40 flex items-center justify-center mx-auto text-proto-signal shadow-[0_0_20px_rgba(0,255,136,0.15)] relative">
              <ShieldAlert className="w-7 h-7" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-proto-signal border-2 border-[#0f1712] animate-pulse" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-wider text-[#f3f7f4] uppercase">
                PERSONAL ADMIN CONSOLE
              </h1>
              <p className="text-xs text-[#8ea897] font-sans mt-1">
                NIT Warangal IEEE Student Branch • Master Protocol Gateway
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-proto-crimson/15 border border-proto-crimson/40 text-proto-crimson text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] text-[#8ea897] uppercase tracking-wider mb-1.5 font-bold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-proto-signal" />
                <span>Agent-Name</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="ieee-protocol-admin"
                className="w-full px-4 py-3 text-xs bg-[#090e0b] border border-[#23352a] rounded-xl text-[#f3f7f4] placeholder:text-[#55695c] focus:outline-none focus:border-proto-signal focus:ring-1 focus:ring-proto-signal transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#8ea897] uppercase tracking-wider mb-1.5 font-bold flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-proto-gold" />
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 text-xs bg-[#090e0b] border border-[#23352a] rounded-xl text-[#f3f7f4] placeholder:text-[#55695c] focus:outline-none focus:border-proto-signal focus:ring-1 focus:ring-proto-signal transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-proto-signal via-[#00e676] to-proto-gold text-[#070b09] font-black text-xs uppercase tracking-widest transition-all hover:opacity-95 active:scale-[0.99] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,136,0.25)] cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#070b09] border-t-transparent rounded-full animate-spin" />
                  <span>AUTHORIZING CLEARANCE...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>AUTHENTICATE & ACCESS CONTROLS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Notice Card */}
          <div className="p-3 rounded-xl bg-[#0a0f0c] border border-[#1b2a21] text-[11px] text-[#8ea897] space-y-1">
            <div className="flex items-center gap-1.5 text-proto-gold font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Restricted Clearance Zone</span>
            </div>
            <p className="text-[10px] text-[#718779] font-sans leading-relaxed">
              Provides master control over public leaderboard visibility, live WhatsApp participant broadcasts, participant active-timers, and cryptographic circuits.
            </p>
          </div>

          <div className="pt-2 border-t border-[#1b2a21] flex items-center justify-between text-xs text-[#718779]">
            <Link href="/play" className="hover:text-proto-signal transition-colors">
              Operative HUD →
            </Link>
            <Link href="/leaderboard" className="hover:text-proto-gold transition-colors">
              Standings →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-md w-full mx-auto text-center py-3 text-[11px] text-[#55695c] z-10">
        NIT Warangal IEEE Student Branch // The Protocol Ops
      </footer>
    </div>
  );
}
