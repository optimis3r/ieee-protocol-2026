"use client";

import React, { useState } from "react";
import type { PublicPuzzle, Progress } from "@/lib/event/types";
import { soundEffects } from "@/lib/audio";
import { Field } from "@/components/event/shared";
import { Eye, Grid, Sparkles, KeyRound } from "lucide-react";

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

export function RedFilterStation({
  node,
  progress,
  answer,
  onAnswerChange,
  onSubmit,
  disabled,
  busy,
  saved,
}: StationProps) {
  const [activeTab, setActiveTab] = useState<"RED_FILTER" | "CARDAN_GRILLE">(
    "RED_FILTER",
  );
  const [filterEngaged, setFilterEngaged] = useState(false);

  const cipherText = "EBVSDVV SURWRFRO DOSKD";
  const denseBlock = "B Y P A S S P R O T O C O L A L P H A 2 0 2 6";
  const letters = denseBlock.split(" ").filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Submode Switcher Tabs */}
      <div className="flex items-center gap-2 border border-[#2d312c] bg-[#141514] p-1 rounded-xs">
        <button
          type="button"
          onClick={() => {
            setActiveTab("RED_FILTER");
            soundEffects.playKeystrokeBeep();
          }}
          className={`flex-1 py-1.5 px-3 text-xs font-mono-tabular font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "RED_FILTER"
              ? "bg-[#2d1b1b] border border-[#c93b2b] text-[#f4f1ea]"
              : "text-[#949e93] hover:text-[#f4f1ea]"
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-[#c93b2b]" />
          <span>OPTICAL RED FILTER (650nm)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("CARDAN_GRILLE");
            soundEffects.playKeystrokeBeep();
          }}
          className={`flex-1 py-1.5 px-3 text-xs font-mono-tabular font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "CARDAN_GRILLE"
              ? "bg-[#2d251b] border border-[#c28b28] text-[#f4f1ea]"
              : "text-[#949e93] hover:text-[#f4f1ea]"
          }`}
        >
          <Grid className="w-3.5 h-3.5 text-[#c28b28]" />
          <span>SLOTTED CARDAN GRILLE</span>
        </button>
      </div>

      {/* Tab 1: Optical Red Filter Simulation */}
      {activeTab === "RED_FILTER" ? (
        <div className="border border-[#3f453f] bg-[#141514] p-5 sm:p-6 rounded-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#2d312c] pb-3">
            <span className="text-xs font-mono-tabular font-bold text-[#c93b2b] uppercase tracking-wider">
              CHROMATIC CAMOUFLAGE PLACARD
            </span>

            <button
              type="button"
              onClick={() => {
                setFilterEngaged(!filterEngaged);
                soundEffects.playKeystrokeBeep();
              }}
              className={`text-xs font-mono-tabular font-bold uppercase px-3 py-1.5 border transition-all ${
                filterEngaged
                  ? "bg-[#c93b2b] border-[#c93b2b] text-[#f4f1ea]"
                  : "bg-[#212421] border-[#3f453f] text-[#949e93] hover:text-[#f4f1ea]"
              }`}
            >
              {filterEngaged
                ? "RED SHEET: ENGAGED"
                : "ENGAGE RED ACRYLIC SHEET"}
            </button>
          </div>

          {/* Optical Poster Surface */}
          <div
            onClick={() => {
              setFilterEngaged(!filterEngaged);
              soundEffects.playKeystrokeBeep();
            }}
            className={`relative p-8 rounded-xs border overflow-hidden min-h-[160px] flex items-center justify-center select-none cursor-pointer transition-all duration-300 ${
              filterEngaged
                ? "bg-[#330c0c] border-[#c93b2b]/60"
                : "bg-[#181111] border-[#2d312c]"
            }`}
          >
            {/* Visual Noise Pattern */}
            {!filterEngaged && (
              <div className="absolute inset-0 flex flex-wrap opacity-60 pointer-events-none">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1/4 h-8 border-t border-r rotate-6"
                    style={{
                      borderColor: i % 2 === 0 ? "#ef4444" : "#22c55e",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Hidden Blue Text revealed under red optical filter */}
            <div
              className={`font-mono-tabular text-xl sm:text-2xl font-bold tracking-widest transition-all duration-300 z-10 text-center ${
                filterEngaged
                  ? "text-[#8aadf4] drop-shadow-[0_0_10px_rgba(138,173,244,0.9)] opacity-100"
                  : "text-[#d24c3a] blur-[2px] opacity-40 select-none"
              }`}
            >
              {cipherText}
            </div>
          </div>

          <div className="text-[11px] font-mono-tabular text-[#949e93] leading-relaxed">
            Hint: Place the physical red acrylic sheet over the poster to cancel
            red noise and reveal blue ciphertext. Decode it with your Caesar -3
            key from Node 03.
          </div>
        </div>
      ) : (
        /* Tab 2: Slotted Cardan Grille Simulation */
        <div className="border border-[#3f453f] bg-[#141514] p-5 sm:p-6 rounded-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#2d312c] pb-3">
            <span className="text-xs font-mono-tabular font-bold text-[#c28b28] uppercase tracking-wider">
              APERTURE CARD OVERLAY
            </span>
            <span className="text-[10px] font-mono-tabular text-[#949e93]">
              MATRIX 4x6
            </span>
          </div>

          <div className="p-6 bg-[#161716] border border-[#2d312c] rounded-xs select-none">
            <div className="grid grid-cols-6 gap-2 text-center font-mono-tabular text-base">
              {letters.map((char, idx) => {
                const isCardanSlot = idx < 20;
                return (
                  <div
                    key={idx}
                    className={`py-2 px-1 border rounded-xs ${
                      isCardanSlot
                        ? "bg-[#252016] border-[#c28b28] text-[#c28b28] font-bold"
                        : "bg-[#111211] border-[#202420] text-[#4e564e]"
                    }`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] font-mono-tabular text-[#949e93]">
            Slotted aperture cards isolate the directive payload across the
            character matrix.
          </div>
        </div>
      )}

      {/* Answer Submission Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Your answer">
          <input
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. Bypass Protocol Alpha"
            required
            maxLength={100}
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
