'use client';

import React, { useState } from 'react';
import { AgentNode, NodeItem } from '@/types/database';
import { Store, calculateDynamicScore } from '@/lib/store';
import { 
  Scan, 
  Terminal, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Cpu,
  ChevronRight
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

  const getNodeIcon = (type: NodeItem['type']) => {
    switch (type) {
      case 'PHYSICAL_QR':
        return <Scan className="w-4 h-4 text-cat-sapphire" />;
      case 'TERMINAL_DECRYPT':
        return <Terminal className="w-4 h-4 text-cat-mauve" />;
      case 'DUAL_HANDSHAKE':
        return <Users className="w-4 h-4 text-cat-yellow" />;
      case 'DEDUCTION_HYPOTHESIS':
        return <Sparkles className="w-4 h-4 text-cat-green" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cat-surface0 pb-3">
        <div className="flex items-center gap-1 p-1 bg-cat-mantle rounded-xl border border-cat-surface0">
          {(
            [
              { id: 'ALL', label: 'All Circuits' },
              { id: 'AVAILABLE', label: 'Available' },
              { id: 'HANDSHAKE', label: 'Requires Handshake' },
              { id: 'COMPLETED', label: 'Completed' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-cyber transition-all ${
                activeTab === tab.id
                  ? 'bg-cat-surface1 text-cat-text font-bold shadow-sm'
                  : 'text-cat-subtext hover:text-cat-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono-cyber text-cat-subtext">
          <span>{filteredNodes.length} CIRCUITS TRACKED</span>
        </div>
      </div>

      {/* Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNodes.map((item) => {
          const { node, is_completed, attempts, points_earned } = item;
          const globalSolves = Store.getNodeGlobalSolves(node.id);
          const currentScore = calculateDynamicScore(node.base_points, globalSolves, attempts);

          return (
            <div
              key={node.id}
              onClick={() => onSelectNode(item)}
              className={`group relative rounded-2xl bg-cat-base border p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-lg flex flex-col justify-between ${
                is_completed
                  ? 'border-cat-green/40 hover:border-cat-green bg-cat-base/90'
                  : 'border-cat-surface1 hover:border-cat-sapphire hover:shadow-cat-sapphire/10'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-cat-surface0 border border-cat-surface1 group-hover:border-cat-sapphire transition-colors">
                      {getNodeIcon(node.type)}
                    </div>
                    <div>
                      <span className="font-mono-cyber text-[11px] text-cat-subtext block">
                        {node.id}
                      </span>
                      <h4 className="text-sm font-bold text-cat-text leading-snug group-hover:text-cat-sapphire transition-colors">
                        {node.title}
                      </h4>
                    </div>
                  </div>

                  {is_completed ? (
                    <span className="shrink-0 p-1 rounded-full bg-cat-green/20 text-cat-green">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="shrink-0 p-1 rounded-full bg-cat-surface0 text-cat-subtext group-hover:text-cat-sapphire transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  )}
                </div>

                {/* Subtitle / Payload teaser */}
                <div className="text-xs text-cat-subtext font-mono-cyber line-clamp-2 my-2 min-h-[32px]">
                  {node.payload.location ||
                    node.payload.cipher ||
                    node.payload.circuit_name ||
                    node.payload.description ||
                    'Encrypted circuit parameters pending verification.'}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-cat-surface0 flex items-center justify-between text-xs font-mono-cyber">
                <div className="flex items-center gap-1.5 text-cat-subtext text-[11px]">
                  <Clock className="w-3 h-3" />
                  <span>{globalSolves} solves</span>
                  {attempts > 0 && !is_completed && (
                    <span className="text-cat-peach ml-1">({attempts} tries)</span>
                  )}
                </div>

                <div className="font-bold">
                  {is_completed ? (
                    <span className="text-cat-green">
                      +{points_earned || node.base_points} PTS
                    </span>
                  ) : (
                    <span className="text-cat-yellow">
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
