'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, initStore } from '@/lib/store';
import { Agent, ROLE_DETAILS, PrimaryDomain } from '@/types/database';
import { soundEffects } from '@/lib/audio';
import { 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  MessageSquare, 
  LogOut, 
  Sparkles, 
  QrCode, 
  Smartphone 
} from 'lucide-react';

// Target launch date: September 24, 2026 at 09:00:00 AM IST
const TARGET_LAUNCH_DATE = new Date('2026-09-24T09:00:00+05:30').getTime();

export default function StandbyWaitingPage() {
  const router = useRouter();
  const [agent] = useState<Agent | null>(() => {
    if (typeof window === 'undefined') return null;
    initStore();
    const storedId = localStorage.getItem('ieee_agent_id');
    return storedId ? Store.getAgentById(storedId) : null;
  });
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>(() => {
    const now = Date.now();
    const diff = Math.max(0, TARGET_LAUNCH_DATE - now);
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
  });
  const [isLiveLaunching, setIsLiveLaunching] = useState(false);
  const [waGroupLink] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return Store.getWhatsAppConfig().groupLink;
  });

  // Calculate remaining time
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
    const timer = setInterval(updateCountdown, 1000);

    // Real-Time Event State Checker
    // If the admin opens the event (status === 'NETWORK_ACTIVE'), automatically launch into HUD
    const checkStatus = () => {
      const state = Store.getGameState();
      if (state.status === 'NETWORK_ACTIVE') {
        setIsLiveLaunching(true);
        soundEffects.playSuccessChime();
        setTimeout(() => {
          router.push('/play');
        }, 1800);
      }
    };

    checkStatus();
    const pollInterval = setInterval(checkStatus, 2500);

    const handleUpdate = () => checkStatus();
    window.addEventListener('ieee_store_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
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
    <div className="min-h-screen bg-[#070b09] text-[#eaf2ec] flex flex-col justify-between p-4 sm:p-6 font-mono-cyber selection:bg-proto-gold selection:text-[#070b09]">
      {/* Top Navbar */}
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between pt-4 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#111914] border border-[#202f26] flex items-center justify-center text-proto-signal font-black text-xs">
            NW
          </div>
          <div>
            <div className="font-bold text-xs text-[#f3f7f4] tracking-wider">NIT WARANGAL</div>
            <div className="text-[10px] text-[#7d9787] uppercase tracking-wider">IEEE The Protocol 2026</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-proto-gold/15 border border-proto-gold/40 text-proto-gold font-bold text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-proto-gold animate-ping" />
            <span>STANDBY MODE</span>
          </span>

          <Link
            href="/admin"
            className="px-2.5 py-1 rounded-lg bg-[#111914] border border-[#202f26] text-[#7d9787] hover:text-[#eaf2ec] text-[11px] flex items-center gap-1 transition-colors"
            title="Operations Desk"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#ff7700]" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </div>
      </header>

      {/* Main Holding Container */}
      <main className="max-w-2xl w-full mx-auto my-auto py-8 space-y-6">
        
        {/* Live Launch Banner if Admin triggered ACTIVE */}
        {isLiveLaunching && (
          <div className="p-4 rounded-2xl bg-proto-signal text-[#070b09] shadow-2xl font-black text-center space-y-1 animate-in zoom-in duration-300">
            <div className="flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>SYSTEM ACTIVATED BY OPERATIONS DESK!</span>
            </div>
            <p className="text-xs font-mono font-bold">
              Access granted. Launching into your Operative Terminal now...
            </p>
          </div>
        )}

        {/* Central Standby Card */}
        <div className="bg-[#0e1612] border-2 border-[#203025] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
          
          {/* Subtle Cyber Grid Background Accent */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2e240a_1px,transparent_1px),linear-gradient(to_bottom,#1f2e240a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Central Beacon Icon */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-proto-gold/15 border-2 border-proto-gold/40 flex items-center justify-center text-proto-gold shadow-lg shadow-proto-gold/10 animate-pulse">
              <Clock className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-2 relative">
            <h1 className="text-2xl sm:text-3xl font-black text-[#f3f7f4] tracking-tight uppercase">
              THE EVENT HAS NOT STARTED YET
            </h1>
            <p className="text-sm font-bold text-proto-gold uppercase tracking-wider">
              OFFICIAL LAUNCH: SEPTEMBER 24TH, 2026
            </p>
            <p className="text-xs text-[#8ea897] font-sans max-w-md mx-auto">
              Decryption terminals, station circuits, and questions are currently locked. 
              The network will be unlocked synchronously by the Operations team on launch day.
            </p>
          </div>

          {/* Live Countdown Timer */}
          <div className="relative bg-[#070b09] border border-[#1b2a20] rounded-2xl p-4 sm:p-5 shadow-inner">
            <div className="text-[10px] text-[#7d9787] uppercase tracking-widest font-mono mb-3">
              COUNTDOWN TO PROTOCOL INITIALIZATION
            </div>
            <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
              <div className="bg-[#121c15] border border-[#203226] rounded-xl p-2.5">
                <div className="text-2xl sm:text-3xl font-black text-proto-gold font-mono">
                  {String(timeLeft.days).padStart(2, '0')}
                </div>
                <div className="text-[9px] text-[#7d9787] uppercase font-mono mt-0.5">Days</div>
              </div>

              <div className="bg-[#121c15] border border-[#203226] rounded-xl p-2.5">
                <div className="text-2xl sm:text-3xl font-black text-proto-gold font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-[9px] text-[#7d9787] uppercase font-mono mt-0.5">Hours</div>
              </div>

              <div className="bg-[#121c15] border border-[#203226] rounded-xl p-2.5">
                <div className="text-2xl sm:text-3xl font-black text-proto-gold font-mono">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-[9px] text-[#7d9787] uppercase font-mono mt-0.5">Mins</div>
              </div>

              <div className="bg-[#121c15] border border-[#203226] rounded-xl p-2.5">
                <div className="text-2xl sm:text-3xl font-black text-proto-gold font-mono">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-[9px] text-[#7d9787] uppercase font-mono mt-0.5">Secs</div>
              </div>
            </div>
          </div>

          {/* Operative Registration Status Card */}
          {agent ? (
            <div className="relative bg-[#121b16] border border-[#203025] rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-[#203025] pb-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-proto-signal" />
                  <span className="text-xs font-bold text-proto-text uppercase">
                    REGISTRATION VERIFIED & ENROLLED
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-proto-signal/15 text-proto-signal border border-proto-signal/30 font-bold">
                  {agent.agent_id}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-proto-subtext block uppercase font-mono">OPERATIVE NAME</span>
                  <span className="font-bold text-proto-text truncate block mt-0.5">{agent.name}</span>
                </div>

                <div>
                  <span className="text-[10px] text-proto-subtext block uppercase font-mono">ASSIGNED DOMAIN</span>
                  <span 
                    className="font-bold truncate block mt-0.5"
                    style={{ color: roleMeta.color }}
                  >
                    {roleMeta.title}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-proto-subtext block uppercase font-mono">REGISTERED PHONE</span>
                  <span className="font-mono text-proto-text block mt-0.5">{agent.contact || 'N/A'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative bg-[#121b16] border border-[#203025] rounded-2xl p-4 text-xs text-proto-subtext">
              <span>Have you registered for the event? </span>
              <Link href="/register" className="text-proto-signal font-bold hover:underline">
                Complete your enrollment here →
              </Link>
            </div>
          )}

          {/* WhatsApp Transmission Confirmation Card */}
          <div className="relative bg-proto-surface0/60 border border-proto-surface1 rounded-2xl p-4 text-left space-y-2.5">
            <div className="flex items-center gap-2 text-proto-signal text-xs font-bold uppercase">
              <Smartphone className="w-4 h-4" />
              <span>CHECK YOUR WHATSAPP FOR YOUR PASS & GROUP LINK</span>
            </div>
            
            <p className="text-xs text-proto-subtext leading-relaxed font-sans">
              We have automatically dispatched two key transmissions directly to your WhatsApp:
            </p>

            <ul className="text-xs space-y-1.5 text-proto-text font-mono pl-1">
              <li className="flex items-start gap-2">
                <span className="text-proto-signal font-bold">1.</span>
                <span><strong>Official WhatsApp Group Link</strong> — for station decrypt hints, coordinates, and live broadcasts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-proto-signal font-bold">2.</span>
                <span><strong>Personal Operative QR Pass Card</strong> — keep this image ready on your phone for scanning into physical workstations.</span>
              </li>
            </ul>

            {waGroupLink && (
              <div className="pt-2">
                <a
                  href={waGroupLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-proto-signal/20 hover:bg-proto-signal/30 text-proto-signal border border-proto-signal/40 text-xs font-bold transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open WhatsApp Group Link Directly →</span>
                </a>
              </div>
            )}
          </div>

          {/* Navigation & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Link
                href="/my-badge"
                className="px-3.5 py-2 rounded-xl bg-proto-surface0 hover:bg-proto-surface1 text-proto-text border border-proto-surface1 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <QrCode className="w-3.5 h-3.5 text-proto-gold" />
                <span>View My Pass Card</span>
              </Link>
            </div>

            {agent && (
              <button
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl text-proto-subtext hover:text-proto-text text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-3xl w-full mx-auto text-center py-4 text-[11px] text-[#55695c] border-t border-[#16201a]">
        <div>NIT Warangal • IEEE Student Branch • The Protocol Event Portal</div>
        <div className="text-[10px] text-[#3d4c42] mt-0.5">Automated dispatch active // Live sync enabled</div>
      </footer>
    </div>
  );
}
