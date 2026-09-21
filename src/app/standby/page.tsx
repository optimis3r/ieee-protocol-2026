'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, initStore } from '@/lib/store';
import { Agent, ROLE_DETAILS, PrimaryDomain } from '@/types/database';
import { soundEffects } from '@/lib/audio';

const TARGET_LAUNCH_DATE = new Date('2026-09-24T09:00:00+05:30').getTime();

export default function StandbyWaitingPage() {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isLiveLaunching, setIsLiveLaunching] = useState(false);
  const [waGroupLink, setWaGroupLink] = useState<string>('');

  const updateCountdown = useCallback(() => {
    const now = Date.now();
    const diff = Math.max(0, TARGET_LAUNCH_DATE - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeLeft({ days, hours, minutes, seconds });
  }, []);

  useEffect(() => {
    initStore();
    updateCountdown();

    const storedId = localStorage.getItem('ieee_agent_id');
    if (storedId) {
      const localAg = Store.getAgentById(storedId);
      if (localAg) setAgent(localAg);
    }
    setWaGroupLink(Store.getWhatsAppConfig().groupLink || '');

    const timer = setInterval(updateCountdown, 1000);

    let isCancelled = false;
    const pollServerStatus = async () => {
      const activeId = localStorage.getItem('ieee_agent_id');
      try {
        const result = await Store.syncAgentWithServer(activeId || undefined);
        if (isCancelled) return;

        if (result.agent) {
          setAgent(result.agent);
        }

        if (result.gameState?.status === 'NETWORK_ACTIVE') {
          setIsLiveLaunching(true);
          soundEffects.playSuccessChime();
          setTimeout(() => {
            if (!isCancelled) {
              router.push('/play');
            }
          }, 1000);
        }
      } catch {
        const localState = Store.getGameState();
        if (localState.status === 'NETWORK_ACTIVE' && !isCancelled) {
          setIsLiveLaunching(true);
          router.push('/play');
        }
      }
    };

    pollServerStatus();
    const pollInterval = setInterval(pollServerStatus, 2000);

    const handleUpdate = () => pollServerStatus();
    window.addEventListener('ieee_store_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      isCancelled = true;
      clearInterval(timer);
      clearInterval(pollInterval);
      window.removeEventListener('ieee_store_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [router, updateCountdown]);

  const handleLogout = () => {
    soundEffects.playScanChirp();
    localStorage.removeItem('ieee_agent_id');
    localStorage.removeItem('ieee_agent_token');
    router.push('/login');
  };

  const domain = (agent?.archetype || 'LOGIC') as PrimaryDomain;
  const roleMeta = ROLE_DETAILS[domain] || ROLE_DETAILS.LOGIC;

  return (
    <div className="min-h-screen bg-[#141514] text-[#f4f1ea] flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Top Editorial Masthead */}
      <header className="max-w-2xl w-full mx-auto rule-double pb-2.5 flex items-baseline justify-between text-xs text-[#949e93] font-mono-tabular">
        <div>
          <strong className="text-[#f4f1ea] font-display-grotesk tracking-tight">NIT WARANGAL IEEE</strong>
          <span className="mx-2">•</span>
          <span>COMMENCEMENT BULLETIN</span>
        </div>
        <div className="editorial-stamp text-[#c28b28] border-[#c28b28]">
          HOLDING STATE
        </div>
      </header>

      {/* Main Asymmetric Editorial Body */}
      <main className="max-w-2xl w-full mx-auto my-auto py-6 space-y-6">
        
        {/* Live Launch Banner */}
        {isLiveLaunching && (
          <div className="p-4 bg-[#c93b2b] text-[#f4f1ea] font-bold text-center border border-[#a82e20]">
            <div className="text-sm uppercase tracking-widest font-display-grotesk">
              NETWORK ACTIVATED // OPENING HUD TERMINAL
            </div>
          </div>
        )}

        {/* Editorial Headline & Statement */}
        <div className="space-y-2">
          <div className="text-[11px] text-[#c28b28] uppercase tracking-widest font-mono-tabular font-bold">
            SCHEDULED EVENT START: SEPT 24, 2026 // 09:00 IST
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-editorial tracking-tight text-[#f4f1ea] leading-tight">
            Please standby for the game to begin.
          </h1>
          <p className="text-sm text-[#949e93] font-display-grotesk max-w-lg leading-relaxed pt-1">
            Station circuits and challenge coordinates are locked until the Operations Desk initializes the network. This terminal will automatically transition to your active HUD upon launch.
          </p>
        </div>

        {/* Mechanical Countdown Display */}
        <div className="border border-[#2d312c] bg-[#1b1d1b] p-4 sm:p-5">
          <div className="text-[10px] uppercase text-[#949e93] font-mono-tabular tracking-wider rule-hairline pb-2 mb-3">
            OFFICIAL COMMENCEMENT COUNTDOWN
          </div>
          <div className="grid grid-cols-4 gap-2 text-center font-mono-tabular">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-[#f4f1ea] tracking-tight">
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className="text-[10px] uppercase text-[#949e93] mt-1">Days</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-[#f4f1ea] tracking-tight">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-[10px] uppercase text-[#949e93] mt-1">Hours</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-[#f4f1ea] tracking-tight">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] uppercase text-[#949e93] mt-1">Minutes</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-[#c28b28] tracking-tight">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-[10px] uppercase text-[#949e93] mt-1">Seconds</div>
            </div>
          </div>
        </div>

        {/* Two-Column Detail & Action Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start font-display-grotesk text-xs">
          
          {/* Left: Operative Enrollment Ledger */}
          <div className="border border-[#2d312c] bg-[#1b1d1b] p-4 space-y-2.5">
            <div className="rule-hairline pb-1.5 flex items-center justify-between">
              <span className="text-[10px] uppercase text-[#949e93] font-mono-tabular">ENROLLED OPERATIVE</span>
              {agent && (
                <span className="font-mono-tabular font-bold text-[#c28b28]">{agent.agent_id}</span>
              )}
            </div>

            {agent ? (
              <div className="space-y-1">
                <div className="font-bold text-[#f4f1ea] text-sm truncate">{agent.name}</div>
                <div className="text-[#949e93] font-serif-editorial italic">Cell: {roleMeta.title} ({roleMeta.subtitle})</div>
                <div className="text-[11px] text-[#949e93] font-mono-tabular pt-1">
                  Wristband ID: <strong className="text-[#f4f1ea]">{agent.wristband_id || agent.agent_id}</strong>
                </div>
              </div>
            ) : (
              <div className="text-[#949e93]">
                <span>No active enrollment on this device. </span>
                <Link href="/register" className="text-[#f4f1ea] underline underline-offset-4 font-bold">
                  Enlist here →
                </Link>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="space-y-2">
            <Link
              href="/my-badge"
              className="w-full py-3 px-4 btn-editorial-outline text-xs block text-center uppercase tracking-wider font-bold"
            >
              View My Personal QR Pass →
            </Link>

            {waGroupLink && (
              <a
                href={waGroupLink}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-[#1b1d1b] hover:bg-[#212421] border border-[#2d312c] text-xs text-[#949e93] hover:text-[#f4f1ea] block text-center transition-colors"
              >
                Official WhatsApp Channel →
              </a>
            )}
          </div>

        </div>

        {/* Subordinate Links */}
        <div className="flex items-center justify-between text-xs text-[#949e93] font-display-grotesk pt-2 rule-hairline pb-2">
          <span>Auto-sync active (2s interval)</span>
          {agent && (
            <button
              onClick={handleLogout}
              className="text-[#c93b2b] hover:underline underline-offset-4 cursor-pointer"
            >
              Sign Out
            </button>
          )}
        </div>

      </main>

      {/* Editorial Footer */}
      <footer className="max-w-2xl w-full mx-auto rule-hairline pt-2 flex items-center justify-between text-[10px] text-[#949e93] font-mono-tabular">
        <span>NIT WARANGAL • THE PROTOCOL 2026</span>
        <span>AUTONOMOUS DISPATCH SYSTEM</span>
      </footer>
    </div>
  );
}
