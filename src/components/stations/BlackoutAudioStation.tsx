"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { PublicPuzzle, Progress } from "@/lib/event/types";
import { soundEffects } from "@/lib/audio";
import { Field } from "@/components/event/shared";
import {
  Play,
  Pause,
  RotateCcw,
  Radio,
  Sliders,
  Clock,
  Volume2,
  VolumeX,
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

export function BlackoutAudioStation({
  node,
  progress,
  answer,
  onAnswerChange,
  onSubmit,
  disabled,
  busy,
  saved,
}: StationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const audioAsset = node.assets.find((a) => a.kind === "audio");

  // Web Audio Synthetic Radio Static + Morse Pulse Generator
  const stopAudio = useCallback(() => {
    try {
      if (noiseSourceRef.current) {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
        noiseSourceRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.suspend().catch(() => {});
      }
    } catch {}
    setIsPlaying(false);
  }, []);

  const startAudio = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      // Generate 2 seconds of synthetic RF carrier noise
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Bandpass / Lowpass filter
      const filter = ctx.createBiquadFilter();
      filter.type = isFilterActive ? "bandpass" : "lowpass";
      filter.frequency.value = isFilterActive ? 1200 : 750;
      filter.Q.value = isFilterActive ? 6 : 1;
      filterNodeRef.current = filter;

      const gain = ctx.createGain();
      gain.gain.value = 0.08;
      gainNodeRef.current = gain;

      // Morse Tone Oscillator (beeps 17:45 in pulse sequence)
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.04, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      whiteNoise.start();
      osc.start();

      noiseSourceRef.current = whiteNoise;
      setIsPlaying(true);
      soundEffects.playScanChirp();
    } catch (e) {
      console.error("Audio synth error:", e);
    }
  }, [isFilterActive]);

  // Update filter dynamically
  useEffect(() => {
    if (filterNodeRef.current) {
      filterNodeRef.current.type = isFilterActive ? "bandpass" : "lowpass";
      filterNodeRef.current.frequency.value = isFilterActive ? 1200 : 750;
      filterNodeRef.current.Q.value = isFilterActive ? 6 : 1;
    }
  }, [isFilterActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [stopAudio]);

  // Oscilloscope canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      ctx.fillStyle = "#101210";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#1b2a1e";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      for (let y = 0; y < canvas.height; y += 15) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      // Green waveform
      ctx.strokeStyle = isPlaying ? (isFilterActive ? "#2d9f5d" : "#c28b28") : "#3f453f";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      const mid = canvas.height / 2;
      for (let x = 0; x < canvas.width; x++) {
        const noise = isPlaying ? (Math.random() - 0.5) * (isFilterActive ? 12 : 28) : 0;
        const wave = isPlaying ? Math.sin((x + phase) * 0.08) * 10 : 0;
        const y = mid + wave + noise;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      if (isPlaying) phase += 3;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isFilterActive]);

  return (
    <div className="space-y-6">
      {/* Tactical Audio Player Card */}
      <div className="border border-[#3f453f] bg-[#141514] p-5 sm:p-6 rounded-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#2d312c] pb-3">
          <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#2d9f5d]">
            <Radio className={`w-4 h-4 ${isPlaying ? "animate-pulse" : ""}`} />
            <span className="font-bold tracking-wider">
              FREQUENCY: 14.318 MHz // CARRIER AUDIO
            </span>
          </div>

          <span className="text-[10px] font-mono-tabular px-2 py-0.5 border border-[#2d312c] text-[#949e93]">
            RECEIVER: LIVE
          </span>
        </div>

        {/* Real audio asset if uploaded */}
        {audioAsset && (
          <div className="space-y-2">
            <span className="font-mono-tabular text-[10px] text-[#949e93] uppercase block">
              OFFICIAL TRANSMISSION RECORDING
            </span>
            <audio controls src={audioAsset.url} className="w-full" />
          </div>
        )}

        {/* Oscilloscope Canvas */}
        <div className="border border-[#2d312c] rounded-xs overflow-hidden">
          <canvas
            ref={canvasRef}
            width={480}
            height={110}
            className="w-full h-[110px] block"
          />
        </div>

        {/* Synthesizer & Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={isPlaying ? stopAudio : startAudio}
              className={`py-2 px-3.5 text-xs font-mono-tabular font-bold uppercase flex items-center gap-2 border transition-all ${
                isPlaying
                  ? "bg-[#c93b2b] border-[#c93b2b] text-[#f4f1ea]"
                  : "bg-[#212421] border-[#3f453f] text-[#f4f1ea] hover:border-[#949e93]"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Mute Static Carrier</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-[#2d9f5d]" />
                  <span>Synthesize Signal</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsFilterActive(!isFilterActive)}
              className={`py-2 px-3 text-xs font-mono-tabular flex items-center gap-1.5 border transition-all ${
                isFilterActive
                  ? "bg-[#1f2d22] border-[#2d9f5d] text-[#2d9f5d] font-bold"
                  : "bg-[#141514] border-[#2d312c] text-[#949e93] hover:text-[#f4f1ea]"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isFilterActive ? "Bandpass: ON" : "Bandpass Filter"}</span>
            </button>
          </div>

          <div className="text-[11px] font-mono-tabular text-[#949e93]">
            Target: Incident Time
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
            placeholder="e.g. 17:45"
            required
            maxLength={20}
            className="font-mono-tabular text-lg"
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
