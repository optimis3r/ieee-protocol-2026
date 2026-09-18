'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home, Terminal } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors securely without leaking confidential data
    console.error('[PROTOCOL EXCEPTION]', error.name, error.message);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#070b09] text-[#eaf2ec] flex flex-col justify-between p-4 sm:p-6 font-mono-cyber selection:bg-proto-signal selection:text-[#070b09] scanlines relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-proto-crimson/10 rounded-full blur-3xl pointer-events-none" />

      <header className="max-w-md w-full mx-auto flex items-center justify-between pt-4 pb-2 z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e1315] border border-proto-crimson/30 text-[10px] text-proto-crimson font-bold tracking-widest uppercase">
          <AlertTriangle className="w-3 h-3" />
          <span>SYSTEM ANOMALY</span>
        </div>
        {error.digest && (
          <span className="text-[9px] text-[#55695c]">REF: {error.digest.slice(0, 8)}</span>
        )}
      </header>

      <main className="max-w-md w-full mx-auto my-auto z-10">
        <div className="bg-[#0f1712]/95 backdrop-blur-xl border border-[#203226] hover:border-proto-crimson/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6 text-center transition-all">
          
          <div className="w-16 h-16 rounded-2xl bg-[#1f1215] border border-proto-crimson/50 flex items-center justify-center mx-auto text-proto-crimson shadow-[0_0_25px_rgba(255,51,68,0.25)]">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-[#f3f7f4] uppercase">
              CIRCUIT FAULT DETECTED
            </h1>
            <p className="text-xs text-[#8ea897] font-sans leading-relaxed">
              An unexpected anomaly disrupted this node. Protocol telemetry remains intact.
            </p>
          </div>

          <div className="p-3 bg-[#070b09] border border-[#203226] rounded-xl text-[11px] text-[#8ea897] flex items-center justify-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-proto-crimson shrink-0" />
            <span className="truncate">SAFEGUARD ACTIVE // RETRY TO RE-ESTABLISH SIGNAL</span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => reset()}
              className="flex-1 px-4 py-3 bg-proto-signal text-[#070b09] font-bold text-xs rounded-xl uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Signal</span>
            </button>
            <Link
              href="/"
              className="px-4 py-3 bg-[#121b15] border border-[#203226] text-[#eaf2ec] hover:border-proto-signal/40 font-bold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Home Hub</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-[10px] text-[#55695c] z-10">
        NIT WARANGAL • IEEE THE PROTOCOL 2026
      </footer>
    </div>
  );
}
