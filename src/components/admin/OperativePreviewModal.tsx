'use client';

import React, { useState, useEffect } from 'react';
import { Agent, AgentNode, NodeItem } from '@/types/database';
import { Store, formatActiveTime, getAgentActiveSeconds } from '@/lib/store';
import { 
  X, 
  Play, 
  Pause, 
  Smartphone, 
  Edit3, 
  RotateCcw, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  Ticket, 
  Radio, 
  HelpCircle, 
  MapPin, 
  Laptop, 
  Zap, 
  Award,
  Hash,
  Phone,
  UserCheck
} from 'lucide-react';

interface OperativePreviewModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleCheckIn: (agentId: string) => void;
  onResendWhatsApp: (agent: Agent) => void;
  onAdjustScore: (agent: Agent) => void;
  onResetAgent: (agentId: string) => void;
  onDeleteAgent: (agentId: string) => void;
}

export const OperativePreviewModal: React.FC<OperativePreviewModalProps> = ({
  agent,
  isOpen,
  onClose,
  onToggleCheckIn,
  onResendWhatsApp,
  onAdjustScore,
  onResetAgent,
  onDeleteAgent
}) => {
  const [activeSeconds, setActiveSeconds] = useState<number>(0);
  const [agentNodes, setAgentNodes] = useState<Array<AgentNode & { node: NodeItem }>>([]);
  const [currentQuestionData, setCurrentQuestionData] = useState<{
    currentNode: (AgentNode & { node: NodeItem }) | null;
    status: 'IN_PROGRESS' | 'SOLVED' | 'NO_ACTIVITY';
    totalSolved: number;
    totalAssigned: number;
  }>({
    currentNode: null,
    status: 'NO_ACTIVITY',
    totalSolved: 0,
    totalAssigned: 0
  });

  // Fetch operative nodes and live active time
  useEffect(() => {
    if (!agent || !isOpen) return;

    const refreshData = () => {
      const secs = getAgentActiveSeconds(agent);
      setActiveSeconds(secs);

      const nodes = Store.getAgentNodes(agent.agent_id);
      setAgentNodes(nodes);

      const qData = Store.getAgentCurrentQuestion(agent.agent_id);
      setCurrentQuestionData(qData);
    };

    refreshData();

    // 1-second live active time counter ticker
    const timer = setInterval(() => {
      if (agent.check_in_status === 'ACTIVE') {
        setActiveSeconds(getAgentActiveSeconds(agent));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [agent, isOpen]);

  if (!isOpen || !agent) return null;

  const isActive = agent.check_in_status === 'ACTIVE';
  const isPaused = agent.check_in_status === 'PAUSED';
  const isPending = !isActive && !isPaused;

  const currentStation = currentQuestionData.currentNode;
  const currentPayload = currentStation?.node.payload || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#0c120f] border border-[#233529] rounded-2xl shadow-2xl p-5 sm:p-7 space-y-6 text-[#eaf2ec] font-mono-cyber selection:bg-proto-signal selection:text-[#0c120f]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-start justify-between gap-4 border-b border-[#1f3025] pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-proto-signal/20 text-proto-signal border border-proto-signal/40">
                {agent.agent_number || agent.agent_id}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-proto-surface0 text-proto-logic border border-proto-logic/30 font-bold uppercase">
                {agent.archetype}
              </span>
              <span className="text-[10px] text-proto-subtext flex items-center gap-1 font-sans">
                <Ticket className="w-3 h-3 text-proto-gold" />
                <span>Band: {agent.wristband_id || agent.agent_id}</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#f3f7f4] tracking-tight">
              {agent.name}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#8ea897]">
              <span className="flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-proto-gold" />
                <span>Roll: {agent.auth_identifier || 'N/A'}</span>
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-proto-signal" />
                <span>{agent.contact || 'No WhatsApp'}</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8ea897] hover:text-white hover:bg-[#1a2920] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Operational State Banner */}
        <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
          isActive 
            ? 'bg-[#102418] border-proto-signal/50 text-proto-signal shadow-[0_0_20px_rgba(34,197,94,0.15)]'
            : isPaused
            ? 'bg-[#291f0e] border-proto-gold/50 text-proto-gold'
            : 'bg-[#1a221d] border-[#2d3d33] text-[#8ea897]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3.5 h-3.5 rounded-full ${
              isActive ? 'bg-proto-signal animate-ping' : isPaused ? 'bg-proto-gold' : 'bg-[#60776b]'
            }`} />
            <div>
              <div className="text-xs font-black tracking-wider uppercase flex items-center gap-2">
                <span>STATUS: {isActive ? 'ACTIVE (IN VENUE)' : isPaused ? 'PAUSED (OFF-SITE / STEPPED OUT)' : 'AWAITING INITIAL CHECK-IN'}</span>
                {isActive && <Radio className="w-3.5 h-3.5 animate-pulse" />}
              </div>
              <div className="text-[11px] text-[#8ea897] font-sans mt-0.5">
                {isActive
                  ? 'Operative on campus. Play timer is advancing live.'
                  : isPaused
                  ? 'Operative has stepped out. Active play timer is frozen.'
                  : 'Operative enrolled. Requires physical pass scan at Operations Desk.'}
              </div>
            </div>
          </div>

          <button
            onClick={() => onToggleCheckIn(agent.agent_id)}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow ${
              isActive
                ? 'bg-proto-gold/20 text-proto-gold hover:bg-proto-gold hover:text-black border border-proto-gold/50'
                : 'bg-proto-signal text-[#0a0f0d] hover:bg-[#2ae068]'
            }`}
          >
            {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isActive ? 'Check-Out (Pause)' : 'Check-In (Activate)'}</span>
          </button>
        </div>

        {/* Real-Time Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#121c16] border border-[#203026]">
            <span className="text-[10px] text-[#8ea897] uppercase flex items-center gap-1">
              <Clock className="w-3 h-3 text-proto-signal" /> ACTIVE TIME
            </span>
            <div className="text-lg font-black font-mono text-[#f3f7f4] mt-1">
              {formatActiveTime(activeSeconds)}
            </div>
            <div className="text-[9px] text-[#63806f] mt-0.5">
              {isActive ? '⏱️ Live ticker ticking' : '⏸️ Clock paused'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#121c16] border border-[#203026]">
            <span className="text-[10px] text-[#8ea897] uppercase flex items-center gap-1">
              <Award className="w-3 h-3 text-proto-gold" /> TOTAL SCORE
            </span>
            <div className="text-lg font-black font-mono text-proto-gold mt-1">
              {agent.score} PTS
            </div>
            <div className="text-[9px] text-[#63806f] mt-0.5">
              Anti-grind decayed
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#121c16] border border-[#203026]">
            <span className="text-[10px] text-[#8ea897] uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-proto-logic" /> SOLVED CIRCUITS
            </span>
            <div className="text-lg font-black font-mono text-proto-logic mt-1">
              {currentQuestionData.totalSolved} / {currentQuestionData.totalAssigned || agentNodes.length}
            </div>
            <div className="text-[9px] text-[#63806f] mt-0.5">
              {agentNodes.length > 0 
                ? `${Math.round((currentQuestionData.totalSolved / agentNodes.length) * 100)}% completed`
                : '0% completed'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#121c16] border border-[#203026]">
            <span className="text-[10px] text-[#8ea897] uppercase flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-proto-signal" /> LAST ACTIVE
            </span>
            <div className="text-xs font-bold font-mono text-[#f3f7f4] mt-2 truncate">
              {agent.last_active_at 
                ? new Date(agent.last_active_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : 'Never'}
            </div>
            <div className="text-[9px] text-[#63806f] mt-0.5">
              {agent.last_active_at ? new Date(agent.last_active_at).toLocaleDateString() : 'Pending'}
            </div>
          </div>
        </div>

        {/* Current Question / Station Telemetry Card */}
        <div className="bg-[#121c16] border border-[#203026] rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#203026] pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-proto-gold" />
              <h3 className="text-xs font-black uppercase text-[#f3f7f4] tracking-wider">
                CURRENT STATION & QUESTION IN PROGRESS
              </h3>
            </div>
            {currentStation && (
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                currentStation.is_completed 
                  ? 'bg-proto-signal/20 text-proto-signal border border-proto-signal/30'
                  : 'bg-proto-gold/20 text-proto-gold border border-proto-gold/30'
              }`}>
                {currentStation.is_completed ? 'CIRCUIT SOLVED' : 'ATTEMPT IN PROGRESS'}
              </span>
            )}
          </div>

          {currentStation ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-proto-gold flex items-center gap-1.5">
                    <span>{currentStation.node.station_number || 'Station'}</span>
                    <span>•</span>
                    <span>{currentStation.node.station_symbol || currentStation.node.domain}</span>
                  </div>
                  <div className="text-sm font-black text-[#f3f7f4] mt-0.5">
                    {currentStation.node.title}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-proto-subtext block">BASE VALUE</span>
                  <span className="text-xs font-black text-proto-gold">{currentStation.node.base_points} PTS</span>
                </div>
              </div>

              {/* Station Location & Laptop Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-[#0c120f] p-3 rounded-lg border border-[#1b2820]">
                <div className="flex items-center gap-2 text-[#8ea897]">
                  <Laptop className="w-3.5 h-3.5 text-proto-logic shrink-0" />
                  <span className="truncate">{currentStation.node.laptop_label || 'Physical Station Laptop'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#8ea897]">
                  <MapPin className="w-3.5 h-3.5 text-proto-gold shrink-0" />
                  <span className="truncate">{currentPayload.location || currentPayload.sector || 'NITW Campus Station'}</span>
                </div>
              </div>

              {/* Question Challenge / Prompt Preview */}
              <div className="bg-[#0c120f] p-3 rounded-lg border border-[#1b2820] space-y-1.5">
                <div className="text-[10px] font-bold text-proto-logic uppercase flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  <span>CHALLENGE PROMPT / CIPHER</span>
                </div>
                <p className="text-xs text-[#d5e0d7] font-sans">
                  {currentPayload.prompt || currentPayload.hint || currentPayload.expression || currentPayload.cipher || 'Optical scan verification puzzle.'}
                </p>
                {currentPayload.hint && currentPayload.prompt && (
                  <div className="text-[11px] text-proto-subtext italic font-sans border-t border-[#1b2820] pt-1">
                    Clue hint: {currentPayload.hint}
                  </div>
                )}
              </div>

              {/* Station Attempt Stats */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-[#8ea897] pt-1">
                <span>Attempts logged: <strong className="text-[#f3f7f4]">{currentStation.attempts || 0}</strong></span>
                <span>
                  First accessed:{' '}
                  <strong className="text-[#f3f7f4]">
                    {currentStation.first_accessed_at 
                      ? new Date(currentStation.first_accessed_at).toLocaleTimeString() 
                      : 'Not accessed yet'}
                  </strong>
                </span>
                {currentStation.completed_at && (
                  <span>
                    Solved at:{' '}
                    <strong className="text-proto-signal">
                      {new Date(currentStation.completed_at).toLocaleTimeString()}
                    </strong>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-5 text-xs text-[#8ea897]">
              No station challenges assigned or accessed yet.
            </div>
          )}
        </div>

        {/* Full Station Circuit Matrix */}
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase text-[#f3f7f4] tracking-wider flex items-center gap-2">
            <span>FULL CIRCUITS PROGRESS MATRIX ({agentNodes.length} STATIONS)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {agentNodes.map((an) => {
              const isComp = an.is_completed;
              const isCurr = currentStation?.node_id === an.node_id;

              return (
                <div 
                  key={an.id} 
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                    isComp 
                      ? 'bg-[#102217] border-proto-signal/40 text-[#f3f7f4]'
                      : isCurr
                      ? 'bg-[#221c10] border-proto-gold/40 text-proto-gold'
                      : 'bg-[#121c16] border-[#203026] text-[#8ea897]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-bold truncate text-[11px]">
                      {an.node.station_number || an.node_id} • {an.node.title}
                    </div>
                    <div className="text-[10px] text-[#63806f] flex items-center gap-1 mt-0.5">
                      <span>{an.node.domain}</span>
                      <span>•</span>
                      <span>{an.points_earned || an.node.base_points} PTS</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isComp ? (
                      <span className="px-1.5 py-0.5 rounded bg-proto-signal/20 text-proto-signal text-[9px] font-bold">
                        SOLVED
                      </span>
                    ) : isCurr ? (
                      <span className="px-1.5 py-0.5 rounded bg-proto-gold/20 text-proto-gold text-[9px] font-bold animate-pulse">
                        CURRENT
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-[#1a261f] text-[#63806f] text-[9px]">
                        LOCKED
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Desk Actions Toolbar */}
        <div className="border-t border-[#1f3025] pt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Send WhatsApp Pass */}
            <button
              onClick={() => onResendWhatsApp(agent)}
              className="px-3 py-1.5 rounded-lg bg-proto-signal/15 text-proto-signal hover:bg-proto-signal hover:text-[#070b09] border border-proto-signal/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Resend WhatsApp Pass</span>
            </button>

            {/* Adjust Score */}
            <button
              onClick={() => onAdjustScore(agent)}
              className="px-3 py-1.5 rounded-lg bg-[#141d17] border border-[#233529] hover:border-proto-gold text-[#d5e0d7] hover:text-proto-gold text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-proto-gold" />
              <span>Adjust Score</span>
            </button>

            {/* Reset Progress */}
            <button
              onClick={() => onResetAgent(agent.agent_id)}
              className="px-3 py-1.5 rounded-lg bg-[#141d17] border border-[#233529] hover:border-proto-crimson text-[#d5e0d7] hover:text-proto-crimson text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-proto-crimson" />
              <span>Reset Progress</span>
            </button>
          </div>

          <button
            onClick={() => onDeleteAgent(agent.agent_id)}
            className="px-3 py-1.5 rounded-lg bg-red-950/30 text-red-400 hover:bg-red-900/50 border border-red-800/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
