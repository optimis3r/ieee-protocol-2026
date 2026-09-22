'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NodeItem } from '@/types/database';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Radio, Sliders, Clock, Sparkles } from 'lucide-react';

interface BlackoutAudioStationProps {
  node: NodeItem;
  answerInput: string;
  setAnswerInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const BlackoutAudioStation: React.FC<BlackoutAudioStationProps> = ({
  node,
  answerInput,
  setAnswerInput,
  onSubmit,
  isSubmitting
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [audioError, setAudioError] = useState(false);

  // Web Audio Synth Fallback (synthesizes realistic static radio + tone pulses)
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const audioUrl = typeof node.payload.audio_url === 'string' && node.payload.audio_url.trim()
    ? node.payload.audio_url.trim()
    : null;

  // Web Audio Noise Generator
  const startSyntheticAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Generate White Noise Buffer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter
      const filter = ctx.createBiquadFilter();
      filter.type = isFilterActive ? 'bandpass' : 'lowpass';
      filter.frequency.value = isFilterActive ? 1200 : 800;
      filter.Q.value = isFilterActive ? 8 : 1;

      // Gain
      const gain = ctx.createGain();
      gain.gain.value = 0.12;

      // Morse Tone Oscillator
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.06, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      whiteNoise.start();
      osc.start();

      noiseNodeRef.current = gain;
    } catch (e) {
      console.error('Audio synth error:', e);
    }
  };

  const stopSyntheticAudio = () => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.suspend().catch(() => {});
    }
  };

  const togglePlay = () => {
    if (audioUrl && audioElementRef.current && !audioError) {
      if (isPlaying) {
        audioElementRef.current.pause();
        setIsPlaying(false);
      } else {
        audioElementRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setAudioError(true);
          startSyntheticAudio();
          setIsPlaying(true);
        });
      }
    } else {
      if (isPlaying) {
        stopSyntheticAudio();
        setIsPlaying(false);
      } else {
        startSyntheticAudio();
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    if (audioElementRef.current && audioUrl && !audioError) {
      audioElementRef.current.currentTime = seconds;
    }
  };

  // Visualizer Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const numBars = 36;
      const barWidth = canvas.width / numBars - 2;

      for (let i = 0; i < numBars; i++) {
        let height = 6;
        if (isPlaying) {
          const wave = Math.sin(frame * 0.1 + i * 0.4) * Math.cos(frame * 0.05 + i * 0.2);
          const noise = Math.random() * 0.4;
          const factor = isFilterActive ? (i > 10 && i < 24 ? 1.4 : 0.3) : 0.8;
          height = Math.max(4, Math.min(canvas.height - 4, (Math.abs(wave) + noise) * canvas.height * 0.75 * factor));
        }

        const x = i * (barWidth + 2);
        const y = (canvas.height - height) / 2;

        ctx.fillStyle = isFilterActive 
          ? `hsl(${145 + i * 2}, 100%, ${isPlaying ? 55 : 25}%)`
          : `hsl(${160}, 80%, ${isPlaying ? 45 : 20}%)`;

        ctx.fillRect(x, y, barWidth, height);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, isFilterActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSyntheticAudio();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Audio Intercept Visualizer Deck */}
      <div className="bg-[#0b130e] border border-proto-signal/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1b2a20] pb-3">
          <div className="flex items-center gap-2 text-proto-signal text-xs font-bold uppercase tracking-wider">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Blackout Signal Audio Stream</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-proto-signal/15 border border-proto-signal/30 text-proto-signal font-bold">
            {node.payload.frequency || '14.318 MHz'} CARRIER
          </span>
        </div>

        {/* Audio Spectrum Canvas */}
        <div className="relative bg-[#060c08] border border-[#1b2b20] rounded-xl p-3 flex flex-col items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            width={500}
            height={90}
            className="w-full h-24 rounded-lg"
          />
          {isPlaying && (
            <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[9px] text-proto-signal font-mono font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-proto-signal" />
              <span>TRANSMITTING FREQUENCY</span>
            </div>
          )}
        </div>

        {/* Audio Element if URL provided */}
        {audioUrl && (
          <audio
            ref={audioElementRef}
            src={audioUrl}
            onTimeUpdate={() => {
              if (audioElementRef.current) {
                setCurrentTime(audioElementRef.current.currentTime);
                setDuration(audioElementRef.current.duration || 30);
              }
            }}
            onEnded={() => setIsPlaying(false)}
            onError={() => setAudioError(true)}
            className="hidden"
          />
        )}

        {/* Scrubber & Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#8ea897] font-mono">
            <span>{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</span>
            <span>00:{Math.floor(duration).toString().padStart(2, '0')}</span>
          </div>

          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="w-full h-1.5 bg-[#15231a] rounded-lg appearance-none cursor-pointer accent-proto-signal"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="px-5 py-2.5 rounded-xl bg-proto-signal hover:bg-[#00e676] text-[#0a0f0d] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'PAUSE CARRIER' : 'PLAY AUDIO'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSeek(0)}
                className="p-2.5 rounded-xl bg-[#142219] hover:bg-[#1a2d21] border border-[#273a2e] text-[#8ea897] hover:text-[#eaf2ec] transition-colors"
                title="Rewind to start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* High-Pass / Noise Reduction DSP Filter */}
            <button
              type="button"
              onClick={() => setIsFilterActive(!isFilterActive)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                isFilterActive
                  ? 'bg-proto-signal/20 border-proto-signal text-proto-signal shadow-sm'
                  : 'bg-[#121c15] border-[#223327] text-[#8ea897] hover:text-[#eaf2ec]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isFilterActive ? 'DSP FILTER: ACTIVE' : 'DSP NOISE FILTER: OFF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reconnaissance Clue Banner */}
      <div className="p-4 rounded-xl bg-[#111a14] border border-[#233529] text-xs space-y-1.5">
        <div className="text-[10px] font-black text-proto-signal uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ACOUSTIC ISOLATION OBJECTIVE:</span>
        </div>
        <p className="text-[#cad3f5] font-sans leading-relaxed">
          {node.payload.hint || 'Isolate the real incident timestamp buried beneath the static radio carrier and touch-tone bursts.'}
        </p>
      </div>

      {/* Timestamp Answer Submission Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] text-[#8ea897] uppercase mb-1.5 font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-proto-signal" />
            <span>{node.payload.prompt || 'Submit Isolated Timestamp [HH:MM]:'}</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              placeholder="e.g. 17:45 or 17:45 hrs"
              className="w-full px-4 py-3 text-sm bg-[#09110d] border border-[#273a2e] rounded-xl text-[#f3f7f4] focus:outline-none focus:border-proto-signal font-mono uppercase tracking-widest"
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-[#6b8575]">Format samples:</span>
            {['17:45', '17:45 HRS', '18:30'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setAnswerInput(sample)}
                className="text-[10px] px-2 py-0.5 rounded bg-[#131d16] border border-[#243429] text-proto-signal hover:bg-proto-signal/20 transition-colors font-mono"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !answerInput.trim()}
          className="w-full py-3.5 px-4 rounded-xl bg-proto-signal hover:bg-[#00e676] disabled:opacity-50 text-[#0a0f0d] font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>TRANSMIT RECONSTRUCTED TIMESTAMP</span>
        </button>
      </form>
    </div>
  );
};
