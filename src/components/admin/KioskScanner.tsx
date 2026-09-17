'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { Store } from '@/lib/store';
import { soundEffects } from '@/lib/audio';
import { Agent, AccessLog } from '@/types/database';
import { RegisterModal } from './RegisterModal';
import { 
  Camera, 
  CheckCircle2, 
  LogIn, 
  LogOut, 
  UserPlus, 
  AlertCircle, 
  Clock, 
  Shield 
} from 'lucide-react';

export const KioskScanner: React.FC = () => {
  const containerId = 'kiosk-qr-scanner';
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const [activeDirection, setActiveDirection] = useState<'AUTO' | 'IN' | 'OUT'>('AUTO');
  const [lastScannedAgent, setLastScannedAgent] = useState<Agent | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [unregisteredBadgeId, setUnregisteredBadgeId] = useState<string>('');
  const [manualCode, setManualCode] = useState('');
  const [isScanningActive, setIsScanningActive] = useState(false);

  const refreshLogs = useCallback(() => {
    setAccessLogs(Store.getAccessLogs());
  }, []);

  const processBadgeScan = useCallback(
    (scannedText: string) => {
      let badgeId = scannedText.trim();

      // Parse if it's a URL
      try {
        if (badgeId.includes('?') && badgeId.includes('agent_id=')) {
          const url = new URL(badgeId.startsWith('http') ? badgeId : `https://network.ieee/${badgeId}`);
          const parsed = url.searchParams.get('agent_id');
          if (parsed) badgeId = parsed;
        }
      } catch {}

      // Extract regex match
      const match = badgeId.match(/\b(AGT-[A-Z0-9]{4,8})\b/i);
      if (match) {
        badgeId = match[1].toUpperCase();
      }

      const existingAgent = Store.getAgentById(badgeId);

      if (existingAgent) {
        // Decide direction
        let dir: 'IN' | 'OUT' = 'IN';
        if (activeDirection === 'AUTO') {
          dir = existingAgent.is_active ? 'OUT' : 'IN';
        } else {
          dir = activeDirection;
        }

        Store.logAccess(existingAgent.agent_id, dir);
        soundEffects.playSuccessChime();

        const updated = Store.getAgentById(existingAgent.agent_id);
        setLastScannedAgent(updated);
        setLastAction(`${dir === 'IN' ? 'CHECK-IN' : 'CHECK-OUT'} RECORDED`);
        refreshLogs();
      } else {
        // Unregistered QR badge
        soundEffects.playScanChirp();
        setUnregisteredBadgeId(badgeId);
        setIsRegisterOpen(true);
      }
    },
    [activeDirection, refreshLogs]
  );

  useEffect(() => {
    refreshLogs();
    let isMounted = true;

    const startKiosk = async () => {
      try {
        await new Promise((r) => setTimeout(r, 200));
        if (!isMounted) return;

        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;

        const config: Html5QrcodeCameraScanConfig = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await scanner.start(
          { facingMode: 'environment' },
          config,
          (decoded) => {
            processBadgeScan(decoded);
          },
          () => {}
        );

        if (isMounted) setIsScanningActive(true);
      } catch (err) {
        console.warn('Kiosk camera feed unavailable:', err);
      }
    };

    startKiosk();

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .then(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          });
      }
    };
  }, [processBadgeScan, refreshLogs]);

  const handleManualScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processBadgeScan(manualCode.trim());
    setManualCode('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Scanner Viewport Column */}
      <div className="lg:col-span-7 bg-cat-base border border-cat-surface1 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cat-surface0 pb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cat-green" />
            <h3 className="font-mono-cyber text-sm font-bold uppercase text-cat-text">
              CONTINUOUS BADGE KIOSK
            </h3>
          </div>

          {/* Direction toggle */}
          <div className="flex items-center gap-1 bg-cat-mantle p-1 rounded-xl border border-cat-surface0">
            {(['AUTO', 'IN', 'OUT'] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => setActiveDirection(dir)}
                className={`px-3 py-1 rounded-lg text-[11px] font-mono-cyber transition-all ${
                  activeDirection === dir
                    ? 'bg-cat-surface1 text-cat-text font-bold shadow'
                    : 'text-cat-subtext hover:text-cat-text'
                }`}
              >
                {dir === 'AUTO' ? 'AUTO-TOGGLE' : dir}
              </button>
            ))}
          </div>
        </div>

        {/* Video Viewport Container */}
        <div className="relative aspect-video sm:aspect-[4/3] w-full bg-cat-crust rounded-xl overflow-hidden flex items-center justify-center border border-cat-surface0">
          <div id={containerId} className="w-full h-full object-cover" />

          {/* Cyber Overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-56 h-56 border-2 border-dashed border-cat-green/50 rounded-xl relative">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-cat-green animate-pulse shadow-[0_0_10px_#a6da95]" />
            </div>
          </div>
        </div>

        {/* Manual Fallback Bar */}
        <form onSubmit={handleManualScanSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Scan / Type badge QR string (e.g. AGT-TURING)"
            className="flex-1 px-3.5 py-2.5 text-xs font-mono-cyber bg-cat-mantle border border-cat-surface1 rounded-xl text-cat-text focus:outline-none focus:border-cat-green"
          />
          <button
            type="submit"
            className="px-4 py-2.5 text-xs font-mono-cyber font-bold uppercase bg-cat-green text-cat-crust hover:bg-cat-green/90 rounded-xl transition-colors"
          >
            Register / Log
          </button>
        </form>

        {/* Rapid Register Trigger */}
        <div className="flex items-center justify-between pt-2 text-xs font-mono-cyber text-cat-subtext">
          <span>Unregistered wristband?</span>
          <button
            onClick={() => {
              setUnregisteredBadgeId('');
              setIsRegisterOpen(true);
            }}
            className="flex items-center gap-1 text-cat-sapphire hover:underline font-bold"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Enroll New Operative
          </button>
        </div>
      </div>

      {/* Scanned Badge Telemetry & Recent Logs */}
      <div className="lg:col-span-5 space-y-4">
        {/* Scanned Operative Status Card */}
        {lastScannedAgent ? (
          <div className="bg-cat-base border border-cat-green/40 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono-cyber px-2 py-0.5 rounded bg-cat-green/20 text-cat-green font-bold">
                {lastAction}
              </span>
              <span className="text-xs font-mono-cyber text-cat-subtext">
                {new Date().toLocaleTimeString()}
              </span>
            </div>

            <div>
              <div className="text-lg font-bold font-mono-cyber text-cat-text">
                {lastScannedAgent.name}
              </div>
              <div className="text-xs font-mono-cyber text-cat-sapphire">
                {lastScannedAgent.agent_id} • {lastScannedAgent.archetype}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cat-surface0 text-xs font-mono-cyber">
              <div className="p-2 rounded-lg bg-cat-mantle">
                <span className="text-cat-subtext text-[10px] block">CLEARANCE SCORE</span>
                <span className="text-cat-yellow font-bold text-sm">
                  {lastScannedAgent.score} PTS
                </span>
              </div>
              <div className="p-2 rounded-lg bg-cat-mantle">
                <span className="text-cat-subtext text-[10px] block">VENUE STATUS</span>
                <span
                  className={`font-bold text-sm ${
                    lastScannedAgent.is_active ? 'text-cat-green' : 'text-cat-red'
                  }`}
                >
                  {lastScannedAgent.is_active ? 'ON SITE (IN)' : 'OFF SITE (OUT)'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center rounded-2xl bg-cat-base border border-cat-surface0 text-cat-subtext font-mono-cyber text-xs">
            <Shield className="w-8 h-8 mx-auto mb-2 opacity-40 text-cat-subtext" />
            READY FOR BADGE SCAN
            <p className="text-[11px] opacity-60 mt-1 font-sans">
              Scan operative badges to record attendance and inspect live progress.
            </p>
          </div>
        )}

        {/* Live Attendance History Feed */}
        <div className="bg-cat-base border border-cat-surface1 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-cat-surface0 pb-2">
            <div className="flex items-center gap-2 text-xs font-mono-cyber font-bold text-cat-text">
              <Clock className="w-4 h-4 text-cat-sapphire" />
              <span>LIVE ACCESS LOGS</span>
            </div>
            <span className="text-[10px] font-mono-cyber text-cat-subtext">
              {accessLogs.length} EVENTS
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {accessLogs.slice(0, 15).map((log) => {
              const isIn = log.direction === 'IN';
              return (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-cat-mantle border border-cat-surface0 text-xs font-mono-cyber flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`p-1 rounded-md ${
                        isIn
                          ? 'bg-cat-green/20 text-cat-green'
                          : 'bg-cat-red/20 text-cat-red'
                      }`}
                    >
                      {isIn ? <LogIn className="w-3.5 h-3.5" /> : <LogOut className="w-3.5 h-3.5" />}
                    </span>
                    <div>
                      <div className="font-bold text-cat-text">{log.agent_id}</div>
                      <div className="text-[10px] text-cat-subtext">
                        {isIn ? 'CHECK-IN' : 'CHECK-OUT'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-cat-subtext">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        initialAgentId={unregisteredBadgeId}
        onSuccess={(id) => {
          const fresh = Store.getAgentById(id);
          setLastScannedAgent(fresh);
          setLastAction('NEW OPERATIVE ENROLLED & SEEDED');
          refreshLogs();
        }}
      />
    </div>
  );
};
