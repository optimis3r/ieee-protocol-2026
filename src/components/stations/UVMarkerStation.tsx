"use client";

import React, { useState } from "react";
import type { PublicPuzzle, Progress } from "@/lib/event/types";
import { soundEffects } from "@/lib/audio";
import { Field } from "@/components/event/shared";
import {
  Lightbulb,
  Eye,
  KeyRound,
  RotateCw,
  Sparkles,
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

function caesarDecrypt(text: string, shift: number): string {
  return text
    .split("")
    .map((char) => {
      if (char >= "A" && char <= "Z") {
        const code = char.charCodeAt(0) - 65;
        const shifted = (code + shift + 26) % 26;
        return String.fromCharCode(shifted + 65);
      }
      return char;
    })
    .join("");
}

export function UVMarkerStation({
  node,
  progress,
  answer,
  onAnswerChange,
  onSubmit,
  disabled,
  busy,
  saved,
}: StationProps) {
  const [uvActive, setUvActive] = useState(false);
  const [shiftTester, setShiftTester] = useState(-3);

  const cipherText = "WKH SURWRFRO LV DOLYH";
  const decryptedPreview = caesarDecrypt(cipherText, shiftTester);

  return (
    <div className="space-y-6">
      {/* UV Blacklight Interactive Surface */}
      <div className="border border-[#3f453f] bg-[#141514] p-5 sm:p-6 rounded-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#2d312c] pb-3">
          <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#c6a0f6]">
            <Lightbulb className={`w-4 h-4 ${uvActive ? "text-[#c6a0f6]" : "text-[#949e93]"}`} />
            <span className="font-bold tracking-wider">
              UV FLUORESCENCE // 395nm SPECTRUM
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setUvActive(!uvActive);
              soundEffects.playKeystrokeBeep();
            }}
            className={`text-xs font-mono-tabular font-bold uppercase px-3 py-1.5 border transition-all ${
              uvActive
                ? "bg-[#351e44] border-[#c6a0f6] text-[#f4f1ea] shadow-lg shadow-purple-950/40"
                : "bg-[#212421] border-[#3f453f] text-[#949e93] hover:text-[#f4f1ea]"
            }`}
          >
            {uvActive ? "UV TORCH: ENGAGED" : "ACTIVATE UV TORCH"}
          </button>
        </div>

        {/* Poster Surface Canvas */}
        <div
          onClick={() => {
            setUvActive(!uvActive);
            soundEffects.playKeystrokeBeep();
          }}
          className={`relative p-8 rounded-xs border transition-all duration-500 cursor-pointer min-h-[140px] flex flex-col items-center justify-center text-center select-none ${
            uvActive
              ? "bg-[#110918] border-[#9368b7]/60 shadow-inner"
              : "bg-[#161816] border-[#2d312c]"
          }`}
        >
          {uvActive ? (
            <div className="space-y-2 animate-fade-in">
              <span className="text-[10px] font-mono-tabular uppercase tracking-widest text-[#c6a0f6] block">
                [LUMINESCENT INK FLUORESCING UNDER 395nm BEAM]
              </span>
              <div
                className="font-mono-tabular text-2xl sm:text-3xl font-bold tracking-widest text-[#f5c2e7] drop-shadow-[0_0_12px_rgba(198,160,246,0.8)]"
              >
                {cipherText}
              </div>
              <div className="text-[11px] font-mono-tabular text-[#c6a0f6] mt-2">
                CIPHER DIRECTIVE: Caesar Shift -3
              </div>
            </div>
          ) : (
            <div className="text-xs font-mono-tabular text-[#949e93] space-y-1">
              <Eye className="w-5 h-5 mx-auto text-[#4e564e]" />
              <div>Poster appears blank under ambient room lighting.</div>
              <div className="text-[10px] text-[#4e564e]">
                Click to aim tethered UV flashlight.
              </div>
            </div>
          )}
        </div>

        {/* Interactive Caesar Cipher Test Tool */}
        {uvActive && (
          <div className="pt-3 border-t border-[#2d312c] space-y-2 text-xs font-mono-tabular">
            <div className="flex items-center justify-between text-[11px] text-[#949e93]">
              <span>CIPHER TEST BENCH:</span>
              <span className="text-[#c28b28]">
                Shift: {shiftTester > 0 ? `+${shiftTester}` : shiftTester}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min="-6"
                max="6"
                value={shiftTester}
                onChange={(e) => setShiftTester(Number(e.target.value))}
                className="w-full accent-[#c6a0f6]"
              />
            </div>

            <div className="p-2.5 bg-[#141514] border border-[#2d312c] rounded-xs text-[11px] flex justify-between">
              <span className="text-[#949e93]">Decoded Plaintext:</span>
              <span
                className={
                  shiftTester === -3
                    ? "text-[#2d9f5d] font-bold"
                    : "text-[#f4f1ea]"
                }
              >
                {decryptedPreview}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Answer Submission Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Your answer">
          <input
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. Caesar -3"
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
