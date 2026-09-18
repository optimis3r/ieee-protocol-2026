'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Agent, AgentNode, NodeItem, AgentIntel, IntelFragment, GameState } from '@/types/database';
import { Store, initStore, getAgentActiveSeconds } from '@/lib/store';
import { StatusRibbon } from '@/components/hud/StatusRibbon';
import { BroadcastBanner } from '@/components/hud/BroadcastBanner';
import { NodeTerminal } from '@/components/nodes/NodeTerminal';
import { NodeModal } from '@/components/nodes/NodeModal';
import { IntelLocker } from '@/components/intel/IntelLocker';
import { HypothesisModal } from '@/components/hypothesis/HypothesisModal';
import { QRScannerModal, ScanResult } from '@/components/scanner/QRScannerModal';
import { 
  ScanLine, 
  Pause,
  FileSearch,
  Radio,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

function AgentHUD() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [activeSeconds, setActiveSeconds] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState>({
    id: 1,
    status: 'NETWORK_ACTIVE',
    global_broadcast: null,
    leaderboard_visible: true,
    submission_cutoff_time: '20:00',
    updated_at: new Date().toISOString(),
  });
  const [nodes, setNodes] = useState<Array<AgentNode & { node: NodeItem }>>([]);
  const [intel, setIntel] = useState<Array<AgentIntel & { intel: IntelFragment }>>([]);
  const [activeView, setActiveView] = useState<'TERMINAL' | 'INTEL'>('TERMINAL');

  // Modals
  const [selectedNode, setSelectedNode] = useState<(AgentNode & { node: NodeItem }) | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isHypothesisOpen, setIsHypothesisOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize and load agent session
  const refreshAgentData = useCallback((currentAgentId: string) => {
    const freshAgent = Store.getAgentById(currentAgentId);
    if (freshAgent) {
      setAgent({ ...freshAgent });
      setActiveSeconds(getAgentActiveSeconds(freshAgent));
      setNodes(Store.getAgentNodes(freshAgent.agent_id));
      setIntel(Store.getAgentIntel(freshAgent.agent_id));
      setGameState(Store.getGameState());
    }
  }, []);

  useEffect(() => {
    initStore();

    // 1. Check query parameters first
    const paramAgentId = searchParams.get('agent_id');
    const paramToken = searchParams.get('token');

    let currentAgent: Agent | null = null;

    if (paramAgentId) {
      currentAgent = Store.validateAgent(paramAgentId, paramToken || undefined);
      if (currentAgent) {
        localStorage.setItem('ieee_agent_id', currentAgent.agent_id);
        localStorage.setItem('ieee_agent_token', currentAgent.token);
      }
    }

    // 2. Fall back to localStorage session token
    if (!currentAgent) {
      const storedAgentId = localStorage.getItem('ieee_agent_id');
      const storedToken = localStorage.getItem('ieee_agent_token');
      if (storedAgentId) {
        currentAgent = Store.validateAgent(storedAgentId, storedToken || undefined);
      }
    }

    // 3. If still not authenticated, redirect to /login
    if (!currentAgent) {
      router.push('/login');
      return;
    }

    // 4. Event Status Guard: If event is in STANDBY, only admins can access play HUD
    const isAdmin = typeof window !== 'undefined' && sessionStorage.getItem('ieee_admin_auth') === 'true';
    if (!isAdmin && !Store.isEventActive()) {
      router.push('/standby');
      return;
    }

    // 5. Check Session Status: Mandatory Initial Check-In at Operations Desk
    const sessionStatus = Store.checkSessionStatus(currentAgent.agent_id);
    if (sessionStatus.status === 'AWAITING_CHECKIN') {
      router.push('/my-badge');
      return;
    }

    // Agent is checked-in: record presence and start live view
    Store.recordActivity(currentAgent.agent_id);
    setTimeout(() => {
      setAgent(currentAgent);
      refreshAgentData(currentAgent.agent_id);
    }, 0);

    // Live 1-second interval to update active play timer clock
    const clockInterval = setInterval(() => {
      const live = Store.getAgentById(currentAgent.agent_id);
      if (live) {
        setActiveSeconds(getAgentActiveSeconds(live));
      }
    }, 1000);

    // Heartbeat every 25s
    const heartbeatInterval = setInterval(() => {
      if (currentAgent) {
        Store.recordActivity(currentAgent.agent_id);
      }
    }, 25000);

    // Cross-tab and live store event listener
    const handleStoreUpdate = () => {
      if (currentAgent) {
        refreshAgentData(currentAgent.agent_id);
      }
    };

    window.addEventListener('ieee_store_update', handleStoreUpdate);
    window.addEventListener('storage', handleStoreUpdate);

    return () => {
      clearInterval(clockInterval);
      clearInterval(heartbeatInterval);
      window.removeEventListener('ieee_store_update', handleStoreUpdate);
      window.removeEventListener('storage', handleStoreUpdate);
    };
  }, [searchParams, router, refreshAgentData]);

  // Handle QR Scan results inside agent portal
  const handleScanSuccess = (result: ScanResult) => {
    if (!agent) return;

    if (result.type === 'NODE' || result.id.startsWith('NODE-')) {
      // Record access to unlock or timestamp the node
      Store.recordNodeAccess(agent.agent_id, result.id);
      refreshAgentData(agent.agent_id);

      const updatedList = Store.getAgentNodes(agent.agent_id);
      const targetNode = updatedList.find(n => n.node.id.toUpperCase() === result.id.toUpperCase());
      if (targetNode) {
        setSelectedNode(targetNode);
        setToastMessage(`STATION ACCESSED: [${targetNode.node.station_number || 'STATION'}] ${targetNode.node.title}`);
      } else {
        setToastMessage(`NODE ${result.id} ACCESSED`);
      }
    } else if (result.type === 'BADGE') {
      // Handshake with peer agent
      const handshakeNode = nodes.find(n => n.node.type === 'DUAL_HANDSHAKE' && !n.is_completed);
      if (handshakeNode) {
        const res = Store.submitHandshake(agent.agent_id, result.id, handshakeNode.node.id);
        setToastMessage(res.message);
        refreshAgentData(agent.agent_id);
      } else {
        setToastMessage(`OPERATIVE IDENTIFIED: ${result.id}. No pending handshake circuits currently active.`);
      }
    } else {
      setToastMessage(`DATA PARSED: ${result.raw}`);
    }
  };

  if (!agent) {
    return (
      <div className="min-h-screen bg-[#0d120f] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-proto-signal border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-mono-cyber text-xs text-[#8ea897] uppercase tracking-wider">
          AUTHENTICATING OPERATIVE CREDENTIALS...
        </p>
      </div>
    );
  }

  const connectionsCount = Store.getAgents().filter(a => a.agent_id !== agent.agent_id).length > 0 ? 2 : 0;
  const availableNodesCount = nodes.filter(n => !n.is_completed).length;
  const isPaused = agent.check_in_status === 'PAUSED';

  return (
    <div className="min-h-screen bg-[#0d120f] text-[#eaf2ec] flex flex-col font-mono-cyber selection:bg-proto-signal selection:text-[#0d120f]">
      {/* Top Status Ribbon with Agent 047 & Live Telemetry */}
      <StatusRibbon
        agent={agent}
        networkStatus={gameState.status}
        activeSeconds={activeSeconds}
        discoveriesCount={intel.length}
        connectionsCount={connectionsCount}
        availableNodesCount={availableNodesCount}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Global Broadcast Ticker */}
      <BroadcastBanner
        broadcast={gameState.global_broadcast}
        status={gameState.status}
      />

      {/* Paused Off-Site Status Notice */}
      {isPaused && (
        <div className="w-full bg-[#1e1b10] border-b border-proto-gold/40 px-4 py-2.5 text-xs text-proto-gold flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <Pause className="w-4 h-4 shrink-0 animate-pulse text-proto-gold" />
            <span>
              <strong>CHECKED OUT // TIMER PAUSED:</strong> You are currently off-site. Your score and progress are preserved. Scan your phone QR at the Operations Desk upon return to resume active play.
            </span>
          </div>
        </div>
      )}

      {/* Main Agent Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Toast alert banner */}
        {toastMessage && (
          <div className="p-3 rounded-xl bg-[#141d17] border border-proto-logic/40 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-proto-logic">
              <Radio className="w-4 h-4 shrink-0 animate-pulse" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-[10px] text-[#8ea897] hover:text-[#eaf2ec]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Action Controls & View Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-[#141d17] p-1.5 rounded-2xl border border-[#223027]">
            <button
              onClick={() => setActiveView('TERMINAL')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeView === 'TERMINAL'
                  ? 'bg-proto-signal text-[#0a0f0d] shadow-sm'
                  : 'text-[#8ea897] hover:text-[#eaf2ec]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>CIRCUIT TERMINALS ({nodes.length})</span>
            </button>

            <button
              onClick={() => setActiveView('INTEL')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeView === 'INTEL'
                  ? 'bg-proto-obs text-[#0a0f0d] shadow-sm'
                  : 'text-[#8ea897] hover:text-[#eaf2ec]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>INTEL LOCKER ({intel.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Deduction Hypothesis Trigger Button */}
            <button
              onClick={() => setIsHypothesisOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141d17] hover:bg-[#1a251e] text-proto-gold border border-proto-gold/40 text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
            >
              <FileSearch className="w-4 h-4 text-proto-gold" />
              <span>TOPOLOGY DEDUCTION (+400)</span>
            </button>

            {/* In-App Camera Scanner */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-proto-logic to-proto-signal text-[#0a0f0d] text-xs font-black uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all shadow cursor-pointer"
            >
              <ScanLine className="w-4 h-4" />
              <span>SCAN NODE QR</span>
            </button>
          </div>
        </div>

        {/* View Switcher: Terminal Nodes vs Intel Locker */}
        {activeView === 'TERMINAL' ? (
          <NodeTerminal
            nodes={nodes}
            onSelectNode={(nodeItem) => setSelectedNode(nodeItem)}
          />
        ) : (
          <IntelLocker 
            intelList={intel} 
            onOpenHypothesis={() => setIsHypothesisOpen(true)}
          />
        )}
      </main>

      {/* Node Interaction Modal */}
      {selectedNode && (
        <NodeModal
          nodeItem={selectedNode}
          agent={agent}
          onClose={() => setSelectedNode(null)}
          onSuccess={() => {
            refreshAgentData(agent.agent_id);
            setSelectedNode(null);
          }}
        />
      )}

      {/* QR Scanner Modal (Client Camera) */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        title="OPTICAL SENSOR SCANNER"
        subtitle="Align Station Node QR or Peer Wristband code in reticle"
      />

      {/* Deduction Hypothesis Modal */}
      <HypothesisModal
        isOpen={isHypothesisOpen}
        agent={agent}
        onClose={() => setIsHypothesisOpen(false)}
        onSuccess={() => {
          refreshAgentData(agent.agent_id);
          setIsHypothesisOpen(false);
        }}
      />

      {/* Footer */}
      <footer className="w-full bg-[#101713] border-t border-[#223027] px-4 py-3 text-center text-xs text-[#7d9787] flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto gap-2">
        <div className="flex items-center gap-2">
          <span>NIT WARANGAL IEEE STUDENT BRANCH</span>
          <span>•</span>
          <span>{agent.agent_number || agent.agent_id}</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <Link href="/my-badge" className="hover:text-[#eaf2ec] transition-colors">
            My QR Pass & Band
          </Link>
          <Link href="/leaderboard" className="hover:text-[#eaf2ec] transition-colors">
            Live Standings
          </Link>
          <Link href="/admin" className="text-proto-logic hover:underline flex items-center gap-1">
            Operations <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0d120f] flex items-center justify-center p-4">
          <div className="w-8 h-8 border-2 border-proto-signal border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AgentHUD />
    </Suspense>
  );
}
