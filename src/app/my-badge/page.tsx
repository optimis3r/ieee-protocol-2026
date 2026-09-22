'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { Store, initStore, getAgentActiveSeconds, formatActiveTime } from '@/lib/store';
import { Agent, GameState, ROLE_DETAILS, PrimaryDomain } from '@/types/database';
import { soundEffects } from '@/lib/audio';

export default function MyBadgePage() {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [gameState, setGameState] = useState<GameState>(() => Store.getGameState());
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeSeconds, setActiveSeconds] = useState<number>(0);

  const refreshState = useCallback((agentId: string) => {
    const current = Store.getAgentById(agentId);
    if (!current) return;
    setAgent(current);
    setActiveSeconds(getAgentActiveSeconds(current));
    setGameState(Store.getGameState());
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

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://network.ieee';
    const qrPayload = `${origin}/play?agent_id=${current.agent_id}&token=${current.token}`;

    QRCode.toDataURL(qrPayload, {
      width: 260,
      margin: 1,
      color: {
        dark: '#141514',
        light: '#f4f1ea',
      },
    }).then(setQrDataUrl).catch(console.error);

    let isCancelled = false;
    let prevCheckInStatus = current.check_in_status;

    const pollLiveStatus = async () => {
      try {
        const { agent: serverAg, gameState: serverState } = await Store.syncAgentWithServer(current.agent_id);
        if (isCancelled || !serverAg) return;

        setAgent({ ...serverAg });
        if (serverState) {
          setGameState(serverState);
        }
        setActiveSeconds(getAgentActiveSeconds(serverAg));

        const isLiveActive = (serverState?.status || Store.getGameState().status) === 'NETWORK_ACTIVE';

        if (serverAg.check_in_status === 'ACTIVE' && prevCheckInStatus !== 'ACTIVE') {
          prevCheckInStatus = 'ACTIVE';
          soundEffects.playSuccessChime();
          if (isLiveActive) {
            setTimeout(() => {
              if (!isCancelled) {
                router.push('/play');
              }
            }, 600);
          }
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
      setGameState(Store.getGameState());
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
      <div className="min-h-screen bg-[#141514] flex items-center justify-center p-4">
        <div className="w-5 h-5 border border-[#f4f1ea] border-t-transparent animate-spin" />
      </div>
    );
  }

  const roleMeta = ROLE_DETAILS[(agent.archetype as PrimaryDomain) || 'LOGIC'];
  const isActive = agent.check_in_status === 'ACTIVE';
  const isPaused = agent.check_in_status === 'PAUSED';

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
          PASS ID: {agent.agent_id}
        </div>
      </header>

      {/* Asymmetric Document Body */}
      <main className="max-w-xl w-full mx-auto my-auto py-4 space-y-5">
        
        {/* Editorial Heading Section */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-serif-editorial tracking-tight text-[#f4f1ea]">
            Operative Credential Pass
          </h1>
          <p className="text-xs text-[#949e93] font-display-grotesk leading-relaxed">
            Present this QR pass at the desk to complete verification or scan into workstations.
          </p>
        </div>

        {/* Asymmetric Pass Layout (Two Columns on Desktop, Stacked on Mobile) */}
        <div className="border border-[#2d312c] bg-[#1b1d1b] p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
          
          {/* Column A: Tabular Identity Ledger */}
          <div className="space-y-3 font-display-grotesk text-xs order-2 sm:order-1">
            <div className="rule-hairline pb-2">
              <span className="text-[10px] uppercase text-[#949e93] block font-mono-tabular">CALL SIGN</span>
              <span className="text-xl font-bold font-mono-tabular text-[#f4f1ea] tracking-tight">{agent.agent_id}</span>
            </div>

            <div className="rule-hairline pb-2">
              <span className="text-[10px] uppercase text-[#949e93] block font-mono-tabular">NAME & ROLL NO</span>
              <span className="font-semibold text-[#f4f1ea] block truncate">{agent.name}</span>
              <span className="text-[11px] text-[#949e93] font-mono-tabular block">{agent.auth_identifier || 'Unspecified'}</span>
            </div>

            <div className="rule-hairline pb-2">
              <span className="text-[10px] uppercase text-[#949e93] block font-mono-tabular">TACTICAL CELL</span>
              <span className="font-semibold text-[#f4f1ea]">{roleMeta.title}</span>
              <span className="text-[11px] text-[#949e93] block font-serif-editorial italic">{roleMeta.subtitle}</span>
            </div>

            <div className="rule-hairline pb-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-[#949e93] block font-mono-tabular">WRISTBAND</span>
                <span className="font-mono-tabular font-bold text-[#c28b28]">{agent.wristband_id || agent.agent_id}</span>
              </div>
              
              {/* Authentic Status Stamp */}
              <div>
                {isActive ? (
                  <span className="editorial-stamp text-[#2d9f5d] border-[#2d9f5d]">
                    ACTIVE // {formatActiveTime(activeSeconds)}
                  </span>
                ) : isPaused ? (
                  <span className="editorial-stamp text-[#c28b28] border-[#c28b28]">
                    CHECKED OUT (PAUSED)
                  </span>
                ) : (
                  <span className="editorial-stamp text-[#c93b2b] border-[#c93b2b]">
                    AWAITING CHECK-IN
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Column B: High-Contrast QR Code */}
          <div className="flex flex-col items-center justify-center order-1 sm:order-2">
            <div className="p-2.5 bg-[#f4f1ea] border border-[#2d312c]">
              {qrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={qrDataUrl}
                  alt="Operative Authentication Pass"
                  className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center bg-[#f4f1ea]">
                  <div className="w-5 h-5 border border-[#141514] border-t-transparent animate-spin" />
                </div>
              )}
            </div>
            <div className="text-[9px] uppercase tracking-wider text-[#949e93] font-mono-tabular mt-2 text-center">
              SCAN IDENTIFIER // LIVE TOKEN
            </div>
          </div>

        </div>

        {/* Primary Action Button */}
        <div>
          {gameState.status !== 'NETWORK_ACTIVE' ? (
            isActive ? (
              <div className="space-y-2">
                <div className="p-3 border border-[#2d9f5d]/40 bg-[#15241b] text-center rounded-sm">
                  <span className="text-xs font-bold text-[#2d9f5d] font-mono-tabular block">
                    ✓ DESK VERIFICATION COMPLETE • PASS ACTIVE
                  </span>
                  <span className="text-[11px] text-[#949e93] font-display-grotesk block mt-0.5">
                    Terminal access unlocks as soon as operations desk activates the network.
                  </span>
                </div>
                <Link
                  href="/standby"
                  className="w-full py-3 px-4 btn-editorial-outline text-xs block text-center uppercase tracking-wider font-bold"
                >
                  Event in Standby • View Launch Countdown →
                </Link>
              </div>
            ) : (
              <Link
                href="/standby"
                className="w-full py-3 px-4 btn-editorial-outline text-xs block text-center uppercase tracking-wider font-bold"
              >
                Event in Standby • View Launch Countdown →
              </Link>
            )
          ) : isActive ? (
            <Link
              href="/play"
              className="w-full py-3 px-4 btn-editorial-primary text-xs block text-center tracking-wider font-bold"
            >
              Enter Mission Terminal →
            </Link>
          ) : isPaused ? (
            <Link
              href="/play"
              className="w-full py-3 px-4 btn-editorial-outline text-xs block text-center uppercase tracking-wider font-bold"
            >
              View Terminal Progress (Timer Paused) →
            </Link>
          ) : (
            <div className="text-xs text-[#949e93] text-center font-display-grotesk rule-hairline pb-2">
              Present this pass to operations staff at the venue desk to receive clearance.
            </div>
          )}
        </div>

        {/* Subordinate Links */}
        <div className="flex items-center justify-between text-xs text-[#949e93] font-display-grotesk pt-1">
          <Link href="/leaderboard" className="hover:text-[#f4f1ea] underline underline-offset-4">
            Public Leaderboard
          </Link>
          <button
            onClick={handleLogout}
            className="text-[#c93b2b] hover:underline underline-offset-4 cursor-pointer"
          >
            Sign Out
          </button>
        </div>

      </main>

      {/* Editorial Footer */}
      <footer className="max-w-xl w-full mx-auto rule-hairline pt-2 flex items-center justify-between text-[10px] text-[#949e93] font-mono-tabular">
        <span>NIT WARANGAL • DEPT OF ECE</span>
        <span>AUTONOMOUS TELEMETRY ACTIVE</span>
      </footer>
    </div>
  );
}
