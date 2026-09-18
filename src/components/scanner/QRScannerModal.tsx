'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { Camera, X, Flashlight, AlertCircle } from 'lucide-react';
import { soundEffects } from '@/lib/audio';

export interface ScanResult {
  raw: string;
  type: 'BADGE' | 'NODE' | 'GENERIC';
  id: string;
  token?: string;
}

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (result: ScanResult) => void;
  title?: string;
  subtitle?: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'OPTICAL SENSOR SCANNER',
  subtitle = 'Align QR code within cybernetic reticle',
}) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'interactive-qr-reader';
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualCode, setManualCode] = useState('');

  // Parse QR content using required regex rules
  const parseScannedText = useCallback((text: string): ScanResult => {
    const trimmed = text.trim();

    // 1. Check for signed URL query params e.g. /play?agent_id=AGT-047&token=tok_abc
    try {
      if (trimmed.includes('?') && (trimmed.includes('agent_id=') || trimmed.includes('node_id='))) {
        const url = new URL(trimmed.startsWith('http') ? trimmed : `https://network.ieee/${trimmed}`);
        const agentId = url.searchParams.get('agent_id');
        const token = url.searchParams.get('token');
        const nodeId = url.searchParams.get('node_id');

        if (agentId) {
          return {
            raw: trimmed,
            type: 'BADGE',
            id: agentId.toUpperCase(),
            token: token || undefined,
          };
        }
        if (nodeId) {
          return {
            raw: trimmed,
            type: 'NODE',
            id: nodeId.toUpperCase(),
          };
        }
      }
    } catch {}

    // 2. Check for Badge Pattern: AGT-[A-Z0-9]{3,12}
    const badgeMatch = trimmed.match(/\b(AGT-[A-Z0-9]{3,12})\b/i);
    if (badgeMatch) {
      return {
        raw: trimmed,
        type: 'BADGE',
        id: badgeMatch[1].toUpperCase(),
      };
    }

    // 3. Check for Node Pattern: /node/[id] or NODE-[A-Z0-9_-]+
    const nodeEndpointMatch = trimmed.match(/\/node\/([a-zA-Z0-9_-]+)/i);
    if (nodeEndpointMatch) {
      return {
        raw: trimmed,
        type: 'NODE',
        id: nodeEndpointMatch[1].toUpperCase(),
      };
    }

    const nodeCodeMatch = trimmed.match(/\b(NODE-[A-Z0-9_-]+)\b/i);
    if (nodeCodeMatch) {
      return {
        raw: trimmed,
        type: 'NODE',
        id: nodeCodeMatch[1].toUpperCase(),
      };
    }

    // Generic fallback
    return {
      raw: trimmed,
      type: 'GENERIC',
      id: trimmed,
    };
  }, []);

  const handleScanData = useCallback(
    (decodedText: string) => {
      if (isProcessing) return;
      setIsProcessing(true);
      soundEffects.playScanChirp();

      const parsed = parseScannedText(decodedText);
      setTimeout(() => {
        onScanSuccess(parsed);
        setIsProcessing(false);
        onClose();
      }, 400);
    },
    [isProcessing, onScanSuccess, onClose, parseScannedText]
  );

  // Initialize and start scanner when opened
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const startScanner = async () => {
      try {
        await new Promise((r) => setTimeout(r, 150));
        if (!isMounted) return;

        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;

        const config: Html5QrcodeCameraScanConfig = {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await scanner.start(
          { facingMode: 'environment' },
          config,
          (decoded) => {
            handleScanData(decoded);
          },
          () => {}
        );
      } catch (err) {
        if (isMounted) {
          setErrorMsg('Camera sensor feed unavailable. You can enter or paste code below.');
          console.warn('Scanner error:', err);
        }
      }
    };

    startScanner();

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
  }, [isOpen, handleScanData]);

  // Toggle Torch if available
  const toggleTorch = async () => {
    if (!scannerRef.current) return;
    try {
      const scanner = scannerRef.current as unknown as { applyVideoConstraints?: (constraints: MediaTrackConstraints) => Promise<void> };
      if (scanner.applyVideoConstraints) {
        await scanner.applyVideoConstraints({
          advanced: [{ torch: !torchOn } as unknown as MediaTrackConstraintSet],
        });
        setTorchOn(!torchOn);
      }
    } catch {
      // Torch not supported on device
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleScanData(manualCode.trim());
    setManualCode('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-proto-obsidian/85 backdrop-blur-md animate-in fade-in duration-200 font-mono-cyber">
      <div className="relative w-full max-w-lg bg-proto-base border-2 border-proto-signal/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-proto-mantle border-b border-proto-surface1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-proto-surface0 text-proto-signal">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-proto-text uppercase">
                {title}
              </h3>
              <p className="text-xs text-proto-subtext">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-proto-subtext hover:text-proto-text hover:bg-proto-surface0 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="relative aspect-square w-full bg-proto-obsidian flex items-center justify-center overflow-hidden">
          <div id={containerId} className="w-full h-full object-cover" />

          {/* Cyber Target Overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-64 border-2 border-dashed border-proto-signal/50 rounded-xl flex items-center justify-center">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-proto-signal" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-proto-signal" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-proto-signal" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-proto-signal" />

              {/* Animated Scan Line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-proto-signal to-transparent animate-pulse shadow-[0_0_8px_#00ff88]" />

              {/* Center Crosshair */}
              <div className="w-4 h-4 border border-proto-gold/40 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-proto-gold rounded-full" />
              </div>
            </div>
          </div>

          {/* Flashlight/Torch toggle */}
          <button
            onClick={toggleTorch}
            className={`absolute top-4 right-4 z-20 p-2.5 rounded-full border transition-all cursor-pointer ${
              torchOn
                ? 'bg-proto-gold text-proto-obsidian border-proto-gold'
                : 'bg-proto-base/80 text-proto-subtext border-proto-surface1 hover:text-proto-text'
            }`}
            title="Toggle Illuminator"
          >
            <Flashlight className="w-5 h-5" />
          </button>

          {/* Camera Permission Alert */}
          {errorMsg && (
            <div className="absolute inset-x-6 bottom-4 z-20 p-3 rounded-xl bg-proto-surface0/95 border border-proto-crimson/40 text-proto-crimson text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Manual Input Fallback & Controls */}
        <div className="p-4 bg-proto-mantle border-t border-proto-surface1 space-y-3">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Paste or type code (e.g. AGT-047 or NODE-ALPHA-QR)"
              className="flex-1 px-3 py-2 text-xs font-mono-cyber bg-proto-base border border-proto-surface1 rounded-lg text-proto-text focus:outline-none focus:border-proto-signal placeholder:text-proto-subtext/50 uppercase"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-proto-signal text-[#0a0f0d] rounded-lg hover:bg-[#00e676] transition-colors cursor-pointer"
            >
              Verify
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-proto-subtext">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-proto-signal animate-ping" />
              OPTICAL SENSOR ACTIVE
            </span>
            <span className="opacity-70">IEEE PROTOCOL SENSOR</span>
          </div>
        </div>
      </div>
    </div>
  );
};
