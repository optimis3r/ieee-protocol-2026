'use client';

import React, { useState } from 'react';
import { NodeItem } from '@/types/database';
import { Terminal, FileText, Sun, Sparkles, Search, UserCheck } from 'lucide-react';

interface RedactedArchiveStationProps {
  node: NodeItem;
  answerInput: string;
  setAnswerInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const RedactedArchiveStation: React.FC<RedactedArchiveStationProps> = ({
  node,
  answerInput,
  setAnswerInput,
  onSubmit,
  isSubmitting
}) => {
  const [isBacklightActive, setIsBacklightActive] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'ARCHIVE OS v4.2 [CLASSIFIED CLEARANCE DETECTED]',
    'Type "help" for available commands, or "cat memo.txt" to read intercepted incident memo.'
  ]);

  const memoTitle = (typeof node.payload.memo_title === 'string' && node.payload.memo_title) || 'DEPT MEMORANDUM 1994 // DECLASSIFIED';
  const redactedSubject = (typeof node.payload.redacted_subject === 'string' && node.payload.redacted_subject) || 'AGENT K';
  const redactedRoll = (typeof node.payload.redacted_roll === 'string' && node.payload.redacted_roll) || '248721';

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    const newLogs = [...terminalLogs, `$ ${terminalInput}`];

    if (cmd === 'help') {
      newLogs.push(
        'AVAILABLE COMMANDS:',
        '  cat memo.txt        - Read raw intercepted memorandum text',
        '  grep -i "operative" - Search records for suspect mentions',
        '  inspect --backlight - Unmask redacted characters under light',
        '  roll_index          - Query suspect student roll index',
        '  clear               - Clear terminal log buffer'
      );
    } else if (cmd.includes('memo')) {
      newLogs.push(
        'READING /archive/1994/memo.txt...',
        'INCIDENT 94-B: Subsea Fiber 4 cluster unauthorized access logged.',
        `Suspect Operative: ${isBacklightActive ? redactedSubject : '[REDACTED]'} (Roll: ${isBacklightActive ? redactedRoll : '[REDACTED]'})`
      );
    } else if (cmd.includes('grep') || cmd.includes('operative') || cmd.includes('search')) {
      newLogs.push(
        `MATCH FOUND [LINE 42]: "...operative identified as ${isBacklightActive ? redactedSubject : '████████'} under classified oversight..."`
      );
    } else if (cmd.includes('backlight') || cmd.includes('inspect')) {
      setIsBacklightActive(true);
      newLogs.push(
        'BACKLIGHT ENGAGED. Illuminating redacted paper fiber...',
        `REVEALED SUBJECT: ${redactedSubject} // ROLL NO: ${redactedRoll}`
      );
    } else if (cmd.includes('roll')) {
      newLogs.push(`CAMPUS ARCHIVE QUERY: Roll #${redactedRoll} maps to Operative Codename "${redactedSubject}".`);
    } else if (cmd === 'clear') {
      setTerminalLogs([]);
      setTerminalInput('');
      return;
    } else {
      newLogs.push(`Command not recognized: "${terminalInput}". Type "help" for syntax.`);
    }

    setTerminalLogs(newLogs.slice(-14));
    setTerminalInput('');
  };

  return (
    <div className="space-y-6">
      {/* Physical Binder / Declassified Memo Document */}
      <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 shadow-2xl ${
        isBacklightActive
          ? 'bg-[#181d11] border-yellow-500/60 shadow-[0_0_25px_rgba(234,179,8,0.2)]'
          : 'bg-[#0b130e] border-[#1b2b20]'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <FileText className="w-4 h-4" />
            <span>{memoTitle}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsBacklightActive(!isBacklightActive)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              isBacklightActive
                ? 'bg-amber-500 text-black shadow-lg font-black'
                : 'bg-[#142219] border border-[#273a2e] text-[#8ea897] hover:text-[#eaf2ec]'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>{isBacklightActive ? 'BACKLIGHT: ILLUMINATED' : 'HOLD TO BACKLIGHT'}</span>
          </button>
        </div>

        {/* Redacted Memo Content */}
        <div className="mt-4 p-5 rounded-xl bg-[#070d09] border border-[#1b2b20] font-mono text-xs leading-relaxed space-y-3">
          <div className="text-[10px] text-[#7d9787] uppercase border-b border-[#1b2b20] pb-2 flex justify-between">
            <span>DEPARTMENT OF ELECTRICAL & COMPUTING</span>
            <span>RESTRICTED CLASSIFICATION</span>
          </div>

          <p className="text-[#cad3f5]">
            INCIDENT REPORT 1994-09: During subsea fiber routing maintenance, an unauthorized terminal handshake bypassed root memory integrity checks.
          </p>

          <p className="text-[#cad3f5]">
            Eyewitness statements and physical logs cross-referenced with attendance records identify operative{' '}
            {isBacklightActive ? (
              <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/40 animate-in fade-in">
                {redactedSubject} (Roll #{redactedRoll})
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-black text-black select-none font-bold border border-[#2b3e32]">
                ██████████████
              </span>
            )}{' '}
            originating from the Central Computer Bay. All operatives must maintain total radio silence.
          </p>
        </div>

        <p className="text-[11px] text-[#7d9787] mt-3">
          {isBacklightActive
            ? 'Strong backlight shines through carbon ink layers, revealing the unmasked suspect.'
            : 'Black permanent marker conceals key names. Use backlight inspection or execute terminal queries below.'}
        </p>
      </div>

      {/* Mini-Terminal CLI */}
      <div className="p-4 rounded-2xl bg-[#060b08] border border-proto-system/40 space-y-3 font-mono text-xs shadow-2xl">
        <div className="flex items-center justify-between text-proto-system border-b border-[#1b2b20] pb-2">
          <div className="flex items-center gap-1.5 font-bold uppercase">
            <Terminal className="w-4 h-4" />
            <span>Archive Terminal CLI (Search & Forensics)</span>
          </div>
          <span className="text-[10px] text-[#7d9787]">bash - NITW ARCHIVES</span>
        </div>

        {/* Terminal Logs Output */}
        <div className="h-32 overflow-y-auto space-y-1 text-[11px] text-[#8ea897] p-2 bg-[#040705] rounded-xl border border-[#142017]">
          {terminalLogs.map((log, i) => (
            <div key={i} className={log.startsWith('$') ? 'text-proto-signal font-bold' : ''}>
              {log}
            </div>
          ))}
        </div>

        {/* Terminal Input Form */}
        <form onSubmit={handleTerminalSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-proto-signal font-bold">$</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              placeholder="e.g. cat memo.txt, grep operative, or inspect --backlight"
              className="w-full pl-7 pr-3 py-2 bg-[#09110d] border border-[#233529] rounded-xl text-xs text-[#eaf2ec] focus:outline-none focus:border-proto-system font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-proto-system text-black font-bold text-xs uppercase hover:opacity-90 transition-opacity"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Reconnaissance Clue Banner */}
      <div className="p-4 rounded-xl bg-[#111a14] border border-[#233529] text-xs space-y-1.5">
        <div className="text-[10px] font-black text-proto-system uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>REDACTED ARCHIVE OBJECTIVE:</span>
        </div>
        <p className="text-[#cad3f5] font-sans leading-relaxed">
          {node.payload.hint || 'Hold the physical memo sheets against backlight or execute terminal reconnaissance queries to unveil the redacted subject.'}
        </p>
      </div>

      {/* Answer Submission Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] text-[#8ea897] uppercase mb-1.5 font-bold flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-proto-system" />
            <span>{node.payload.prompt || 'Submit Redacted Operative Name or Student Roll Number:'}</span>
          </label>
          <input
            type="text"
            required
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            placeholder="e.g. AGENT K or 248721"
            className="w-full px-4 py-3 text-sm bg-[#09110d] border border-[#273a2e] rounded-xl text-[#f3f7f4] focus:outline-none focus:border-proto-system font-mono uppercase tracking-wider"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !answerInput.trim()}
          className="w-full py-3.5 px-4 rounded-xl bg-proto-system hover:bg-[#ff8c1a] disabled:opacity-50 text-[#0a0f0d] font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>TRANSMIT UNMASKED OPERATIVE IDENTIFIER</span>
        </button>
      </form>
    </div>
  );
};
