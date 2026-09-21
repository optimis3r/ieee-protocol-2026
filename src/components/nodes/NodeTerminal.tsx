'use client';

import React, { useState } from 'react';
import { AgentNode, NodeItem } from '@/types/database';
import { Store, calculateDynamicScore } from '@/lib/store';
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
  Clock
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
        return <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />;
      case 'SIGNAL':
        return <Activity className="w-3.5 h-3.5 text-[#22c55e]" />;
      case 'OBSERVATION':
        return <Eye className="w-3.5 h-3.5 text-[#c084fc]" />;
      case 'SYSTEM':
        return <Cpu className="w-3.5 h-3.5 text-[#f97316]" />;
      case 'SOCIAL':
        return <Users className="w-3.5 h-3.5 text-[#2dd4bf]" />;
      default:
        return <Terminal className="w-3.5 h-3.5 text-[#38bdf8]" />;
    }
  };

  return (
    <div className="space-y-3 font-mono-cyber">
      {/* Top Banner: RECOVERED Status (Tactile Meter) */}
      <div className="p-3 bg-[#121513] border-2 border-[#28302b] rounded-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#8f9e91] uppercase tracking-wider font-bold">
            CIRCUITS RESTORED:
          </span>
          <span className="text-sm font-black text-[#22c55e]">
            {String(completedCount).padStart(2, '0')} / {String(nodes.length).padStart(2, '0')}
          </span>
        </div>

        {/* Minimal Progress Line */}
        <div className="h-2 w-32 sm:w-48 bg-[#0c0e0d] border border-[#28302b] rounded-none overflow-hidden p-0.5">
          <div 
            className="h-full bg-[#22c55e] transition-all duration-300" 
            style={{ width: `${Math.max(4, (completedCount / Math.max(1, nodes.length)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Tab Navigation (Tactile Filter Tabs) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#28302b] pb-2">
        <div className="flex items-center gap-1">
          {(
            [
              { id: 'ALL', label: 'ALL' },
              { id: 'AVAILABLE', label: 'AVAILABLE' },
              { id: 'HANDSHAKE', label: 'HANDSHAKE' },
              { id: 'COMPLETED', label: 'SOLVED' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1 rounded-sm text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#28302b] text-[#f1ede4] border border-[#48544c]'
                  : 'text-[#8f9e91] hover:text-[#f1ede4] border border-transparent'
              }`}
            >
              [{tab.label}]
            </button>
          ))}
        </div>

        <div className="text-[10px] text-[#8f9e91] font-mono">
          {filteredNodes.length} STATIONS LISTED
        </div>
      </div>

      {/* Nodes Grid (Tactile Station Dossiers) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
              className={`group rounded-sm bg-[#121513] border-2 p-3.5 cursor-pointer transition-all duration-150 shadow-md flex flex-col justify-between ${
                is_completed 
                  ? 'border-[#22c55e]/50 hover:border-[#22c55e]' 
                  : 'border-[#28302b] hover:border-[#38bdf8]'
              }`}
            >
              <div>
                {/* Top Row: Station number + Domain */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-sm bg-[#171b18] border border-[#28302b]">
                      {getDomainIcon(node.domain)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#eab308] font-bold">
                          {node.station_number || node.id}
                        </span>
                        {node.domain && (
                          <span className="text-[9px] font-bold px-1 rounded-sm bg-[#171b18] text-[#8f9e91] border border-[#28302b]">
                            {node.domain}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-[#f1ede4] leading-snug group-hover:text-[#38bdf8] transition-colors mt-0.5">
                        {node.title}
                      </h4>
                    </div>
                  </div>

                  {is_completed ? (
                    <span className="shrink-0 stamp-box stamp-active text-[9px] py-0.5 px-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>SOLVED</span>
                    </span>
                  ) : (
                    <span className="shrink-0 p-1 text-[#8f9e91] group-hover:text-[#f1ede4] transition-colors">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Laptop Station hint */}
                {node.laptop_label && (
                  <div className="text-[10px] text-[#eab308] flex items-center gap-1 my-1 font-mono">
                    <Laptop className="w-3 h-3" />
                    <span className="truncate">{node.laptop_label}</span>
                  </div>
                )}

                {/* Subtitle / Payload teaser */}
                <div className="text-[11px] text-[#8f9e91] line-clamp-2 my-1.5 min-h-[28px] font-sans">
                  {payloadTeaser}
                </div>
              </div>

              {/* Card Footer Strip */}
              <div className="pt-2 border-t border-[#28302b] flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 text-[#8f9e91]">
                  <Clock className="w-3 h-3" />
                  <span>{globalSolves} solves</span>
                  {attempts > 0 && !is_completed && (
                    <span className="text-[#dc2626]">({attempts} tries)</span>
                  )}
                </div>

                <div className="font-bold">
                  {is_completed ? (
                    <span className="text-[#22c55e]">
                      +{points_earned || node.base_points} PTS
                    </span>
                  ) : (
                    <span className="text-[#eab308]">
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
