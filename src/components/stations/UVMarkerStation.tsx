'use client';

import React, { useState } from 'react';
import { NodeItem } from '@/types/database';
import { Eye, Sun, Moon, Key, RotateCw, Sparkles, MapPin } from 'lucide-react';

interface UVMarkerStationProps {
  node: NodeItem;
  answerInput: string;
  setAnswerInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const UVMarkerStation: React.FC<UVMarkerStationProps> = ({
  node,
  answerInput,
  setAnswerInput,
  onSubmit,
  isSubmitting
}) => {
  const [isUVActive, setIsUVActive] = useState(false);
  const [caesarShift, setCaesarShift] = useState(3);
  const [toolInput, setToolInput] = useState(typeof node.payload.uv_hidden_text === 'string' ? node.payload.uv_hidden_text : 'WKH SURWRFRO LV DOLYH');

  const roomLocation = (typeof node.payload.uv_room_location === 'string' && node.payload.uv_room_location) || 'Seminar Hall 2 - North Wall Poster';
  const hiddenText = (typeof node.payload.uv_hidden_text === 'string' && node.payload.uv_hidden_text) || 'WKH SURWRFRO LV DOLYH';
  const cipherAlg = (typeof node.payload.cipher_algorithm === 'string' && node.payload.cipher_algorithm) || 'Caesar Shift (+3)';

  // Helper Caesar shift function for testing
  const applyCaesarShift = (text: string, shift: number) => {
    return text.split('').map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
      }
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
      }
      return char;
    }).join('');
  };

  const decodedPreview = applyCaesarShift(toolInput, caesarShift);

  return (
    <div className="space-y-6">
      {/* Physical Inspection Placard with UV Torch Simulation */}
      <div className={`transition-all duration-500 rounded-2xl p-5 sm:p-6 shadow-2xl border ${
        isUVActive
          ? 'bg-[#150a24] border-purple-500/80 shadow-[0_0_35px_rgba(168,85,247,0.35)]'
          : 'bg-[#0b130e] border-[#1f3025]'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            {isUVActive ? (
              <Moon className="w-4 h-4 text-purple-400 animate-pulse" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <span className={isUVActive ? 'text-purple-300' : 'text-[#8ea897]'}>
              {isUVActive ? 'UV Blacklight Active (395nm Spectra)' : 'Ambient Optical Mode'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsUVActive(!isUVActive)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              isUVActive
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-[#18261e] border border-[#2b3e32] text-proto-signal hover:bg-proto-signal hover:text-[#0a0f0d]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{isUVActive ? 'DEACTIVATE UV TORCH' : 'ACTIVATE UV BLACKLIGHT'}</span>
          </button>
        </div>

        {/* Inscription Wall Simulation */}
        <div className="mt-4 p-6 rounded-xl border relative min-h-[130px] flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-300"
          style={{
            backgroundColor: isUVActive ? '#1a0d2e' : '#080f0a',
            borderColor: isUVActive ? '#9333ea' : '#1b2a20'
          }}
        >
          {isUVActive ? (
            <div className="space-y-2 animate-in fade-in duration-500">
              <span className="text-[10px] text-purple-400 uppercase tracking-widest font-mono font-bold block">
                [FLUORESCENT INK DETECTED UNDER 395nm UV BEAM]
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#a855f7] tracking-widest font-mono drop-shadow-[0_0_12px_rgba(168,85,247,0.9)]">
                {hiddenText}
              </div>
              <div className="text-xs text-purple-300 font-mono font-bold">
                CIPHER KEY INSCRIBED: <span className="underline">{cipherAlg}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-center py-3">
              <span className="text-xs text-[#526a5c] font-mono">
                [Wall surface appears clean under normal ambient room light]
              </span>
              <p className="text-[11px] text-[#7d9787]">
                Click <strong className="text-purple-400 font-bold">&quot;ACTIVATE UV BLACKLIGHT&quot;</strong> or use physical UV torch on-site to reveal invisible luminescent chalk ink.
              </p>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-[#8ea897]">
          <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>Physical Location: <strong className="text-[#f3f7f4]">{roomLocation}</strong></span>
        </div>
      </div>

      {/* Embedded In-Browser Cipher Decoder Wheel */}
      <div className="p-5 rounded-2xl bg-[#0b130e] border border-purple-500/30 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1b2a20] pb-2 text-xs font-bold text-purple-400 uppercase">
          <div className="flex items-center gap-1.5">
            <Key className="w-4 h-4" />
            <span>Tactical Decryption Wheel Tool</span>
          </div>
          <span className="text-[10px] font-mono text-[#8ea897]">CAESAR SHIFT TOOL</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Ciphertext to Decrypt:</label>
            <input
              type="text"
              value={toolInput}
              onChange={(e) => setToolInput(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#070e09] border border-[#233328] rounded-xl text-[#eaf2ec] font-mono uppercase"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-[10px] text-[#8ea897] uppercase mb-1">
              <span>Shift Offset (N):</span>
              <span className="text-purple-400 font-mono font-bold">+{caesarShift}</span>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              value={caesarShift}
              onChange={(e) => setCaesarShift(Number(e.target.value))}
              className="w-full h-1.5 bg-[#17251c] rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#070e09] border border-purple-500/20 text-xs flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] text-[#8ea897] uppercase">Decrypted Plaintext Output:</span>
          <span className="font-mono font-black text-purple-300 text-sm tracking-wider">{decodedPreview}</span>
          <button
            type="button"
            onClick={() => setAnswerInput(decodedPreview)}
            className="text-[10px] px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 transition-colors"
          >
            Copy to Submit Box →
          </button>
        </div>
      </div>

      {/* Reconnaissance Clue Banner */}
      <div className="p-4 rounded-xl bg-[#111a14] border border-[#233529] text-xs space-y-1.5">
        <div className="text-[10px] font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>UV RECONNAISSANCE DIRECTIVE:</span>
        </div>
        <p className="text-[#cad3f5] font-sans leading-relaxed">
          {node.payload.hint || 'Direct the UV blacklight keychain torch against the room perimeter to uncover invisible luminescent cipher text.'}
        </p>
      </div>

      {/* Plaintext Answer Submission Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] text-[#8ea897] uppercase mb-1.5 font-bold flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-purple-400" />
            <span>{node.payload.prompt || 'Submit Decrypted Plaintext Bypass Phrase:'}</span>
          </label>
          <input
            type="text"
            required
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            placeholder="e.g. THE PROTOCOL IS ALIVE"
            className="w-full px-4 py-3 text-sm bg-[#09110d] border border-[#273a2e] rounded-xl text-[#f3f7f4] focus:outline-none focus:border-purple-500 font-mono uppercase tracking-wider"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !answerInput.trim()}
          className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
          <span>TRANSMIT DECRYPTED CIPHER PASSCODE</span>
        </button>
      </form>
    </div>
  );
};
