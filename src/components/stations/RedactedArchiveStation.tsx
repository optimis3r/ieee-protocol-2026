"use client";

import React, { useState } from "react";
import type { PublicPuzzle, Progress } from "@/lib/event/types";
import { soundEffects } from "@/lib/audio";
import { Field } from "@/components/event/shared";
import { Flashlight, Shield, User, FileText } from "lucide-react";

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

export function RedactedArchiveStation({
  node,
  progress,
  answer,
  onAnswerChange,
  onSubmit,
  disabled,
  busy,
  saved,
}: StationProps) {
  const [isIlluminated, setIsIlluminated] = useState(false);

  return (
    <div className="space-y-6">
      {/* Redacted Dossier Terminal */}
      <div className="border border-[#3f453f] bg-[#141514] p-5 sm:p-6 rounded-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#2d312c] pb-3">
          <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#d96b27]">
            <FileText className="w-4 h-4 text-[#d96b27]" />
            <span className="font-bold tracking-wider">
              ARCHIVE DOSSIER // DECLASSIFIED PERSONNEL LOG
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsIlluminated(!isIlluminated);
              soundEffects.playKeystrokeBeep();
            }}
            className={`text-xs font-mono-tabular font-bold uppercase px-3 py-1.5 border transition-all ${
              isIlluminated
                ? "bg-[#331c11] border-[#d96b27] text-[#f4f1ea] shadow-lg shadow-orange-950/40"
                : "bg-[#212421] border-[#3f453f] text-[#949e93] hover:text-[#f4f1ea]"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Flashlight className="w-3.5 h-3.5" />
              <span>{isIlluminated ? "BACKLIGHT: ACTIVE" : "SHINE FLASHLIGHT"}</span>
            </span>
          </button>
        </div>

        {/* Paper Document Surface */}
        <div
          onClick={() => {
            setIsIlluminated(!isIlluminated);
            soundEffects.playKeystrokeBeep();
          }}
          className={`p-6 rounded-xs border transition-all duration-300 select-none cursor-pointer relative overflow-hidden ${
            isIlluminated
              ? "bg-[#241d14] border-[#d96b27]/60 shadow-[inset_0_0_40px_rgba(217,107,39,0.25)]"
              : "bg-[#181a18] border-[#2d312c]"
          }`}
        >
          {/* Official Document Masthead */}
          <div className="flex items-start justify-between border-b border-[#3f453f] pb-3 mb-4 text-[10px] font-mono-tabular text-[#949e93]">
            <div>
              <div className="font-bold text-[#f4f1ea]">
                DEPARTMENT OF ECE // ARCHIVE FILE 2026-X
              </div>
              <div>SUBJECT: INTERNAL CLEARANCE ANOMALY</div>
            </div>
            <span className="editorial-stamp border-[#c93b2b] text-[#c93b2b]">
              CONFIDENTIAL
            </span>
          </div>

          <div className="space-y-3 text-xs font-display-grotesk text-[#949e93] leading-relaxed">
            <p>
              Operative audit conducted on 22 September 2026 logged suspicious
              packet relay activities originating from an unauthorized identity.
              The primary operative profile has been stricken from standard
              registers:
            </p>

            {/* The Redacted Marker Block */}
            <div className="py-2">
              <span className="text-[10px] font-mono-tabular uppercase tracking-wider text-[#949e93] block mb-1">
                PRIMARY ASSET IDENTITY:
              </span>

              <div
                className={`p-3.5 border transition-all duration-300 rounded-xs font-mono-tabular text-base sm:text-lg font-bold tracking-widest text-center ${
                  isIlluminated
                    ? "bg-[#352516] border-[#d96b27] text-[#eed49f] drop-shadow-[0_0_8px_rgba(238,212,159,0.8)]"
                    : "bg-[#0a0b0a] border-black text-black select-none"
                }`}
              >
                {isIlluminated ? "K. Sharma (K-24)" : "████████████████████"}
              </div>
            </div>

            <p className="text-[11px] text-[#949e93] pt-1 border-t border-[#2d312c] font-mono-tabular">
              {isIlluminated
                ? "Backlit phone flashlight reveals underlying printed ink beneath marker layer."
                : "Heavily obscured with black permanent marker. Click or press button to simulate flashlight backlighting."}
            </p>
          </div>
        </div>
      </div>

      {/* Answer Submission Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Your answer">
          <input
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. K-24 or K. Sharma"
            required
            maxLength={60}
            className="font-mono-tabular text-sm"
          />
        </Field>

        <div className="flex items-center justify-between gap-3">
          <button
            type="submit"
            className="primary text-xs font-bold uppercase"
            disabled={disabled || busy || !answer.trim()}
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
