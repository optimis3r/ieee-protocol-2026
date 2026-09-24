"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Frame, Panel, QR, useEvent, api } from "@/components/event/shared";
import confetti from "canvas-confetti";
import { soundEffects } from "@/lib/audio";
import {
  Shield,
  CheckCircle2,
  Clock,
  QrCode,
  ArrowRight,
  Printer,
  LogOut,
  UserCheck,
  AlertTriangle,
  Radio,
} from "lucide-react";

export default function MyBadgePage() {
  const router = useRouter();
  const { data, error, offline, refresh } = useEvent();
  const [origin, setOrigin] = useState("");
  const prevCheckedIn = useRef<boolean | null>(null);
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setOrigin(window.location.origin));
  }, []);

  const p = data?.participant;

  // Sound and transition notification when desk checks in the player
  useEffect(() => {
    if (p) {
      if (prevCheckedIn.current === false && p.checkedIn === true) {
        soundEffects.playSuccessChime();
        setJustCheckedIn(true);
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#2d9f5d", "#c28b28", "#f4f1ea"],
          });
        } catch {}
      }
      prevCheckedIn.current = p.checkedIn;
    }
  }, [p]);

  if (!data && !offline) {
    return (
      <Frame title="Retrieving operative credential…">
        <div className="event-notice">Accessing secure identity records…</div>
      </Frame>
    );
  }

  if (!p) {
    return (
      <Frame
        title="Operative Pass Retrieval"
        subtitle="No active operative session detected on this device."
      >
        <div style={{ maxWidth: 580 }}>
          <Panel title="Identity Required">
            <p className="text-sm text-[#949e93] leading-relaxed mb-6">
              To present your badge or check in at the desk, authenticate using
              your private login pass or register as a new operative.
            </p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="btn-editorial-primary w-full py-3 px-4 text-xs font-bold uppercase flex items-center justify-center gap-2 text-center"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan Private Login Pass</span>
              </Link>
              <Link
                href="/register"
                className="btn-editorial-outline w-full py-2.5 px-4 text-xs uppercase flex items-center justify-center gap-2 text-center font-mono-tabular"
              >
                <span>Register New Operative</span>
              </Link>
            </div>
          </Panel>
        </div>
      </Frame>
    );
  }

  const solvedCount = Object.values(p.progress).filter(
    (pr) => pr.completedAt,
  ).length;

  return (
    <Frame
      title={`Pass Docket // Agent ${p.id.replace("AGT-", "")}`}
      subtitle="Official Field Credential · Present at operations desk for verification and physical wristband."
    >
      {justCheckedIn && (
        <div className="event-notice border-[#2d9f5d] bg-[#16271c] text-[#a6da95] flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2d9f5d] shrink-0" />
            <span>
              <strong>CHECK-IN CONFIRMED:</strong> You are now authorized for
              field operations!
            </span>
          </div>
          <Link
            href="/play"
            className="btn-editorial-primary py-1.5 px-3 text-xs font-bold uppercase shrink-0"
          >
            Launch Terminal
          </Link>
        </div>
      )}

      {error && <div className="event-notice event-error">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Physical Pass Mockup (Printable Card) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border-2 border-[#3f453f] bg-[#1b1d1b] p-6 sm:p-8 rounded-sm shadow-2xl relative overflow-hidden print:border-black print:text-black print:bg-white">
            {/* Top Badge Ribbon */}
            <div className="flex items-start justify-between gap-4 border-b-2 border-[#2d312c] pb-4 mb-6">
              <div>
                <span className="font-mono-tabular text-[10px] text-[#949e93] uppercase tracking-widest block">
                  NIT WARANGAL • IEEE STUDENT BRANCH
                </span>
                <span className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#f4f1ea] block">
                  {p.name}
                </span>
                <div className="font-mono-tabular text-xs text-[#c28b28] mt-1 font-bold">
                  {p.id} • ROLL: {p.roll}
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`editorial-stamp font-mono-tabular ${
                    p.checkedIn
                      ? "border-[#2d9f5d] text-[#2d9f5d]"
                      : "border-[#c28b28] text-[#c28b28]"
                  }`}
                >
                  {p.checkedIn ? "DESK: ACTIVE" : "DESK: PENDING"}
                </span>
                <span className="text-[10px] font-mono-tabular text-[#949e93] block mt-1">
                  26 SEPT 2026
                </span>
              </div>
            </div>

            {/* Central Pass Graphic: Scannable Interaction QR */}
            <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
              <div className="shrink-0 bg-white p-3 rounded-xs border-2 border-[#3f453f] shadow-inner">
                {origin && (
                  <QR
                    value={`${origin}/play#peer=${p.socialToken}`}
                    label={`${p.id} interaction pass`}
                  />
                )}
              </div>

              <div className="space-y-3 text-xs font-mono-tabular flex-1 w-full">
                <div className="p-3 bg-[#141514] border border-[#2d312c] rounded-xs space-y-1">
                  <div className="text-[10px] text-[#949e93] uppercase">
                    PASS USAGE
                  </div>
                  <div className="text-[#f4f1ea]">
                    Present this public QR code to the operations desk for gate
                    entry and to other operatives for data handshakes.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 border border-[#2d312c] bg-[#141514]">
                    <span className="text-[#949e93] block text-[9px]">
                      CLEARANCE
                    </span>
                    <span className="text-[#c28b28] font-bold text-sm">
                      {p.score} PTS
                    </span>
                  </div>
                  <div className="p-2 border border-[#2d312c] bg-[#141514]">
                    <span className="text-[#949e93] block text-[9px]">
                      NODES SOLVED
                    </span>
                    <span className="text-[#2d9f5d] font-bold text-sm">
                      {solvedCount} / 7
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Check-in Status Notice */}
            <div className="mt-6 pt-4 border-t border-[#2d312c] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs">
                {p.checkedIn ? (
                  <>
                    <UserCheck className="w-4 h-4 text-[#2d9f5d]" />
                    <span className="text-[#2d9f5d] font-semibold">
                      Officially checked in at operations desk.
                    </span>
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4 text-[#c28b28] animate-pulse" />
                    <span className="text-[#c28b28]">
                      Awaiting QR scan at E&ICT C301 desk…
                    </span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="btn-editorial-outline py-1.5 px-3 text-[11px] font-mono-tabular flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pass</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Private Credentials */}
        <div className="lg:col-span-5 space-y-6">
          <Panel title="Operations Directive">
            <div className="space-y-4 text-xs font-display-grotesk text-[#949e93] leading-relaxed">
              <p>
                Keep this screen open when approaching the event desk. Once the
                operator scans your badge, your clearance activates
                automatically.
              </p>

              <div className="space-y-2">
                {p.checkedIn ? (
                  <Link
                    href="/play"
                    className="btn-editorial-primary w-full py-3 px-4 text-xs font-bold uppercase flex items-center justify-center gap-2 text-center"
                  >
                    <span>Enter Mission Terminal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="p-3 border border-[#c28b28]/40 bg-[#1e1c14] text-[#eed49f] rounded-xs text-[11px]">
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>GATE CHECK REQUIRED</span>
                    </div>
                    You cannot solve Nodes or submit deduction hypotheses until
                    your wristband is issued at E&ICT C301.
                  </div>
                )}

                <Link
                  href="/play"
                  className="btn-editorial-outline w-full py-2.5 px-4 text-xs uppercase flex items-center justify-center gap-1.5 text-center font-mono-tabular"
                >
                  <span>Open Full HUD</span>
                </Link>
              </div>
            </div>
          </Panel>

          <Panel title="Private Login Key">
            <p className="text-xs text-[#949e93] mb-3 leading-relaxed">
              This private link grants instant login access to your account from
              any other device. Do not display this to other participants.
            </p>

            <details className="text-xs font-mono-tabular space-y-3">
              <summary className="cursor-pointer text-[#c28b28] hover:underline font-bold py-1">
                Reveal Private QR Code
              </summary>
              <div className="p-4 bg-[#141514] border border-[#2d312c] rounded-xs mt-2">
                {origin && (
                  <QR
                    value={`${origin}/login#login=${p.token}`}
                    label={`${p.id} Private Login Key`}
                  />
                )}
                <div className="text-[10px] text-[#949e93] mt-2 break-all select-all">
                  {origin}/login#login={p.token}
                </div>
              </div>
            </details>

            <div className="pt-4 mt-4 border-t border-[#2d312c]">
              <button
                type="button"
                onClick={async () => {
                  await api("logout");
                  router.push("/login");
                }}
                className="text-xs text-[#c93b2b] hover:text-[#f4f1ea] flex items-center gap-1.5 transition-colors font-mono-tabular"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect session from this browser</span>
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </Frame>
  );
}
