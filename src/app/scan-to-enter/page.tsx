"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Frame, Panel, Field, api, credential } from "@/components/event/shared";
import { QRScannerModal } from "@/components/scanner/QRScannerModal";
import { soundEffects } from "@/lib/audio";
import { Camera, QrCode, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function ScanToEnterPage() {
  const router = useRouter();
  const [scanOpen, setScanOpen] = useState(true);
  const [manualCode, setManualCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = useCallback(
    async (raw: string) => {
      setBusy(true);
      setError("");
      soundEffects.playScanChirp();
      try {
        // If it's a direct station node URL, route there directly
        const nodeMatch = raw.match(/\/node\/([a-zA-Z0-9_-]+)/i);
        if (nodeMatch) {
          router.push(`/node/${nodeMatch[1]}`);
          return;
        }

        // Check if user accidentally scanned a peer interaction pass
        if (raw.includes("peer=")) {
          setError(
            "Scanned code is an operative interaction pass for handshakes. Scan your private login pass to authenticate.",
          );
          soundEffects.playErrorBuzz();
          setBusy(false);
          return;
        }

        const token = credential(raw, "login");
        if (!token) {
          throw new Error("Invalid pass format. Please scan a valid private login QR.");
        }

        await api("login", { token });
        soundEffects.playSuccessChime();
        router.push("/play");
      } catch (err) {
        soundEffects.playErrorBuzz();
        setError((err as Error).message || "Authentication failed. Pass may be rotated or invalid.");
        setBusy(false);
      }
    },
    [router],
  );

  return (
    <Frame
      title="Rapid Optical Access // Scan to Enter"
      subtitle="Present your physical badge or private QR to this terminal’s optical sensor."
    >
      <div style={{ maxWidth: 600 }}>
        <Panel title="Optical Viewfinder">
          {error && (
            <div className="event-notice event-error flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-[#949e93] leading-relaxed mb-6 font-display-grotesk">
            Align your private login QR code within the camera frame. The
            cybernetic reticle will automatically lock on and initialize your
            session.
          </p>

          <div className="space-y-4">
            <button
              type="button"
              className="btn-editorial-primary w-full py-3.5 px-4 text-xs font-bold uppercase flex items-center justify-center gap-2 text-center"
              onClick={() => setScanOpen(true)}
              disabled={busy}
            >
              <Camera className="w-4 h-4" />
              <span>Open Scanner Viewfinder</span>
            </button>

            {/* Fallback Manual Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleLogin(manualCode);
              }}
              className="pt-4 border-t border-[#2d312c] space-y-3"
            >
              <Field label="Or paste private token / link manually">
                <input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Paste login link or token..."
                  disabled={busy}
                  autoComplete="off"
                />
              </Field>

              <button
                type="submit"
                className="btn-editorial-outline w-full py-2.5 px-4 text-xs uppercase flex items-center justify-center gap-2 text-center font-mono-tabular"
                disabled={busy || !manualCode.trim()}
              >
                <span>Authorize Credentials</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-[#2d312c] flex justify-between text-[11px] font-mono-tabular text-[#949e93]">
            <Link href="/register" className="hover:text-[#f4f1ea] transition-colors">
              New operative? Register
            </Link>
            <Link href="/" className="hover:text-[#f4f1ea] transition-colors">
              Return home
            </Link>
          </div>
        </Panel>
      </div>

      <QRScannerModal
        isOpen={scanOpen}
        onClose={() => setScanOpen(false)}
        onScanSuccess={(result) => {
          setScanOpen(false);
          void handleLogin(result.raw);
        }}
        title="OPTICAL SENSOR SCANNER"
        subtitle="Align your private pass QR within frame"
      />
    </Frame>
  );
}
