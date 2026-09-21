'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, initStore } from '@/lib/store';
import { Agent, ROLE_DETAILS, PrimaryDomain } from '@/types/database';
import { soundEffects } from '@/lib/audio';
import { 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  LogOut, 
  QrCode, 
  Radio,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

// Target launch date: September 24, 2026 at 09:00:00 AM IST
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

    // Network-aware status polling
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
          }, 1200);
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
    <div className="min-h-screen bg-[#0c0e0d] text-[#f1ede4] flex flex-col justify-between p-3 sm:p-5 tactile-grain select-none">
      {/* Tactical Top Identifier */}
      <header className="max-w-sm w-full mx-auto flex items-center justify-between text-[11px] text-[#8f9e91] border-b border-[#28302b] pb-2">
        <div className="flex items-center gap-1.5 font-bold tracking-wider text-[#f1ede4]">
          <span>NITW</span>
          <span className="text-[#8f9e91]">/</span>
          <span>IEEE THE PROTOCOL</span>
        </div>
        <div className="stamp-box stamp-standby text-[9px] py-0.5 px-1.5">
          <span>HOLDING</span>
        </div>
      </header>

      {/* Main Single-Screen Holding Container */}
      <main className="max-w-sm w-full mx-auto my-auto py-2 space-y-3">
        
        {/* Live Launch Banner when Admin triggers ACTIVE */}
        {isLiveLaunching && (
          <div className="p-3.5 bg-[#22c55e] text-[#0c0e0d] font-black text-center space-y-0.5 border-2 border-[#16a34a] rounded-sm">
            <div className="text-xs uppercase tracking-widest">
              SYSTEM INITIALIZED // LAUNCHING
            </div>
            <div className="text-[10px] font-mono">
              Opening operative HUD terminal now...
            </div>
          </div>
        )}

        {/* Central Tactical Standby Card */}
        <div className="bg-[#121513] border-2 border-[#28302b] rounded-sm p-4 sm:p-5 shadow-2xl space-y-4 text-center relative">
          
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-widest text-[#eab308] font-bold">
              [SYSTEM STATUS // PRE-COMMENCEMENT]
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#f1ede4] tracking-tight uppercase leading-snug">
              PLEASE STANDBY FOR THE GAME TO BEGIN
            </h1>
            <div className="text-[10px] text-[#8f9e91] font-mono">
              COMMENCEMENT: SEPTEMBER 24TH, 2026 // 09:00 IST
            </div>
          </div>

          {/* Mechanical Countdown Clock */}
          <div className="bg-[#0c0e0d] border border-[#28302b] rounded-sm p-3 shadow-inner">
            <div className="text-[9px] text-[#8f9e91] uppercase tracking-widest font-mono mb-2">
              COUNTDOWN TO PROTOCOL UNLOCK
            </div>
            <div className="grid grid-cols-4 gap-1 text-center font-mono">
              <div className="bg-[#171b18] border border-[#28302b] p-1.5 rounded-sm">
                <div className="text-xl font-black text-[#eab308]">
                  {String(timeLeft.days).padStart(2, '0')}
                </div>
                <div className="text-[8px] text-[#8f9e91] uppercase">Days</div>
              </div>
              <div className="bg-[#171b18] border border-[#28302b] p-1.5 rounded-sm">
                <div className="text-xl font-black text-[#eab308]">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-[8px] text-[#8f9e91] uppercase">Hours</div>
              </div>
              <div className="bg-[#171b18] border border-[#28302b] p-1.5 rounded-sm">
                <div className="text-xl font-black text-[#eab308]">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-[8px] text-[#8f9e91] uppercase">Mins</div>
              </div>
              <div className="bg-[#171b18] border border-[#28302b] p-1.5 rounded-sm">
                <div className="text-xl font-black text-[#eab308]">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-[8px] text-[#8f9e91] uppercase">Secs</div>
              </div>
            </div>
          </div>

          {/* Operative Registration Status Strip */}
          {agent ? (
            <div className="bg-[#171b18] border border-[#28302b] rounded-sm p-2.5 text-left text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-[#8f9e91] uppercase font-mono">ENROLLED OPERATIVE</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-sm bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 font-bold">
                  {agent.agent_id}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#f1ede4] font-bold text-xs pt-0.5">
                <span className="truncate max-w-[150px]">{agent.name}</span>
                <span 
                  className="text-[10px] uppercase font-bold"
                  style={{ color: roleMeta.color || '#38bdf8' }}
                >
                  [{roleMeta.title}]
                </span>
              </div>
              <div className="text-[9px] text-[#8f9e91] font-mono pt-0.5 flex items-center justify-between border-t border-[#28302b]">
                <span>BAND: <strong className="text-[#eab308]">{agent.wristband_id || agent.agent_id}</strong></span>
                <span className="text-[#8f9e91]">Circuits Locked</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#171b18] border border-[#28302b] rounded-sm p-2.5 text-xs text-[#8f9e91]">
              <span>Unregistered operative? </span>
              <Link href="/register" className="text-[#22c55e] font-bold underline underline-offset-2">
                Register here →
              </Link>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <Link
              href="/my-badge"
              className="w-full py-2.5 px-3 rounded-sm btn-tactile-dark text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-[#eab308]" />
              <span>SHOW OPERATIVE QR PASS</span>
            </Link>

            {waGroupLink && (
              <a
                href={waGroupLink}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 rounded-sm bg-[#171b18] hover:bg-[#1e2320] border border-[#28302b] text-[11px] text-[#22c55e] flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                <span>OFFICIAL WHATSAPP INTEL GROUP →</span>
              </a>
            )}
          </div>

        </div>

        {/* Tactical Footer Strip */}
        {agent && (
          <div className="flex items-center justify-between text-[10px] text-[#8f9e91] px-1">
            <span className="font-mono text-[9px] text-[#48544c]">AUTO-SYNC ACTIVE (2S)</span>
            <button
              onClick={handleLogout}
              className="text-[#dc2626] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </main>

      {/* Minimal Bottom Stamp */}
      <footer className="max-w-sm w-full mx-auto text-center text-[9px] text-[#48544c] uppercase tracking-widest pt-1">
        NIT WARANGAL • IEEE THE PROTOCOL • LIVE TELEMETRY
      </footer>
    </div>
  );
}
