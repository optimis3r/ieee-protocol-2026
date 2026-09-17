'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Agent, AgentNode, NodeItem, AgentIntel, IntelFragment, GameState } from '@/types/database';
import { Store, initStore } from '@/lib/store';
import { StatusRibbon } from '@/components/hud/StatusRibbon';
import { BroadcastBanner } from '@/components/hud/BroadcastBanner';
import { NodeTerminal } from '@/components/nodes/NodeTerminal';
import { NodeModal } from '@/components/nodes/NodeModal';
import { IntelLocker } from '@/components/intel/IntelLocker';
import { HypothesisModal } from '@/components/hypothesis/HypothesisModal';
import { QRScannerModal, ScanResult } from '@/components/scanner/QRScannerModal';
import { 
  Terminal, 
  KeyRound, 
  Sparkles, 
  ScanLine, 
  LogOut, 
  Radio, 
  AlertCircle,
  QrCode
} from 'lucide-react';

function AgentHUD() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    id: 1,
    status: 'NETWORK_ACTIVE',
    global_broadcast: null,
    leaderboard_visible: true,
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

    // 4. Enforce 15-minute Gatekeeper Session Check
    const validity = Store.checkSessionValidity(currentAgent.agent_id);
    if (!validity.valid) {
      // Must be scanned by host to enter/re-enter
      router.push('/my-badge');
      return;
    }

    // Agent is valid - record active presence
    Store.recordActivity(currentAgent.agent_id);
    setAgent(currentAgent);
    refreshAgentData(currentAgent.agent_id);

    // Heartbeat: update active presence every 20s and re-verify validity
    const heartbeatInterval = setInterval(() => {
      if (currentAgent) {
        Store.recordActivity(currentAgent.agent_id);
        const check = Store.checkSessionValidity(currentAgent.agent_id);
        if (!check.valid) {
          router.push('/my-badge');
        }
      }
    }, 20000);

    // Track departure when tab becomes hidden or window unloads
    const handleVisibilityChange = () => {
      if (!currentAgent) return;
      if (document.visibilityState === 'hidden') {
        Store.recordDeparture(currentAgent.agent_id);
      } else if (document.visibilityState === 'visible') {
        const check = Store.checkSessionValidity(currentAgent.agent_id);
        if (!check.valid) {
          router.push('/my-badge');
        } else {
          Store.recordActivity(currentAgent.agent_id);
          refreshAgentData(currentAgent.agent_id);
        }
      }
    };

    const handleBeforeUnload = () => {
      if (currentAgent) {
        Store.recordDeparture(currentAgent.agent_id);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cross-tab and live store event listener
    const handleStoreUpdate = () => {
      if (currentAgent) {
        const fresh = Store.getAgentById(currentAgent.agent_id);
        if (fresh) {
          const check = Store.checkSessionValidity(fresh.agent_id);
          if (!check.valid) {
            router.push('/my-badge');
            return;
          }
          refreshAgentData(fresh.agent_id);
        }
      }
    };

    window.addEventListener('ieee_store_update', handleStoreUpdate);
    window.addEventListener('storage', handleStoreUpdate);

    return () => {
      clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('ieee_store_update', handleStoreUpdate);
      window.removeEventListener('storage', handleStoreUpdate);
    };
  }, [searchParams, router, refreshAgentData]);

  // Handle QR Scan results inside agent portal
  const handleScanSuccess = (result: ScanResult) => {
    if (!agent) return;

    if (result.type === 'NODE') {
      // Find node and open its interaction modal
      const targetNode = nodes.find(n => n.node.id === result.id);
      if (targetNode) {
        setSelectedNode(targetNode);
      } else {
        // Auto-unlock and verify
        const submitRes = Store.submitNodeAnswer(agent.agent_id, result.id, result.id);
        setToastMessage(submitRes.message);
        refreshAgentData(agent.agent_id);
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
      // Generic code test
      setToastMessage(`SCANNED DATA: ${result.raw}`);
    }
  };

  const handleLogout = () => {
    if (agent) {
      Store.logoutPlayer(agent.agent_id);
    }
    localStorage.removeItem('ieee_agent_id');
    localStorage.removeItem('ieee_agent_token');
    router.push('/login');
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

  return (
    <div className="min-h-screen bg-[#0d120f] text-[#eaf2ec] flex flex-col">
      {/* Top Status Ribbon */}
      <StatusRibbon
        agent={agent}
        networkStatus={gameState.status}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Global Broadcast Ticker */}
      <BroadcastBanner
        broadcast={gameState.global_broadcast}
        status={gameState.status}
      />

      {/* Main Agent Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Toast alert banner */}
        {toastMessage && (
          <div className="p-3 rounded-xl bg-cat-surface0 border border-cat-sapphire/40 text-xs font-mono-cyber flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-cat-sapphire">
              <Radio className="w-4 h-4 shrink-0 animate-pulse" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-cat-subtext hover:text-cat-text text-[11px]"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-cat-surface0 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('TERMINAL')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono-cyber font-bold transition-all ${
                activeView === 'TERMINAL'
                  ? 'bg-cat-surface1 text-cat-sapphire border border-cat-surface2'
                  : 'text-cat-subtext hover:text-cat-text'
              }`}
            >
              <Terminal className="w-4 h-4" />
              NODE CIRCUITS ({nodes.length})
            </button>
            <button
              onClick={() => setActiveView('INTEL')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono-cyber font-bold transition-all ${
                activeView === 'INTEL'
                  ? 'bg-cat-surface1 text-cat-mauve border border-cat-surface2'
                  : 'text-cat-subtext hover:text-cat-text'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              INTEL VAULT ({intel.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/my-badge"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16201a] hover:bg-[#1f2d25] text-proto-signal text-xs font-mono-cyber border border-[#23332a] transition-colors"
              title="View your personal host check-in QR code"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">My QR Pass</span>
            </Link>

            <a
              href="/leaderboard"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16201a] hover:bg-[#1f2d25] text-proto-gold text-xs font-mono-cyber border border-proto-gold/30 transition-colors"
            >
              <span>🏆 Leaderboard</span>
            </a>

            <button
              onClick={() => setIsHypothesisOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16201a] hover:bg-[#1f2d25] text-proto-signal text-xs font-mono-cyber border border-proto-signal/40 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              TOPOLOGY (+400)
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#16201a] hover:bg-proto-crimson/20 text-[#8ea897] hover:text-proto-crimson text-xs font-mono-cyber border border-[#23332a] transition-colors"
              title="Log Out of this session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>

        {/* Dynamic Viewport */}
        {activeView === 'TERMINAL' ? (
          <NodeTerminal
            nodes={nodes}
            onSelectNode={(n) => setSelectedNode(n)}
          />
        ) : (
          <IntelLocker
            intelList={intel}
            onOpenHypothesis={() => setIsHypothesisOpen(true)}
          />
        )}
      </main>

      {/* Mobile Floating Action Toolbar */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 sm:hidden">
        <button
          onClick={() => setIsScannerOpen(true)}
          className="p-3.5 rounded-full bg-cat-sapphire text-cat-crust shadow-xl active:scale-95 transition-transform"
          title="Open Scanner"
        >
          <ScanLine className="w-6 h-6" />
        </button>
      </div>

      {/* Footer info bar */}
      <footer className="w-full bg-cat-crust border-t border-cat-surface0 px-4 py-3 text-center text-xs font-mono-cyber text-cat-subtext flex items-center justify-between max-w-6xl mx-auto">
        <span className="opacity-75">
          IEEE PROTOCOL // SECURE TERMINAL v2.5
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-[11px] hover:text-cat-red transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          DISENGAGE SESSION
        </button>
      </footer>

      {/* Modals */}
      <NodeModal
        nodeItem={selectedNode}
        agent={agent}
        onClose={() => setSelectedNode(null)}
        onSuccess={() => {
          refreshAgentData(agent.agent_id);
          setSelectedNode(null);
        }}
        onOpenScannerForNode={(nodeId) => {
          setSelectedNode(null);
          setIsScannerOpen(true);
        }}
      />

      <HypothesisModal
        isOpen={isHypothesisOpen}
        agent={agent}
        onClose={() => setIsHypothesisOpen(false)}
        onSuccess={() => {
          refreshAgentData(agent.agent_id);
          setIsHypothesisOpen(false);
        }}
      />

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        title="OPERATIVE RETICLE SENSOR"
        subtitle="Point camera at physical node tags or peer badges"
      />
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cat-mantle flex items-center justify-center p-4">
          <div className="w-8 h-8 border-2 border-cat-sapphire border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AgentHUD />
    </Suspense>
  );
}
