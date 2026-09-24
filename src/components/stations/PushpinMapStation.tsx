"use client";

import React, { useState } from "react";
import type { PublicPuzzle, Progress } from "@/lib/event/types";
import { soundEffects } from "@/lib/audio";
import { Field } from "@/components/event/shared";
import {
  Compass,
  MapPin,
  Crosshair,
  Sparkles,
  Layers,
} from "lucide-react";

interface StationProps {
  node: PublicPuzzle;
  progress: Progress;
  answer: string;
  onAnswerChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled: boolean;
  busy: boolean;
  saved: boolean;
}

export function PushpinMapStation({
  node,
  progress,
  answer,
  onAnswerChange,
  onSubmit,
  disabled,
  busy,
  saved,
}: StationProps) {
  const [showOverlay, setShowOverlay] = useState(true);

  // Default coordinate geometry for the 3 pins on the physical corkboard
  const p1 = { x: 110, y: 70, label: "PIN ALPHA // LIBRARY TOWER" };
  const p2 = { x: 390, y: 80, label: "PIN BETA // ECE WAVEGUIDE" };
  const p3 = { x: 250, y: 220, label: "PIN GAMMA // SAC AMPHITHEATRE" };

  const centroid = {
    x: Math.round((p1.x + p2.x + p3.x) / 3),
    y: Math.round((p1.y + p2.y + p3.y) / 3),
  };

  // If node options are empty, provide fallback campus locations
  const options =
    node.options.length > 0
      ? node.options
      : [
          "B-BLOCK TERRACE AIR VENT",
          "ECE ACOUSTIC LAB",
          "CENTRAL LIBRARY ROOFTOP",
          "SAC AMPHITHEATRE STAGE",
          "C301 TRANSMITTER ROOM",
        ];

  return (
    <div className="space-y-6">
      {/* Tactical Radar / SVG Map Board */}
      <div className="border border-[#3f453f] bg-[#141514] p-5 sm:p-6 rounded-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#2d312c] pb-3">
          <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#9368b7]">
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: "16s" }} />
            <span className="font-bold tracking-wider">
              NIT WARANGAL // SECTOR TRIANGULATION RADAR
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowOverlay(!showOverlay);
              soundEffects.playKeystrokeBeep();
            }}
            className={`text-[10px] font-mono-tabular px-2.5 py-1 border transition-all ${
              showOverlay
                ? "bg-[#251f2d] border-[#9368b7] text-[#c6a0f6] font-bold"
                : "bg-[#1b1d1b] border-[#2d312c] text-[#949e93]"
            }`}
          >
            {showOverlay ? "STRING OVERLAY: ON" : "STRING OVERLAY: OFF"}
          </button>
        </div>

        {/* SVG Tactical Campus Radar Canvas */}
        <div className="relative bg-[#0c0e0c] border border-[#2d312c] rounded-xs p-2 overflow-hidden select-none">
          <svg viewBox="0 0 500 280" className="w-full h-auto">
            <defs>
              <pattern
                id="tactical-grid-pat"
                width="25"
                height="25"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 25 0 L 0 0 0 25"
                  fill="none"
                  stroke="#1c211c"
                  strokeWidth="0.8"
                />
              </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#tactical-grid-pat)" />

            {/* Radar concentric range rings */}
            <circle cx="250" cy="140" r="55" fill="none" stroke="#222b22" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="250" cy="140" r="110" fill="none" stroke="#222b22" strokeWidth="1" strokeDasharray="3 3" />

            {/* String overlay stretch simulation */}
            {showOverlay && (
              <g>
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#9368b7" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
                <line x1={p2.x} y1={p2.y} x2={p3.x} y2={p3.y} stroke="#9368b7" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
                <line x1={p3.x} y1={p3.y} x2={p1.x} y2={p1.y} stroke="#9368b7" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />

                {/* Medians to centroid */}
                <line x1={p1.x} y1={p1.y} x2={(p2.x + p3.x) / 2} y2={(p2.y + p3.y) / 2} stroke="#9368b7" strokeWidth="1" opacity="0.3" />
                <line x1={p2.x} y1={p2.y} x2={(p1.x + p3.x) / 2} y2={(p1.y + p3.y) / 2} stroke="#9368b7" strokeWidth="1" opacity="0.3" />
                <line x1={p3.x} y1={p3.y} x2={(p1.x + p2.x) / 2} y2={(p1.y + p2.y) / 2} stroke="#9368b7" strokeWidth="1" opacity="0.3" />

                {/* Centroid Crosshair Marker */}
                <circle cx={centroid.x} cy={centroid.y} r="12" fill="none" stroke="#2d9f5d" strokeWidth="1.5" className="animate-pulse" />
                <line x1={centroid.x - 16} y1={centroid.y} x2={centroid.x + 16} y2={centroid.y} stroke="#2d9f5d" strokeWidth="1.5" />
                <line x1={centroid.x} y1={centroid.y - 16} x2={centroid.x} y2={centroid.y + 16} stroke="#2d9f5d" strokeWidth="1.5" />
                <text x={centroid.x + 8} y={centroid.y - 8} fill="#2d9f5d" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  CENTROID (WHERE)
                </text>
              </g>
            )}

            {/* Pin 1 Alpha */}
            <circle cx={p1.x} cy={p1.y} r="6" fill="#c93b2b" stroke="#ffffff" strokeWidth="1.5" />
            <text x={p1.x - 20} y={p1.y - 10} fill="#c93b2b" fontSize="8" fontWeight="bold" fontFamily="monospace">
              ALPHA: LIBRARY
            </text>

            {/* Pin 2 Beta */}
            <circle cx={p2.x} cy={p2.y} r="6" fill="#3a8ebd" stroke="#ffffff" strokeWidth="1.5" />
            <text x={p2.x - 40} y={p2.y - 10} fill="#3a8ebd" fontSize="8" fontWeight="bold" fontFamily="monospace">
              BETA: ECE MAST
            </text>

            {/* Pin 3 Gamma */}
            <circle cx={p3.x} cy={p3.y} r="6" fill="#c28b28" stroke="#ffffff" strokeWidth="1.5" />
            <text x={p3.x - 30} y={p3.y + 18} fill="#c28b28" fontSize="8" fontWeight="bold" fontFamily="monospace">
              GAMMA: SAC
            </text>
          </svg>
        </div>

        <div className="text-[11px] font-mono-tabular text-[#949e93] leading-relaxed">
          Physical puzzle: Use a ruler and string across the 3 colored pushpins
          on the corkboard to determine the geometric center intersection point.
        </div>
      </div>

      {/* Answer Submission Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Your answer">
          <select
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={disabled}
            required
            className="font-mono-tabular text-sm"
          >
            <option value="">Select triangulated campus location…</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex items-center justify-between gap-3">
          <button
            type="submit"
            className="primary text-xs font-bold uppercase"
            disabled={disabled || busy || !answer}
          >
            <span>{busy ? "Validating…" : "Submit answer"}</span>
          </button>

          <small className="font-mono-tabular text-[11px] text-[#949e93]">
            {saved ? "Draft saved" : "Syncing…"}
            {node.attemptLimit
              ? ` · ${progress.attempts.length}/${node.attemptLimit} attempts`
              : " · Unlimited attempts"}
          </small>
        </div>
      </form>
    </div>
  );
}
