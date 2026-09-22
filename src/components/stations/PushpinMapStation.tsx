'use client';

import React, { useState } from 'react';
import { NodeItem } from '@/types/database';
import { MapPin, Compass, Navigation, Crosshair, Sparkles } from 'lucide-react';

interface PushpinMapStationProps {
  node: NodeItem;
  answerInput: string;
  setAnswerInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const PushpinMapStation: React.FC<PushpinMapStationProps> = ({
  node,
  answerInput,
  setAnswerInput,
  onSubmit,
  isSubmitting
}) => {
  const [showTriangulation, setShowTriangulation] = useState(true);

  const pin1 = (typeof node.payload.pin_1_name === 'string' && node.payload.pin_1_name) || 'Pin Alpha: Central Library Tower (Grid 28, 75)';
  const pin2 = (typeof node.payload.pin_2_name === 'string' && node.payload.pin_2_name) || 'Pin Beta: ECE Waveguide Mast (Grid 74, 20)';
  const pin3 = (typeof node.payload.pin_3_name === 'string' && node.payload.pin_3_name) || 'Pin Gamma: SAC Amphitheatre (Grid 82, 85)';

  // Geometric coordinates for SVG map simulation
  const p1 = { x: 120, y: 70, label: 'PIN ALPHA' };
  const p2 = { x: 380, y: 80, label: 'PIN BETA' };
  const p3 = { x: 260, y: 230, label: 'PIN GAMMA' };

  // Centroid intersection point
  const centroid = {
    x: Math.round((p1.x + p2.x + p3.x) / 3),
    y: Math.round((p1.y + p2.y + p3.y) / 3)
  };

  return (
    <div className="space-y-6">
      {/* Tactical Radar / Pushpin Map Canvas */}
      <div className="bg-[#0b130e] border border-proto-observation/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1b2a20] pb-3">
          <div className="flex items-center gap-2 text-proto-observation text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '10s' }} />
            <span>Tactical Campus Grid & Triangulation Radar</span>
          </div>
          <button
            type="button"
            onClick={() => setShowTriangulation(!showTriangulation)}
            className={`text-[10px] font-mono px-3 py-1 rounded-lg border font-bold transition-all ${
              showTriangulation
                ? 'bg-proto-observation/20 border-proto-observation text-proto-observation'
                : 'bg-[#121c15] border-[#223327] text-[#8ea897]'
            }`}
          >
            {showTriangulation ? 'STRING OVERLAY: PROJECTED' : 'STRING OVERLAY: HIDDEN'}
          </button>
        </div>

        {/* Tactical SVG Map Graphic */}
        <div className="relative bg-[#060c08] border border-[#1b2b20] rounded-xl p-2 sm:p-4 overflow-hidden">
          <svg viewBox="0 0 500 280" className="w-full h-auto select-none">
            {/* Grid Pattern */}
            <defs>
              <pattern id="tactical-grid" width="25" height="25" patternUnits="userSpaceOnUse">
                <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#142419" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tactical-grid)" />

            {/* Concentric Radar Rings */}
            <circle cx="250" cy="140" r="60" fill="none" stroke="#162c1d" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="250" cy="140" r="110" fill="none" stroke="#162c1d" strokeWidth="1" strokeDasharray="3 3" />

            {/* Triangulation Lines (String stretch simulator) */}
            {showTriangulation && (
              <g>
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#bf55ec" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
                <line x1={p2.x} y1={p2.y} x2={p3.x} y2={p3.y} stroke="#bf55ec" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
                <line x1={p3.x} y1={p3.y} x2={p1.x} y2={p1.y} stroke="#bf55ec" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />

                {/* Medians to centroid */}
                <line x1={p1.x} y1={p1.y} x2={(p2.x + p3.x) / 2} y2={(p2.y + p3.y) / 2} stroke="#bf55ec" strokeWidth="1" opacity="0.35" />
                <line x1={p2.x} y1={p2.y} x2={(p1.x + p3.x) / 2} y2={(p1.y + p3.y) / 2} stroke="#bf55ec" strokeWidth="1" opacity="0.35" />
                <line x1={p3.x} y1={p3.y} x2={(p1.x + p2.x) / 2} y2={(p1.y + p2.y) / 2} stroke="#bf55ec" strokeWidth="1" opacity="0.35" />

                {/* Centroid Crosshair Marker */}
                <circle cx={centroid.x} cy={centroid.y} r="14" fill="none" stroke="#00ff88" strokeWidth="1.5" className="animate-pulse" />
                <line x1={centroid.x - 18} y1={centroid.y} x2={centroid.x + 18} y2={centroid.y} stroke="#00ff88" strokeWidth="1.5" />
                <line x1={centroid.x} y1={centroid.y - 18} x2={centroid.x} y2={centroid.y + 18} stroke="#00ff88" strokeWidth="1.5" />
                <text x={centroid.x + 8} y={centroid.y - 8} fill="#00ff88" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  INTERSECTION SECTOR
                </text>
              </g>
            )}

            {/* Pin 1 Alpha */}
            <circle cx={p1.x} cy={p1.y} r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
            <text x={p1.x - 30} y={p1.y - 12} fill="#ef4444" fontSize="9" fontWeight="bold" fontFamily="monospace">
              PIN 1 (A)
            </text>

            {/* Pin 2 Beta */}
            <circle cx={p2.x} cy={p2.y} r="7" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
            <text x={p2.x - 25} y={p2.y - 12} fill="#3b82f6" fontSize="9" fontWeight="bold" fontFamily="monospace">
              PIN 2 (B)
            </text>

            {/* Pin 3 Gamma */}
            <circle cx={p3.x} cy={p3.y} r="7" fill="#eab308" stroke="#ffffff" strokeWidth="1.5" />
            <text x={p3.x - 30} y={p3.y + 20} fill="#eab308" fontSize="9" fontWeight="bold" fontFamily="monospace">
              PIN 3 (C)
            </text>
          </svg>
        </div>

        {/* Pins Landmark Directory */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-[#0e1711] border border-red-500/30 text-red-400 space-y-0.5">
            <div className="text-[10px] font-bold uppercase flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Pin Alpha
            </div>
            <p className="text-[11px] text-[#cad3f5] truncate">{pin1}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0e1711] border border-blue-500/30 text-blue-400 space-y-0.5">
            <div className="text-[10px] font-bold uppercase flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Pin Beta
            </div>
            <p className="text-[11px] text-[#cad3f5] truncate">{pin2}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0e1711] border border-yellow-500/30 text-yellow-400 space-y-0.5">
            <div className="text-[10px] font-bold uppercase flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Pin Gamma
            </div>
            <p className="text-[11px] text-[#cad3f5] truncate">{pin3}</p>
          </div>
        </div>
      </div>

      {/* Reconnaissance Clue Banner */}
      <div className="p-4 rounded-xl bg-[#111a14] border border-[#233529] text-xs space-y-1.5">
        <div className="text-[10px] font-black text-proto-observation uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TRIANGULATION RECONNAISSANCE:</span>
        </div>
        <p className="text-[#cad3f5] font-sans leading-relaxed">
          {node.payload.hint || 'Stretch a taut string or ruler across the 3 colored pushpins on the physical corkboard to isolate the centroid geometric intersection.'}
        </p>
      </div>

      {/* Answer Submission Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] text-[#8ea897] uppercase mb-1.5 font-bold flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-proto-observation" />
            <span>{node.payload.prompt || 'Submit Identified Intersection Facility or Landmark:'}</span>
          </label>
          <input
            type="text"
            required
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            placeholder="e.g. B-BLOCK TERRACE AIR VENT"
            className="w-full px-4 py-3 text-sm bg-[#09110d] border border-[#273a2e] rounded-xl text-[#f3f7f4] focus:outline-none focus:border-proto-observation font-mono uppercase tracking-wider"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !answerInput.trim()}
          className="w-full py-3.5 px-4 rounded-xl bg-proto-observation hover:bg-[#c970f5] disabled:opacity-50 text-[#0a0f0d] font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <Navigation className="w-4 h-4" />
          <span>TRANSMIT GEOMETRIC INTERSECTION LOCATION</span>
        </button>
      </form>
    </div>
  );
};
