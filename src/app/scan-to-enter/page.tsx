'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRScannerModal, ScanResult } from '@/components/scanner/QRScannerModal';
import { Store, initStore } from '@/lib/store';
import { 
  ScanLine, 
  ArrowLeft,
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
        const destination = Store.isEventActive()
          ? `/play?agent_id=${agent.agent_id}&token=${agent.token}`
          : '/standby';
        router.push(destination);
      } else {
        setErrorMsg(`Badge identifier ${result.id} not registered yet. Please check in at the Operations desk.`);
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
      const destination = Store.isEventActive()
        ? `/play?agent_id=${agent.agent_id}&token=${agent.token}`
        : '/standby';
      router.push(destination);
    } else {
      setErrorMsg(`Operative ${manualId.toUpperCase()} not found in Protocol directory.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#141514] text-[#f4f1ea] flex flex-col justify-between selection:bg-[#c93b2b] selection:text-[#f4f1ea]">
      {/* Top Masthead */}
      <header className="w-full border-b border-[#2d312c] px-4 sm:px-8 py-3.5 bg-[#141514]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 border border-[#3f453f] hover:border-[#949e93] text-[#949e93] hover:text-[#f4f1ea] transition-colors rounded-sm"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="font-mono-tabular text-[10px] text-[#949e93] tracking-widest uppercase">
                NIT WARANGAL • DEPT OF ECE
              </div>
              <div className="text-xs font-bold tracking-wider text-[#f4f1ea] uppercase">
                OPTICAL SENSOR GATEWAY
              </div>
            </div>
          </div>

          <Link
            href="/my-badge"
            className="btn-editorial-outline px-3 py-1.5 text-xs uppercase font-mono-tabular"
          >
            My Pass
          </Link>
        </div>
      </header>

      {/* Main Authentication Section */}
      <main className="max-w-md w-full mx-auto px-4 py-10 flex-1 flex flex-col justify-center">
        <div className="border border-[#3f453f] bg-[#1b1d1b] p-6 sm:p-7 space-y-6">
          <div className="space-y-1 border-b border-[#2d312c] pb-4">
            <span className="font-mono-tabular text-[10px] text-[#c93b2b] uppercase tracking-wider block">
              [GATEWAY AUTHENTICATION]
            </span>
            <h1 className="font-serif-editorial text-3xl font-normal text-[#f4f1ea]">
              Scan to Enter
            </h1>
            <p className="font-display-grotesk text-xs text-[#949e93]">
              Scan an operative physical badge or enter your assigned Agent ID.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 border border-[#c93b2b] bg-[#251515] text-[#c93b2b] text-xs flex items-start gap-2 font-mono-tabular">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Action: Camera Scan */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="btn-editorial-primary w-full py-3.5 px-4 text-xs font-bold uppercase flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <ScanLine className="w-4 h-4" />
            <span>OPEN CAMERA SCANNER</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#2d312c] w-full" />
            <span className="bg-[#1b1d1b] px-3 font-mono-tabular text-[10px] uppercase text-[#949e93] absolute">
              OR MANUAL AGENT ID
            </span>
          </div>

          {/* Secondary: Manual ID Entry */}
          <form onSubmit={handleManualLogin} className="space-y-2 font-mono-tabular">
            <label className="block text-[10px] text-[#949e93] uppercase">
              Agent ID (e.g. AGT-001):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="AGT-XXXX"
                className="flex-1 px-3 py-2 text-xs bg-[#141514] border border-[#2d312c] text-[#f4f1ea] focus:outline-none focus:border-[#949e93] uppercase placeholder:text-[#949e93]/50"
              />
              <button
                type="submit"
                className="btn-editorial-outline px-4 py-2 text-xs font-bold uppercase"
              >
                Access
              </button>
            </div>
          </form>

          {/* Operative Registration Link */}
          <div className="pt-3 border-t border-[#2d312c] flex items-center justify-between text-xs font-display-grotesk text-[#949e93]">
            <span>Need an assignment?</span>
            <Link href="/register" className="text-[#f4f1ea] hover:underline font-bold">
              Register here →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="w-full border-t border-[#2d312c] px-4 sm:px-8 py-3.5 text-xs text-[#949e93] bg-[#141514]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono-tabular text-[11px]">
          <span>NIT WARANGAL IEEE STUDENT BRANCH</span>
          <div className="flex items-center gap-4">
            <Link href="/my-badge" className="hover:text-[#f4f1ea]">
              My Pass
            </Link>
            <Link href="/login" className="hover:text-[#f4f1ea]">
              Pass Recovery
            </Link>
            <Link href="/admin" className="hover:text-[#f4f1ea]">
              Operations
            </Link>
          </div>
        </div>
      </footer>

      {/* Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        title="BADGE OPTICAL SENSOR"
        subtitle="Align physical badge QR within reticle"
      />
    </div>
  );
}
