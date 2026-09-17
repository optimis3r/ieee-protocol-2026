'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { Camera, X, Flashlight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
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
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualCode, setManualCode] = useState('');

  // Parse QR content using required regex rules
  const parseScannedText = useCallback((text: string): ScanResult => {
    const trimmed = text.trim();

    // 1. Check for signed URL query params e.g. /play?agent_id=AGT-1234&token=tok_abc
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

    // 2. Check for Badge Pattern: AGT-[A-Z0-9]{4,8}
    const badgeMatch = trimmed.match(/\b(AGT-[A-Z0-9]{4,8})\b/i);
    if (badgeMatch) {
      return {
        raw: trimmed,
        type: 'BADGE',
        id: badgeMatch[1].toUpperCase(),
      };
    }

    // 3. Check for Node Pattern: NODE-[A-Z0-9_-]+ or /node/[id]
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
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .then(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          });
      }
      setTorchOn(false);
      setErrorMsg(null);
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        // Small delay to ensure modal DOM is mounted
        await new Promise((r) => setTimeout(r, 150));
        if (!isMounted) return;

        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;

        const config: Html5QrcodeCameraScanConfig = {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        };

        await scanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            handleScanData(decodedText);
          },
          () => {
            // Frame scan miss, normal
          }
        );

        if (isMounted) {
          setHasPermission(true);
          setErrorMsg(null);
        }
      } catch (err: unknown) {
        console.warn('Camera start issue:', err);
        if (isMounted) {
          setHasPermission(false);
          setErrorMsg('Camera access unavailable. You can enter or paste the code manually below.');
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
      const scanner = scannerRef.current as any;
      if (scanner.applyVideoConstraints) {
        await scanner.applyVideoConstraints({
          advanced: [{ torch: !torchOn }],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cat-crust/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-cat-base border border-cat-surface1 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-cat-mantle border-b border-cat-surface0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cat-surface0 text-cat-sapphire">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wider text-cat-text uppercase font-mono-cyber">
                {title}
              </h3>
              <p className="text-xs text-cat-subtext">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-cat-subtext hover:text-cat-red hover:bg-cat-surface0 rounded-lg transition-colors"
            title="Abort Scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="relative aspect-square w-full bg-cat-crust overflow-hidden flex items-center justify-center">
          {/* HTML5 QR Container */}
          <div id={containerId} className="w-full h-full object-cover" />

          {/* Cyber Target Overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-64 border-2 border-dashed border-cat-sapphire/50 rounded-xl flex items-center justify-center">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-cat-sapphire" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-cat-sapphire" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-cat-sapphire" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-cat-sapphire" />

              {/* Animated Scan Line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cat-green to-transparent animate-pulse shadow-[0_0_8px_#a6da95]" />

              {/* Center Crosshair */}
              <div className="w-4 h-4 border border-cat-mauve/40 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-cat-mauve rounded-full" />
              </div>
            </div>
          </div>

          {/* Flashlight/Torch toggle */}
          <button
            onClick={toggleTorch}
            className={`absolute top-4 right-4 z-20 p-2.5 rounded-full border transition-all ${
              torchOn
                ? 'bg-cat-yellow text-cat-base border-cat-yellow'
                : 'bg-cat-base/80 text-cat-subtext border-cat-surface1 hover:text-cat-text'
            }`}
            title="Toggle Illuminator"
          >
            <Flashlight className="w-5 h-5" />
          </button>

          {/* Camera Permission Alert */}
          {errorMsg && (
            <div className="absolute inset-x-6 bottom-4 z-20 p-3 rounded-xl bg-cat-surface0/90 border border-cat-peach/40 text-cat-peach text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Manual Input Fallback & Controls */}
        <div className="p-4 bg-cat-mantle border-t border-cat-surface0 space-y-3">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Paste or type code (e.g. AGT-TURING or NODE-ALPHA-QR)"
              className="flex-1 px-3 py-2 text-xs font-mono-cyber bg-cat-base border border-cat-surface1 rounded-lg text-cat-text focus:outline-none focus:border-cat-sapphire placeholder:text-cat-subtext/50"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-cat-sapphire text-cat-crust rounded-lg hover:bg-cat-sapphire/90 transition-colors"
            >
              Verify
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-cat-subtext">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cat-green animate-ping" />
              OPTICAL FEED ACTIVE
            </span>
            <span className="font-mono-cyber opacity-70">IEEE PROTOCOL SENSOR</span>
          </div>
        </div>
      </div>
    </div>
  );
};
