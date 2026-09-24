"use client";

import React, { useState } from "react";
import type { PublicPuzzle, Progress } from "@/lib/event/types";
import { soundEffects } from "@/lib/audio";
import { Field } from "@/components/event/shared";
import { Mail, Key, Sparkles, UserCheck, Delete } from "lucide-react";

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

export function DeadDropStation({
  node,
  progress,
  answer,
  onAnswerChange,
  onSubmit,
  disabled,
  busy,
  saved,
}: StationProps) {
  const [envelopeOpen, setEnvelopeOpen] = useState(false);

  const handleDigit = (digit: string) => {
    if (disabled || answer.length >= 4) return;
    soundEffects.playKeystrokeBeep();
    onAnswerChange(answer + digit);
  };

  const handleBackspace = () => {
    if (disabled || answer.length === 0) return;
    soundEffects.playKeystrokeBeep();
    onAnswerChange(answer.slice(0, -1));
  };

  return (
    <div className="space-y-6">
      {/* Operative Contact Dossier */}
      <div className="border border-[#3f453f] bg-[#141514] p-5 sm:p-6 rounded-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#2d312c] pb-3">
          <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#2fa596]">
            <UserCheck className="w-4 h-4 text-[#2fa596]" />
            <span className="font-bold tracking-wider">
              HUMINT CONTACT PROTOCOL // DEAD DROP HANDLER
            </span>
          </div>

          <span className="editorial-stamp border-[#2fa596] text-[#2fa596]">
            SOCIAL
          </span>
        </div>

        {/* Tactical Contact Card */}
        <div className="p-4 bg-[#181d1b] border border-[#2d312c] rounded-xs space-y-3 text-xs font-display-grotesk text-[#949e93] leading-relaxed">
          <div className="flex items-start gap-3">
            <div className="p-2 border border-[#2fa596]/40 bg-[#121c17] rounded-xs shrink-0 text-[#2fa596]">
              <Mail className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <span className="font-mono-tabular text-[10px] text-[#949e93] uppercase block font-bold">
                VOLUNTEER IDENTIFICATION PROFILE:
              </span>
              <p className="text-[#f4f1ea]">
                Locate the handler operative wearing a{" "}
                <strong className="text-[#eed49f]">YELLOW LANYARD</strong> and carrying a{" "}
                <strong className="text-[#a6da95]">GREEN PEN</strong>.
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#111614] border border-[#202924] rounded-xs font-mono-tabular text-xs space-y-1">
            <span className="text-[10px] text-[#949e93] uppercase block">
              VERBAL RECOGNITION CHALLENGE:
            </span>
            <div className="text-sm font-bold text-[#f4f1ea] italic">
              “The packet dropped at midnight.”
            </div>
          </div>

          {/* Interactive Envelope Graphic */}
          <div
            onClick={() => {
              setEnvelopeOpen(!envelopeOpen);
              soundEffects.playKeystrokeBeep();
            }}
            className="p-4 border border-[#3f453f] bg-[#141514] rounded-xs cursor-pointer select-none text-center space-y-2 hover:border-[#2fa596] transition-colors"
          >
            <span className="text-[10px] font-mono-tabular text-[#2fa596] uppercase tracking-wider block font-bold">
              {envelopeOpen
                ? "[ENVELOPE UNSEALED // ENTER 4-DIGIT PIN]"
                : "[CLICK TO INSPECT SEALED HANDLER ENVELOPE]"}
            </span>

            {envelopeOpen ? (
              <div className="text-xs font-mono-tabular text-[#eed49f]">
                Inside envelope: A card with four perforated digits. Enter the PIN below.
              </div>
            ) : (
              <div className="text-xs font-mono-tabular text-[#949e93]">
                Sealed wax document packet issued by the Dead Drop Handler.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tactile 4-Digit PIN Tumbler Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <span className="font-mono-tabular text-[11px] text-[#949e93] uppercase block mb-2 font-bold flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-[#2fa596]" />
            <span>FOUR-DIGIT ENVELOPE PIN</span>
          </span>

          {/* PIN Digit Boxes Display */}
          <div className="flex items-center justify-center gap-3 py-2">
            {[0, 1, 2, 3].map((index) => {
              const digit = answer[index];
              return (
                <div
                  key={index}
                  className={`w-14 h-16 border-2 rounded-xs flex items-center justify-center text-2xl font-mono-tabular font-bold select-none ${
                    digit
                      ? "border-[#2fa596] bg-[#1a2520] text-[#a6da95]"
                      : "border-[#3f453f] bg-[#141514] text-[#4e564e]"
                  }`}
                >
                  {digit || "–"}
                </div>
              );
            })}
          </div>

          <Field label="Your answer">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
              disabled={disabled}
              placeholder="Enter 4-digit PIN"
              className="font-mono-tabular text-center tracking-widest text-lg"
              autoComplete="off"
            />
          </Field>

          {/* Tactile On-Screen Numeric Keypad */}
          <div className="max-w-[280px] mx-auto pt-3">
            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={disabled || answer.length >= 4}
                  onClick={() => handleDigit(num)}
                  className="py-3 bg-[#1b1d1b] border border-[#3f453f] hover:border-[#2fa596] text-[#f4f1ea] font-mono-tabular text-base font-bold transition-all active:scale-95 disabled:opacity-40"
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                disabled={disabled || answer.length === 0}
                onClick={() => onAnswerChange("")}
                className="py-3 bg-[#141514] border border-[#3f453f] text-[#949e93] hover:text-[#f4f1ea] font-mono-tabular text-xs uppercase"
              >
                Clear
              </button>

              <button
                type="button"
                disabled={disabled || answer.length >= 4}
                onClick={() => handleDigit("0")}
                className="py-3 bg-[#1b1d1b] border border-[#3f453f] hover:border-[#2fa596] text-[#f4f1ea] font-mono-tabular text-base font-bold transition-all active:scale-95 disabled:opacity-40"
              >
                0
              </button>

              <button
                type="button"
                disabled={disabled || answer.length === 0}
                onClick={handleBackspace}
                className="py-3 bg-[#141514] border border-[#3f453f] text-[#949e93] hover:text-[#f4f1ea] font-mono-tabular flex items-center justify-center"
              >
                <Delete className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="submit"
            className="primary text-xs font-bold uppercase w-full sm:w-auto"
            disabled={disabled || busy || answer.length !== 4}
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
