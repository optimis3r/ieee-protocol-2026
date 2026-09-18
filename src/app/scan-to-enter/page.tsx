'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QRScannerModal, ScanResult } from '@/components/scanner/QRScannerModal';
import { Store, initStore, INITIAL_AGENTS } from '@/lib/store';
import { 
  ScanLine, 
  Terminal, 
  Lock,
  AlertTriangle
} from 'lucide-react';

export default function ScanToEnterPage() {
  const router = useRouter();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [manualId, setManualId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    initStore();
  }, []);

  const handleScanSuccess = (result: ScanResult) => {
    if (result.type === 'BADGE' || result.id.startsWith('AGT-')) {
      const agent = Store.getAgentById(result.id);
      if (agent) {
        localStorage.setItem('ieee_agent_id', agent.agent_id);
        localStorage.setItem('ieee_agent_token', agent.token);
        router.push(`/play?agent_id=${agent.agent_id}&token=${agent.token}`);
      } else {
        setErrorMsg(`Badge identifier ${result.id} not registered yet. Please check in at the Admin Operations desk.`);
      }
    } else {
      setErrorMsg(`Unrecognized badge format: ${result.raw}`);
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId.trim()) return;

    const agent = Store.getAgentById(manualId.trim());
    if (agent) {
      localStorage.setItem('ieee_agent_id', agent.agent_id);
      localStorage.setItem('ieee_agent_token', agent.token);
      router.push(`/play?agent_id=${agent.agent_id}&token=${agent.token}`);
    } else {
      setErrorMsg(`Operative ${manualId.toUpperCase()} not found in Protocol directory.`);
    }
  };

  const handleQuickSelect = (agentId: string) => {
    const agent = Store.getAgentById(agentId);
    if (agent) {
      localStorage.setItem('ieee_agent_id', agent.agent_id);
      localStorage.setItem('ieee_agent_token', agent.token);
      router.push(`/play?agent_id=${agent.agent_id}&token=${agent.token}`);
    }
  };

  return (
    <div className="min-h-screen bg-proto-obsidian text-proto-text flex flex-col justify-between p-4 sm:p-6 scanlines font-mono-cyber">
      {/* Top Header */}
      <header className="max-w-md w-full mx-auto text-center pt-8 pb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-proto-surface0 border border-proto-signal/40 text-proto-signal text-xs mb-3">
          <Terminal className="w-3.5 h-3.5" />
          <span>NIT WARANGAL // IEEE STUDENT BRANCH</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-proto-text">
          THE PROTOCOL
        </h1>
        <p className="text-xs text-proto-gold font-bold tracking-widest uppercase mt-1">
          ENTER. INVESTIGATE. DECIDE.
        </p>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-md w-full mx-auto bg-proto-base border border-proto-surface1 rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Warning Callout */}
        <div className="p-3 rounded-xl bg-proto-surface0 border border-proto-crimson/50 text-proto-crimson text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
          <span>TRUST NO ONE. Some agents have other objectives.</span>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-proto-crimson/15 border border-proto-crimson/40 text-proto-crimson text-xs flex items-start gap-2">
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Primary Action: Camera Scan */}
        <button
          onClick={() => setIsScannerOpen(true)}
          className="w-full py-4 px-5 rounded-xl bg-gradient-to-r from-proto-logic to-proto-signal text-proto-obsidian font-black text-sm tracking-wider uppercase flex items-center justify-center gap-3 hover:opacity-95 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)]"
        >
          <ScanLine className="w-5 h-5" />
          <span>SCAN PHYSICAL BADGE QR</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-proto-surface1 w-full" />
          <span className="bg-proto-base px-3 text-[10px] uppercase text-proto-subtext absolute">
            or manual operative id
          </span>
        </div>

        {/* Secondary: Manual ID Entry */}
        <form onSubmit={handleManualLogin} className="space-y-3">
          <div>
            <label className="block text-[11px] text-proto-subtext mb-1 uppercase">
              Agent ID (e.g. AGT-TURING):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="AGT-XXXX"
                className="flex-1 px-3.5 py-2.5 text-xs bg-proto-surface0 border border-proto-surface1 rounded-xl text-proto-text focus:outline-none focus:border-proto-logic uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2.5 text-xs font-bold uppercase bg-proto-surface1 text-proto-text hover:bg-proto-surface2 rounded-xl transition-colors"
              >
                Access
              </button>
            </div>
          </div>
        </form>

        {/* Demo Fast-Switch Operatives across 5 domains */}
        <div className="pt-2 border-t border-proto-surface1 space-y-2">
          <span className="text-[11px] uppercase text-proto-subtext block">
            Instant Demo Operatives (5 Domains):
          </span>
          <div className="grid grid-cols-2 gap-2">
            {INITIAL_AGENTS.map((demo) => {
              const borderColors: Record<string, string> = {
                LOGIC: 'hover:border-proto-logic text-proto-logic',
                SIGNAL: 'hover:border-proto-signal text-proto-signal',
                OBSERVATION: 'hover:border-proto-obs text-proto-obs',
                SYSTEM: 'hover:border-proto-system text-proto-system',
                SOCIAL: 'hover:border-proto-social text-proto-social',
              };
              return (
                <button
                  key={demo.agent_id}
                  onClick={() => handleQuickSelect(demo.agent_id)}
                  className={`p-2.5 rounded-xl bg-proto-surface0 border border-proto-surface1 text-left transition-colors flex flex-col justify-between ${
                    borderColors[demo.archetype] || ''
                  }`}
                >
                  <div className="text-xs font-bold text-proto-text">
                    {demo.agent_id}
                  </div>
                  <div className="text-[10px] font-bold opacity-90 mt-0.5">
                    [{demo.archetype}]
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="max-w-md w-full mx-auto text-center py-6 text-xs text-proto-subtext space-y-2">
        <div>
          <span>Operations personnel? </span>
          <a
            href="/admin"
            className="text-proto-logic hover:underline font-bold"
          >
            Access Operations Desk →
          </a>
        </div>
        <p className="opacity-60 text-[11px]">
          NIT Warangal IEEE Student Branch // The Protocol
        </p>
      </footer>

      {/* Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        title="BADGE OPTICAL SENSOR"
        subtitle="Point camera at operative badge to authenticate"
      />
    </div>
  );
}
