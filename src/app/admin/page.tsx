'use client';

import React, { useState, useEffect } from 'react';
import { KioskScanner } from '@/components/admin/KioskScanner';
import { TelemetryDashboard } from '@/components/admin/TelemetryDashboard';
import { PrintStation } from '@/components/admin/PrintStation';
import { initStore } from '@/lib/store';
import { 
  ShieldCheck, 
  Camera, 
  BarChart3, 
  Printer, 
  Lock, 
  ExternalLink 
} from 'lucide-react';

const ADMIN_PASSCODE = 'ieee_ops_secure_2025';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'KIOSK' | 'TELEMETRY' | 'PRINT'>('KIOSK');

  useEffect(() => {
    initStore();
    const storedAuth = sessionStorage.getItem('ieee_admin_auth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim() === ADMIN_PASSCODE || passcodeInput.trim() === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('ieee_admin_auth', 'true');
      setAuthError(null);
    } else {
      setAuthError('INVALID SECURITY TOKEN: Access to Operations Console denied.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-proto-obsidian text-proto-text flex items-center justify-center p-4 scanlines font-mono-cyber">
        <div className="max-w-md w-full bg-proto-base border border-proto-surface1 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-proto-surface0 border border-proto-system/40 flex items-center justify-center mx-auto text-proto-system shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-proto-text">
              OPERATIONS DESK GATEWAY
            </h2>
            <p className="text-xs text-proto-subtext font-sans">
              NIT Warangal IEEE Student Branch • The Protocol Control Room.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-proto-crimson/15 border border-proto-crimson/40 text-proto-crimson text-xs">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-proto-subtext mb-1 uppercase">
                Admin Secret Bearer Token:
              </label>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter admin token or 'admin'..."
                className="w-full px-3.5 py-2.5 text-xs bg-proto-surface0 border border-proto-surface1 rounded-xl text-proto-text focus:outline-none focus:border-proto-system"
              />
              <p className="text-[10px] text-proto-subtext/60 mt-1">
                Default key: <span className="text-proto-logic">ieee_ops_secure_2025</span> (or <span className="text-proto-logic">admin</span>)
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-proto-system to-proto-gold text-proto-obsidian font-black text-xs tracking-wider uppercase hover:opacity-90 transition-all shadow-md"
            >
              AUTHENTICATE CONSOLE
            </button>
          </form>

          <div className="text-center pt-2 border-t border-proto-surface1">
            <a
              href="/play"
              className="text-xs text-proto-logic hover:underline inline-flex items-center gap-1"
            >
              Switch to Operative HUD <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-proto-obsidian text-proto-text flex flex-col scanlines font-mono-cyber">
      {/* Top Operations Header */}
      <header className="sticky top-0 z-30 bg-proto-base/95 backdrop-blur-md border-b border-proto-surface1">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-proto-surface0 border border-proto-signal/40 flex items-center justify-center text-proto-signal font-black text-xs">
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
              <p className="text-xs text-proto-subtext">
                NIT Warangal IEEE Student Branch • 247 Agents Telemetry
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-proto-surface0 p-1 rounded-xl border border-proto-surface1">
            <button
              onClick={() => setActiveTab('KIOSK')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'KIOSK'
                  ? 'bg-proto-surface2 text-proto-signal shadow-sm'
                  : 'text-proto-subtext hover:text-proto-text'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>KIOSK CHECK-IN</span>
            </button>
            <button
              onClick={() => setActiveTab('TELEMETRY')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'TELEMETRY'
                  ? 'bg-proto-surface2 text-proto-logic shadow-sm'
                  : 'text-proto-subtext hover:text-proto-text'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>TELEMETRY</span>
            </button>
            <button
              onClick={() => setActiveTab('PRINT')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'PRINT'
                  ? 'bg-proto-surface2 text-proto-gold shadow-sm'
                  : 'text-proto-subtext hover:text-proto-text'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>BADGE STATION</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'KIOSK' && <KioskScanner />}
        {activeTab === 'TELEMETRY' && <TelemetryDashboard />}
        {activeTab === 'PRINT' && <PrintStation />}
      </main>

      {/* Footer */}
      <footer className="w-full bg-proto-base border-t border-proto-surface1 px-4 py-3 text-center text-xs text-proto-subtext flex items-center justify-between max-w-7xl mx-auto">
        <span className="opacity-75">
          NIT WARANGAL IEEE STUDENT BRANCH // THE PROTOCOL
        </span>
        <a
          href="/play"
          target="_blank"
          rel="noreferrer"
          className="text-proto-logic hover:underline flex items-center gap-1"
        >
          Open Operative Terminal <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </footer>
    </div>
  );
}
