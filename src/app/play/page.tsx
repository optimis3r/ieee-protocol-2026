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
  Sparkles,
  QrCode
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
    let isCancelled = false;

    const initializeHUD = async () => {
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

      const activeId = currentAgent?.agent_id || searchParams.get('agent_id') || (typeof window !== 'undefined' ? localStorage.getItem('ieee_agent_id') : null);

      // Sync fresh server state (status, timer, gameState) before applying route guards
      if (activeId) {
        try {
          const syncResult = await Store.syncAgentWithServer(activeId);
          if (syncResult.agent) {
            currentAgent = syncResult.agent;
            localStorage.setItem('ieee_agent_id', currentAgent.agent_id);
            localStorage.setItem('ieee_agent_token', currentAgent.token);
          }
        } catch (_) {}
      }

      if (isCancelled) return;

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
      setAgent(currentAgent);
      refreshAgentData(currentAgent.agent_id);
    };

    initializeHUD();

    // Live 1-second interval to update active play timer clock
    const clockInterval = setInterval(() => {
      const activeId = localStorage.getItem('ieee_agent_id');
      if (activeId) {
        const live = Store.getAgentById(activeId);
        if (live) {
          setActiveSeconds(getAgentActiveSeconds(live));
        }
      }
    }, 1000);

    // Live server polling every 3 seconds for desk pause/resume & game state changes
    const pollInterval = setInterval(async () => {
      const activeId = localStorage.getItem('ieee_agent_id');
      if (!activeId || isCancelled) return;

      try {
        const { agent: freshAg, gameState: freshState } = await Store.syncAgentWithServer(activeId);
        if (isCancelled) return;

        const isAdmin = typeof window !== 'undefined' && sessionStorage.getItem('ieee_admin_auth') === 'true';
        if (!isAdmin && freshState && freshState.status === 'STANDBY') {
          router.push('/standby');
          return;
        }

        if (freshAg) {
          setAgent({ ...freshAg });
          setActiveSeconds(getAgentActiveSeconds(freshAg));
          if (freshState) setGameState(freshState);
        }
      } catch (_) {}
    }, 3000);

    // Heartbeat every 25s
    const heartbeatInterval = setInterval(() => {
      const activeId = localStorage.getItem('ieee_agent_id');
      if (activeId) {
        Store.recordActivity(activeId);
      }
    }, 25000);

    // Cross-tab and live store event listener
    const handleStoreUpdate = () => {
      const activeId = localStorage.getItem('ieee_agent_id');
      if (activeId) {
        refreshAgentData(activeId);
      }
    };

    window.addEventListener('ieee_store_update', handleStoreUpdate);
    window.addEventListener('storage', handleStoreUpdate);

    return () => {
      isCancelled = true;
      clearInterval(clockInterval);
      clearInterval(pollInterval);
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
      <div className="min-h-screen bg-[#141514] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-[#c28b28] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-mono-tabular text-xs text-[#949e93] uppercase tracking-wider">
          AUTHENTICATING OPERATIVE CREDENTIALS...
        </p>
      </div>
    );
  }

  const connectionsCount = Store.getAgents().filter(a => a.agent_id !== agent.agent_id).length > 0 ? 2 : 0;
  const availableNodesCount = nodes.filter(n => !n.is_completed).length;
  const isPaused = agent.check_in_status === 'PAUSED';

  return (
    <div className="min-h-screen bg-[#141514] text-[#f4f1ea] flex flex-col font-display-grotesk selection:bg-[#c93b2b] selection:text-[#f4f1ea]">
      {/* Top Status Ribbon with Live Telemetry */}
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
        <div className="w-full bg-[#1c1a14] border-b border-[#c28b28]/40 px-3 py-2 text-xs text-[#c28b28] flex items-center justify-between font-mono-tabular">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <Pause className="w-3.5 h-3.5 shrink-0 text-[#c28b28]" />
            <span className="text-[11px]">
              <strong>[OFF-SITE // TIMER FROZEN]:</strong> Progress preserved. Scan QR pass at desk to resume active session.
            </span>
          </div>
        </div>
      )}

      {/* Main Agent Viewport */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 space-y-4">
        {/* Toast alert banner */}
        {toastMessage && (
          <div className="p-2.5 bg-[#1b1d1b] border border-[#3a8ebd] text-xs flex items-center justify-between gap-2 font-mono-tabular">
            <div className="flex items-center gap-2 text-[#3a8ebd]">
              <Radio className="w-3.5 h-3.5 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-[10px] text-[#949e93] hover:text-[#f4f1ea] uppercase font-bold"
            >
              [Dismiss]
            </button>
          </div>
        )}

        {/* Action Controls & View Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2d312c] pb-2 font-mono-tabular">
          {/* Toggles */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveView('TERMINAL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase transition-all cursor-pointer ${
                activeView === 'TERMINAL'
                  ? 'bg-[#f4f1ea] text-[#141514]'
                  : 'text-[#949e93] hover:text-[#f4f1ea] border border-[#2d312c]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>CIRCUITS ({nodes.length})</span>
            </button>

            <button
              onClick={() => setActiveView('INTEL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase transition-all cursor-pointer ${
                activeView === 'INTEL'
                  ? 'bg-[#f4f1ea] text-[#141514]'
                  : 'text-[#949e93] hover:text-[#f4f1ea] border border-[#2d312c]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>INTEL ({intel.length})</span>
            </button>
          </div>

          {/* Action Triggers */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHypothesisOpen(true)}
              className="btn-editorial-primary flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold uppercase cursor-pointer"
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>DEDUCE (+400)</span>
            </button>

            <Link
              href="/my-badge"
              className="btn-editorial-outline flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold uppercase"
              title="View Personal QR Pass"
            >
              <QrCode className="w-3.5 h-3.5 text-[#c28b28]" />
              <span className="hidden sm:inline">MY PASS</span>
            </Link>
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
      <footer className="w-full bg-[#141514] border-t border-[#2d312c] px-4 py-3 text-xs text-[#949e93] flex flex-col sm:flex-row items-center justify-between max-w-5xl mx-auto gap-2 font-mono-tabular text-[11px]">
        <div className="flex items-center gap-2">
          <span>NIT WARANGAL IEEE STUDENT BRANCH</span>
          <span>•</span>
          <span>{agent.agent_number || agent.agent_id}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/my-badge" className="hover:text-[#f4f1ea] transition-colors">
            My QR Pass & Band
          </Link>
          <Link href="/leaderboard" className="hover:text-[#f4f1ea] transition-colors">
            Live Standings
          </Link>
          <Link href="/admin" className="text-[#3a8ebd] hover:underline flex items-center gap-1">
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
