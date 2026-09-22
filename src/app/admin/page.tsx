'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KioskScanner } from '@/components/admin/KioskScanner';
import { TelemetryDashboard } from '@/components/admin/TelemetryDashboard';
import { PrintStation } from '@/components/admin/PrintStation';
import { StationManager } from '@/components/admin/StationManager';
import { initStore } from '@/lib/store';
import { 
  Camera, 
  BarChart3, 
  Printer, 
  MessageSquare, 
  ExternalLink,
  LogOut,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { soundEffects } from '@/lib/audio';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminAgentName, setAdminAgentName] = useState<string>('ieee-protocol-admin');
  const [activeTab, setActiveTab] = useState<'KIOSK' | 'TELEMETRY' | 'PRINT' | 'WHATSAPP' | 'STATIONS'>('TELEMETRY');

  useEffect(() => {
    initStore();
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const isAuth = sessionStorage.getItem('ieee_admin_auth') === 'true';
        const storedAgent = sessionStorage.getItem('ieee_admin_agent') || 'ieee-protocol-admin';
        
        if (!isAuth) {
          setIsAuthenticated(false);
          router.push('/admin/login');
        } else {
          setIsAuthenticated(true);
          setAdminAgentName(storedAgent);
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [router]);

  const handleLogout = () => {
    soundEffects.playScanChirp();
    sessionStorage.removeItem('ieee_admin_auth');
    sessionStorage.removeItem('ieee_admin_agent');
    sessionStorage.removeItem('ieee_admin_token');
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  // Loading or redirecting state
  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#070b09] text-[#eaf2ec] flex flex-col items-center justify-center p-4 font-mono-cyber">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-proto-signal border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#8ea897] tracking-widest uppercase animate-pulse">
            CHECKING OPERATOR CLEARANCE...
          </p>
          <p className="text-[11px] text-[#55695c]">
            Redirecting to <Link href="/admin/login" className="text-proto-signal underline">Personal Admin Login</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-proto-obsidian text-proto-text flex flex-col scanlines font-mono-cyber selection:bg-proto-signal selection:text-proto-obsidian">
      {/* Top Operations Header */}
      <header className="sticky top-0 z-30 bg-proto-base/95 backdrop-blur-md border-b border-proto-surface1">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-proto-surface0 border border-proto-signal/40 flex items-center justify-center text-proto-signal font-black text-xs shadow-inner">
              NITW
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-sm text-proto-text tracking-wider">
                  THE PROTOCOL // OPERATIONS DESK
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-proto-signal/20 text-proto-signal border border-proto-signal/40">
                  MASTER CONSOLE
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-proto-subtext mt-0.5">
                <span className="inline-flex items-center gap-1 text-proto-signal font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Agent: {adminAgentName}</span>
                </span>
                <span>•</span>
                <span>Full Tactical Controls Enabled</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation & Admin Session Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-proto-surface0 p-1 rounded-xl border border-proto-surface1">
              <button
                onClick={() => setActiveTab('TELEMETRY')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'TELEMETRY'
                    ? 'bg-proto-surface2 text-proto-logic shadow-sm'
                    : 'text-proto-subtext hover:text-proto-text'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>TELEMETRY & CONTROLS</span>
              </button>

              <button
                onClick={() => setActiveTab('WHATSAPP')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'WHATSAPP'
                    ? 'bg-proto-surface2 text-proto-signal shadow-sm'
                    : 'text-proto-subtext hover:text-proto-text'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>WHATSAPP HUB</span>
              </button>

              <button
                onClick={() => setActiveTab('KIOSK')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'KIOSK'
                    ? 'bg-proto-surface2 text-proto-signal shadow-sm'
                    : 'text-proto-subtext hover:text-proto-text'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>KIOSK CHECK-IN</span>
              </button>

              <button
                onClick={() => setActiveTab('PRINT')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'PRINT'
                    ? 'bg-proto-surface2 text-proto-gold shadow-sm'
                    : 'text-proto-subtext hover:text-proto-text'
                }`}
              >
                <Printer className="w-4 h-4" />
                <span>BADGE STATION</span>
              </button>

              <button
                onClick={() => setActiveTab('STATIONS')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'STATIONS'
                    ? 'bg-proto-surface2 text-proto-signal shadow-sm'
                    : 'text-proto-subtext hover:text-proto-text'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>CHALLENGE STATIONS</span>
              </button>
            </div>

            {/* Logout Admin Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-proto-crimson/15 border border-proto-crimson/40 text-proto-crimson hover:bg-proto-crimson hover:text-proto-obsidian font-bold text-xs transition-all cursor-pointer"
              title="Logout from Admin Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOGOUT</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'TELEMETRY' && <TelemetryDashboard defaultSection="CONTROLS" />}
        {activeTab === 'WHATSAPP' && <TelemetryDashboard defaultSection="WHATSAPP" />}
        {activeTab === 'KIOSK' && <KioskScanner />}
        {activeTab === 'PRINT' && <PrintStation />}
        {activeTab === 'STATIONS' && <StationManager />}
      </main>

      {/* Footer */}
      <footer className="w-full bg-proto-base border-t border-proto-surface1 px-4 py-3 text-center text-xs text-proto-subtext flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
        <span className="opacity-75">
          NIT WARANGAL IEEE STUDENT BRANCH // THE PROTOCOL CONSOLE
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/leaderboard"
            target="_blank"
            className="text-proto-gold hover:underline flex items-center gap-1"
          >
            Public Leaderboard <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/play"
            target="_blank"
            className="text-proto-logic hover:underline flex items-center gap-1"
          >
            Operative HUD <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
