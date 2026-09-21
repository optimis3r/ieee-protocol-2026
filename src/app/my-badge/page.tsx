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
  Clock, 
  CheckCircle2, 
  LogOut,
  Ticket,
  ArrowRight,
  ShieldAlert,
  AlertTriangle
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
      width: 280,
      margin: 1,
      color: {
        dark: '#0c0e0d',
        light: '#ffffff',
      },
    }).then(setQrDataUrl).catch(console.error);

    // Live server polling to detect desk check-in across devices
    let isCancelled = false;
    let prevCheckInStatus = current.check_in_status;

    const pollLiveStatus = async () => {
      try {
        const { agent: serverAg, gameState } = await Store.syncAgentWithServer(current.agent_id);
        if (isCancelled || !serverAg) return;

        setAgent({ ...serverAg });
        setActiveSeconds(getAgentActiveSeconds(serverAg));

        // When desk staff completes check-in, automatically advance phone
        if (serverAg.check_in_status === 'ACTIVE' && prevCheckInStatus !== 'ACTIVE') {
          prevCheckInStatus = 'ACTIVE';
          soundEffects.playSuccessChime();
          setTimeout(() => {
            if (!isCancelled) {
              if (gameState?.status === 'NETWORK_ACTIVE' || Store.isEventActive()) {
                router.push('/play');
              } else {
                router.push('/standby');
              }
            }
          }, 800);
        } else {
          prevCheckInStatus = serverAg.check_in_status;
        }
      } catch {
        refreshState(current.agent_id);
      }
    };

    pollLiveStatus();
    const interval = setInterval(pollLiveStatus, 2000);

    const handleStoreUpdate = () => {
      pollLiveStatus();
    };

    window.addEventListener('ieee_store_update', handleStoreUpdate);
    window.addEventListener('storage', handleStoreUpdate);

    return () => {
      isCancelled = true;
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
      <div className="min-h-screen bg-[#0c0e0d] flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-[#22c55e] border-t-transparent animate-spin" />
      </div>
    );
  }

  const roleMeta = ROLE_DETAILS[(agent.archetype as PrimaryDomain) || 'LOGIC'];
  const isActive = agent.check_in_status === 'ACTIVE';
  const isPaused = agent.check_in_status === 'PAUSED';

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
          [FIELD PASS]
        </div>
      </header>

      {/* Main Single-Screen Credential Pass */}
      <main className="max-w-sm w-full mx-auto my-auto py-2">
        <div className="bg-[#121513] border-2 border-[#28302b] rounded-sm p-4 sm:p-5 shadow-2xl relative">
          
          {/* Lanyard punch notch simulation */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full bg-[#0c0e0d] border border-[#28302b]" />

          {/* Operative Header Strip */}
          <div className="flex items-start justify-between gap-2 border-b border-[#28302b] pb-3 mb-3">
            <div>
              <div className="text-[9px] uppercase tracking-widest text-[#8f9e91] font-bold">
                DESIGNATION // CALL SIGN
              </div>
              <div className="text-2xl font-black tracking-tight text-[#f1ede4] leading-tight">
                {agent.agent_id}
              </div>
              <div className="text-xs text-[#8f9e91] font-sans truncate max-w-[200px] mt-0.5">
                {agent.name} {agent.auth_identifier ? `• ${agent.auth_identifier}` : ''}
              </div>
            </div>

            <div className="text-right">
              <span 
                className="inline-block text-[10px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-wider"
                style={{ 
                  color: roleMeta.color || '#38bdf8', 
                  borderColor: `${roleMeta.color || '#38bdf8'}40`,
                  backgroundColor: `${roleMeta.color || '#38bdf8'}10`
                }}
              >
                {roleMeta.title}
              </span>
              <div className="text-[9px] text-[#8f9e91] uppercase mt-1 font-mono">
                BAND: <strong className="text-[#eab308]">{agent.wristband_id || agent.agent_id}</strong>
              </div>
            </div>
          </div>

          {/* Centered High-Contrast Physical QR Code */}
          <div className="flex flex-col items-center justify-center my-1">
            <div className="p-3 bg-white rounded-sm border-2 border-[#121513] shadow-md inline-block">
              {qrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={qrDataUrl}
                  alt="Operative Authentication Pass"
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-[#f1ede4]">
                  <div className="w-6 h-6 border-2 border-[#0c0e0d] border-t-transparent animate-spin" />
                </div>
              )}
            </div>
            <div className="text-[9px] text-[#8f9e91] uppercase tracking-wider font-mono mt-2 text-center">
              PRESENT QR FOR DESK CHECK-IN & STATIONS
            </div>
          </div>

          {/* Physical Rubber Stamp Status Badge */}
          <div className="my-3 text-center">
            {isActive ? (
              <div className="stamp-box stamp-active w-full justify-center text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ACTIVE // {formatActiveTime(activeSeconds)}</span>
              </div>
            ) : isPaused ? (
              <div className="stamp-box stamp-standby w-full justify-center text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>OFF-SITE // TIMER FROZEN</span>
              </div>
            ) : (
              <div className="stamp-box stamp-danger w-full justify-center text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>DESK VERIFICATION REQUIRED</span>
              </div>
            )}
          </div>

          {/* Direct Tactical Action */}
          <div className="pt-2">
            {!Store.isEventActive() ? (
              <Link
                href="/standby"
                className="w-full py-2.5 px-3 rounded-sm btn-tactile-amber text-xs flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span>AWAITING LAUNCH • VIEW STANDBY</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : isActive ? (
              <Link
                href="/play"
                className="w-full py-2.5 px-3 rounded-sm btn-tactile-primary text-xs flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span>ENTER MISSION TERMINAL</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : isPaused ? (
              <Link
                href="/play"
                className="w-full py-2.5 px-3 rounded-sm btn-tactile-amber text-xs flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span>VIEW PROGRESS (PAUSED)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="text-[10px] text-[#8f9e91] text-center font-sans">
                Show this pass to IEEE operations staff at desk to begin.
              </div>
            )}
          </div>

        </div>

        {/* Tactical Footer Strip */}
        <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#8f9e91] px-1">
          <Link href="/leaderboard" className="hover:text-[#f1ede4] transition-colors underline underline-offset-2">
            Leaderboard
          </Link>
          <button
            onClick={handleLogout}
            className="text-[#dc2626] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>Switch Account</span>
          </button>
        </div>
      </main>

      {/* Minimal Bottom Stamp */}
      <footer className="max-w-sm w-full mx-auto text-center text-[9px] text-[#48544c] uppercase tracking-widest pt-1">
        NIT WARANGAL • IEEE THE PROTOCOL • AUTONOMOUS VERIFICATION
      </footer>
    </div>
  );
}
