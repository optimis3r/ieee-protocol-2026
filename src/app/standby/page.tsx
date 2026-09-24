"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Frame, Panel } from "@/components/event/shared";
import confetti from "canvas-confetti";
import { soundEffects } from "@/lib/audio";
import {
  Clock,
  Radio,
  ArrowRight,
  ShieldAlert,
  MessageCircle,
  QrCode,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";

const TARGET_LAUNCH_DATE = new Date("2026-09-26T17:00:00+05:30").getTime();

function calculateTimeLeft() {
  const now = Date.now();
  const diff = Math.max(0, TARGET_LAUNCH_DATE - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast: diff === 0 };
}

export default function StandbyWaitingPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);
  const [publicState, setPublicState] = useState<{
    phase: string;
    deadline: string;
    whatsappUrl?: string;
  } | null>(null);
  const [currentAgent, setCurrentAgent] = useState<{
    id: string;
    name: string;
    checkedIn: boolean;
  } | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const hasTransitioned = useRef(false);

  // Countdown timer tick
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Poll event phase and auto-transition when game starts
  useEffect(() => {
    let live = true;

    async function checkPhase() {
      try {
        const pubRes = await fetch("/api/event?view=public", {
          cache: "no-store",
        });
        if (pubRes.ok) {
          const pub = await pubRes.json();
          if (!live) return;
          setPublicState(pub);

          const isActive = [
            "EVENT_ACTIVE",
            "SUBMISSIONS_OPEN",
            "EVENT_CLOSING",
          ].includes(pub.phase);

          if (isActive && !hasTransitioned.current) {
            hasTransitioned.current = true;
            setIsLaunching(true);
            soundEffects.playMasterDeductionFanfare();
            try {
              confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.5 },
                colors: ["#2d9f5d", "#c28b28", "#f4f1ea", "#c93b2b"],
              });
            } catch {}
            setTimeout(() => {
              if (live) {
                router.push("/play");
              }
            }, 1800);
          }
        }

        const agentRes = await fetch("/api/event", { cache: "no-store" });
        if (agentRes.ok) {
          const snap = await agentRes.json();
          if (live && snap.participant) {
            setCurrentAgent({
              id: snap.participant.id,
              name: snap.participant.name,
              checkedIn: snap.participant.checkedIn,
            });
          }
        }
      } catch {
        /* Reconnecting */
      }
    }

    void checkPhase();
    const pollId = setInterval(checkPhase, 3000);

    return () => {
      live = false;
      clearInterval(pollId);
    };
  }, [router]);

  return (
    <Frame
      title="Network Standby // Staging Docket"
      subtitle="The campus network is currently dormant. Operations initiate at 17:00 HRS IST."
    >
      {isLaunching && (
        <div className="event-notice border-[#2d9f5d] bg-[#16271c] text-[#a6da95] flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2d9f5d] animate-spin" />
            <span>
              <strong>NETWORK ACTIVATED:</strong> Initializing operative
              terminal…
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Big Countdown Clock & Status */}
        <div className="lg:col-span-7 space-y-6">
          <Panel title="Mission Initiation Countdown">
            <div className="py-4">
              <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center font-mono-tabular">
                <div className="p-3 sm:p-5 bg-[#141514] border border-[#2d312c] rounded-xs">
                  <span className="text-3xl sm:text-5xl font-bold text-[#c28b28] block">
                    {String(timeLeft.days).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#949e93] uppercase tracking-wider block mt-1">
                    DAYS
                  </span>
                </div>

                <div className="p-3 sm:p-5 bg-[#141514] border border-[#2d312c] rounded-xs">
                  <span className="text-3xl sm:text-5xl font-bold text-[#c28b28] block">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#949e93] uppercase tracking-wider block mt-1">
                    HOURS
                  </span>
                </div>

                <div className="p-3 sm:p-5 bg-[#141514] border border-[#2d312c] rounded-xs">
                  <span className="text-3xl sm:text-5xl font-bold text-[#c28b28] block">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#949e93] uppercase tracking-wider block mt-1">
                    MINS
                  </span>
                </div>

                <div className="p-3 sm:p-5 bg-[#141514] border border-[#2d312c] rounded-xs">
                  <span className="text-3xl sm:text-5xl font-bold text-[#c28b28] block">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#949e93] uppercase tracking-wider block mt-1">
                    SECS
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#2d312c] flex items-center justify-between text-xs font-mono-tabular text-[#949e93]">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-[#c28b28] animate-pulse" />
                <span>
                  PHASE:{" "}
                  <strong className="text-[#f4f1ea]">
                    {publicState?.phase?.replaceAll("_", " ") || "STANDBY"}
                  </strong>
                </span>
              </div>
              <span>AUTO-REFRESH ACTIVE</span>
            </div>
          </Panel>

          {/* Staging Instructions */}
          <Panel title="Operative Briefing">
            <div className="space-y-3 text-xs font-display-grotesk text-[#949e93] leading-relaxed">
              <p>
                Welcome, operative. When the countdown reaches zero and the
                operations desk signals <strong className="text-[#f4f1ea]">EVENT ACTIVE</strong>, this page will automatically unlock your mission HUD.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono-tabular text-[11px]">
                <div className="p-3 border border-[#2d312c] bg-[#141514]">
                  <span className="text-[#949e93] block text-[9px] uppercase">
                    STEP 01
                  </span>
                  <span className="text-[#f4f1ea] font-medium">
                    Register or sign in on this device.
                  </span>
                </div>
                <div className="p-3 border border-[#2d312c] bg-[#141514]">
                  <span className="text-[#949e93] block text-[9px] uppercase">
                    STEP 02
                  </span>
                  <span className="text-[#f4f1ea] font-medium">
                    Present QR pass at E&ICT C301 for your wristband.
                  </span>
                </div>
                <div className="p-3 border border-[#2d312c] bg-[#141514]">
                  <span className="text-[#949e93] block text-[9px] uppercase">
                    STEP 03
                  </span>
                  <span className="text-[#f4f1ea] font-medium">
                    Investigate campus nodes & exchange intel.
                  </span>
                </div>
                <div className="p-3 border border-[#2d312c] bg-[#141514]">
                  <span className="text-[#949e93] block text-[9px] uppercase">
                    STEP 04
                  </span>
                  <span className="text-[#f4f1ea] font-medium">
                    Submit Master Deduction before 20:00 HRS sharp.
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right Column: Operative Status & Channels */}
        <div className="lg:col-span-5 space-y-6">
          {currentAgent ? (
            <Panel title="Identified Operative">
              <div className="space-y-3 text-xs font-mono-tabular">
                <div className="flex justify-between items-center border-b border-[#2d312c] pb-2">
                  <span className="text-[#949e93]">OPERATIVE</span>
                  <span className="text-[#f4f1ea] font-bold">
                    {currentAgent.name}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-[#2d312c] pb-2">
                  <span className="text-[#949e93]">AGENT ID</span>
                  <span className="text-[#c28b28] font-bold">
                    {currentAgent.id}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-[#2d312c] pb-2">
                  <span className="text-[#949e93]">DESK STATUS</span>
                  <span
                    className={
                      currentAgent.checkedIn
                        ? "text-[#2d9f5d] font-bold"
                        : "text-[#c28b28] font-bold"
                    }
                  >
                    {currentAgent.checkedIn ? "CHECKED IN" : "PENDING GATE SCAN"}
                  </span>
                </div>

                <div className="pt-2 space-y-2">
                  <Link
                    href="/my-badge"
                    className="btn-editorial-primary w-full py-2.5 px-4 text-xs font-bold uppercase flex items-center justify-center gap-2 text-center"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View Official Pass</span>
                  </Link>
                </div>
              </div>
            </Panel>
          ) : (
            <Panel title="Operative Enlistment">
              <p className="text-xs text-[#949e93] leading-relaxed mb-4">
                Not enlisted yet? Register to receive your cryptographic agent
                pass and join the alternate reality game.
              </p>
              <div className="space-y-2">
                <Link
                  href="/register"
                  className="btn-editorial-primary w-full py-2.5 px-4 text-xs font-bold uppercase flex items-center justify-center gap-2 text-center"
                >
                  <span>Register as Operative</span>
                </Link>
                <Link
                  href="/login"
                  className="btn-editorial-outline w-full py-2 px-4 text-xs uppercase flex items-center justify-center gap-2 text-center font-mono-tabular"
                >
                  <span>Sign in with private pass</span>
                </Link>
              </div>
            </Panel>
          )}

          {/* Official Communications */}
          <Panel title="Official Transmission Line">
            <div className="space-y-3 text-xs text-[#949e93] leading-relaxed">
              <p>
                All official clues, campus announcements, and event updates are
                dispatched via the IEEE Protocol WhatsApp community.
              </p>

              {publicState?.whatsappUrl ? (
                <a
                  href={publicState.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-editorial-outline w-full py-2.5 px-4 text-xs uppercase flex items-center justify-center gap-2 text-center font-mono-tabular text-[#2fa596] hover:text-[#f4f1ea]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Join WhatsApp Field Channel</span>
                </a>
              ) : (
                <div className="p-2.5 border border-[#2d312c] bg-[#141514] text-[11px] font-mono-tabular">
                  The operations desk will publish the link shortly.
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </Frame>
  );
}
