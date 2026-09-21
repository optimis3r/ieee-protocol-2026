'use client';

import React, { useState, useEffect } from 'react';
import { Agent } from '@/types/database';
import { formatActiveTime, getAgentActiveSeconds } from '@/lib/store';
import { soundEffects } from '@/lib/audio';
import { 
  X, 
  LogIn, 
  LogOut, 
  Shield, 
  Clock, 
  Ticket, 
  User, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Play,
  Pause
} from 'lucide-react';

interface CheckInOutModalProps {
  isOpen: boolean;
  agent: Agent | null;
  onClose: () => void;
  onCheckIn: (agentId: string) => void;
  onCheckOut: (agentId: string) => void;
}

export const CheckInOutModal: React.FC<CheckInOutModalProps> = ({
  isOpen,
  agent,
  onClose,
  onCheckIn,
  onCheckOut,
}) => {
  const [liveSeconds, setLiveSeconds] = useState<number>(0);
  const [confirmingAction, setConfirmingAction] = useState<'IN' | 'OUT' | null>(null);

  useEffect(() => {
    if (!agent || !isOpen) return;

    // Initialize timer
    setLiveSeconds(getAgentActiveSeconds(agent));
    setConfirmingAction(null);

    // Live update timer if agent is ACTIVE
    if (agent.check_in_status === 'ACTIVE') {
      const timer = setInterval(() => {
        setLiveSeconds(getAgentActiveSeconds(agent));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [agent, isOpen]);

  if (!isOpen || !agent) return null;

  const isActive = agent.check_in_status === 'ACTIVE';

  const handleAction = (direction: 'IN' | 'OUT') => {
    setConfirmingAction(direction);
    soundEffects.playSuccessChime();
    setTimeout(() => {
      if (direction === 'IN') {
        onCheckIn(agent.agent_id);
      } else {
        onCheckOut(agent.agent_id);
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-proto-obsidian/85 backdrop-blur-md animate-in fade-in duration-200 font-mono-cyber">
      <div className="relative w-full max-w-lg bg-proto-base border border-proto-surface1 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-proto-mantle border-b border-proto-surface1">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isActive 
                ? 'bg-proto-signal/20 text-proto-signal border-proto-signal/40' 
                : 'bg-proto-gold/20 text-proto-gold border-proto-gold/40'
            }`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-proto-text uppercase tracking-wide">
                OPERATIVE DESK VERIFICATION
              </h3>
              <p className="text-[11px] text-proto-subtext font-sans">
                Badge scanned at check-in / check-out terminal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-proto-subtext hover:text-proto-text hover:bg-proto-surface1 rounded-xl transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* Status Alert Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isActive
              ? 'bg-proto-signal/10 border-proto-signal/40 text-proto-signal'
              : 'bg-proto-gold/10 border-proto-gold/40 text-proto-gold'
          }`}>
            <div className="flex items-center gap-3">
              {isActive ? (
                <div className="w-3 h-3 rounded-full bg-proto-signal animate-ping" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-proto-gold" />
              )}
              <div>
                <div className="text-xs font-black uppercase tracking-wider">
                  CURRENT STATUS: {isActive ? 'ACTIVE (IN PLAY)' : 'PAUSED (CHECKED OUT)'}
                </div>
                <div className="text-[11px] opacity-80 font-sans">
                  {isActive 
                    ? 'Active play timer is currently running.' 
                    : 'Active play timer is frozen. Operative is out of field.'}
                </div>
              </div>
            </div>
            <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg border ${
              isActive
                ? 'bg-proto-signal/20 border-proto-signal/50 text-proto-signal'
                : 'bg-proto-gold/20 border-proto-gold/50 text-proto-gold'
            }`}>
              {isActive ? 'IN GAME' : 'PAUSED'}
            </span>
          </div>

          {/* Operative Credentials Card */}
          <div className="p-4 rounded-xl bg-proto-surface0 border border-proto-surface1 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-proto-subtext flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5 text-proto-logic" />
                  <span>OPERATIVE IDENTITY</span>
                </div>
                <h4 className="text-2xl font-black text-proto-text tracking-wide">
                  {agent.agent_number || agent.agent_id}
                </h4>
                <p className="text-sm text-proto-subtext font-sans font-medium mt-0.5">
                  {agent.name}
                </p>
                <p className="text-xs text-proto-subtext/70 mt-0.5">
                  Roll / Contact: {agent.auth_identifier || 'None'} • {agent.contact || 'No phone'}
                </p>
              </div>

              {/* Physical Wristband Confirmation */}
              <div className="p-3 rounded-xl bg-proto-base border border-proto-gold/40 text-right shrink-0">
                <div className="text-[10px] text-proto-subtext flex items-center justify-end gap-1 mb-0.5">
                  <Ticket className="w-3 h-3 text-proto-gold" />
                  <span>WRISTBAND ID</span>
                </div>
                <span className="text-sm font-black text-proto-gold tracking-wider font-mono">
                  {agent.wristband_id || agent.agent_id}
                </span>
              </div>
            </div>

            {/* Role, Score, and Timer Stats */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-proto-surface1 text-xs">
              <div className="p-2.5 rounded-xl bg-proto-base border border-proto-surface1">
                <span className="text-[10px] text-proto-subtext block uppercase">Domain Role</span>
                <span className="font-bold text-proto-logic">{agent.archetype}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-proto-base border border-proto-surface1">
                <span className="text-[10px] text-proto-subtext block uppercase flex items-center gap-1">
                  <Award className="w-3 h-3 text-proto-gold" />
                  <span>Score</span>
                </span>
                <span className="font-bold text-proto-gold">{agent.score} PTS</span>
              </div>

              <div className="p-2.5 rounded-xl bg-proto-base border border-proto-surface1">
                <span className="text-[10px] text-proto-subtext block uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-proto-signal" />
                  <span>Play Time</span>
                </span>
                <span className="font-bold text-proto-text">
                  {formatActiveTime(liveSeconds)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Prompt */}
          <div className="text-center">
            <p className="text-xs font-bold text-proto-text uppercase tracking-wider">
              SELECT DESK ACTION:
            </p>
            <p className="text-[11px] text-proto-subtext font-sans mt-0.5">
              Choose to activate their timer for campus entry or freeze it upon departure.
            </p>
          </div>

          {/* Dedicated Check-In & Check-Out Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* CHECK IN BUTTON */}
            <button
              type="button"
              onClick={() => handleAction('IN')}
              disabled={confirmingAction !== null}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer group ${
                !isActive
                  ? 'bg-proto-signal text-[#0a0f0d] border-proto-signal font-black shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:brightness-110 scale-[1.02]'
                  : 'bg-proto-surface0 border-proto-surface1 text-proto-text hover:border-proto-signal/60 hover:bg-proto-signal/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${!isActive ? 'bg-[#0a0f0d]/20 text-[#0a0f0d]' : 'bg-proto-signal/20 text-proto-signal'}`}>
                  <LogIn className="w-5 h-5" />
                </div>
                {!isActive && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#0a0f0d]/20 text-[#0a0f0d]">
                    RECOMMENDED
                  </span>
                )}
              </div>
              <div>
                <div className={`text-sm font-black uppercase tracking-wide flex items-center gap-1.5 ${!isActive ? 'text-[#0a0f0d]' : 'text-proto-signal'}`}>
                  <Play className="w-4 h-4 fill-current" />
                  <span>CHECK IN</span>
                </div>
                <div className={`text-[11px] font-sans mt-0.5 ${!isActive ? 'text-[#0a0f0d]/80' : 'text-proto-subtext'}`}>
                  {isActive ? 'Re-confirm Active (Timer running)' : 'Mark Active • Start/Resume Timer'}
                </div>
              </div>
            </button>

            {/* CHECK OUT BUTTON */}
            <button
              type="button"
              onClick={() => handleAction('OUT')}
              disabled={confirmingAction !== null}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer group ${
                isActive
                  ? 'bg-proto-gold text-[#0a0f0d] border-proto-gold font-black shadow-[0_0_20px_rgba(255,191,0,0.3)] hover:brightness-110 scale-[1.02]'
                  : 'bg-proto-surface0 border-proto-surface1 text-proto-text hover:border-proto-gold/60 hover:bg-proto-gold/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${isActive ? 'bg-[#0a0f0d]/20 text-[#0a0f0d]' : 'bg-proto-gold/20 text-proto-gold'}`}>
                  <LogOut className="w-5 h-5" />
                </div>
                {isActive && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#0a0f0d]/20 text-[#0a0f0d]">
                    RECOMMENDED
                  </span>
                )}
              </div>
              <div>
                <div className={`text-sm font-black uppercase tracking-wide flex items-center gap-1.5 ${isActive ? 'text-[#0a0f0d]' : 'text-proto-gold'}`}>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>CHECK OUT</span>
                </div>
                <div className={`text-[11px] font-sans mt-0.5 ${isActive ? 'text-[#0a0f0d]/80' : 'text-proto-subtext'}`}>
                  {isActive ? 'Mark Paused • Freeze Timer' : 'Already Paused (Keep frozen)'}
                </div>
              </div>
            </button>

          </div>

          {/* Dismiss Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-proto-surface0 border border-proto-surface1 hover:border-proto-surface2 text-xs text-proto-subtext hover:text-proto-text transition-all flex items-center justify-center gap-2 cursor-pointer font-bold"
            >
              <X className="w-4 h-4" />
              <span>DISMISS / KEEP CURRENT STATUS</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
