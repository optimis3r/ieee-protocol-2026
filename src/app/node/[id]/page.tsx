'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ArrowRight, 
  Clock,
  RotateCw,
  Sparkles,
  Compass,
  Layers,
  ChevronRight
} from 'lucide-react';
import { BlackoutAudioStation } from '@/components/stations/BlackoutAudioStation';
import { PushpinMapStation } from '@/components/stations/PushpinMapStation';
import { UVMarkerStation } from '@/components/stations/UVMarkerStation';
import { RedFilterStation } from '@/components/stations/RedFilterStation';
import { RedactedArchiveStation } from '@/components/stations/RedactedArchiveStation';
import { DeadDropStation } from '@/components/stations/DeadDropStation';
import { RogueIntelStation } from '@/components/stations/RogueIntelStation';

interface NodePageProps {
  params: Promise<{ id: string }>;
}

export default function NodeStationPage({ params }: NodePageProps) {
  const resolvedParams = use(params);
  const nodeId = resolvedParams.id.toUpperCase();
  const router = useRouter();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [node, setNode] = useState<NodeItem | null>(null);
  const [agentNode, setAgentNode] = useState<AgentNode | null>(null);
  const [allAgentNodes, setAllAgentNodes] = useState<Array<AgentNode & { node: NodeItem }>>([]);
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Challenge Input & Progression States
  const [answerInput, setAnswerInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextStation, setNextStation] = useState<NodeItem | null>(null);
  const [allCompleted, setAllCompleted] = useState<boolean>(false);
  const [isDeferring, setIsDeferring] = useState<boolean>(false);
  const [deferNotice, setDeferNotice] = useState<string | null>(null);
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
    points?: number;
  } | null>(null);

  const refreshState = useCallback((currentAgentId: string) => {
    const ag = Store.getAgentById(currentAgentId);
    if (!ag) return;
    setAgent(ag);

    const targetNode = Store.getNodeById(nodeId) || SEED_NODES.find(n => n.id.toUpperCase() === nodeId);
    setNode(targetNode || null);

    if (targetNode) {
      // Record physical station access & set active focus
      const record = Store.recordNodeAccess(ag.agent_id, targetNode.id);
      Store.setActiveNode(ag.agent_id, targetNode.id);
      setAgentNode(record);
    }

    const assignedNodes = Store.getAgentNodes(ag.agent_id);
    setAllAgentNodes(assignedNodes);
  }, [nodeId]);

  useEffect(() => {
    initStore();
    setTimeout(() => {
      const storedId = localStorage.getItem('ieee_agent_id');
      if (storedId) {
        refreshState(storedId);
      } else {
        const targetNode = Store.getNodeById(nodeId) || SEED_NODES.find(n => n.id.toUpperCase() === nodeId);
        setNode(targetNode || null);
      }
    }, 0);
  }, [nodeId, refreshState]);

  const handleQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginInput.trim()) return;

    const res = Store.loginPlayer(loginInput.trim());
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
      if (res.nextNode) {
        setNextStation(res.nextNode);
      }
      if (res.allCompleted) {
        setAllCompleted(true);
      }
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

  const handleSwitchToStation = (targetStationId: string) => {
    if (!agent) return;
    Store.setActiveNode(agent.agent_id, targetStationId);
    soundEffects.playScanChirp();
    router.push(`/node/${targetStationId}`);
  };

  const handleDeferStation = () => {
    if (!agent || !node || isDeferring) return;
    setIsDeferring(true);
    setDeferNotice(null);
    try {
      const res = Store.deferCurrentNode(agent.agent_id, node.id);
      if (res.success && res.assignedNode) {
        soundEffects.playScanChirp();
        router.push(`/node/${res.assignedNode.node.id}`);
      } else {
        setDeferNotice(res.message);
        setIsDeferring(false);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to switch station';
      setDeferNotice(msg);
      setIsDeferring(false);
    }
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

  // Standby Guard: Block participant access to challenge circuits until event starts on Sept 24th
  const isAdmin = typeof window !== 'undefined' && sessionStorage.getItem('ieee_admin_auth') === 'true';
  if (!isAdmin && !Store.isEventActive()) {
    return (
      <div className="min-h-screen bg-[#070b09] text-[#eaf2ec] flex flex-col items-center justify-center p-4 font-mono-cyber">
        <div className="max-w-md w-full bg-[#0e1612] border-2 border-proto-gold/50 rounded-2xl p-6 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-proto-gold/15 border-2 border-proto-gold/40 flex items-center justify-center mx-auto text-proto-gold animate-pulse">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] text-proto-gold font-bold uppercase tracking-widest block">
              CIRCUIT TERMINALS IN STANDBY
            </span>
            <h1 className="text-xl font-black text-[#f3f7f4] mt-1">
              THE EVENT HAS NOT STARTED YET
            </h1>
            <p className="text-xs text-proto-gold font-bold mt-1">
              OFFICIAL LAUNCH: SEPTEMBER 24TH, 2026
            </p>
          </div>
          <p className="text-xs text-[#8ea897] font-sans leading-relaxed">
            Decryption challenges and station answer submissions are offline. 
            All challenge circuits will be activated simultaneously by the Operations team on launch day.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/standby"
              className="w-full py-3 px-4 rounded-xl bg-proto-gold text-[#070b09] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all text-center cursor-pointer"
            >
              View Standby Launch Timer
            </Link>
            <Link
              href="/"
              className="text-xs text-proto-subtext hover:underline"
            >
              Return to Protocol Home
            </Link>
          </div>
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
  const deferredStations = allAgentNodes.filter(
    an => !an.is_completed && an.node_id.toUpperCase() !== nodeId
  );
  const solvedStations = allAgentNodes.filter(
    an => an.is_completed && an.node_id.toUpperCase() !== nodeId
  );
  const tournamentStations = Store.getTournamentStations();
  const solvedIds = allAgentNodes.filter(an => an.is_completed).map(an => an.node_id.toUpperCase());
  const unlockedIds = allAgentNodes.map(an => an.node_id.toUpperCase());
  const canDrawMoreStations = tournamentStations.some(
    ts => !solvedIds.includes(ts.id.toUpperCase()) && !unlockedIds.includes(ts.id.toUpperCase())
  );

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

          <div className="flex items-center gap-2">
            <Link
              href="/play"
              className="px-3.5 py-1.5 rounded-lg bg-[#18261e] border border-proto-signal/40 text-proto-signal hover:bg-proto-signal hover:text-[#0a0f0d] text-xs font-bold transition-all"
            >
              Open HUD
            </Link>
          </div>
        </div>
      </header>

      {/* Standby Circuits Switcher Bar */}
      {deferredStations.length > 0 && (
        <div className="w-full bg-[#111915] border-b border-[#3a8ebd]/40 px-4 sm:px-6 py-2">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-[#3a8ebd] uppercase flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-[#3a8ebd]" />
                STANDBY CIRCUITS ({deferredStations.length}):
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {deferredStations.map((ds) => (
                  <button
                    key={ds.node_id}
                    onClick={() => handleSwitchToStation(ds.node_id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18261e] border border-[#3a8ebd]/60 hover:border-[#3a8ebd] text-[#3a8ebd] hover:text-[#f4f1ea] text-[11px] font-bold uppercase transition-colors cursor-pointer"
                    title={`Click to switch back to ${ds.node.title}`}
                  >
                    <span>{ds.node.station_number ? ds.node.station_number.replace('Station ', 'ST-') : ds.node_id}: {ds.node.title}</span>
                    <span className="text-[9px] text-[#8ea897]">({ds.attempts} att.)</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </button>
                ))}
              </div>
            </div>
            <span className="text-[10px] text-[#8ea897] hidden md:inline">
              Progress saved • Return anytime
            </span>
          </div>
        </div>
      )}

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
            <div className="p-6 rounded-2xl bg-proto-signal/10 border-2 border-proto-signal text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-proto-signal mx-auto animate-bounce" />
              <h2 className="text-lg font-black text-proto-signal uppercase">
                CIRCUIT VERIFIED & ENERGIZED
              </h2>
              <p className="text-xs text-[#8ea897]">
                You have verified this station challenge. +{agentNode?.points_earned || node.base_points} points accredited to your operative clearance score.
              </p>

              {/* Next Mission Directive Card */}
              {nextStation ? (
                <div className="p-4 rounded-xl bg-[#141d17] border border-proto-gold/60 text-left space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-proto-gold">
                      ★ NEXT MISSION DIRECTIVE ASSIGNED
                    </span>
                    <span className="text-[10px] text-[#8ea897]">
                      {nextStation.station_number || nextStation.id}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#f3f7f4]">
                    {nextStation.title}
                  </h3>
                  {nextStation.laptop_label && (
                    <p className="text-xs text-proto-gold flex items-center gap-1.5">
                      <Laptop className="w-3.5 h-3.5 shrink-0" />
                      <span>Location: {nextStation.laptop_label}</span>
                    </p>
                  )}
                  <div className="pt-2 flex flex-wrap gap-2">
                    <Link
                      href={`/node/${nextStation.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-proto-signal text-[#0a0f0d] font-bold text-xs uppercase cursor-pointer"
                    >
                      Proceed to Station Terminal <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/play"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18261e] border border-[#2d4034] text-[#eaf2ec] font-bold text-xs uppercase"
                    >
                      Return to HUD
                    </Link>
                  </div>
                </div>
              ) : null}

              {/* Deferred Circuits Available to Resume */}
              {deferredStations.length > 0 && (
                <div className="p-4 rounded-xl bg-[#111915] border border-[#3a8ebd]/40 text-left space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#3a8ebd] flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5" />
                      OR RESUME A PREVIOUSLY DEFERRED CIRCUIT ({deferredStations.length}):
                    </span>
                    <span className="text-[9px] text-[#8ea897]">
                      Return anytime
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {deferredStations.map(ds => (
                      <button
                        key={ds.node_id}
                        onClick={() => handleSwitchToStation(ds.node_id)}
                        className="p-2.5 rounded-lg bg-[#141d17] border border-[#223027] hover:border-[#3a8ebd] flex items-center justify-between text-left transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="text-[11px] font-bold text-[#f3f7f4]">
                            {ds.node.station_number || ds.node_id}: {ds.node.title}
                          </div>
                          <div className="text-[9px] text-[#8ea897]">
                            {ds.node.laptop_label || 'Physical Station'} • {ds.attempts} attempts
                          </div>
                        </div>
                        <span className="text-[10px] text-[#3a8ebd] font-bold uppercase shrink-0 ml-2">
                          RESUME →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {allCompleted ? (
                <div className="p-4 rounded-xl bg-[#141d17] border border-proto-gold/60 text-center space-y-2 mt-2">
                  <span className="text-xs font-bold text-proto-gold uppercase block">
                    ALL 7 TOURNAMENT CIRCUITS CONQUERED!
                  </span>
                  <p className="text-xs text-[#8ea897]">
                    Final master topology deduction is now unlocked in your classified Intel Locker.
                  </p>
                  <Link
                    href="/play?action=hypothesis"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-proto-gold text-[#0a0f0d] font-bold text-xs uppercase"
                  >
                    <Sparkles className="w-4 h-4" /> Final Topology Deduction (+400 PTS)
                  </Link>
                </div>
              ) : !nextStation && deferredStations.length === 0 ? (
                <Link
                  href="/play"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-proto-signal text-[#0a0f0d] font-bold text-xs uppercase"
                >
                  Return to Operative HUD <ArrowRight className="w-4 h-4" />
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="space-y-5">
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

              {/* Dynamic Bespoke Station Challenge View */}
              {(() => {
                const sNum = (node.station_number || '').toUpperCase();
                const nid = node.id.toUpperCase();

                if (nid.includes('AUDIO') || sNum === 'STATION 01') {
                  return (
                    <BlackoutAudioStation
                      node={node}
                      answerInput={answerInput}
                      setAnswerInput={setAnswerInput}
                      onSubmit={handleAnswerSubmit}
                      isSubmitting={isSubmitting}
                    />
                  );
                }

                if (nid.includes('MAP') || sNum === 'STATION 02') {
                  return (
                    <PushpinMapStation
                      node={node}
                      answerInput={answerInput}
                      setAnswerInput={setAnswerInput}
                      onSubmit={handleAnswerSubmit}
                      isSubmitting={isSubmitting}
                    />
                  );
                }

                if (nid.includes('UV') || sNum === 'STATION 03') {
                  return (
                    <UVMarkerStation
                      node={node}
                      answerInput={answerInput}
                      setAnswerInput={setAnswerInput}
                      onSubmit={handleAnswerSubmit}
                      isSubmitting={isSubmitting}
                    />
                  );
                }

                if (nid.includes('FILTER') || sNum === 'STATION 04') {
                  return (
                    <RedFilterStation
                      node={node}
                      answerInput={answerInput}
                      setAnswerInput={setAnswerInput}
                      onSubmit={handleAnswerSubmit}
                      isSubmitting={isSubmitting}
                    />
                  );
                }

                if (nid.includes('ARCHIVE') || sNum === 'STATION 05') {
                  return (
                    <RedactedArchiveStation
                      node={node}
                      answerInput={answerInput}
                      setAnswerInput={setAnswerInput}
                      onSubmit={handleAnswerSubmit}
                      isSubmitting={isSubmitting}
                    />
                  );
                }

                if (nid.includes('DEAD-DROP') || sNum === 'STATION 06') {
                  return (
                    <DeadDropStation
                      node={node}
                      answerInput={answerInput}
                      setAnswerInput={setAnswerInput}
                      onSubmit={handleAnswerSubmit}
                      isSubmitting={isSubmitting}
                    />
                  );
                }

                if (nid.includes('TWO-MAN') || sNum === 'STATION 07') {
                  return (
                    <RogueIntelStation
                      node={node}
                      answerInput={answerInput}
                      setAnswerInput={setAnswerInput}
                      onSubmit={handleAnswerSubmit}
                      isSubmitting={isSubmitting}
                    />
                  );
                }

                // Default Challenge Form for custom or legacy circuits
                return (
                  <div className="space-y-5">
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

                    <form onSubmit={handleAnswerSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[11px] text-[#8ea897] uppercase mb-1 font-bold">
                          {typeof node.payload.prompt === 'string' ? node.payload.prompt : 'Submit Station Bypass Passcode / Key:'}
                        </label>
                        <input
                          type="text"
                          required
                          value={answerInput}
                          onChange={(e) => setAnswerInput(e.target.value)}
                          placeholder="Enter decrypted bypass code..."
                          className="w-full px-4 py-3 text-xs sm:text-sm bg-[#0a0f0d] border border-[#2b3e32] rounded-xl text-[#f3f7f4] focus:outline-none focus:border-proto-signal uppercase tracking-wider font-mono"
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
                );
              })()}

              {/* Deferral option for stuck operatives */}
              <div className="p-4 rounded-xl bg-[#141d17] border border-[#223027] space-y-3 mt-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <RotateCw className="w-4 h-4 text-[#3a8ebd]" />
                      <h4 className="text-xs font-bold text-[#f3f7f4] uppercase tracking-wider">
                        Stuck on this station?
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#8ea897] mt-0.5">
                      Move on to another challenge now. This station and your progress are saved — you can return back to it anytime.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDeferStation}
                    disabled={isDeferring}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#18261e] border border-[#3a8ebd] text-[#3a8ebd] hover:bg-[#3a8ebd] hover:text-[#0a0f0d] text-xs font-bold uppercase transition-colors shrink-0 cursor-pointer shadow-sm"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isDeferring ? 'animate-spin' : ''}`} />
                    <span>{canDrawMoreStations ? 'DRAW NEXT STATION' : 'SWITCH TO ALTERNATE'}</span>
                  </button>
                </div>

                {/* Direct switcher for deferred stations in standby */}
                {deferredStations.length > 0 && (
                  <div className="pt-2.5 border-t border-[#1c2921] space-y-1.5">
                    <span className="text-[10px] text-[#8ea897] uppercase tracking-wider block font-bold">
                      Or switch directly back to a station in standby:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {deferredStations.map(ds => (
                        <button
                          key={ds.node_id}
                          type="button"
                          onClick={() => handleSwitchToStation(ds.node_id)}
                          className="p-2.5 rounded-lg bg-[#0e1611] border border-[#223027] hover:border-[#3a8ebd] flex items-center justify-between text-left transition-colors cursor-pointer group"
                        >
                          <div>
                            <div className="text-[11px] font-bold text-[#f3f7f4] group-hover:text-[#3a8ebd]">
                              {ds.node.station_number || ds.node_id}: {ds.node.title}
                            </div>
                            <div className="text-[9px] text-[#7d9787]">
                              {ds.node.laptop_label || 'Physical Station'} • {ds.attempts} attempts
                            </div>
                          </div>
                          <span className="text-[10px] text-[#3a8ebd] font-bold uppercase shrink-0 ml-2">
                            RESUME →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {deferNotice && (
                  <div className="p-2.5 bg-[#141d17] border border-[#c93b2b] text-[#c93b2b] text-xs font-mono-tabular flex items-center justify-between rounded-lg">
                    <span>{deferNotice}</span>
                    <button
                      onClick={() => setDeferNotice(null)}
                      className="text-[10px] text-[#8ea897] hover:text-[#f3f7f4] uppercase ml-2"
                    >
                      [Dismiss]
                    </button>
                  </div>
                )}
              </div>
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
