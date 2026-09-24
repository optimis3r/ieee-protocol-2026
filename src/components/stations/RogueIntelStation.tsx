"use client";

import React, { useState } from "react";
import type { PublicPuzzle, Progress } from "@/lib/event/types";
import { soundEffects } from "@/lib/audio";
import { Field } from "@/components/event/shared";
import { AlertTriangle, ShieldAlert, CheckCircle2, XCircle, FileWarning } from "lucide-react";

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

export function RogueIntelStation({
  node,
  progress,
  answer,
  onAnswerChange,
  onSubmit,
  disabled,
  busy,
  saved,
}: StationProps) {
  const [inspectDiscrepancy, setInspectDiscrepancy] = useState(false);

  const optionA = "AUTHORIZE AS VALID INTEL";
  const optionB = "FLAG AS FORGED / COMPROMISED";

  return (
    <div className="space-y-6">
      {/* Classified Leak Document Placard */}
      <div className="border border-[#3f453f] bg-[#141514] p-5 sm:p-6 rounded-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#2d312c] pb-3">
          <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#ed8796]">
            <FileWarning className="w-4 h-4 text-[#ed8796]" />
            <span className="font-bold tracking-wider">
              INTERCEPTED INTEL // VERIFICATION PROTOCOL
            </span>
          </div>

          <span className="editorial-stamp border-[#c93b2b] text-[#c93b2b]">
            1 ATTEMPT ONLY
          </span>
        </div>

        {/* Leaked Memo Document */}
        <div className="p-6 bg-[#181515] border border-[#3f2222] rounded-xs space-y-4 font-display-grotesk select-none relative overflow-hidden">
          {/* Top Red Stamp */}
          <div className="flex items-start justify-between border-b border-[#2d312c] pb-3 text-[10px] font-mono-tabular">
            <div>
              <div className="text-[#f4f1ea] font-bold">
                DOCUMENT CODE: LEAK-102-ALPHA
              </div>
              <div className="text-[#949e93]">CLEARANCE: COMPROMISED RELAY</div>
            </div>
            <span className="editorial-stamp border-[#c93b2b] text-[#c93b2b] font-bold">
              UNVERIFIED
            </span>
          </div>

          <div className="space-y-3 text-xs text-[#f4f1ea] leading-relaxed">
            <p>
              <strong className="text-[#c28b28] uppercase font-mono-tabular text-[11px] block mb-1">
                DISPATCH SUMMARY:
              </strong>
              “All field operatives are advised that the primary network payload
              assembly is scheduled for activation in{" "}
              <strong className="text-[#f4f1ea] underline underline-offset-4 decoration-[#c93b2b]">
                Room 102
              </strong>
              . Disregard prior acoustic intercepts.”
            </p>

            <div className="p-3 bg-[#120f0f] border border-[#2d1b1b] rounded-xs font-mono-tabular text-[11px] space-y-1 text-[#949e93]">
              <div>
                DATE MARKER:{" "}
                <span className="text-[#eed49f] font-bold">
                  Tuesday, September 26, 2026
                </span>
              </div>
              <div>
                AUTHORIZED SIGNATURE:{" "}
                <span className="text-[#eed49f] font-bold">
                  Agent M-88 (Signal Corps)
                </span>
              </div>
            </div>
          </div>

          {/* Forensic Analysis Toggle */}
          <div className="pt-2 border-t border-[#2d312c]">
            <button
              type="button"
              onClick={() => {
                setInspectDiscrepancy(!inspectDiscrepancy);
                soundEffects.playKeystrokeBeep();
              }}
              className="text-xs font-mono-tabular text-[#c28b28] hover:underline flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#c28b28]" />
              <span>
                {inspectDiscrepancy
                  ? "Hide Forensics Hints"
                  : "View Forensic Intelligence Clues"}
              </span>
            </button>

            {inspectDiscrepancy && (
              <div className="mt-3 p-3.5 bg-[#141514] border border-[#2d312c] rounded-xs text-[11px] font-mono-tabular space-y-2 text-[#949e93] animate-fade-in">
                <div className="flex items-start gap-2">
                  <span className="text-[#c93b2b] font-bold">ANOMALY 1:</span>
                  <span>
                    September 26, 2026 is a <strong>Saturday</strong>, not a Tuesday.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#c93b2b] font-bold">ANOMALY 2:</span>
                  <span>
                    Agent M-88 was officially flagged as terminated in the Node 05
                    personnel register.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* High-Stakes Decision Choice Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <span className="font-mono-tabular text-[11px] text-[#949e93] uppercase block font-bold">
          DETERMINE INTEL AUTHENTICITY // 1 ATTEMPT STRICT
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Option A: Authorize as Valid */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onAnswerChange(optionA);
              soundEffects.playKeystrokeBeep();
            }}
            className={`p-4 border text-left transition-all rounded-xs select-none ${
              answer === optionA
                ? "bg-[#2d1b1b] border-[#c93b2b] shadow-lg shadow-red-950/40"
                : "bg-[#181918] border-[#3f453f] hover:border-[#949e93]"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono-tabular text-[11px] font-bold text-[#c93b2b]">
                OPTION A
              </span>
              <XCircle className="w-4 h-4 text-[#c93b2b]" />
            </div>
            <div className="font-serif-editorial text-base font-bold text-[#f4f1ea] leading-tight">
              AUTHORIZE AS VALID INTEL
            </div>
            <div className="text-[10px] font-mono-tabular text-[#949e93] mt-2">
              Penalty if incorrect: −{node.penalty} PTS
            </div>
          </button>

          {/* Option B: Flag as Forged */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onAnswerChange(optionB);
              soundEffects.playKeystrokeBeep();
            }}
            className={`p-4 border text-left transition-all rounded-xs select-none ${
              answer === optionB
                ? "bg-[#16271c] border-[#2d9f5d] shadow-lg shadow-green-950/40"
                : "bg-[#181918] border-[#3f453f] hover:border-[#949e93]"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono-tabular text-[11px] font-bold text-[#2d9f5d]">
                OPTION B
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#2d9f5d]" />
            </div>
            <div className="font-serif-editorial text-base font-bold text-[#f4f1ea] leading-tight">
              FLAG AS FORGED / COMPROMISED
            </div>
            <div className="text-[10px] font-mono-tabular text-[#2d9f5d] mt-2">
              Reward if correct: +{node.points} PTS
            </div>
          </button>
        </div>

        <Field label="Your answer">
          <select
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={disabled}
            required
            className="font-mono-tabular text-sm"
          >
            <option value="">Select decision…</option>
            <option value={optionA}>{optionA}</option>
            <option value={optionB}>{optionB}</option>
          </select>
        </Field>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="submit"
            className="primary text-xs font-bold uppercase w-full sm:w-auto"
            disabled={disabled || busy || !answer}
          >
            <span>{busy ? "Executing Authorization…" : "Submit answer"}</span>
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
