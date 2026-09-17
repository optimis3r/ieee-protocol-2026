'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QRScannerModal, ScanResult } from '@/components/scanner/QRScannerModal';
import { Store, initStore, INITIAL_AGENTS } from '@/lib/store';
import { 
  ScanLine, 
  ShieldCheck, 
  Terminal, 
  UserCheck, 
  ArrowRight, 
  Cpu, 
  KeyRound,
  Lock
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
      setErrorMsg(`Operative ${manualId.toUpperCase()} not found in network directory.`);
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
    <div className="min-h-screen bg-cat-mantle text-cat-text flex flex-col justify-between p-4 sm:p-6 scanlines">
      {/* Top Header */}
      <header className="max-w-md w-full mx-auto text-center pt-8 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cat-surface0 border border-cat-surface1 text-cat-sapphire text-xs font-mono-cyber mb-4">
          <Terminal className="w-3.5 h-3.5" />
          <span>IEEE PROTOCOL: THE NETWORK</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-mono-cyber tracking-tight text-cat-text">
          OPERATIVE AUTHENTICATION
        </h1>
        <p className="text-xs text-cat-subtext mt-2">
          Scan your physical badge QR code or identify your operative clearance token.
        </p>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-md w-full mx-auto bg-cat-base border border-cat-surface1 rounded-2xl p-6 shadow-2xl space-y-6">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-cat-red/15 border border-cat-red/40 text-cat-red text-xs font-mono-cyber flex items-start gap-2">
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Primary Action: Camera Scan */}
        <button
          onClick={() => setIsScannerOpen(true)}
          className="w-full py-4 px-5 rounded-xl bg-cat-sapphire text-cat-crust font-bold font-mono-cyber text-sm tracking-wider uppercase flex items-center justify-center gap-3 hover:bg-cat-sapphire/90 active:scale-[0.99] transition-all shadow-lg glow-sapphire"
        >
          <ScanLine className="w-5 h-5" />
          <span>SCAN PHYSICAL BADGE QR</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-cat-surface0 w-full" />
          <span className="bg-cat-base px-3 text-[10px] uppercase font-mono-cyber text-cat-subtext absolute">
            or manual operative id
          </span>
        </div>

        {/* Secondary: Manual ID Entry */}
        <form onSubmit={handleManualLogin} className="space-y-3">
          <div>
            <label className="block text-[11px] font-mono-cyber text-cat-subtext mb-1 uppercase">
              Agent ID (e.g. AGT-TURING):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="AGT-XXXX"
                className="flex-1 px-3.5 py-2.5 text-xs font-mono-cyber bg-cat-mantle border border-cat-surface1 rounded-xl text-cat-text focus:outline-none focus:border-cat-sapphire uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2.5 text-xs font-mono-cyber font-bold uppercase bg-cat-surface1 text-cat-text hover:bg-cat-surface2 rounded-xl transition-colors"
              >
                Access
              </button>
            </div>
          </div>
        </form>

        {/* Demo Fast-Switch Operatives */}
        <div className="pt-2 border-t border-cat-surface0 space-y-2">
          <span className="text-[11px] font-mono-cyber uppercase text-cat-subtext block">
            Instant Demo Operatives:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {INITIAL_AGENTS.map((demo) => (
              <button
                key={demo.agent_id}
                onClick={() => handleQuickSelect(demo.agent_id)}
                className="p-2.5 rounded-xl bg-cat-mantle border border-cat-surface0 hover:border-cat-surface2 text-left transition-colors flex flex-col justify-between"
              >
                <div className="font-mono-cyber text-xs font-bold text-cat-text">
                  {demo.agent_id}
                </div>
                <div className="text-[10px] text-cat-subtext truncate">
                  {demo.archetype.replace('_', ' ')}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="max-w-md w-full mx-auto text-center py-6 text-xs font-mono-cyber text-cat-subtext space-y-2">
        <div>
          <span>Operations personnel? </span>
          <a
            href="/admin"
            className="text-cat-sapphire hover:underline font-bold"
          >
            Access Operations Desk →
          </a>
        </div>
        <p className="opacity-60 text-[11px]">
          IEEE Protocol ARG Engine // Zero-Install PWA
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
