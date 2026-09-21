'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, initStore } from '@/lib/store';
import { Agent } from '@/types/database';
import { 
  ArrowRight,
  QrCode,
  UserPlus,
  LogIn,
  CheckCircle2,
  Clock,
  Trophy,
  ShieldAlert
} from 'lucide-react';

export default function HomePage() {
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [sessionStatus, setSessionStatus] = useState<{ canPlay: boolean; status: string; activeSeconds: number }>({
    canPlay: false,
    status: 'AWAITING_CHECKIN',
    activeSeconds: 0
  });

  useEffect(() => {
    initStore();
    const storedId = localStorage.getItem('ieee_agent_id');
    if (storedId) {
      const ag = Store.getAgentById(storedId);
      if (ag) {
        setTimeout(() => {
          setCurrentAgent(ag);
          setSessionStatus(Store.checkSessionStatus(ag.agent_id));
        }, 0);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#141514] text-[#f4f1ea] flex flex-col justify-between selection:bg-[#c93b2b] selection:text-[#f4f1ea]">
      {/* Editorial Masthead */}
      <header className="w-full border-b border-[#2d312c] px-4 sm:px-8 py-3.5 bg-[#141514]">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-mono-tabular text-[10px] text-[#949e93] uppercase tracking-widest">
              NIT WARANGAL • DEPT OF ECE // IEEE STUDENT BRANCH
            </div>
            <div className="text-xs font-semibold tracking-wider text-[#f4f1ea] uppercase">
              THE PROTOCOL 2026 — FIELD OPERATIONS
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <Link
              href="/leaderboard"
              className="px-3 py-1.5 rounded-sm border border-[#3f453f] hover:border-[#c28b28] text-[#c28b28] hover:text-[#f4f1ea] transition-colors flex items-center gap-1.5 font-mono-tabular text-[11px]"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>STANDINGS</span>
            </Link>
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-sm border border-[#3f453f] hover:border-[#949e93] text-[#949e93] hover:text-[#f4f1ea] transition-colors flex items-center gap-1.5 font-mono-tabular text-[11px]"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#c93b2b]" />
              <span className="hidden sm:inline">DESK ADMIN</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Editorial Body */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-8 py-10 sm:py-14 flex-1">
        {/* Asymmetric 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-start">
          
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <span className="font-mono-tabular text-[11px] text-[#c93b2b] uppercase tracking-wider block">
                [EXHIBIT 2026.09 // LIVE RECONNAISSANCE]
              </span>
              <h1 className="font-serif-editorial text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.08] tracking-tight text-[#f4f1ea]">
                The campus is an encoded circuit.
              </h1>
            </div>

            <p className="font-display-grotesk text-sm sm:text-base text-[#949e93] leading-relaxed max-w-xl">
              Every operative is assigned an asymmetric role across campus monoliths. Register on your phone, present your QR pass at the operations desk for your wristband, and solve the network before the 8:00 PM cutoff.
            </p>

            {/* Role Domains Ledger (Clean Editorial List) */}
            <div className="pt-4 border-t border-[#2d312c] space-y-3">
              <span className="font-mono-tabular text-[10px] uppercase tracking-widest text-[#949e93] block">
                OPERATIVE DOMAINS // 05 DISCIPLINES
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-display-grotesk">
                <div className="p-2.5 border border-[#2d312c] bg-[#1b1d1b]">
                  <span className="font-mono-tabular text-[10px] text-[#3a8ebd] font-bold block">01 / LOGIC</span>
                  <span className="text-[#f4f1ea] font-medium text-[11px]">Cryptographic ciphers & stream tokens</span>
                </div>
                <div className="p-2.5 border border-[#2d312c] bg-[#1b1d1b]">
                  <span className="font-mono-tabular text-[10px] text-[#2d9f5d] font-bold block">02 / SIGNAL</span>
                  <span className="text-[#f4f1ea] font-medium text-[11px]">Physical station nodes & RF triangulation</span>
                </div>
                <div className="p-2.5 border border-[#2d312c] bg-[#1b1d1b]">
                  <span className="font-mono-tabular text-[10px] text-[#9368b7] font-bold block">03 / OBSERVATION</span>
                  <span className="text-[#f4f1ea] font-medium text-[11px]">Reconnaissance & sector anomaly tracking</span>
                </div>
                <div className="p-2.5 border border-[#2d312c] bg-[#1b1d1b]">
                  <span className="font-mono-tabular text-[10px] text-[#d96b27] font-bold block">04 / SYSTEM</span>
                  <span className="text-[#f4f1ea] font-medium text-[11px]">Campus host architecture & daemon logic</span>
                </div>
                <div className="p-2.5 border border-[#2d312c] bg-[#1b1d1b] sm:col-span-2">
                  <span className="font-mono-tabular text-[10px] text-[#2fa596] font-bold block">05 / SOCIAL</span>
                  <span className="text-[#f4f1ea] font-medium text-[11px]">Dual-agent handshakes & cross-domain synthesis</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Operative Action Dossier */}
          <div className="lg:col-span-5 space-y-6">
            {currentAgent ? (
              /* Authenticated Operative Status Sheet */
              <div className="border border-[#3f453f] bg-[#1b1d1b] p-5 sm:p-6 space-y-5">
                <div className="flex items-start justify-between gap-3 border-b border-[#2d312c] pb-3">
                  <div>
                    <span className="font-mono-tabular text-[10px] text-[#949e93] uppercase block">
                      ASSIGNED OPERATIVE
                    </span>
                    <span className="font-serif-editorial text-2xl text-[#f4f1ea]">
                      {currentAgent.name}
                    </span>
                    <div className="font-mono-tabular text-xs text-[#c28b28] mt-0.5">
                      {currentAgent.agent_number || currentAgent.agent_id}{currentAgent.auth_identifier ? ` • ${currentAgent.auth_identifier}` : ''}
                    </div>
                  </div>

                  <span className={`editorial-stamp ${
                    sessionStatus.canPlay
                      ? 'border-[#2d9f5d] text-[#2d9f5d]'
                      : 'border-[#c28b28] text-[#c28b28]'
                  }`}>
                    {sessionStatus.canPlay ? 'ACTIVE' : 'STANDBY'}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-display-grotesk text-[#949e93]">
                  <div className="flex justify-between py-1 border-b border-[#2d312c]">
                    <span>Clearance Score</span>
                    <span className="font-mono-tabular text-[#f4f1ea] font-bold">{currentAgent.score || 0} PTS</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#2d312c]">
                    <span>Wristband / Band ID</span>
                    <span className="font-mono-tabular text-[#f4f1ea]">{currentAgent.wristband_id || 'UNLINKED'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#2d312c]">
                    <span>Desk Check-in</span>
                    <span className="font-mono-tabular text-[#f4f1ea]">
                      {sessionStatus.canPlay ? 'VERIFIED' : 'PENDING GATE SCAN'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  {!Store.isEventActive() ? (
                    <Link
                      href="/standby"
                      className="btn-editorial-primary w-full py-3 px-4 text-xs font-bold uppercase flex items-center justify-center gap-2 text-center"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Standby Holding Page</span>
                    </Link>
                  ) : sessionStatus.canPlay ? (
                    <Link
                      href="/play"
                      className="btn-editorial-primary w-full py-3 px-4 text-xs font-bold uppercase flex items-center justify-center gap-2 text-center"
                    >
                      <span>Enter Mission Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <Link
                      href="/my-badge"
                      className="btn-editorial-primary w-full py-3 px-4 text-xs font-bold uppercase flex items-center justify-center gap-2 text-center"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Present Pass at Desk</span>
                    </Link>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/my-badge"
                      className="btn-editorial-outline py-2.5 px-3 text-xs uppercase flex items-center justify-center gap-1.5 text-center font-mono-tabular"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#c28b28]" />
                      <span>QR Pass</span>
                    </Link>

                    <Link
                      href="/login"
                      className="btn-editorial-outline py-2.5 px-3 text-xs uppercase flex items-center justify-center text-center font-mono-tabular"
                    >
                      <span>Switch</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* Enlistment / Login Callout */
              <div className="border border-[#3f453f] bg-[#1b1d1b] p-5 sm:p-6 space-y-5">
                <div className="space-y-1 border-b border-[#2d312c] pb-3">
                  <span className="font-mono-tabular text-[10px] text-[#c93b2b] uppercase tracking-wider block">
                    [ENLISTMENT DOCKET]
                  </span>
                  <h2 className="font-serif-editorial text-2xl text-[#f4f1ea]">
                    Join the Investigation
                  </h2>
                  <p className="font-display-grotesk text-xs text-[#949e93]">
                    Registration is open to all NITW students. Bring your phone to the event desk to scan in.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <Link
                    href="/register"
                    className="btn-editorial-primary w-full py-3 px-4 text-xs font-bold uppercase flex items-center justify-center gap-2 text-center"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register as Operative</span>
                  </Link>

                  <Link
                    href="/login"
                    className="btn-editorial-outline w-full py-2.5 px-4 text-xs uppercase flex items-center justify-center gap-2 text-center font-mono-tabular"
                  >
                    <LogIn className="w-4 h-4 text-[#c28b28]" />
                    <span>Retrieve Pass (Roll Number)</span>
                  </Link>
                </div>

                <div className="pt-2 text-[11px] text-[#949e93] font-display-grotesk border-t border-[#2d312c]">
                  Your pass is linked directly to your roll number. No passwords required.
                </div>
              </div>
            )}

            {/* Event Dispatch Information */}
            <div className="border border-[#2d312c] p-4 text-xs font-mono-tabular space-y-2 bg-[#141514]">
              <div className="text-[10px] text-[#949e93] uppercase tracking-widest">
                DISPATCH PARAMETERS
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#949e93] block">DATE</span>
                  <span className="text-[#f4f1ea] font-bold">24 September 2026</span>
                </div>
                <div>
                  <span className="text-[#949e93] block">LOCATION</span>
                  <span className="text-[#f4f1ea] font-bold">Dept of ECE, NITW</span>
                </div>
                <div>
                  <span className="text-[#949e93] block">SUBMISSION CUTOFF</span>
                  <span className="text-[#c93b2b] font-bold">20:00 HRS SHARP</span>
                </div>
                <div>
                  <span className="text-[#949e93] block">CLEARANCE AWARD</span>
                  <span className="text-[#c28b28] font-bold">Claude Pro 1-Yr</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Understated Editorial Colophon */}
      <footer className="w-full border-t border-[#2d312c] px-4 sm:px-8 py-4 text-xs text-[#949e93] bg-[#141514]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono-tabular text-[11px]">
          <div>
            NIT WARANGAL • IEEE STUDENT BRANCH © 2026
          </div>
          <div className="flex items-center gap-4">
            <Link href="/leaderboard" className="hover:text-[#f4f1ea] transition-colors">
              Standings
            </Link>
            <Link href="/my-badge" className="hover:text-[#f4f1ea] transition-colors">
              Pass Retrieval
            </Link>
            <Link href="/admin" className="hover:text-[#f4f1ea] transition-colors">
              Operations Desk
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
