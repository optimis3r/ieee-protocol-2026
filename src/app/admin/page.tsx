'use client';

import React, { useState, useEffect } from 'react';
import { KioskScanner } from '@/components/admin/KioskScanner';
import { TelemetryDashboard } from '@/components/admin/TelemetryDashboard';
import { PrintStation } from '@/components/admin/PrintStation';
import { initStore } from '@/lib/store';
import { 
  ShieldCheck, 
  Terminal, 
  Camera, 
  BarChart3, 
  Printer, 
  KeyRound, 
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
      <div className="min-h-screen bg-cat-mantle text-cat-text flex items-center justify-center p-4 scanlines">
        <div className="max-w-md w-full bg-cat-base border border-cat-surface1 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-cat-surface0 border border-cat-surface1 flex items-center justify-center mx-auto text-cat-mauve shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold font-mono-cyber text-cat-text">
              OPERATIONS DESK GATEWAY
            </h2>
            <p className="text-xs text-cat-subtext font-mono-cyber">
              Restricted area for IEEE Event Organizers & Network Controllers.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-cat-red/15 border border-cat-red/40 text-cat-red text-xs font-mono-cyber">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono-cyber text-cat-subtext mb-1 uppercase">
                Admin Secret Bearer Token:
              </label>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter admin token or 'admin'..."
                className="w-full px-3.5 py-2.5 text-xs font-mono-cyber bg-cat-mantle border border-cat-surface1 rounded-xl text-cat-text focus:outline-none focus:border-cat-mauve"
              />
              <p className="text-[10px] font-mono-cyber text-cat-subtext/60 mt-1">
                Default key: <span className="text-cat-sapphire">ieee_ops_secure_2025</span> (or <span className="text-cat-sapphire">admin</span>)
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-cat-mauve text-cat-crust font-bold font-mono-cyber text-xs tracking-wider uppercase hover:bg-cat-mauve/90 transition-all shadow-md"
            >
              AUTHENTICATE CONSOLE
            </button>
          </form>

          <div className="text-center pt-2 border-t border-cat-surface0">
            <a
              href="/play"
              className="text-xs font-mono-cyber text-cat-sapphire hover:underline inline-flex items-center gap-1"
            >
              Switch to Operative Terminal <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cat-mantle text-cat-text flex flex-col scanlines">
      {/* Top Operations Header */}
      <header className="sticky top-0 z-30 bg-cat-crust/95 backdrop-blur-md border-b border-cat-surface0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cat-surface0 border border-cat-surface1 flex items-center justify-center text-cat-green">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono-cyber font-bold text-sm text-cat-text tracking-wider">
                  IEEE PROTOCOL // OPERATIONS DESK
                </h1>
                <span className="text-[10px] font-mono-cyber px-2 py-0.5 rounded bg-cat-green/20 text-cat-green font-bold">
                  MASTER CONSOLE
                </span>
              </div>
              <p className="text-xs text-cat-subtext font-mono-cyber">
                Kiosk Check-In • Realtime Telemetry • Badge Factory
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-cat-base p-1 rounded-xl border border-cat-surface0">
            <button
              onClick={() => setActiveTab('KIOSK')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono-cyber font-bold transition-all ${
                activeTab === 'KIOSK'
                  ? 'bg-cat-surface1 text-cat-green shadow-sm'
                  : 'text-cat-subtext hover:text-cat-text'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>KIOSK CHECK-IN</span>
            </button>
            <button
              onClick={() => setActiveTab('TELEMETRY')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono-cyber font-bold transition-all ${
                activeTab === 'TELEMETRY'
                  ? 'bg-cat-surface1 text-cat-sapphire shadow-sm'
                  : 'text-cat-subtext hover:text-cat-text'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>TELEMETRY</span>
            </button>
            <button
              onClick={() => setActiveTab('PRINT')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono-cyber font-bold transition-all ${
                activeTab === 'PRINT'
                  ? 'bg-cat-surface1 text-cat-mauve shadow-sm'
                  : 'text-cat-subtext hover:text-cat-text'
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
      <footer className="w-full bg-cat-crust border-t border-cat-surface0 px-4 py-3 text-center text-xs font-mono-cyber text-cat-subtext flex items-center justify-between max-w-7xl mx-auto">
        <span className="opacity-75">
          IEEE PROTOCOL // ADMIN OPERATIONS SUITE
        </span>
        <a
          href="/play"
          target="_blank"
          rel="noreferrer"
          className="text-cat-sapphire hover:underline flex items-center gap-1"
        >
          Open Operative HUD <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </footer>
    </div>
  );
}
