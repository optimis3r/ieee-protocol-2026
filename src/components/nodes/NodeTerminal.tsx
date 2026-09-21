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

  return (
    <div className="space-y-4">
      {/* Top Banner: Restored Status */}
      <div className="p-3 bg-[#1b1d1b] border border-[#2d312c] flex items-center justify-between gap-3 font-mono-tabular">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#949e93] uppercase tracking-wider">
            CIRCUITS SOLVED:
          </span>
          <span className="text-xs font-bold text-[#2d9f5d]">
            {String(completedCount).padStart(2, '0')} / {String(nodes.length).padStart(2, '0')}
          </span>
        </div>

        {/* Minimal Progress Line */}
        <div className="h-1.5 w-32 sm:w-48 bg-[#141514] border border-[#2d312c] overflow-hidden">
          <div 
            className="h-full bg-[#2d9f5d] transition-all duration-300" 
            style={{ width: `${Math.max(4, (completedCount / Math.max(1, nodes.length)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Tab Navigation (Editorial Filter Tabs) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2d312c] pb-2 font-mono-tabular">
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
          {filteredNodes.length} STATIONS
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
              className={`group bg-[#1b1d1b] border p-4 cursor-pointer transition-colors flex flex-col justify-between ${
                is_completed 
                  ? 'border-[#2d9f5d]/50 hover:border-[#2d9f5d]' 
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
                  ) : (
                    <span className="shrink-0 p-1 text-[#949e93] group-hover:text-[#f4f1ea] transition-colors">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Laptop Station hint */}
                {node.laptop_label && (
                  <div className="text-[10px] text-[#c28b28] flex items-center gap-1 my-1 font-mono-tabular">
                    <Laptop className="w-3 h-3" />
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
