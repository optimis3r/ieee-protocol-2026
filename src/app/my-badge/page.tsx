'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { Store, initStore, getAgentActiveSeconds, formatActiveTime } from '@/lib/store';
import { Agent, ROLE_DETAILS, PrimaryDomain } from '@/types/database';
import { soundEffects } from '@/lib/audio';
import { 
  Terminal, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  LogOut,
  Ticket,
  Play
} from 'lucide-react';

export default function MyBadgePage() {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeSeconds, setActiveSeconds] = useState<number>(0);

  const refreshState = useCallback((agentId: string) => {
    const current = Store.getAgentById(agentId);
    if (!current) return;
    setAgent(current);
    setActiveSeconds(getAgentActiveSeconds(current));
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

    setTimeout(() => {
      setAgent(current);
      refreshState(current.agent_id);
    }, 0);

    // Generate Personal Badge QR (stays on phone)
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

    // Live store event listener (triggers when admin desk scans their QR)
    const handleStoreUpdate = () => {
      const updated = Store.getAgentById(current.agent_id);
      if (updated) {
        setAgent({ ...updated });
        setActiveSeconds(getAgentActiveSeconds(updated));

        // When admin checks them in (transitions to ACTIVE), automatically enter HUD
        if (updated.check_in_status === 'ACTIVE' && current.check_in_status !== 'ACTIVE') {
          soundEffects.playSuccessChime();
          setTimeout(() => {
            router.push('/play');
          }, 800);
        }
      }
    };

    window.addEventListener('ieee_store_update', handleStoreUpdate);
    window.addEventListener('storage', handleStoreUpdate);

    const interval = setInterval(() => {
      refreshState(current.agent_id);
    }, 1000);

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

  const roleMeta = ROLE_DETAILS[(agent.archetype as PrimaryDomain) || 'LOGIC'];
  const isActive = agent.check_in_status === 'ACTIVE';
  const isPaused = agent.check_in_status === 'PAUSED';

  return (
    <div className="min-h-screen bg-[#0d120f] text-[#eaf2ec] flex flex-col justify-between p-4 sm:p-6 font-mono-cyber selection:bg-proto-signal selection:text-[#0d120f]">
      {/* Top Header */}
      <header className="max-w-md w-full mx-auto text-center pt-6 pb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#16201a] border border-[#23332a] text-[#8ea897] text-xs mb-2">
          <Terminal className="w-3.5 h-3.5 text-proto-signal" />
          <span>NIT WARANGAL • THE PROTOCOL</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#f3f7f4]">
          PERSONAL OPERATIVE BADGE
        </h1>
        <p className="text-xs text-[#8ea897] font-sans">
          Keep this QR code on your phone for station scans & check-in.
        </p>
      </header>

      {/* Main Badge Card */}
      <main className="max-w-md w-full mx-auto bg-[#141d17] border border-[#223027] rounded-2xl p-6 shadow-2xl space-y-5 text-center">
        
        {/* Verification Status Pill */}
        {isActive ? (
          <div className="p-3 rounded-xl bg-proto-signal/15 border border-proto-signal/40 text-proto-signal text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-black uppercase tracking-wider">CHECKED IN // ACTIVE</span>
            </div>
            <span className="font-bold">{formatActiveTime(activeSeconds)}</span>
          </div>
        ) : isPaused ? (
          <div className="p-3 rounded-xl bg-proto-gold/15 border border-proto-gold/40 text-proto-gold text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span className="font-black uppercase tracking-wider">CHECKED OUT // PAUSED</span>
            </div>
            <span className="font-bold">Timer Frozen</span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-proto-crimson/15 border border-proto-crimson/40 text-proto-crimson text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 animate-pulse" />
              <span className="font-black uppercase tracking-wider">Awaiting Venue Check-In</span>
            </div>
            <span className="text-[10px] text-proto-subtext font-sans">Desk Scan Required</span>
          </div>
        )}

        {/* Physical Wristband Verification Callout */}
        <div className="p-3.5 rounded-xl bg-[#101713] border border-proto-gold/40 flex items-center justify-between text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-proto-gold/15 border border-proto-gold/30 flex items-center justify-center text-proto-gold">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#8ea897] block uppercase tracking-wider font-bold">
                PHYSICAL WRISTBAND ID
              </span>
              <span className="text-sm font-black text-proto-gold tracking-widest">
                {agent.wristband_id || agent.agent_id}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-[#8ea897] text-right font-sans max-w-[140px] leading-tight">
            Matches your physical wristband for visual checkpoints.
          </div>
        </div>

        {/* The QR Code (Stays on Phone) */}
        <div className="flex justify-center my-2">
          <div className="p-4 bg-white rounded-2xl shadow-xl inline-block border-2 border-proto-signal/40">
            {qrDataUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={qrDataUrl}
                alt="Operative Pass QR Code"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-proto-signal border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Operative Details */}
        <div className="space-y-2 text-center pt-1">
          <div className="text-xl font-black text-[#f3f7f4] tracking-wider">
            {agent.agent_number || agent.agent_id}
          </div>
          <div className="text-xs text-[#8ea897]">
            {agent.name} • {agent.auth_identifier || agent.contact}
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18261e] border border-proto-signal/30 text-xs">
            <span className="font-black text-proto-signal">{roleMeta.title} Operative</span>
            <span className="text-[10px] text-[#8ea897]">({roleMeta.subtitle})</span>
          </div>
        </div>

        {/* Action Button */}
        {isActive ? (
          <Link
            href="/play"
            className="w-full py-3.5 px-4 rounded-xl bg-proto-signal hover:bg-[#00e676] text-[#0a0f0d] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Operative HUD Terminal</span>
          </Link>
        ) : isPaused ? (
          <Link
            href="/play"
            className="w-full py-3.5 px-4 rounded-xl bg-proto-gold hover:bg-[#ffcf66] text-[#0a0f0d] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span>View Saved Progress in HUD (Timer Paused)</span>
          </Link>
        ) : (
          <div className="p-3 rounded-xl bg-[#101713] border border-[#23332a] text-xs text-[#8ea897] font-sans">
            Show this screen to an IEEE Operations staff member at the desk to complete mandatory initial check-in.
          </div>
        )}

        {/* Log out / Switch Operative */}
        <div className="pt-2 border-t border-[#1b2620] flex items-center justify-between text-xs text-[#7d9787]">
          <Link href="/leaderboard" className="hover:text-[#eaf2ec] transition-colors">
            Standings Leaderboard
          </Link>
          <button
            onClick={handleLogout}
            className="text-proto-crimson hover:underline flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Account</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-md w-full mx-auto text-center py-4 text-xs text-[#7d9787]">
        NIT Warangal IEEE Student Branch // The Protocol
      </footer>
    </div>
  );
}
