"use client";

import React, { use, useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Frame, Panel, useEvent, time } from "@/components/event/shared";
import { soundEffects } from "@/lib/audio";
import {
  MapPin,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Radio,
  Sparkles,
  QrCode,
} from "lucide-react";

interface NodePageProps {
  params: Promise<{ id: string }>;
}

function normalizeNodeId(id: string): string {
  const clean = id.trim().toUpperCase();
  const matchNum = clean.match(/^(?:NODE-)?0?([1-7])(?:-[A-Z0-9_-]+)?$/i);
  if (matchNum) {
    return `NODE-0${matchNum[1]}`;
  }
  return clean;
}

export default function NodeStationPage({ params }: NodePageProps) {
  const resolvedParams = use(params);
  const targetNodeId = normalizeNodeId(resolvedParams.id);
  const router = useRouter();
  const { data, error, offline, busy, act } = useEvent();
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState("");
  const hasAutoStarted = useRef(false);

  const p = data?.participant;
  const targetNode = data?.nodes.find((n) => n.id === targetNodeId);
  const currentNode = data?.nodes.find((n) => n.id === p?.currentNode);
  const currentProgress = currentNode && p?.progress[currentNode.id];

  // Calculate elapsed time on current node for the 5-minute rule
  const now = Date.now();
  const elapsed = p?.activeSince
    ? Math.max(0, now - Date.parse(p.activeSince)) / 1000
    : 0;

  const currentSecondsSpent = currentProgress
    ? currentProgress.seconds + (p?.activeSince && !currentProgress.completedAt ? elapsed : 0)
    : 0;

  const lockRemaining = currentNode && currentProgress && !currentProgress.completedAt
    ? Math.max(0, currentNode.minSeconds - currentSecondsSpent)
    : 0;

  const canSwitch =
    !p?.currentNode ||
    p.currentNode === targetNodeId ||
    !currentProgress ||
    !!currentProgress.completedAt ||
    lockRemaining <= 0;

  // Auto-start node if user is checked in, can switch, and hasn't started it yet
  const handleStartNode = useCallback(async () => {
    if (!targetNode || !p?.checkedIn || !canSwitch || switching) return;
    setSwitching(true);
    setSwitchError("");
    try {
      if (p.currentNode !== targetNodeId) {
        await act("start", { nodeId: targetNodeId });
        soundEffects.playScanChirp();
      }
      router.push("/play");
    } catch (err) {
      setSwitchError((err as Error).message || "Could not switch to this Node.");
      setSwitching(false);
    }
  }, [targetNode, p, canSwitch, switching, targetNodeId, act, router]);

  useEffect(() => {
    if (
      p?.checkedIn &&
      targetNode &&
      canSwitch &&
      !hasAutoStarted.current &&
      p.currentNode !== targetNodeId
    ) {
      hasAutoStarted.current = true;
      void handleStartNode();
    }
  }, [p?.checkedIn, targetNode, canSwitch, targetNodeId, handleStartNode]);

  if (!data && !offline) {
    return (
      <Frame title="Scanning physical monolith…">
        <div className="event-notice">Accessing station terminal…</div>
      </Frame>
    );
  }

  // Case 1: Unauthenticated visitor
  if (!p) {
    return (
      <Frame
        title={`Physical Monolith // ${targetNodeId}`}
        subtitle="Tactical Field Station · Operative identification required to log attempt."
      >
        <div style={{ maxWidth: 640 }}>
          <Panel title="Monolith Secured">
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-[#2d312c] pb-3">
                <MapPin className="w-5 h-5 text-[#c28b28]" />
                <div>
                  <span className="font-mono-tabular text-[10px] text-[#949e93] uppercase block">
                    TARGET STATION
                  </span>
                  <span className="font-serif-editorial text-xl font-bold text-[#f4f1ea]">
                    {targetNode?.title || targetNodeId}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#949e93] leading-relaxed">
                You have reached a physical clue location on the NIT Warangal
                campus. Authenticate with your private operative pass to connect
                this terminal to your clearance docket.
              </p>

              <div className="pt-2 space-y-2.5">
                <Link
                  href={`/login#redirect=/node/${targetNodeId}`}
                  className="btn-editorial-primary w-full py-3 px-4 text-xs font-bold uppercase flex items-center justify-center gap-2 text-center"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Scan Private Pass to Enter</span>
                </Link>

                <Link
                  href="/register"
                  className="btn-editorial-outline w-full py-2.5 px-4 text-xs uppercase flex items-center justify-center gap-2 text-center font-mono-tabular"
                >
                  <span>Enlist as New Operative</span>
                </Link>
              </div>
            </div>
          </Panel>
        </div>
      </Frame>
    );
  }

  // Case 2: Authenticated but not checked in at desk
  if (!p.checkedIn) {
    return (
      <Frame
        title={`Physical Monolith // ${targetNodeId}`}
        subtitle="Gate verification required before physical clue interaction."
      >
        <div style={{ maxWidth: 640 }}>
          <Panel title="Desk Check-in Required">
            <div className="event-notice event-error flex items-start gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                You have not checked in at the operations desk. Physical station
                terminals remain locked until gate check is complete.
              </span>
            </div>

            <p className="text-xs text-[#949e93] leading-relaxed mb-6 font-display-grotesk">
              Head to <strong className="text-[#f4f1ea]">Dept of ECE, Room C301</strong>.
              Present your QR pass to the operator to receive your physical
              wristband and activate active gameplay telemetry.
            </p>

            <Link
              href="/my-badge"
              className="btn-editorial-primary w-full py-3 px-4 text-xs font-bold uppercase flex items-center justify-center gap-2 text-center"
            >
              <QrCode className="w-4 h-4" />
              <span>Open Desk Check-in Pass</span>
            </Link>
          </Panel>
        </div>
      </Frame>
    );
  }

  // Case 3: Station already completed
  const targetProgress = p.progress[targetNodeId];
  if (targetProgress?.completedAt) {
    return (
      <Frame
        title={`${targetNode?.title || targetNodeId} // Completed`}
        subtitle="You have already extracted the intelligence fragment from this monolith."
      >
        <div style={{ maxWidth: 640 }}>
          <Panel title="Monolith Decoded">
            <div className="event-notice border-[#2d9f5d] bg-[#16271c] text-[#a6da95] flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-[#2d9f5d] shrink-0" />
              <span>
                <strong>INTEL RECOVERED:</strong> {targetProgress.clue || "Completed"}
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono-tabular text-[#949e93]">
              <div className="flex justify-between py-1 border-b border-[#2d312c]">
                <span>Points Earned</span>
                <span className="text-[#f4f1ea] font-bold">
                  +{targetProgress.points} PTS
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2d312c]">
                <span>Solved At</span>
                <span className="text-[#f4f1ea]">
                  {new Date(targetProgress.completedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/play"
                className="btn-editorial-primary w-full py-3 px-4 text-xs font-bold uppercase flex items-center justify-center gap-2 text-center"
              >
                <span>Return to Mission HUD</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Panel>
        </div>
      </Frame>
    );
  }

  // Case 4: 5-Minute Station Switch Lock Engaged
  if (!canSwitch && currentNode) {
    return (
      <Frame
        title="Station Lockout // 5-Minute Rule"
        subtitle="Section 10.2: Minimum five-minute engagement rule is currently active."
      >
        <div style={{ maxWidth: 640 }}>
          <Panel title="Switching Lockout Active">
            <div className="event-notice flex items-start gap-2 mb-4">
              <Lock className="w-4 h-4 text-[#c28b28] shrink-0 mt-0.5" />
              <span>
                You are currently assigned to{" "}
                <strong className="text-[#f4f1ea]">
                  {currentNode.id}: {currentNode.title}
                </strong>
                . You must remain on that station for at least 5 minutes before
                attempting a different puzzle.
              </span>
            </div>

            <div className="p-4 bg-[#141514] border border-[#2d312c] rounded-xs text-center space-y-1 mb-6">
              <span className="font-mono-tabular text-[10px] text-[#949e93] uppercase block">
                TIME REMAINING UNTIL SWITCH ALLOWED
              </span>
              <span className="font-mono-tabular text-3xl font-bold text-[#c28b28]">
                {time(lockRemaining)}
              </span>
            </div>

            <div className="space-y-3">
              <Link
                href="/play"
                className="btn-editorial-primary w-full py-3 px-4 text-xs font-bold uppercase flex items-center justify-center gap-2 text-center"
              >
                <span>Return to Current Station ({currentNode.id})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Panel>
        </div>
      </Frame>
    );
  }

  // Case 5: Ready to Engage Station
  return (
    <Frame
      title={`Engaging ${targetNode?.title || targetNodeId}`}
      subtitle="Connecting operative terminal to physical monolith circuit…"
    >
      <div style={{ maxWidth: 640 }}>
        <Panel title="Monolith Link">
          {switchError && (
            <div className="event-notice event-error mb-4">{switchError}</div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#2d9f5d]">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>MONOLITH SIGNAL ACQUIRED • READY TO DEPLOY</span>
            </div>

            <p className="text-xs text-[#949e93] leading-relaxed">
              Entering this station will initiate your active 5-minute
              engagement timer for <strong className="text-[#f4f1ea]">{targetNode?.title || targetNodeId}</strong>.
            </p>

            <button
              type="button"
              onClick={() => void handleStartNode()}
              disabled={busy || switching}
              className="btn-editorial-primary w-full py-3.5 px-4 text-xs font-bold uppercase flex items-center justify-center gap-2 text-center"
            >
              <Sparkles className="w-4 h-4" />
              <span>{switching ? "Connecting…" : "Launch Station Terminal"}</span>
            </button>
          </div>
        </Panel>
      </div>
    </Frame>
  );
}
