'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { Store, formatActiveTime, getAgentActiveSeconds } from '@/lib/store';
import { soundEffects } from '@/lib/audio';
import { Agent, AccessLog } from '@/types/database';
import { RegisterModal } from './RegisterModal';
import { CheckInOutModal } from './CheckInOutModal';
import { 
  Camera, 
  CheckCircle2, 
  LogIn, 
  LogOut, 
  UserPlus, 
  Clock, 
  Shield, 
  Ticket,
  Pause,
  Play,
  Activity,
  Timer
} from 'lucide-react';

export const KioskScanner: React.FC = () => {
  const containerId = 'kiosk-qr-scanner';
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const [activeDirection, setActiveDirection] = useState<'AUTO' | 'IN' | 'OUT'>('AUTO');
  const [lastScannedAgent, setLastScannedAgent] = useState<Agent | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(() => Store.getAccessLogs());
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [unregisteredBadgeId, setUnregisteredBadgeId] = useState<string>('');
  const [manualCode, setManualCode] = useState('');

  // Check-In / Check-Out Confirmation Modal State
  const [selectedAgentForModal, setSelectedAgentForModal] = useState<Agent | null>(null);
  const [isCheckInOutOpen, setIsCheckInOutOpen] = useState(false);

  // Cooldown & Scan Lock to prevent rapid cycling loops
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const isModalOpenRef = useRef<boolean>(false);
  const cooldownUntilRef = useRef<number>(0);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshLogs = useCallback(() => {
    setAccessLogs(Store.getAccessLogs());
  }, []);

  const triggerCooldown = useCallback((durationMs = 2500) => {
    cooldownUntilRef.current = Date.now() + durationMs;
    setCooldownSeconds(Math.ceil(durationMs / 1000));

    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    cooldownIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((cooldownUntilRef.current - Date.now()) / 1000));
      setCooldownSeconds(remaining);
      if (remaining <= 0) {
        if (cooldownIntervalRef.current) {
          clearInterval(cooldownIntervalRef.current);
          cooldownIntervalRef.current = null;
        }
        // Safely resume camera scanning once cooldown elapses
        try {
          if (scannerRef.current && !isModalOpenRef.current) {
            scannerRef.current.resume();
          }
        } catch (_) {}
      }
    }, 200);
  }, []);

  const processBadgeScan = useCallback(
    (scannedText: string) => {
      // Ignore new scans if modal is already open or during cooldown period
      if (isModalOpenRef.current || Date.now() < cooldownUntilRef.current) {
        return;
      }

      let badgeId = scannedText.trim();

      // Parse if it's a URL
      try {
        if (badgeId.includes('?') && badgeId.includes('agent_id=')) {
          const url = new URL(badgeId.startsWith('http') ? badgeId : `https://network.ieee/${badgeId}`);
          const parsed = url.searchParams.get('agent_id');
          if (parsed) badgeId = parsed;
        }
      } catch {}

      // Extract badge ID from BADGE: prefix or regex
      if (badgeId.startsWith('BADGE:')) {
        badgeId = badgeId.replace('BADGE:', '').trim();
      }
      const match = badgeId.match(/\b(AGT-[A-Z0-9]{3,12})\b/i);
      if (match) {
        badgeId = match[1].toUpperCase();
      }

      const existingAgent = Store.getAgentById(badgeId) || Store.findAgentByIdentifier(badgeId);

      if (existingAgent) {
        // Pause scanner and display the Check-In / Check-Out Confirmation Modal
        isModalOpenRef.current = true;
        soundEffects.playScanChirp();
        try {
          scannerRef.current?.pause(true);
        } catch (_) {}

        setSelectedAgentForModal(existingAgent);
        setIsCheckInOutOpen(true);
      } else {
        // Unregistered QR badge: Pause scanner and display enrollment modal
        isModalOpenRef.current = true;
        soundEffects.playScanChirp();
        try {
          scannerRef.current?.pause(true);
        } catch (_) {}

        setUnregisteredBadgeId(badgeId);
        setIsRegisterOpen(true);
      }
    },
    []
  );

  const handleModalCheckIn = async (agentId: string) => {
    await Store.checkInAgentAsync(agentId, 'Kiosk desk camera scan');
    const updated = Store.getAgentById(agentId);
    setLastScannedAgent(updated);
    setLastAction('CHECKED IN (ACTIVE - TIMER STARTED)');
    refreshLogs();
    setIsCheckInOutOpen(false);
    isModalOpenRef.current = false;
    triggerCooldown(2500);
  };

  const handleModalCheckOut = async (agentId: string) => {
    await Store.checkOutAgentAsync(agentId, 'Kiosk desk camera scan');
    const updated = Store.getAgentById(agentId);
    setLastScannedAgent(updated);
    setLastAction('CHECKED OUT (PAUSED - TIMER FROZEN)');
    refreshLogs();
    setIsCheckInOutOpen(false);
    isModalOpenRef.current = false;
    triggerCooldown(2500);
  };

  const handleModalClose = () => {
    setIsCheckInOutOpen(false);
    isModalOpenRef.current = false;
    triggerCooldown(1500);
  };

  useEffect(() => {
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
      } catch (err) {
        console.warn('Kiosk camera feed unavailable:', err);
      }
    };

    startKiosk();

    return () => {
      isMounted = false;
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
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
  }, [processBadgeScan]);

  const handleManualScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processBadgeScan(manualCode.trim());
    setManualCode('');
  };

  const handleToggleCurrent = () => {
    if (!lastScannedAgent) return;
    const res = Store.toggleCheckIn(lastScannedAgent.agent_id);
    soundEffects.playSuccessChime();
    const updated = Store.getAgentById(lastScannedAgent.agent_id);
    setLastScannedAgent(updated);
    setLastAction(res.status === 'ACTIVE' ? 'CHECKED IN (ACTIVE)' : 'CHECKED OUT (PAUSED)');
    refreshLogs();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Scanner Viewport Column */}
      <div className="lg:col-span-7 bg-proto-base border border-proto-surface1 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-proto-surface1 pb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-proto-signal" />
            <h3 className="font-mono-cyber text-sm font-bold uppercase text-proto-text">
              DESK CHECK-IN / CHECK-OUT SCANNER
            </h3>
          </div>

          {/* Scanner Status & Cooldown Pill */}
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono-cyber font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border transition-all ${
              isCheckInOutOpen || isRegisterOpen
                ? 'bg-proto-gold/20 text-proto-gold border-proto-gold/40'
                : cooldownSeconds > 0
                ? 'bg-proto-logic/20 text-proto-logic border-proto-logic/40'
                : 'bg-proto-signal/20 text-proto-signal border-proto-signal/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                isCheckInOutOpen || isRegisterOpen
                  ? 'bg-proto-gold animate-pulse'
                  : cooldownSeconds > 0
                  ? 'bg-proto-logic animate-spin'
                  : 'bg-proto-signal animate-ping'
              }`} />
              <span>
                {isCheckInOutOpen || isRegisterOpen
                  ? 'POPUP ACTIVE'
                  : cooldownSeconds > 0
                  ? `COOLDOWN (${cooldownSeconds}s)`
                  : 'SCANNER READY'}
              </span>
            </span>
          </div>
        </div>

        {/* Video Viewport Container */}
        <div className="relative aspect-video sm:aspect-[4/3] w-full bg-proto-obsidian rounded-xl overflow-hidden flex items-center justify-center border border-proto-surface1">
          <div id={containerId} className="w-full h-full object-cover" />

          {/* Reticle Overlay with Dynamic Cooldown Visuals */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className={`w-56 h-56 border-2 rounded-xl relative transition-all duration-300 ${
              cooldownSeconds > 0
                ? 'border-proto-logic/50 shadow-[0_0_15px_rgba(0,180,255,0.2)]'
                : isCheckInOutOpen
                ? 'border-proto-gold/50 shadow-[0_0_15px_rgba(255,191,0,0.2)]'
                : 'border-dashed border-proto-signal/60 shadow-[0_0_20px_rgba(0,255,136,0.25)]'
            }`}>
              {cooldownSeconds > 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-proto-obsidian/40 backdrop-blur-[1px] rounded-xl text-center p-2">
                  <Timer className="w-8 h-8 text-proto-logic animate-pulse mb-1" />
                  <span className="text-[11px] font-mono-cyber font-bold text-proto-logic uppercase">
                    COOLDOWN ACTIVE
                  </span>
                  <span className="text-[10px] text-white/80 font-mono">
                    Ready in {cooldownSeconds}s
                  </span>
                </div>
              ) : (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-proto-signal animate-pulse shadow-[0_0_10px_#00ff88]" />
              )}
            </div>
          </div>
        </div>

        {/* Manual Fallback Bar */}
        <form onSubmit={handleManualScanSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Scan / Type Agent ID, Wristband ID, or Roll No (e.g. AGT-047)"
            className="flex-1 px-3.5 py-2.5 text-xs font-mono-cyber bg-proto-surface0 border border-proto-surface1 rounded-xl text-proto-text focus:outline-none focus:border-proto-signal"
          />
          <button
            type="submit"
            className="px-4 py-2.5 text-xs font-mono-cyber font-bold uppercase bg-proto-signal text-[#0a0f0d] hover:bg-[#00e676] rounded-xl transition-colors cursor-pointer"
          >
            Verify Operative
          </button>
        </form>

        {/* Rapid Register Trigger */}
        <div className="flex items-center justify-between pt-2 text-xs font-mono-cyber text-proto-subtext">
          <span>Unregistered participant at the desk?</span>
          <button
            onClick={() => {
              isModalOpenRef.current = true;
              setUnregisteredBadgeId('');
              setIsRegisterOpen(true);
            }}
            className="flex items-center gap-1 text-proto-logic hover:underline font-bold cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Enroll Operative On-The-Spot
          </button>
        </div>
      </div>

      {/* Scanned Badge Telemetry & Recent Logs */}
      <div className="lg:col-span-5 space-y-4">
        {/* Scanned Operative Status Card */}
        {lastScannedAgent ? (
          <div className="bg-proto-base border-2 border-proto-signal/60 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-proto-surface1 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-proto-signal animate-pulse" />
                <span className="font-mono-cyber text-xs font-bold text-proto-signal uppercase tracking-wider">
                  {lastAction || 'SCANNED OPERATIVE'}
                </span>
              </div>
              <span
                className={`text-[10px] font-mono-cyber font-black px-2 py-0.5 rounded border ${
                  lastScannedAgent.check_in_status === 'ACTIVE'
                    ? 'bg-proto-signal/20 text-proto-signal border-proto-signal/40'
                    : 'bg-proto-gold/20 text-proto-gold border-proto-gold/40'
                }`}
              >
                {lastScannedAgent.check_in_status}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-xl font-black text-proto-text">
                  {lastScannedAgent.agent_number || lastScannedAgent.agent_id}
                </h4>
                <p className="text-xs text-proto-subtext">
                  {lastScannedAgent.name} ({lastScannedAgent.auth_identifier || lastScannedAgent.contact})
                </p>
              </div>

              {/* Physical Wristband Verification Callout */}
              <div className="p-3 rounded-xl bg-proto-surface0 border border-proto-gold/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-proto-gold" />
                  <span className="text-xs text-proto-subtext">Wristband Verification:</span>
                </div>
                <span className="text-sm font-black text-proto-gold tracking-wider">
                  {lastScannedAgent.wristband_id || lastScannedAgent.agent_id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-proto-surface0 border border-proto-surface1">
                  <span className="text-[10px] text-proto-subtext block uppercase">Domain Role</span>
                  <span className="font-bold text-proto-logic">{lastScannedAgent.archetype}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-proto-surface0 border border-proto-surface1">
                  <span className="text-[10px] text-proto-subtext block uppercase">Clearance Score</span>
                  <span className="font-bold text-proto-gold">{lastScannedAgent.score} PTS</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-proto-surface0 border border-proto-surface1 flex items-center justify-between text-xs">
                <span className="text-proto-subtext flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Total Active Play Time:</span>
                </span>
                <span className="font-bold text-proto-text">
                  {formatActiveTime(getAgentActiveSeconds(lastScannedAgent))}
                </span>
              </div>

              <button
                onClick={handleToggleCurrent}
                className="w-full py-2 px-3 rounded-xl bg-proto-surface0 border border-proto-surface1 hover:border-proto-surface2 text-xs text-proto-subtext hover:text-proto-text transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {lastScannedAgent.check_in_status === 'ACTIVE' ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Invert to Check-Out (Pause Timer)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Invert to Check-In (Resume Timer)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-proto-base border border-proto-surface1 rounded-2xl p-6 text-center text-proto-subtext space-y-2">
            <Shield className="w-8 h-8 mx-auto text-proto-subtext/40" />
            <h4 className="text-xs font-bold uppercase text-proto-text">
              AWAITING OPERATIVE QR SCAN
            </h4>
            <p className="text-[11px] font-sans">
              Scan an operative&apos;s phone QR code or enter their ID to open the Check-In / Check-Out confirmation modal.
            </p>
          </div>
        )}

        {/* Live Access Feed */}
        <div className="bg-proto-base border border-proto-surface1 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-proto-surface1 pb-2">
            <h4 className="text-xs font-bold uppercase text-proto-text flex items-center gap-2">
              <Clock className="w-4 h-4 text-proto-signal" />
              RECENT ACCESS HISTORY
            </h4>
            <span className="text-[10px] text-proto-subtext">Last {accessLogs.length} events</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {accessLogs.slice(0, 10).map((log) => {
              const isEntry = log.direction === 'IN';
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-proto-surface0 border border-proto-surface1 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`p-1 rounded-lg ${
                        isEntry ? 'bg-proto-signal/20 text-proto-signal' : 'bg-proto-gold/20 text-proto-gold'
                      }`}
                    >
                      {isEntry ? <LogIn className="w-3.5 h-3.5" /> : <LogOut className="w-3.5 h-3.5" />}
                    </span>
                    <div>
                      <div className="font-bold text-proto-text">{log.agent_id}</div>
                      <div className="text-[10px] text-proto-subtext">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isEntry
                        ? 'bg-proto-signal/15 text-proto-signal'
                        : 'bg-proto-gold/15 text-proto-gold'
                    }`}
                  >
                    {isEntry ? 'CHECK-IN' : 'CHECK-OUT'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Operative Desk Check-In / Check-Out Confirmation Modal */}
      <CheckInOutModal
        isOpen={isCheckInOutOpen}
        agent={selectedAgentForModal}
        onClose={handleModalClose}
        onCheckIn={handleModalCheckIn}
        onCheckOut={handleModalCheckOut}
      />

      {/* Registration Modal Overlay for unallocated badges */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => {
          setIsRegisterOpen(false);
          isModalOpenRef.current = false;
          triggerCooldown(1500);
        }}
        initialAgentId={unregisteredBadgeId}
        onSuccess={(newId) => {
          setIsRegisterOpen(false);
          isModalOpenRef.current = false;
          refreshLogs();
          triggerCooldown(2500);
          const newAgent = Store.getAgentById(newId);
          if (newAgent) {
            setLastScannedAgent(newAgent);
            setLastAction('ENROLLED & CHECKED IN');
          }
        }}
      />
    </div>
  );
};
