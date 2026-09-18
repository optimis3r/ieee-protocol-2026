'use client';

import React, { useState } from 'react';
import { AgentNode, NodeItem } from '@/types/database';
import { Store, calculateDynamicScore } from '@/lib/store';
import { 
  Terminal, 
  Users, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Layers,
  Activity,
  Eye,
  Cpu,
  Laptop
} from 'lucide-react';

interface NodeTerminalProps {
  nodes: Array<AgentNode & { node: NodeItem }>;
  onSelectNode: (nodeItem: AgentNode & { node: NodeItem }) => void;
}

export const NodeTerminal: React.FC<NodeTerminalProps> = ({
  nodes,
  onSelectNode,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'AVAILABLE' | 'HANDSHAKE' | 'COMPLETED'>('ALL');

  const filteredNodes = nodes.filter((item) => {
    if (activeTab === 'COMPLETED') return item.is_completed;
    if (activeTab === 'AVAILABLE') return !item.is_completed && item.node.type !== 'DUAL_HANDSHAKE';
    if (activeTab === 'HANDSHAKE') return item.node.type === 'DUAL_HANDSHAKE';
    return true;
  });

  const completedCount = nodes.filter((n) => n.is_completed).length;

  const getDomainIcon = (domain?: NodeItem['domain']) => {
    switch (domain) {
      case 'LOGIC':
        return <Layers className="w-4 h-4 text-proto-logic" />;
      case 'SIGNAL':
        return <Activity className="w-4 h-4 text-proto-signal" />;
      case 'OBSERVATION':
        return <Eye className="w-4 h-4 text-proto-obs" />;
      case 'SYSTEM':
        return <Cpu className="w-4 h-4 text-proto-system" />;
      case 'SOCIAL':
        return <Users className="w-4 h-4 text-proto-social" />;
      default:
        return <Terminal className="w-4 h-4 text-proto-logic" />;
    }
  };

  const getDomainBorder = (domain?: NodeItem['domain'], isCompleted?: boolean) => {
    if (isCompleted) return 'border-proto-signal/60 bg-proto-base/90 hover:border-proto-signal';
    switch (domain) {
      case 'LOGIC':
        return 'border-proto-surface1 hover:border-proto-logic hover:shadow-[0_0_15px_rgba(0,210,255,0.2)]';
      case 'SIGNAL':
        return 'border-proto-surface1 hover:border-proto-signal hover:shadow-[0_0_15px_rgba(0,255,136,0.2)]';
      case 'OBSERVATION':
        return 'border-proto-surface1 hover:border-proto-obs hover:shadow-[0_0_15px_rgba(191,85,236,0.2)]';
      case 'SYSTEM':
        return 'border-proto-surface1 hover:border-proto-system hover:shadow-[0_0_15px_rgba(255,119,0,0.2)]';
      case 'SOCIAL':
        return 'border-proto-surface1 hover:border-proto-social hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]';
      default:
        return 'border-proto-surface1 hover:border-proto-logic';
    }
  };

  return (
    <div className="space-y-5 font-mono-cyber">
      {/* Top Banner: RECOVERED Status */}
      <div className="p-4 rounded-2xl bg-proto-surface0/90 border border-proto-surface1 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-left">
            <span className="text-[10px] text-proto-subtext uppercase tracking-widest block">
              CIRCUIT RECOVERY TRACKER
            </span>
            <span className="text-sm font-black text-proto-logic">
              RECOVERED: {String(completedCount).padStart(2, '0')} / {String(nodes.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Segmented Cyan Bars */}
        <div className="h-3 w-44 bg-proto-obsidian rounded-sm overflow-hidden p-0.5 border border-proto-logic/40">
          <div 
            className="h-full progress-segments shadow-[0_0_8px_#00d2ff] transition-all duration-500 bg-proto-logic" 
            style={{ width: `${Math.max(5, (completedCount / Math.max(1, nodes.length)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-proto-surface1 pb-3">
        <div className="flex items-center gap-1 p-1 bg-proto-base rounded-xl border border-proto-surface1">
          {(
            [
              { id: 'ALL', label: 'All Circuits' },
              { id: 'AVAILABLE', label: 'Available' },
              { id: 'HANDSHAKE', label: 'Social Handshakes' },
              { id: 'COMPLETED', label: 'Completed' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-proto-surface1 text-proto-text font-bold shadow'
                  : 'text-proto-subtext hover:text-proto-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-proto-subtext">
          <span>{filteredNodes.length} CIRCUITS TRACKED</span>
        </div>
      </div>

      {/* Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNodes.map((item) => {
          const { node, is_completed, attempts, points_earned } = item;
          const globalSolves = Store.getNodeGlobalSolves(node.id);
          const currentScore = calculateDynamicScore(node.base_points, globalSolves, attempts);

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
              className={`group relative rounded-2xl bg-proto-base border p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-xl flex flex-col justify-between ${getDomainBorder(
                node.domain,
                is_completed
              )}`}
            >
              <div>
                {/* Header with Station number */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-proto-surface0 border border-proto-surface1 group-hover:border-proto-logic transition-colors">
                      {getDomainIcon(node.domain)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-proto-signal font-bold">
                          {node.station_number || node.id}
                        </span>
                        {node.domain && (
                          <span className="text-[9px] font-bold px-1.5 rounded bg-proto-surface0 text-proto-logic border border-proto-logic/30">
                            {node.domain}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-proto-text leading-snug group-hover:text-proto-logic transition-colors mt-0.5">
                        {node.title}
                      </h4>
                    </div>
                  </div>

                  {is_completed ? (
                    <span className="shrink-0 p-1 rounded-full bg-proto-signal/20 text-proto-signal">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="shrink-0 p-1 rounded-full bg-proto-surface0 text-proto-subtext group-hover:text-proto-logic transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  )}
                </div>

                {/* Laptop Station hint */}
                {node.laptop_label && (
                  <div className="text-[10px] text-proto-gold flex items-center gap-1 my-1">
                    <Laptop className="w-3 h-3" />
                    <span className="truncate">{node.laptop_label}</span>
                  </div>
                )}

                {/* Subtitle / Payload teaser */}
                <div className="text-xs text-proto-subtext line-clamp-2 my-2 min-h-[32px]">
                  {payloadTeaser}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-proto-surface1 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-proto-subtext text-[11px]">
                  <Clock className="w-3 h-3" />
                  <span>{globalSolves} solves</span>
                  {attempts > 0 && !is_completed && (
                    <span className="text-proto-crimson ml-1">({attempts} tries)</span>
                  )}
                </div>

                <div className="font-bold">
                  {is_completed ? (
                    <span className="text-proto-signal">
                      +{points_earned || node.base_points} PTS
                    </span>
                  ) : (
                    <span className="text-proto-gold">
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
