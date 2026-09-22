'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Store, SEED_NODES } from '@/lib/store';
import { Agent, NodeItem, ROLE_DETAILS, PrimaryDomain } from '@/types/database';
import { QrCode, Printer, ExternalLink, Ticket, Laptop } from 'lucide-react';

export const PrintStation: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(() => Store.getAgents());
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(() => Store.getAgents()[0] || null);
  const [stations, setStations] = useState<NodeItem[]>(() => Store.getStationNodes());
  const [selectedNode, setSelectedNode] = useState<NodeItem>(() => Store.getStationNodes()[0] || SEED_NODES[0]);
  const [agentQrUrl, setAgentQrUrl] = useState<string>('');
  const [nodeQrUrl, setNodeQrUrl] = useState<string>('');

  useEffect(() => {
    const list = Store.getAgents();
    const stList = Store.getStationNodes();
    setTimeout(() => {
      setAgents(list);
      setStations(stList);
      if (list.length > 0 && !selectedAgent) {
        setSelectedAgent(list[0]);
      }
    }, 0);
  }, [selectedAgent]);

  // Generate Agent QR
  useEffect(() => {
    if (!selectedAgent) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://network.ieee';
    const payload = `${origin}/play?agent_id=${selectedAgent.agent_id}&token=${selectedAgent.token}`;

    QRCode.toDataURL(payload, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0a0f0d',
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
        dark: '#0a0f0d',
        light: '#ffffff',
      },
    }).then(setNodeQrUrl).catch(console.error);
  }, [selectedNode]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const roleMeta = selectedAgent ? ROLE_DETAILS[(selectedAgent.archetype as PrimaryDomain) || 'LOGIC'] : null;

  return (
    <div className="space-y-6 font-mono-cyber">
      <div className="flex items-center justify-between border-b border-proto-surface1 pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase text-proto-text flex items-center gap-2">
            <QrCode className="w-5 h-5 text-proto-gold" />
            BADGE & PHYSICAL STATION TAG GENERATOR / PRINT STATION
          </h3>
          <p className="text-xs text-proto-subtext">
            Generate and print physical optical tags, wristband identifiers, and laptop station markers.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-proto-surface0 hover:bg-proto-surface1 text-proto-text text-xs font-bold border border-proto-surface1 transition-colors shadow cursor-pointer"
        >
          <Printer className="w-4 h-4 text-proto-logic" />
          PRINT CARDS
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Agent Badge Generator */}
        <div className="bg-proto-base border border-proto-surface1 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-proto-surface1 pb-2">
            <span className="text-xs font-bold uppercase text-proto-gold">
              OPERATIVE BADGE & WRISTBAND PREVIEW
            </span>
            <select
              value={selectedAgent?.agent_id || ''}
              onChange={(e) => {
                const found = agents.find((a) => a.agent_id === e.target.value);
                if (found) setSelectedAgent(found);
              }}
              className="px-2.5 py-1 text-xs bg-proto-surface0 border border-proto-surface1 rounded-lg text-proto-text focus:outline-none"
            >
              {agents.map((ag) => (
                <option key={ag.id} value={ag.agent_id}>
                  {ag.agent_number || ag.agent_id} ({ag.name})
                </option>
              ))}
            </select>
          </div>

          {selectedAgent && (
            <div className="p-6 bg-proto-mantle border-2 border-proto-gold/40 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-lg print:border-black print:bg-white print:text-black">
              <div className="w-full flex items-center justify-between border-b border-proto-surface1 pb-2 text-[10px] text-proto-subtext uppercase">
                <span>NIT WARANGAL IEEE PROTOCOL</span>
                <span className="text-proto-signal font-bold">{selectedAgent.archetype}</span>
              </div>

              {agentQrUrl && (
                <div className="p-2 bg-white rounded-xl shadow-inner border border-proto-surface1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={agentQrUrl} alt="Badge QR" className="w-48 h-48 object-contain" />
                </div>
              )}

              <div>
                <h4 className="text-xl font-black text-proto-text">
                  {selectedAgent.agent_number || selectedAgent.agent_id}
                </h4>
                <div className="text-xs text-proto-subtext mt-0.5">
                  {selectedAgent.name} ({selectedAgent.auth_identifier || selectedAgent.contact})
                </div>

                {/* Wristband Callout */}
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-proto-surface0 border border-proto-gold/50 text-proto-gold text-xs font-bold">
                  <Ticket className="w-3.5 h-3.5" />
                  <span>WRISTBAND ID: {selectedAgent.wristband_id || selectedAgent.agent_id}</span>
                </div>

                {roleMeta && (
                  <div className="text-[10px] text-proto-subtext mt-1.5">
                    Directive: {roleMeta.title} ({roleMeta.subtitle})
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-proto-surface1 w-full flex items-center justify-center gap-2 print:hidden">
                <a
                  href={`/play?agent_id=${selectedAgent.agent_id}&token=${selectedAgent.token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-proto-logic hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Launch Terminal Directly
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Physical Node Tag Generator for Laptop Stations */}
        <div className="bg-proto-base border border-proto-surface1 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-proto-surface1 pb-2">
            <span className="text-xs font-bold uppercase text-proto-logic">
              PHYSICAL STATION LAPTOP TAG
            </span>
            <select
              value={selectedNode?.id || ''}
              onChange={(e) => {
                const found = stations.find((n) => n.id === e.target.value) || SEED_NODES.find((n) => n.id === e.target.value);
                if (found) setSelectedNode(found);
              }}
              className="px-2.5 py-1 text-xs bg-proto-surface0 border border-proto-surface1 rounded-lg text-proto-text focus:outline-none"
            >
              {stations.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.station_number || 'STATION'}: {n.title}
                </option>
              ))}
            </select>
          </div>

          {selectedNode && (
            <div className="p-6 bg-proto-mantle border-2 border-proto-logic/40 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-lg print:border-black print:bg-white print:text-black">
              <div className="w-full flex items-center justify-between border-b border-proto-surface1 pb-2 text-[10px] text-proto-subtext uppercase">
                <span className="font-bold text-proto-signal">{selectedNode.station_number || 'STATION'}</span>
                <span className="text-proto-logic font-bold">{selectedNode.domain || 'SYSTEM'} CIRCUIT</span>
              </div>

              {nodeQrUrl && (
                <div className="p-2 bg-white rounded-xl shadow-inner border border-proto-surface1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={nodeQrUrl} alt="Node QR" className="w-48 h-48 object-contain" />
                </div>
              )}

              <div>
                <span className="text-xs text-proto-logic font-bold block mb-1">
                  {selectedNode.station_symbol || 'WORKSTATION TERMINAL'}
                </span>
                <h4 className="text-lg font-black text-proto-text">
                  {selectedNode.title}
                </h4>
                <div className="text-xs text-proto-subtext font-mono mt-0.5">
                  ID: {selectedNode.id} • Base: {selectedNode.base_points} PTS
                </div>
                {selectedNode.laptop_label && (
                  <div className="text-[10px] text-proto-gold mt-1.5 flex items-center justify-center gap-1">
                    <Laptop className="w-3.5 h-3.5" />
                    <span>{selectedNode.laptop_label}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-proto-surface1 w-full flex items-center justify-center gap-2 print:hidden">
                <a
                  href={`/node/${selectedNode.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-proto-signal hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Test Station Link (/node/{selectedNode.id})
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
