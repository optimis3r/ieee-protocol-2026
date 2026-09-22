'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AgentNode, NodeItem } from '@/types/database';
import { Store, calculateDynamicScore } from '@/lib/store';
import { soundEffects } from '@/lib/audio';
import { 
  CheckCircle2, 
  ChevronRight, 
  Layers, 
  Activity, 
  Eye, 
  Cpu, 
  Users, 
  Terminal,
  Laptop,
  Clock,
  ArrowRight,
  RotateCw,
  Sparkles,
  MapPin,
  Compass
} from 'lucide-react';

interface NodeTerminalProps {
  nodes: Array<AgentNode & { node: NodeItem }>;
  onSelectNode: (nodeItem: AgentNode & { node: NodeItem }) => void;
  agentId?: string;
  onRefresh?: () => void;
}

export const NodeTerminal: React.FC<NodeTerminalProps> = ({
  nodes,
  onSelectNode,
  agentId,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [isDeferring, setIsDeferring] = useState(false);
  const [deferNotice, setDeferNotice] = useState<string | null>(null);

  // Separate active (unlocked, unsolved) vs completed
  const completedNodes = nodes.filter((n) => n.is_completed);
  const activeNodes = nodes.filter((n) => !n.is_completed && n.is_unlocked);

  // Active focal mission: the active node with the most recent first_accessed_at, or the first active node
  const activeFocalNode = activeNodes.length > 0
    ? [...activeNodes].sort((a, b) => {
        const timeA = a.first_accessed_at ? new Date(a.first_accessed_at).getTime() : 0;
        const timeB = b.first_accessed_at ? new Date(b.first_accessed_at).getTime() : 0;
        return timeB - timeA;
      })[0]
    : null;

  // Other in-progress stations (e.g. deferred stations)
  const deferredOtherNodes = activeNodes.filter(
    (n) => n.node.id !== activeFocalNode?.node.id
  );

  const filteredNodes = nodes.filter((item) => {
    if (activeTab === 'COMPLETED') return item.is_completed;
    if (activeTab === 'ACTIVE') return !item.is_completed && item.is_unlocked;
    return true;
  });

  const completedCount = completedNodes.length;
  const totalAssigned = nodes.length;

  const getDomainIcon = (domain?: NodeItem['domain']) => {
    switch (domain) {
      case 'LOGIC':
        return <Layers className="w-3.5 h-3.5 text-[#3a8ebd]" />;
      case 'SIGNAL':
        return <Activity className="w-3.5 h-3.5 text-[#2d9f5d]" />;
      case 'OBSERVATION':
        return <Eye className="w-3.5 h-3.5 text-[#9368b7]" />;
      case 'SYSTEM':
        return <Cpu className="w-3.5 h-3.5 text-[#d96b27]" />;
      case 'SOCIAL':
        return <Users className="w-3.5 h-3.5 text-[#2fa596]" />;
      default:
        return <Terminal className="w-3.5 h-3.5 text-[#949e93]" />;
    }
  };

  const handleDeferCurrent = () => {
    if (!agentId || !activeFocalNode || isDeferring) return;
    setIsDeferring(true);
    setDeferNotice(null);

    try {
      const res = Store.deferCurrentNode(agentId, activeFocalNode.node.id);
      if (res.success) {
        setDeferNotice(res.message);
        onRefresh?.();
      } else {
        setDeferNotice(res.message);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to switch station';
      setDeferNotice(msg);
    } finally {
      setIsDeferring(false);
    }
  };

  const handleSwitchFocal = (nodeId: string) => {
    if (!agentId) return;
    Store.setActiveNode(agentId, nodeId);
    onRefresh?.();
  };

  const handleSelfHealInit = () => {
    if (!agentId) return;
    Store.assignInitialNode(agentId);
    Store.seedInitialIntel(agentId);
    onRefresh?.();
  };

  // 7 official tournament stations list
  const tournamentStationsList = Store.getTournamentStations();

  return (
    <div className="space-y-4">
      {/* 7-Station Tournament Progression Ladder Strip */}
      <div className="p-3.5 bg-[#171917] border border-[#2d312c] font-mono-tabular space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#c28b28]" />
            <span className="font-bold uppercase tracking-wider text-[#f4f1ea]">
              TOURNAMENT CIRCUIT MATRIX
            </span>
            <span className="text-[11px] px-2 py-0.5 border border-[#2d312c] text-[#2d9f5d] bg-[#141514] font-bold">
              {completedCount} / 7 SOLVED
            </span>
          </div>

          <div className="text-[11px] text-[#949e93]">
            Target: Solve as many stations as possible before cutoff
          </div>
        </div>

        {/* 7 Station Nodes Visual Ladder */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {tournamentStationsList.map((station, index) => {
            const isSolved = completedNodes.some((n) => n.node.id.toUpperCase() === station.id.toUpperCase());
            const isActive = activeFocalNode?.node.id.toUpperCase() === station.id.toUpperCase();
            const isDeferred = deferredOtherNodes.some((n) => n.node.id.toUpperCase() === station.id.toUpperCase());

            return (
              <div
                key={station.id}
                onClick={() => {
                  if (isActive) return;
                  if (isDeferred) handleSwitchFocal(station.id);
                }}
                className={`p-2 text-center border transition-all text-[10px] ${
                  isSolved
                    ? 'bg-[#152319] border-[#2d9f5d] text-[#2d9f5d]'
                    : isActive
                    ? 'bg-[#221f18] border-[#c28b28] text-[#f4f1ea] shadow-sm animate-pulse'
                    : isDeferred
                    ? 'bg-[#182026] border-[#3a8ebd] text-[#3a8ebd] cursor-pointer hover:border-[#f4f1ea]'
                    : 'bg-[#141514] border-[#2d312c] text-[#949e93]/50'
                }`}
                title={
                  isSolved
                    ? `${station.title} (SOLVED)`
                    : isActive
                    ? `${station.title} (CURRENT ACTIVE MISSION)`
                    : isDeferred
                    ? `${station.title} (DEFERRED - Click to resume)`
                    : `${station.title} (LOCKED - Awaiting sequence)`
                }
              >
                <div className="flex items-center justify-center gap-1 font-bold">
                  {isSolved ? (
                    <CheckCircle2 className="w-3 h-3 text-[#2d9f5d]" />
                  ) : isActive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c28b28]" />
                  ) : (
                    <span>#{index + 1}</span>
                  )}
                </div>
                <div className="truncate text-[9px] mt-0.5 font-bold uppercase">
                  {station.station_number ? station.station_number.replace('Station ', 'ST-') : `S${index + 1}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hero Card: Current Active Directive */}
      {activeFocalNode ? (
        <div className="p-4 sm:p-5 bg-[#1c1f1c] border-2 border-[#c28b28]/70 shadow-lg relative overflow-hidden">
          {/* Accent top stripe */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c28b28] via-[#2d9f5d] to-[#3a8ebd]" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2 font-mono-tabular">
                <span className="px-2 py-0.5 bg-[#c28b28] text-[#141514] text-[10px] font-black uppercase tracking-wider">
                  CURRENT ACTIVE DIRECTIVE
                </span>
                <span className="text-[10px] px-2 py-0.5 border border-[#2d312c] text-[#949e93] bg-[#141514]">
                  {activeFocalNode.node.station_number || activeFocalNode.node.id}
                </span>
                <span className="text-[10px] px-2 py-0.5 border border-[#2d312c] text-[#3a8ebd] bg-[#141514] font-bold">
                  {activeFocalNode.node.domain || 'SYSTEM'} CIRCUIT
                </span>
              </div>

              <h2 className="font-serif-editorial text-xl sm:text-2xl text-[#f4f1ea] font-bold">
                {activeFocalNode.node.title}
              </h2>

              {activeFocalNode.node.laptop_label && (
                <div className="flex items-center gap-1.5 text-xs text-[#c28b28] font-mono-tabular">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-[#c28b28]" />
                  <span className="font-bold">LOCATION:</span>
                  <span className="text-[#f4f1ea]/90">{activeFocalNode.node.laptop_label}</span>
                </div>
              )}

              <p className="text-xs text-[#949e93] font-display-grotesk leading-relaxed pt-1">
                {typeof activeFocalNode.node.payload?.hint === 'string'
                  ? activeFocalNode.node.payload.hint
                  : 'Proceed to the designated physical station terminal and enter your decryption keystream to energize this circuit.'}
              </p>
            </div>

            {/* Right Action Stack */}
            <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-2.5 shrink-0 min-w-[200px] pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-[#2d312c] md:pl-4">
              <div className="font-mono-tabular text-right hidden md:block pb-1">
                <span className="text-[10px] text-[#949e93] block uppercase">CREDIT REWARD</span>
                <span className="text-lg font-bold text-[#2d9f5d]">
                  +{calculateDynamicScore(
                    activeFocalNode.node.base_points,
                    Store.getNodeGlobalSolves(activeFocalNode.node.id),
                    activeFocalNode.attempts
                  )} PTS
                </span>
              </div>

              {/* Primary Action Button */}
              <Link
                href={`/node/${activeFocalNode.node.id}`}
                className="btn-editorial-primary flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-center"
              >
                <span>ENTER STATION TERMINAL</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Skip / Defer Button */}
              <button
                onClick={handleDeferCurrent}
                disabled={isDeferring}
                className="btn-editorial-outline flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] font-bold uppercase text-[#949e93] hover:text-[#f4f1ea] border-[#2d312c] hover:border-[#949e93] cursor-pointer"
                title="Stuck on this mission? Move on to another station. You can return back to this one anytime."
              >
                <RotateCw className={`w-3.5 h-3.5 ${isDeferring ? 'animate-spin' : ''}`} />
                <span>STUCK? MOVE TO ANOTHER STATION</span>
              </button>
              <span className="text-[9px] text-[#949e93] text-center font-mono-tabular">
                (Station is saved; return anytime)
              </span>
            </div>
          </div>

          {/* Deferral Notice Banner */}
          {deferNotice && (
            <div className="mt-3 p-2 bg-[#141514] border border-[#3a8ebd] text-xs font-mono-tabular text-[#3a8ebd] flex items-center justify-between">
              <span>{deferNotice}</span>
              <button
                onClick={() => setDeferNotice(null)}
                className="text-[10px] text-[#949e93] hover:text-[#f4f1ea] uppercase ml-2"
              >
                [Dismiss]
              </button>
            </div>
          )}
        </div>
      ) : completedCount === 7 ? (
        /* All 7 Stations Solved Celebration Hero */
        <div className="p-6 bg-[#16231a] border-2 border-[#2d9f5d] text-center space-y-3 font-mono-tabular">
          <CheckCircle2 className="w-10 h-10 text-[#2d9f5d] mx-auto animate-bounce" />
          <h2 className="font-serif-editorial text-2xl text-[#f4f1ea] font-bold">
            ALL 7 TOURNAMENT CIRCUITS CONQUERED!
          </h2>
          <p className="text-xs text-[#949e93] max-w-lg mx-auto">
            Outstanding work, Operative. You have verified all 7 physical stations across the campus network. Proceed to the classified Intel Locker to finalize your Master Topology Deduction (+400 PTS).
          </p>
          <Link
            href="/play?action=hypothesis"
            className="btn-editorial-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase"
          >
            <Sparkles className="w-4 h-4" />
            <span>SUBMIT MASTER TOPOLOGY HYPOTHESIS (+400 PTS)</span>
          </Link>
        </div>
      ) : null}

      {/* Multiple Active / Deferred Stations Banner */}
      {deferredOtherNodes.length > 0 && (
        <div className="p-3 bg-[#182026] border border-[#3a8ebd]/40 font-mono-tabular space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#3a8ebd] uppercase flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5" />
              DEFERRED CIRCUITS IN YOUR ROSTER ({deferredOtherNodes.length}):
            </span>
            <span className="text-[10px] text-[#949e93]">
              Click any station to switch focus and resume
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {deferredOtherNodes.map((item) => (
              <div
                key={item.node.id}
                onClick={() => handleSwitchFocal(item.node.id)}
                className="p-2.5 bg-[#141514] border border-[#2d312c] hover:border-[#3a8ebd] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 border border-[#2d312c] bg-[#171917]">
                    {getDomainIcon(item.node.domain)}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[#f4f1ea]">
                      {item.node.station_number || item.node.id}: {item.node.title}
                    </div>
                    <div className="text-[9px] text-[#949e93]">
                      {item.attempts > 0 ? `${item.attempts} attempts logged` : 'Preserved in standby'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwitchFocal(item.node.id);
                    }}
                    className="text-[9px] px-2 py-1 bg-[#1a221d] border border-[#2d312c] text-[#949e93] hover:text-[#f4f1ea] hover:border-[#3a8ebd] font-bold uppercase transition-colors"
                    title="Set this circuit as active focal directive on HUD"
                  >
                    FOCUS
                  </button>
                  <Link
                    href={`/node/${item.node.id}`}
                    onClick={() => soundEffects.playScanChirp()}
                    className="text-[10px] px-2.5 py-1 bg-[#3a8ebd]/15 border border-[#3a8ebd] text-[#3a8ebd] hover:bg-[#3a8ebd] hover:text-[#141514] font-bold uppercase transition-colors inline-flex items-center gap-1"
                    title="Open Station Decryption Terminal"
                  >
                    <span>TERMINAL</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zero Blank Screen Safety Fallback */}
      {nodes.length === 0 && (
        <div className="p-8 text-center border-2 border-[#c28b28] bg-[#1c1f1c] text-[#f4f1ea] space-y-4">
          <Terminal className="w-8 h-8 mx-auto text-[#c28b28] animate-pulse" />
          <h3 className="font-serif-editorial text-lg font-bold">
            INITIALIZING OPERATIVE MISSION MATRIX...
          </h3>
          <p className="font-display-grotesk text-xs text-[#949e93] max-w-md mx-auto">
            Your clearance credentials have been recognized. Click below to draw your initial random tournament challenge station.
          </p>
          <button
            onClick={handleSelfHealInit}
            className="btn-editorial-primary px-4 py-2 text-xs font-bold uppercase cursor-pointer"
          >
            [ ASSIGN INITIAL MISSION DIRECTIVE ]
          </button>
        </div>
      )}

      {/* Filter Tabs & Count */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2d312c] pb-2 font-mono-tabular">
        <div className="flex items-center gap-1">
          {(
            [
              { id: 'ALL', label: `ALL (${totalAssigned})` },
              { id: 'ACTIVE', label: `ACTIVE (${activeNodes.length})` },
              { id: 'COMPLETED', label: `SOLVED (${completedCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1 text-[10px] tracking-wider transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#f4f1ea] text-[#141514] font-bold'
                  : 'text-[#949e93] hover:text-[#f4f1ea] border border-[#2d312c]'
              }`}
            >
              [{tab.label}]
            </button>
          ))}
        </div>

        <div className="text-[10px] text-[#949e93]">
          {filteredNodes.length} STATIONS DISPLAYED
        </div>
      </div>

      {/* Station Dossiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredNodes.map((item) => {
          const { node, is_completed, attempts, points_earned } = item;
          const globalSolves = Store.getNodeGlobalSolves(node.id);
          const currentScore = calculateDynamicScore(node.base_points, globalSolves, attempts);
          const isCurrentActive = activeFocalNode?.node.id === node.id;

          const payloadTeaser = typeof node.payload.hint === 'string'
            ? node.payload.hint
            : typeof node.payload.cipher === 'string'
            ? `Cipher: ${node.payload.cipher}`
            : typeof node.payload.description === 'string'
            ? node.payload.description
            : 'Encrypted circuit parameters pending physical verification.';

          return (
            <div
              key={node.id}
              onClick={() => onSelectNode(item)}
              className={`group bg-[#1b1d1b] border p-4 cursor-pointer transition-colors flex flex-col justify-between ${
                is_completed 
                  ? 'border-[#2d9f5d]/50 hover:border-[#2d9f5d]' 
                  : isCurrentActive
                  ? 'border-[#c28b28] hover:border-[#f4f1ea]'
                  : 'border-[#2d312c] hover:border-[#3f453f]'
              }`}
            >
              <div>
                {/* Top Row: Station number + Domain */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 border border-[#2d312c] bg-[#141514]">
                      {getDomainIcon(node.domain)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-mono-tabular">
                        <span className="text-[10px] text-[#c28b28] font-bold">
                          {node.station_number || node.id}
                        </span>
                        {node.domain && (
                          <span className="text-[9px] px-1 border border-[#2d312c] text-[#949e93] bg-[#141514]">
                            {node.domain}
                          </span>
                        )}
                      </div>
                      <h4 className="font-display-grotesk text-xs font-bold text-[#f4f1ea] leading-snug group-hover:text-[#c28b28] transition-colors mt-0.5">
                        {node.title}
                      </h4>
                    </div>
                  </div>

                  {is_completed ? (
                    <span className="editorial-stamp border-[#2d9f5d] text-[#2d9f5d] shrink-0 text-[8px] py-0.5 px-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>SOLVED</span>
                    </span>
                  ) : isCurrentActive ? (
                    <span className="px-1.5 py-0.5 border border-[#c28b28] text-[#c28b28] shrink-0 text-[8px] font-bold uppercase font-mono-tabular bg-[#141514]">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="shrink-0 p-1 text-[#949e93] group-hover:text-[#f4f1ea] transition-colors">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Laptop Station hint */}
                {node.laptop_label && (
                  <div className="text-[10px] text-[#c28b28] flex items-center gap-1 my-1 font-mono-tabular">
                    <Laptop className="w-3 h-3 shrink-0" />
                    <span className="truncate">{node.laptop_label}</span>
                  </div>
                )}

                {/* Subtitle / Payload teaser */}
                <div className="text-[11px] text-[#949e93] line-clamp-2 my-2 min-h-[28px] font-display-grotesk">
                  {payloadTeaser}
                </div>
              </div>

              {/* Card Footer Strip */}
              <div className="pt-2 border-t border-[#2d312c] flex items-center justify-between font-mono-tabular text-[10px]">
                <div className="flex items-center gap-1.5 text-[#949e93]">
                  <Clock className="w-3 h-3" />
                  <span>{globalSolves} solves</span>
                  {attempts > 0 && !is_completed && (
                    <span className="text-[#c93b2b]">({attempts} tries)</span>
                  )}
                </div>

                <div className="font-bold">
                  {is_completed ? (
                    <span className="text-[#2d9f5d]">
                      +{points_earned || node.base_points} PTS
                    </span>
                  ) : (
                    <span className="text-[#c28b28]">
                      {currentScore} PTS
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
