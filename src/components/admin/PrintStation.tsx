'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Store, SEED_NODES } from '@/lib/store';
import { Agent, NodeItem } from '@/types/database';
import { QrCode, Printer, Download, ExternalLink, Shield } from 'lucide-react';

export const PrintStation: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeItem>(SEED_NODES[0]);
  const [agentQrUrl, setAgentQrUrl] = useState<string>('');
  const [nodeQrUrl, setNodeQrUrl] = useState<string>('');

  useEffect(() => {
    const list = Store.getAgents();
    setAgents(list);
    if (list.length > 0) setSelectedAgent(list[0]);
  }, []);

  // Generate Agent QR
  useEffect(() => {
    if (!selectedAgent) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://network.ieee';
    const payload = `${origin}/play?agent_id=${selectedAgent.agent_id}&token=${selectedAgent.token}`;

    QRCode.toDataURL(payload, {
      width: 280,
      margin: 2,
      color: {
        dark: '#1e2030',
        light: '#ffffff',
      },
    }).then(setAgentQrUrl).catch(console.error);
  }, [selectedAgent]);

  // Generate Node QR
  useEffect(() => {
    if (!selectedNode) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://network.ieee';
    const payload = `${origin}/node/${selectedNode.id}`;

    QRCode.toDataURL(payload, {
      width: 280,
      margin: 2,
      color: {
        dark: '#1e2030',
        light: '#ffffff',
      },
    }).then(setNodeQrUrl).catch(console.error);
  }, [selectedNode]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-cat-surface0 pb-3">
        <div>
          <h3 className="font-mono-cyber text-sm font-bold uppercase text-cat-text flex items-center gap-2">
            <QrCode className="w-5 h-5 text-cat-mauve" />
            BADGE & PHYSICAL TAG GENERATOR / PRINT STATION
          </h3>
          <p className="text-xs text-cat-subtext font-mono-cyber">
            Generate and print physical optical tags and operative credentials for the event.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cat-surface0 hover:bg-cat-surface1 text-cat-text text-xs font-mono-cyber font-bold border border-cat-surface1 transition-colors shadow"
        >
          <Printer className="w-4 h-4 text-cat-sapphire" />
          PRINT CARDS
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Agent Badge Generator */}
        <div className="bg-cat-base border border-cat-surface1 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-cat-surface0 pb-2">
            <span className="font-mono-cyber text-xs font-bold uppercase text-cat-mauve">
              OPERATIVE BADGE PREVIEW
            </span>
            <select
              value={selectedAgent?.agent_id || ''}
              onChange={(e) => {
                const found = agents.find((a) => a.agent_id === e.target.value);
                if (found) setSelectedAgent(found);
              }}
              className="px-2.5 py-1 text-xs font-mono-cyber bg-cat-mantle border border-cat-surface1 rounded-lg text-cat-text focus:outline-none"
            >
              {agents.map((ag) => (
                <option key={ag.id} value={ag.agent_id}>
                  {ag.agent_id} ({ag.name})
                </option>
              ))}
            </select>
          </div>

          {selectedAgent && (
            <div className="p-6 bg-cat-mantle border-2 border-cat-mauve/40 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-lg">
              <div className="w-full flex items-center justify-between border-b border-cat-surface0 pb-2 text-[10px] font-mono-cyber text-cat-subtext uppercase">
                <span>IEEE PROTOCOL ARG</span>
                <span className="text-cat-mauve font-bold">{selectedAgent.archetype}</span>
              </div>

              {agentQrUrl && (
                <div className="p-2 bg-white rounded-xl shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={agentQrUrl} alt="Badge QR" className="w-48 h-48 object-contain" />
                </div>
              )}

              <div>
                <h4 className="text-lg font-bold font-mono-cyber text-cat-text">
                  {selectedAgent.name}
                </h4>
                <div className="text-xs font-mono-cyber text-cat-mauve font-bold mt-0.5">
                  ID: {selectedAgent.agent_id}
                </div>
                <div className="text-[10px] font-mono-cyber text-cat-subtext mt-1">
                  SECURITY CLEARANCE LEVEL 1 // AUTHORIZED
                </div>
              </div>

              <div className="pt-2 border-t border-cat-surface0 w-full flex items-center justify-center gap-2">
                <a
                  href={`/play?agent_id=${selectedAgent.agent_id}&token=${selectedAgent.token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono-cyber text-cat-sapphire hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Test Launch URL Directly
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Physical Node Tag Generator */}
        <div className="bg-cat-base border border-cat-surface1 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-cat-surface0 pb-2">
            <span className="font-mono-cyber text-xs font-bold uppercase text-cat-sapphire">
              PHYSICAL NODE OPTICAL TAG
            </span>
            <select
              value={selectedNode?.id || ''}
              onChange={(e) => {
                const found = SEED_NODES.find((n) => n.id === e.target.value);
                if (found) setSelectedNode(found);
              }}
              className="px-2.5 py-1 text-xs font-mono-cyber bg-cat-mantle border border-cat-surface1 rounded-lg text-cat-text focus:outline-none"
            >
              {SEED_NODES.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.id} ({n.type})
                </option>
              ))}
            </select>
          </div>

          {selectedNode && (
            <div className="p-6 bg-cat-mantle border-2 border-cat-sapphire/40 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-lg">
              <div className="w-full flex items-center justify-between border-b border-cat-surface0 pb-2 text-[10px] font-mono-cyber text-cat-subtext uppercase">
                <span>VENUE PHYSICAL SENSOR</span>
                <span className="text-cat-sapphire font-bold">{selectedNode.type}</span>
              </div>

              {nodeQrUrl && (
                <div className="p-2 bg-white rounded-xl shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={nodeQrUrl} alt="Node QR" className="w-48 h-48 object-contain" />
                </div>
              )}

              <div>
                <h4 className="text-base font-bold font-mono-cyber text-cat-text">
                  {selectedNode.title}
                </h4>
                <div className="text-xs font-mono-cyber text-cat-sapphire font-bold mt-0.5">
                  CIRCUIT ID: {selectedNode.id}
                </div>
                <div className="text-[10px] font-mono-cyber text-cat-subtext mt-1 max-w-xs">
                  {selectedNode.payload.location || selectedNode.payload.hint || 'Optical scanning checkpoint'}
                </div>
              </div>

              <div className="pt-2 border-t border-cat-surface0 w-full text-[11px] font-mono-cyber text-cat-yellow">
                VALUE: {selectedNode.base_points} PTS BASE
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
