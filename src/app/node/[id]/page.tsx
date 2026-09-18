'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { Store, initStore, SEED_NODES } from '@/lib/store';
import { Agent, AgentNode, NodeItem } from '@/types/database';
import { soundEffects } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Laptop, 
  KeyRound, 
  ArrowRight 
} from 'lucide-react';

interface NodePageProps {
  params: Promise<{ id: string }>;
}

export default function NodeStationPage({ params }: NodePageProps) {
  const resolvedParams = use(params);
  const nodeId = resolvedParams.id.toUpperCase();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [node, setNode] = useState<NodeItem | null>(null);
  const [agentNode, setAgentNode] = useState<AgentNode | null>(null);
  const [loginInput, setLoginInput] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Challenge Input
  const [answerInput, setAnswerInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
    points?: number;
  } | null>(null);

  const refreshState = useCallback((currentAgentId: string) => {
    const ag = Store.getAgentById(currentAgentId);
    if (!ag) return;
    setAgent(ag);

    const targetNode = SEED_NODES.find(n => n.id.toUpperCase() === nodeId);
    setNode(targetNode || null);

    if (targetNode) {
      // Record physical station access
      const record = Store.recordNodeAccess(ag.agent_id, targetNode.id);
      setAgentNode(record);
    }
  }, [nodeId]);

  useEffect(() => {
    initStore();
    setTimeout(() => {
      const storedId = localStorage.getItem('ieee_agent_id');
      if (storedId) {
        refreshState(storedId);
      } else {
        const targetNode = SEED_NODES.find(n => n.id.toUpperCase() === nodeId);
        setNode(targetNode || null);
      }
    }, 0);
  }, [nodeId, refreshState]);

  const handleQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginInput.trim()) return;

    const res = Store.loginPlayer(loginInput.trim(), loginPin.trim() || undefined);
    if (res.success && res.agent) {
      localStorage.setItem('ieee_agent_id', res.agent.agent_id);
      localStorage.setItem('ieee_agent_token', res.agent.token);
      soundEffects.playSuccessChime();
      refreshState(res.agent.agent_id);
    } else {
      setLoginError(res.message);
    }
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent || !node || !answerInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmissionFeedback(null);

    const res = Store.submitNodeAnswer(agent.agent_id, node.id, answerInput.trim());

    if (res.success) {
      soundEffects.playSuccessChime();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
      setSubmissionFeedback({
        type: 'success',
        text: res.message,
        points: res.pointsAwarded
      });
      refreshState(agent.agent_id);
    } else {
      soundEffects.playLockoutBuzz();
      setSubmissionFeedback({
        type: 'error',
        text: res.message
      });
      refreshState(agent.agent_id);
    }
    setIsSubmitting(false);
  };

  if (!node) {
    return (
      <div className="min-h-screen bg-[#0a0f0d] text-[#eaf2ec] flex flex-col items-center justify-center p-4 font-mono-cyber">
        <div className="max-w-md w-full bg-[#101713] border border-proto-crimson/50 rounded-2xl p-6 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-proto-crimson mx-auto" />
          <h2 className="text-lg font-black">CIRCUIT NOT RECOGNIZED</h2>
          <p className="text-xs text-[#8ea897]">
            Node identifier <span className="text-proto-crimson font-bold">{nodeId}</span> does not exist in the active Protocol matrix.
          </p>
          <Link
            href="/play"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-proto-signal text-[#0a0f0d] font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Return to HUD
          </Link>
        </div>
      </div>
    );
  }

  // If operative not authenticated on this device, prompt rapid station login
  if (!agent) {
    return (
      <div className="min-h-screen bg-[#0a0f0d] text-[#eaf2ec] flex flex-col items-center justify-center p-4 font-mono-cyber">
        <div className="max-w-md w-full bg-[#101713] border border-proto-signal/40 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#17231c] border border-proto-signal/40 flex items-center justify-center mx-auto text-proto-signal">
              <Laptop className="w-6 h-6" />
            </div>
            <span className="text-[10px] text-proto-signal font-bold uppercase tracking-widest block">
              {node.station_number || 'PHYSICAL STATION'} • {node.station_symbol || 'WORKSTATION'}
            </span>
            <h1 className="text-lg font-black text-[#f3f7f4]">
              {node.title}
            </h1>
            <p className="text-xs text-[#8ea897] font-sans">
              Authenticate your operative profile to unlock and record access to this physical challenge terminal.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-proto-crimson/15 border border-proto-crimson/40 text-proto-crimson text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleQuickLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] text-[#8ea897] uppercase mb-1">
                Student Roll No / Agent ID:
              </label>
              <input
                type="text"
                required
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="e.g. 23CSB01 or AGT-047"
                className="w-full px-3.5 py-2.5 text-xs bg-[#141d17] border border-[#27392f] rounded-xl text-[#eaf2ec] focus:outline-none focus:border-proto-signal uppercase"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#8ea897] uppercase mb-1">
                Passcode / PIN (Optional):
              </label>
              <input
                type="password"
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value)}
                placeholder="Default: 1234"
                className="w-full px-3.5 py-2.5 text-xs bg-[#141d17] border border-[#27392f] rounded-xl text-[#eaf2ec] focus:outline-none focus:border-proto-signal"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-proto-signal hover:bg-[#00e676] text-[#0a0f0d] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              AUTHENTICATE & ACCESS STATION
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#1b2620] text-xs text-[#7d9787]">
            <span>Don&apos;t have an agent account? </span>
            <Link href="/register" className="text-proto-signal hover:underline font-bold">
              Register here →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = Boolean(agentNode?.is_completed);

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-[#eaf2ec] flex flex-col justify-between font-mono-cyber selection:bg-proto-signal selection:text-[#0a0f0d]">
      {/* Station Top Bar */}
      <header className="w-full bg-[#101713] border-b border-[#223027] px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/play"
              className="p-2 rounded-xl bg-[#16201a] border border-[#23332a] text-[#8ea897] hover:text-[#eaf2ec] transition-colors"
              title="Return to HUD"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-proto-signal">
                  {node.station_number || 'STATION'}
                </span>
                <span className="text-[10px] text-[#8ea897]">
                  [{node.station_symbol || 'WORKSTATION'}]
                </span>
              </div>
              <div className="text-[10px] text-[#7d9787]">
                Operative: {agent.agent_number || agent.agent_id} ({agent.name})
              </div>
            </div>
          </div>

          <Link
            href="/play"
            className="px-3.5 py-1.5 rounded-lg bg-[#18261e] border border-proto-signal/40 text-proto-signal hover:bg-proto-signal hover:text-[#0a0f0d] text-xs font-bold transition-all"
          >
            Open HUD
          </Link>
        </div>
      </header>

      {/* Main Station Workstation View */}
      <main className="max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1 flex flex-col justify-center">
        <div className="bg-[#101713] border-2 border-proto-signal/50 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Header & Badges */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#223027] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded bg-proto-signal/15 text-proto-signal border border-proto-signal/30 text-[10px] font-black">
                  {node.domain || 'SYSTEM'} CIRCUIT
                </span>
                <span className="text-[10px] text-[#8ea897]">
                  {node.id}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#f3f7f4]">
                {node.title}
              </h1>
              {node.laptop_label && (
                <p className="text-xs text-proto-gold flex items-center gap-1.5 mt-1">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Physical Terminal: {node.laptop_label}</span>
                </p>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#7d9787] uppercase block">Base Value</span>
              <span className="text-lg font-black text-proto-gold">{node.base_points} PTS</span>
            </div>
          </div>

          {/* Access Log Stamp */}
          <div className="p-3 rounded-xl bg-[#141d17] border border-[#23332a] text-xs flex items-center justify-between text-[#8ea897]">
            <span>PHYSICAL ACCESS TIMESTAMP:</span>
            <span className="text-[#f3f7f4] font-bold">
              {agentNode?.first_accessed_at 
                ? new Date(agentNode.first_accessed_at).toLocaleTimeString() 
                : 'RECORDED NOW'}
            </span>
          </div>

          {/* If already completed */}
          {isCompleted ? (
            <div className="p-6 rounded-2xl bg-proto-signal/10 border-2 border-proto-signal text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-proto-signal mx-auto animate-bounce" />
              <h2 className="text-lg font-black text-proto-signal uppercase">
                CIRCUIT VERIFIED & ENERGIZED
              </h2>
              <p className="text-xs text-[#8ea897]">
                You have already solved this station challenge. +{agentNode?.points_earned || node.base_points} points accredited to your operative clearance score.
              </p>
              <Link
                href="/play"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-proto-signal text-[#0a0f0d] font-bold text-xs uppercase"
              >
                Return to Operative HUD <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Challenge Description / Cipher */}
              {typeof node.payload.hint === 'string' && (
                <div className="p-4 rounded-xl bg-[#141d17] border border-[#27392f] text-xs space-y-1.5">
                  <div className="text-[10px] font-black text-proto-signal uppercase tracking-wider">
                    STATION RECONNAISSANCE HINT:
                  </div>
                  <p className="text-[#cad3f5] leading-relaxed font-sans">
                    {node.payload.hint}
                  </p>
                </div>
              )}

              {typeof node.payload.cipher === 'string' && (
                <div className="p-4 rounded-xl bg-[#0a0f0d] border border-proto-logic/40 space-y-1 text-center">
                  <div className="text-[10px] text-[#7d9787] uppercase">Intercepted Keystream:</div>
                  <div className="text-sm sm:text-base font-black text-proto-logic tracking-widest break-all">
                    {node.payload.cipher}
                  </div>
                  {typeof node.payload.algorithm === 'string' && (
                    <div className="text-[10px] text-[#8ea897]">Algorithm: {node.payload.algorithm}</div>
                  )}
                </div>
              )}

              {/* Feedback Alert */}
              {submissionFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
                    submissionFeedback.type === 'success'
                      ? 'bg-proto-signal/15 border-proto-signal text-proto-signal'
                      : 'bg-proto-crimson/15 border-proto-crimson text-proto-crimson'
                  }`}
                >
                  {submissionFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{submissionFeedback.text}</span>
                </div>
              )}

              {/* Submission Form */}
              <form onSubmit={handleAnswerSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] text-[#8ea897] uppercase mb-1">
                    {typeof node.payload.prompt === 'string' ? node.payload.prompt : 'Submit Station Bypass Passcode / Key:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    placeholder="Enter decrypted bypass code..."
                    className="w-full px-4 py-3 text-xs sm:text-sm bg-[#0a0f0d] border border-[#2b3e32] rounded-xl text-[#f3f7f4] focus:outline-none focus:border-proto-signal uppercase tracking-wider"
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#7d9787] mt-1">
                    <span>Attempts: {agentNode?.attempts || 0}</span>
                    <span>Penalty: -10 PTS per invalid keystream</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-proto-signal hover:bg-[#00e676] text-[#0a0f0d] font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>TRANSMIT DECRYPTED BYPASS</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#101713] border-t border-[#223027] px-4 py-3 text-center text-xs text-[#7d9787]">
        NIT Warangal IEEE Student Branch // The Protocol Physical Workstation
      </footer>
    </div>
  );
}
