'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { Store, initStore } from '@/lib/store';
import { Agent } from '@/types/database';
import { soundEffects } from '@/lib/audio';
import { 
  Terminal, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  RefreshCw,
  LogOut,
  Sparkles
} from 'lucide-react';

export default function MyBadgePage() {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [sessionStatus, setSessionStatus] = useState<{
    valid: boolean;
    minutesRemaining: number;
    reason?: string;
  }>({ valid: false, minutesRemaining: 0 });

  const refreshState = useCallback((agentId: string) => {
    const current = Store.getAgentById(agentId);
    if (!current) return;
    setAgent(current);

    const status = Store.checkSessionValidity(current.agent_id);
    setSessionStatus(status);
  }, []);

  useEffect(() => {
    initStore();
    const storedAgentId = localStorage.getItem('ieee_agent_id');
    if (!storedAgentId) {
      router.push('/login');
      return;
    }

    const current = Store.getAgentById(storedAgentId);
    if (!current) {
      router.push('/login');
      return;
    }

    setAgent(current);
    refreshState(current.agent_id);

    // Generate Personal Badge QR
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://network.ieee';
    const qrPayload = `${origin}/play?agent_id=${current.agent_id}&token=${current.token}`;

    QRCode.toDataURL(qrPayload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0a0f0d',
        light: '#ffffff',
      },
    }).then(setQrDataUrl).catch(console.error);

    // Cross-tab and live store event listener (triggers when admin host scans their QR!)
    const handleStoreUpdate = () => {
      const updated = Store.getAgentById(current.agent_id);
      if (updated) {
        setAgent({ ...updated });
        const newStatus = Store.checkSessionValidity(updated.agent_id);
        setSessionStatus(newStatus);

        if (newStatus.valid) {
          soundEffects.playSuccessChime();
          // Auto-direct into game dashboard when host scans their QR
          setTimeout(() => {
            router.push('/play');
          }, 800);
        }
      }
    };

    window.addEventListener('ieee_store_update', handleStoreUpdate);
    window.addEventListener('storage', handleStoreUpdate);

    // Check expiry interval every 10 seconds
    const interval = setInterval(() => {
      refreshState(current.agent_id);
    }, 10000);

    return () => {
      window.removeEventListener('ieee_store_update', handleStoreUpdate);
      window.removeEventListener('storage', handleStoreUpdate);
      clearInterval(interval);
    };
  }, [router, refreshState]);

  const handleLogout = () => {
    localStorage.removeItem('ieee_agent_id');
    localStorage.removeItem('ieee_agent_token');
    router.push('/login');
  };

  if (!agent) {
    return (
      <div className="min-h-screen bg-[#0d120f] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-proto-signal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d120f] text-[#eaf2ec] flex flex-col justify-between p-4 sm:p-6 font-mono-cyber selection:bg-proto-signal selection:text-[#0d120f]">
      {/* Top Header */}
      <header className="max-w-md w-full mx-auto text-center pt-6 pb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#16201a] border border-[#23332a] text-[#8ea897] text-xs mb-2">
          <Terminal className="w-3.5 h-3.5 text-proto-signal" />
          <span>NIT WARANGAL • THE PROTOCOL</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f3f7f4]">
          PERSONAL OPERATIVE BADGE
        </h1>
      </header>

      {/* Main Badge Card */}
      <main className="max-w-md w-full mx-auto bg-[#141d17] border border-[#223027] rounded-2xl p-6 shadow-2xl space-y-5 text-center">
        
        {/* Verification Status Pill */}
        {sessionStatus.valid ? (
          <div className="p-3 rounded-xl bg-proto-signal/15 border border-proto-signal/40 text-proto-signal text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-bold uppercase tracking-wider">Clearance Active</span>
            </div>
            <span className="text-[11px] font-sans opacity-90">
              {sessionStatus.minutesRemaining}m window
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-proto-crimson/15 border border-proto-crimson/40 text-proto-crimson text-xs flex items-start gap-2.5 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <span className="font-bold block uppercase tracking-wider">
                {sessionStatus.reason === 'EXPIRED_15_MIN'
                  ? 'Session Expired (>15m Away)'
                  : 'Host Check-In Required'}
              </span>
              <span className="text-[11px] font-sans text-[#8ea897] leading-tight block mt-0.5">
                {sessionStatus.reason === 'EXPIRED_15_MIN'
                  ? 'You were away from the webpage for over 15 minutes. Present this QR to a host at the gate to reactivate your dashboard.'
                  : 'Show this QR pass to an IEEE host at the entrance to authorize your terminal session (15-min window).'}
              </span>
            </div>
          </div>
        )}

        {/* High-Contrast Phone Screen QR Pass */}
        <div className="p-4 bg-white rounded-2xl shadow-xl inline-block mx-auto border-4 border-[#283b30]">
          {qrDataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={qrDataUrl} 
              alt="Personal Badge QR" 
              className="w-56 h-56 object-contain"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-neutral-800">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          )}
        </div>

        {/* Operative Details */}
        <div className="space-y-1">
          <div className="text-lg font-bold text-[#f3f7f4]">
            {agent.name}
          </div>
          <div className="text-xs text-[#8ea897] flex items-center justify-center gap-2">
            <span className="text-proto-signal font-bold">{agent.agent_id}</span>
            <span>•</span>
            <span className="uppercase">{agent.auth_identifier || 'OPERATIVE'}</span>
            <span>•</span>
            <span className="text-[#00d2ff] font-bold">[{agent.archetype}]</span>
          </div>
        </div>

        {/* Action Button */}
        {sessionStatus.valid ? (
          <Link
            href="/play"
            className="w-full py-3.5 px-4 rounded-xl bg-proto-signal hover:bg-[#00e676] text-[#0a0f0d] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Enter Terminal (/play)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <div className="text-[11px] text-[#718a7b] font-sans">
            Terminal will unlock automatically the moment the host scans this code.
          </div>
        )}

        {/* Logout / Switch Account */}
        <div className="pt-2 border-t border-[#1b2620] flex items-center justify-between text-xs text-[#718a7b]">
          <Link href="/leaderboard" className="hover:text-[#eaf2ec] transition-colors">
            View Leaderboard
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 hover:text-proto-crimson transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-md w-full mx-auto text-center py-4 text-xs text-[#718a7b]">
        NIT Warangal IEEE Student Branch // The Protocol
      </footer>
    </div>
  );
}
