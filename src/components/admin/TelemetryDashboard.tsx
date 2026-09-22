'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Store, formatActiveTime, getAgentActiveSeconds } from '@/lib/store';
import { Agent, GameStatus, GameState } from '@/types/database';
import { soundEffects } from '@/lib/audio';
import { 
  sendRegistrationWhatsAppMessages, 
  checkWhatsAppGatewayStatus, 
  unlinkWhatsAppGateway,
  fetchCentralWhatsAppLogs,
  clearCentralWhatsAppLogs,
  WhatsAppGatewayStatus,
  WhatsAppDispatchRecord
} from '@/lib/whatsapp';
import { RegisterModal } from './RegisterModal';
import { OperativePreviewModal } from './OperativePreviewModal';
import { 
  Activity, 
  Users, 
  Radio, 
  ShieldAlert, 
  Send, 
  Lock, 
  Play, 
  Pause, 
  Download, 
  Ticket, 
  Clock, 
  Edit3, 
  RotateCcw, 
  X, 
  MessageSquare, 
  Smartphone, 
  Eye, 
  EyeOff, 
  UserPlus, 
  Trash2, 
  CheckCircle2, 
  ExternalLink, 
  Search,
  QrCode,
  LogOut,
  Zap,
  Globe,
  AlertTriangle,
  Upload,
  FileSpreadsheet
} from 'lucide-react';

interface TelemetryDashboardProps {
  defaultSection?: 'CONTROLS' | 'WHATSAPP';
}

export const TelemetryDashboard: React.FC<TelemetryDashboardProps> = () => {
  const [gameState, setGameState] = useState<GameState>(() => Store.getGameState());
  const [agents, setAgents] = useState<Agent[]>(() => Store.getAgents());
  const [telemetry, setTelemetry] = useState(() => Store.getTelemetry());
  const [broadcastInput, setBroadcastInput] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');

  // WhatsApp Hub State
  const [waConfig, setWaConfig] = useState(() => Store.getWhatsAppConfig());
  const [waLogs, setWaLogs] = useState<WhatsAppDispatchRecord[]>(() => Store.getWhatsAppLogs());
  const [groupLinkInput, setGroupLinkInput] = useState(waConfig.groupLink);
  const [isSendingWa, setIsSendingWa] = useState(false);

  // Score Adjustment Modal State
  const [adjustTarget, setAdjustTarget] = useState<Agent | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(50);
  const [adjustReason, setAdjustReason] = useState('Staff verification bonus');

  // Add Operative Modal
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Operative Detail Preview Modal
  const [previewAgent, setPreviewAgent] = useState<Agent | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // THE GREAT RESET Modal State
  const [isGreatResetModalOpen, setIsGreatResetModalOpen] = useState(false);
  const [greatResetConfirmInput, setGreatResetConfirmInput] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Cutoff Time Editing
  const [cutoffTimeInput, setCutoffTimeInput] = useState(gameState.submission_cutoff_time || '20:00');
  const [isEditingCutoff, setIsEditingCutoff] = useState(false);

  // WhatsApp Baileys Gateway Status
  const [gatewayInfo, setGatewayInfo] = useState<WhatsAppGatewayStatus | null>(null);
  const [isUnlinkingWa, setIsUnlinkingWa] = useState(false);

  // Global State Shift Lock (prevent multi-click jitter & race condition)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Bulk CSV Upload Auto-Register State
  const [isCsvUploadOpen, setIsCsvUploadOpen] = useState(false);
  const [csvFileContent, setCsvFileContent] = useState<string | null>(null);
  const [csvFileName, setCsvFileName] = useState<string>('');
  const [csvPreviewOperatives, setCsvPreviewOperatives] = useState<Array<Partial<Agent>>>([]);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);

  const refreshDashboard = useCallback(async () => {
    setGameState(Store.getGameState());
    const syncedAgents = await Store.syncWithServer();
    setAgents(syncedAgents);
    setTelemetry(Store.getTelemetry());

    // Fetch central WhatsApp logs so all automatic registrations from phones appear
    const centralLogs = await fetchCentralWhatsAppLogs();
    if (centralLogs && centralLogs.length > 0) {
      setWaLogs(centralLogs);
    } else {
      setWaLogs(Store.getWhatsAppLogs());
    }

    setWaConfig(Store.getWhatsAppConfig());
  }, []);

  const handleClearWhatsAppLogs = async () => {
    if (!confirm('Are you sure you want to clear all central WhatsApp transmission logs?')) return;
    await clearCentralWhatsAppLogs();
    setWaLogs([]);
    soundEffects.playScanChirp();
    setActionNotice('WHATSAPP DISPATCH LOGS CLEARED');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleExecuteGreatReset = async () => {
    if (greatResetConfirmInput.trim().toUpperCase() !== 'RESET') {
      alert('Please type RESET to execute THE GREAT RESET.');
      return;
    }

    setIsResetting(true);
    soundEffects.playScanChirp();

    try {
      // 1. Wipe local store (agents, node progress, intel, logs, session tokens)
      Store.greatReset();

      // 2. Clear central WhatsApp logs
      await clearCentralWhatsAppLogs();

      // 3. Trigger server-side purge via participants API
      const adminToken = typeof window !== 'undefined' ? sessionStorage.getItem('ieee_admin_token') || '' : '';
      await fetch('/api/participants', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(adminToken ? { 'x-admin-token': adminToken } : {})
        },
        body: JSON.stringify({ action: 'great_reset' })
      });

      // 4. Update UI states
      setAgents([]);
      setWaLogs([]);
      setTelemetry(Store.getTelemetry());
      setIsGreatResetModalOpen(false);
      setGreatResetConfirmInput('');

      soundEffects.playSuccessChime();
      setActionNotice('⚠️ THE GREAT RESET COMPLETED: ALL USERS & PARTICIPANT DATA PURGED.');
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err) {
      console.error('Error during THE GREAT RESET:', err);
      alert('Error executing reset. Please check console.');
    } finally {
      setIsResetting(false);
    }
  };

  const checkGateway = useCallback(async () => {
    const info = await checkWhatsAppGatewayStatus();
    setGatewayInfo(info);
  }, []);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      checkGateway();
    }, 0);
    // Poll faster (every 2.5s) if waiting for QR scan so UI updates instantly on link
    const pollIntervalMs = gatewayInfo?.status === 'QR_READY' ? 2500 : 8000;
    const gwInterval = setInterval(checkGateway, pollIntervalMs);
    return () => {
      clearTimeout(initTimer);
      clearInterval(gwInterval);
    };
  }, [checkGateway, gatewayInfo?.status]);

  const handleUnlinkWhatsApp = async () => {
    if (!confirm('Are you sure you want to unlink the current WhatsApp device? You will need to scan a new QR code to link another phone.')) {
      return;
    }
    setIsUnlinkingWa(true);
    soundEffects.playScanChirp();
    try {
      const res = await unlinkWhatsAppGateway();
      if (res.success) {
        soundEffects.playSuccessChime();
        setActionNotice('WhatsApp session unlinked. Generating fresh QR code...');
        await checkGateway();
      } else {
        alert(res.error || 'Failed to unlink device');
      }
    } catch (e) {
      console.error(e);
      alert('Error unlinking WhatsApp device');
    } finally {
      setIsUnlinkingWa(false);
      setTimeout(() => setActionNotice(null), 3500);
    }
  };

  useEffect(() => {
    const handleUpdate = () => {
      refreshDashboard();
    };

    window.addEventListener('ieee_store_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('ieee_wa_dispatch', handleUpdate);

    const initTimer = setTimeout(() => {
      refreshDashboard();
    }, 0);
    // 3.5s periodic ticker to poll server for new participants & central WhatsApp logs
    const interval = setInterval(() => {
      refreshDashboard();
    }, 3500);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('ieee_store_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('ieee_wa_dispatch', handleUpdate);
      clearInterval(interval);
    };
  }, [refreshDashboard]);

  const handleStateChange = async (newStatus: GameStatus) => {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(newStatus);
    soundEffects.playScanChirp();
    try {
      const updated = await Store.setGameStateAsync(newStatus);
      setGameState(updated);
      setActionNotice(`PROTOCOL STATE SHIFTED TO: ${newStatus}`);
      await refreshDashboard();
    } finally {
      setIsUpdatingStatus(null);
      setTimeout(() => setActionNotice(null), 3500);
    }
  };

  const handleToggleLeaderboard = async () => {
    const nextVal = !gameState.leaderboard_visible;
    const updated = await Store.setGameStateAsync(gameState.status, gameState.global_broadcast, nextVal, gameState.submission_cutoff_time);
    setGameState(updated);
    soundEffects.playScanChirp();
    setActionNotice(
      nextVal
        ? 'PUBLIC LEADERBOARD RESTORED & VISIBLE: Scores displayed publicly.'
        : 'TELEMETRY BLACKOUT INITIATED: Public standings hidden for suspense.'
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleSaveCutoffTime = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await Store.setGameStateAsync(
      gameState.status,
      gameState.global_broadcast,
      gameState.leaderboard_visible,
      cutoffTimeInput.trim()
    );
    setGameState(updated);
    setIsEditingCutoff(false);
    soundEffects.playSuccessChime();
    setActionNotice(`SUBMISSION CUTOFF TIME UPDATED TO: ${cutoffTimeInput.trim()}`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleDispatchBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastInput.trim()) return;

    const updated = await Store.setGameStateAsync(gameState.status, broadcastInput.trim());
    setGameState(updated);
    soundEffects.playSuccessChime();
    setActionNotice(`PRIORITY DIRECTIVE BROADCAST TO ALL OPERATIVES`);
    setBroadcastInput('');
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleClearBroadcast = async () => {
    const updated = await Store.setGameStateAsync(gameState.status, null);
    setGameState(updated);
    soundEffects.playScanChirp();
    setActionNotice('BROADCAST CLEARED');
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleToggleCheckIn = async (agentId: string) => {
    soundEffects.playScanChirp();
    const res = await Store.toggleCheckInAsync(agentId);
    if (res.success) {
      soundEffects.playSuccessChime();
    }
    setActionNotice(res.message);
    await refreshDashboard();
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleSaveGroupLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupLinkInput.trim()) return;

    Store.setWhatsAppConfig({ groupLink: groupLinkInput.trim() });
    soundEffects.playSuccessChime();
    setActionNotice('OFFICIAL WHATSAPP GROUP LINK UPDATED');
    refreshDashboard();
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Send the 2 WhatsApp messages to an operative from the roster
  const handleSendWhatsAppToAgent = async (agent: Agent) => {
    if (!agent.contact) {
      alert(`No contact phone number recorded for ${agent.name} (${agent.agent_id})`);
      return;
    }

    setIsSendingWa(true);
    soundEffects.playScanChirp();

    try {
      await sendRegistrationWhatsAppMessages({
        recipientPhone: agent.contact,
        agentName: agent.name,
        agentId: agent.agent_id,
        agentNumber: agent.agent_number,
        token: agent.token,
        groupLink: waConfig.groupLink
      });

      soundEffects.playSuccessChime();
      setActionNotice(
        `📱 WhatsApp Transmissions Sent to ${agent.name} (${agent.contact}): Message 1 (Group Link) & Message 2 (QR Pass Image)`
      );
      refreshDashboard();
    } catch (err) {
      console.error(err);
      soundEffects.playLockoutBuzz();
      setActionNotice(`WhatsApp dispatch error for ${agent.name}`);
    } finally {
      setIsSendingWa(false);
      setTimeout(() => setActionNotice(null), 4500);
    }
  };

  const handleDeleteAgent = (agentId: string) => {
    if (confirm(`Are you sure you want to completely remove operative ${agentId} from the roster?`)) {
      Store.deleteAgent(agentId);
      soundEffects.playLockoutBuzz();
      setActionNotice(`OPERATIVE ${agentId} REMOVED FROM ROSTER`);
      refreshDashboard();
      setTimeout(() => setActionNotice(null), 3500);
    }
  };

  const handleExportCSV = () => {
    const csvContent = Store.exportResultsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `the_protocol_results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    soundEffects.playSuccessChime();
    setActionNotice('FULL TOURNAMENT RESULTS CSV EXPORTED');
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleDownloadBackupCSV = () => {
    const csvContent = Store.exportRegistrationBackupCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `protocol_registration_backup_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    soundEffects.playSuccessChime();
    setActionNotice('REGISTRATION BACKUP CSV DOWNLOADED');
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleCsvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvFileContent(text);
      const parsed = Store.parseCSVToOperatives(text);
      setCsvPreviewOperatives(parsed);
    };
    reader.readAsText(file);
  };

  const handleExecuteBulkCsvRegister = async () => {
    if (!csvFileContent) return;
    setIsUploadingCsv(true);
    soundEffects.playScanChirp();

    const res = await Store.bulkRegisterFromCSV(csvFileContent);
    setIsUploadingCsv(false);
    if (res.success) {
      soundEffects.playSuccessChime();
      setActionNotice(res.message);
      setIsCsvUploadOpen(false);
      setCsvFileContent(null);
      setCsvFileName('');
      setCsvPreviewOperatives([]);
      await refreshDashboard();
      setTimeout(() => setActionNotice(null), 5000);
    } else {
      soundEffects.playErrorBuzz();
      alert(res.message);
    }
  };

  const handleApplyScoreAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;

    const res = Store.adjustScore(adjustTarget.agent_id, adjustDelta, adjustReason);
    soundEffects.playSuccessChime();
    setActionNotice(res.message);
    setAdjustTarget(null);
    refreshDashboard();
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleEmergencyReset = (agentId: string) => {
    if (confirm(`WARNING: Reset all score and circuit progress for ${agentId} to 0?`)) {
      const res = Store.resetAgentProgress(agentId);
      soundEffects.playLockoutBuzz();
      setActionNotice(res.message);
      refreshDashboard();
      setTimeout(() => setActionNotice(null), 3500);
    }
  };



  const sortedAgents = [...agents].sort((a, b) => (b.score || 0) - (a.score || 0));

  const filteredAgents = sortedAgents.filter(ag => {
    const q = searchQuery.toLowerCase();
    const matchSearch = 
      ag.agent_id.toLowerCase().includes(q) ||
      ag.name.toLowerCase().includes(q) ||
      (ag.agent_number && ag.agent_number.toLowerCase().includes(q)) ||
      (ag.contact && ag.contact.toLowerCase().includes(q)) ||
      (ag.auth_identifier && ag.auth_identifier.toLowerCase().includes(q));
    const matchDomain = domainFilter === 'ALL' || ag.archetype === domainFilter;
    return matchSearch && matchDomain;
  });

  return (
    <div className="space-y-6 font-mono-cyber">
      {/* Alert Notice Banner */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-proto-logic/20 border border-proto-logic/50 text-proto-logic text-xs flex items-center justify-between gap-2 animate-in fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 animate-spin shrink-0" />
            <span className="font-bold">{actionNotice}</span>
          </div>
          <button 
            onClick={() => setActionNotice(null)}
            className="text-proto-logic hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. MASTER LEADERBOARD VISIBILITY CONTROL (HIDE / SHOW TOGGLE) */}
      {/* ============================================================ */}
      <div className={`rounded-2xl border-2 p-5 shadow-2xl transition-all ${
        gameState.leaderboard_visible
          ? 'bg-gradient-to-r from-[#101b14] via-proto-base to-[#101b14] border-proto-signal/60 shadow-[0_0_30px_rgba(0,255,136,0.15)]'
          : 'bg-gradient-to-r from-[#1c0f12] via-proto-base to-[#1c0f12] border-proto-crimson/80 shadow-[0_0_30px_rgba(255,51,68,0.2)]'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${
              gameState.leaderboard_visible 
                ? 'bg-proto-signal/20 text-proto-signal border-proto-signal/50' 
                : 'bg-proto-crimson/20 text-proto-crimson border-proto-crimson/50 animate-pulse'
            }`}>
              {gameState.leaderboard_visible ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-black text-[#f3f7f4] uppercase tracking-wider">
                  PUBLIC LEADERBOARD CONTROLLER
                </h2>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  gameState.leaderboard_visible
                    ? 'bg-proto-signal/20 text-proto-signal border border-proto-signal/50'
                    : 'bg-proto-crimson/20 text-proto-crimson border border-proto-crimson/50 animate-pulse'
                }`}>
                  {gameState.leaderboard_visible ? 'STATUS: PUBLICLY VISIBLE' : 'STATUS: HIDDEN (SUSPENSE BLACKOUT)'}
                </span>
              </div>
              <p className="text-xs text-[#8ea897] font-sans mt-0.5">
                {gameState.leaderboard_visible 
                  ? 'Participants can view live rankings and scores at /leaderboard. Toggle to hide during finale.'
                  : 'Scores and standings are currently concealed from participants. A suspense blackout banner is shown.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <a
              href="/leaderboard"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2.5 rounded-xl bg-proto-surface0 border border-proto-surface1 hover:border-proto-gold text-proto-gold text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <span>Preview /leaderboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleToggleLeaderboard}
              className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                gameState.leaderboard_visible
                  ? 'bg-proto-crimson hover:bg-[#ff4455] text-[#070b09] shadow-[0_0_20px_rgba(255,51,68,0.3)]'
                  : 'bg-proto-signal hover:bg-[#00e676] text-[#070b09] shadow-[0_0_20px_rgba(0,255,136,0.3)]'
              }`}
            >
              {gameState.leaderboard_visible ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>HIDE LEADERBOARD (CONCEAL)</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>SHOW LEADERBOARD (REVEAL)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Global State & Broadcast Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* System State Controls */}
        <div className="lg:col-span-5 bg-proto-base border border-proto-surface1 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-proto-surface1 pb-3">
            <h3 className="text-xs font-bold uppercase text-proto-text flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-proto-system" />
              GLOBAL PROTOCOL STATE
            </h3>
            <span
              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                gameState.status === 'NETWORK_ACTIVE'
                  ? 'bg-proto-signal/20 text-proto-signal border border-proto-signal/40 animate-pulse'
                  : gameState.status === 'NETWORK_LOCKED'
                  ? 'bg-proto-crimson/20 text-proto-crimson border border-proto-crimson/40 animate-pulse'
                  : 'bg-proto-gold/20 text-proto-gold border border-proto-gold/40'
              }`}
            >
              {gameState.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { status: 'STANDBY', label: 'STANDBY', icon: Activity, color: 'text-proto-gold' },
                { status: 'NETWORK_ACTIVE', label: 'ACTIVE', icon: Play, color: 'text-proto-signal' },
                { status: 'NETWORK_LOCKED', label: 'LOCKDOWN', icon: Lock, color: 'text-proto-crimson' },
              ] as const
            ).map((item) => {
              const isCurrent = gameState.status === item.status;
              const isPending = isUpdatingStatus === item.status;
              const Icon = item.icon;
              return (
                <button
                  key={item.status}
                  onClick={() => handleStateChange(item.status)}
                  disabled={isUpdatingStatus !== null}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${
                    isCurrent
                      ? `bg-proto-surface0 ${item.color} border-2 border-current shadow-lg`
                      : 'bg-proto-surface0/40 border-proto-surface1 hover:border-proto-surface2 text-proto-subtext'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
                  <span className="text-[11px] font-bold">
                    {isPending ? 'SHIFTING...' : item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Submission Cutoff Time Editor */}
          <div className="pt-3 border-t border-proto-surface1 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-proto-subtext">
              <Clock className="w-3.5 h-3.5 text-proto-gold" />
              <span>SUBMISSION DEADLINE:</span>
              <strong className="text-proto-gold font-mono">{gameState.submission_cutoff_time || '20:00'}</strong>
            </div>

            {!isEditingCutoff ? (
              <button
                onClick={() => setIsEditingCutoff(true)}
                className="text-[11px] text-proto-logic hover:underline font-bold"
              >
                Change Time
              </button>
            ) : (
              <form onSubmit={handleSaveCutoffTime} className="flex items-center gap-1.5">
                <input
                  type="time"
                  value={cutoffTimeInput}
                  onChange={(e) => setCutoffTimeInput(e.target.value)}
                  className="px-2 py-1 bg-proto-surface0 border border-proto-surface1 rounded text-xs text-proto-text"
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-proto-gold text-[#0a0f0d] text-[10px] font-bold rounded"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingCutoff(false)}
                  className="text-[10px] text-proto-subtext"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Global Broadcast Dispatcher */}
        <div className="lg:col-span-7 bg-proto-base border border-proto-surface1 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-proto-surface1 pb-3">
            <h3 className="text-xs font-bold uppercase text-proto-text flex items-center gap-2">
              <Radio className="w-4 h-4 text-proto-system animate-pulse" />
              LIVE HUD BROADCAST DISPATCHER
            </h3>
            {gameState.global_broadcast && (
              <button
                onClick={handleClearBroadcast}
                className="text-[10px] text-proto-crimson hover:underline cursor-pointer"
              >
                Clear Broadcast
              </button>
            )}
          </div>

          <form onSubmit={handleDispatchBroadcast} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={broadcastInput}
                onChange={(e) => setBroadcastInput(e.target.value)}
                placeholder="Push emergency directive to all operative terminals simultaneously..."
                className="w-full px-3.5 py-2.5 text-xs bg-proto-surface0 border border-proto-surface1 rounded-xl text-proto-text focus:outline-none focus:border-proto-system placeholder:text-proto-subtext/40"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-proto-subtext truncate max-w-sm">
                CURRENT: {gameState.global_broadcast || 'DEFAULT DIRECTIVE ACTIVE'}
              </span>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-proto-system to-proto-gold text-proto-obsidian text-xs font-black uppercase tracking-wider hover:opacity-95 transition-all flex items-center gap-2 shadow cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Push Directive
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. WHATSAPP API & COMMUNICATIONS HUB */}
      {/* ============================================================ */}
      <div className="bg-proto-base border border-proto-surface1 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-proto-surface1 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-proto-signal/15 text-proto-signal border border-proto-signal/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#f3f7f4] uppercase tracking-wider">
                WHATSAPP TRANSMISSION CENTER
              </h3>
              <p className="text-xs text-[#8ea897] font-sans">
                Sends 2 messages upon registration: (1) WhatsApp Group Invite Link, (2) Personal QR Pass Image in format [QR] / [Agent Name].
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 transition-all ${
              gatewayInfo?.online
                ? 'bg-proto-signal/20 text-proto-signal border border-proto-signal/40'
                : gatewayInfo?.status === 'QR_READY'
                ? 'bg-proto-gold/20 text-proto-gold border border-proto-gold/40'
                : 'bg-proto-surface1 text-proto-subtext border border-proto-surface2'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                gatewayInfo?.online
                  ? 'bg-proto-signal animate-pulse'
                  : gatewayInfo?.status === 'QR_READY'
                  ? 'bg-proto-gold animate-ping'
                  : 'bg-proto-subtext'
              }`} />
              <span>
                {gatewayInfo?.online
                  ? `BAILEYS GATEWAY: LIVE (${gatewayInfo.connectedUser || 'LINKED'})`
                  : gatewayInfo?.status === 'QR_READY'
                  ? 'GATEWAY: SCAN QR BELOW'
                  : 'GATEWAY: OFFLINE (START npm run wa:gateway)'}
              </span>
            </span>

            {gatewayInfo?.online && (
              <button
                onClick={handleUnlinkWhatsApp}
                disabled={isUnlinkingWa}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-950/40 text-red-400 border border-red-800/50 hover:bg-red-900/60 transition-all flex items-center gap-1 cursor-pointer"
                title="Unlink phone and generate a fresh QR code"
              >
                {isUnlinkingWa ? <Activity className="w-3 h-3 animate-spin" /> : <LogOut className="w-3 h-3" />}
                <span>Unlink Device</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive In-Dashboard WhatsApp QR Code Pairing Screen */}
        {gatewayInfo?.status === 'QR_READY' && gatewayInfo?.qrDataUrl && (
          <div className="p-6 rounded-2xl bg-[#0b120e] border-2 border-proto-gold/60 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-proto-surface1 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-proto-gold/20 text-proto-gold border border-proto-gold/40 animate-pulse">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-proto-text uppercase tracking-wide flex items-center gap-2">
                    <span>PAIR OPERATIVE WHATSAPP GATEWAY</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-proto-gold/20 text-proto-gold border border-proto-gold/40">
                      SCAN ONCE • STAYS LINKED FOR EVENT
                    </span>
                  </h4>
                  <p className="text-xs text-proto-subtext">
                    Scan this screen with WhatsApp Linked Devices. It will stay linked for the entire 3–4 day event window.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-proto-gold text-xs font-mono">
                <span>Listening for device...</span>
                <Activity className="w-4 h-4 animate-spin" />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-3">
              {/* Visual QR Code Image */}
              <div className="flex flex-col items-center bg-white p-4 rounded-2xl shadow-2xl border-4 border-proto-gold/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={gatewayInfo.qrDataUrl}
                  alt="WhatsApp Web Pairing QR Code"
                  className="w-56 h-56 md:w-64 md:h-64 object-contain rounded-lg"
                />
                <div className="text-[11px] text-gray-800 font-mono font-bold mt-2 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-black" />
                  <span>Point phone camera at this code</span>
                </div>
              </div>

              {/* Instructions Card */}
              <div className="space-y-3 max-w-md text-xs">
                <h5 className="font-bold text-proto-gold uppercase tracking-wider text-[11px]">
                  HOW TO LINK YOUR PHONE (TAKES 10 SECONDS):
                </h5>
                <div className="space-y-2.5 text-proto-subtext font-mono">
                  <div className="flex items-start gap-2.5 bg-proto-surface0 p-3 rounded-xl border border-proto-surface1">
                    <span className="w-5 h-5 rounded-full bg-proto-gold text-black font-black flex items-center justify-center text-[11px] shrink-0">1</span>
                    <span>Open <strong>WhatsApp</strong> on your phone (Organizer or IEEE club phone).</span>
                  </div>
                  <div className="flex items-start gap-2.5 bg-proto-surface0 p-3 rounded-xl border border-proto-surface1">
                    <span className="w-5 h-5 rounded-full bg-proto-gold text-black font-black flex items-center justify-center text-[11px] shrink-0">2</span>
                    <span>Go to <strong>Settings</strong> (iOS) or <strong>Three Dots ⋮</strong> (Android) ➔ tap <strong>Linked Devices</strong> ➔ <strong>Link a Device</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2.5 bg-proto-surface0 p-3 rounded-xl border border-proto-surface1">
                    <span className="w-5 h-5 rounded-full bg-proto-gold text-black font-black flex items-center justify-center text-[11px] shrink-0">3</span>
                    <span>Point your camera at this QR code. Once scanned, this screen will automatically turn <strong className="text-proto-signal">GREEN (LIVE)</strong> and remain linked!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Group Link Configuration */}
          <div className="lg:col-span-12 bg-proto-surface0/60 border border-proto-surface1 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-proto-text uppercase flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-proto-signal" />
                <span>Official WhatsApp Community Group Invite URL:</span>
              </label>
              <a
                href={groupLinkInput}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-proto-signal hover:underline"
              >
                Open Group Link →
              </a>
            </div>

            <form onSubmit={handleSaveGroupLink} className="flex gap-2">
              <input
                type="url"
                required
                value={groupLinkInput}
                onChange={(e) => setGroupLinkInput(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="flex-1 px-3 py-2 text-xs bg-proto-base border border-proto-surface1 rounded-lg text-proto-text focus:outline-none focus:border-proto-signal"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-proto-signal text-[#070b09] font-bold text-xs rounded-lg uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shrink-0"
              >
                Save Link
              </button>
            </form>
            <p className="text-[10px] text-proto-subtext">
              Every participant will receive this link automatically as Message 1 upon registration.
            </p>
          </div>
        </div>

        {/* Live WhatsApp Dispatch Log */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-proto-text uppercase">CENTRALIZED WHATSAPP TRANSMISSION LOGS</span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-proto-subtext">{waLogs.length} transmissions logged</span>
              {waLogs.length > 0 && (
                <button
                  onClick={handleClearWhatsAppLogs}
                  className="text-[10px] text-proto-crimson hover:underline cursor-pointer"
                >
                  Clear Logs
                </button>
              )}
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto border border-proto-surface1 rounded-xl bg-proto-surface0/40 divide-y divide-proto-surface1/60">
            {waLogs.length === 0 ? (
              <div className="p-4 text-center text-xs text-proto-subtext">
                No WhatsApp messages dispatched yet. Automatic registration dispatches and manual messages will appear here.
              </div>
            ) : (
              waLogs.slice(0, 15).map((log: WhatsAppDispatchRecord) => {
                const isDelivered = log.status === 'DELIVERED';
                const isFailed = log.status === 'FAILED';

                return (
                  <div key={log.id} className="p-2.5 text-xs flex flex-wrap items-center justify-between gap-2 hover:bg-proto-surface0/80 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.type === 'GROUP_INVITE' 
                          ? 'bg-proto-logic/20 text-proto-logic border border-proto-logic/40' 
                          : 'bg-proto-signal/20 text-proto-signal border border-proto-signal/40'
                      }`}>
                        {log.type === 'GROUP_INVITE' ? 'MSG 1: GROUP LINK' : 'MSG 2: QR PASS'}
                      </span>
                      <span className="font-mono text-proto-text">{log.recipient}</span>
                      <span className="text-proto-subtext">({log.agentName || log.agentId})</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-proto-subtext font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={`font-bold flex items-center gap-1 ${
                        isDelivered ? 'text-proto-signal' : isFailed ? 'text-proto-crimson' : 'text-proto-gold'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{log.status}</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-proto-base border border-proto-surface1 shadow-lg">
          <span className="text-[11px] text-proto-subtext block uppercase">REGISTERED OPERATIVES</span>
          <div className="text-2xl font-black text-proto-text mt-1 flex items-baseline gap-2">
            <span className="text-proto-system">{telemetry.totalAgents}</span>
            <span className="text-xs text-proto-subtext font-normal">ENROLLED</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-proto-base border border-proto-surface1 shadow-lg">
          <span className="text-[11px] text-proto-subtext block uppercase">ACTIVE ON-SITE</span>
          <div className="text-2xl font-black text-proto-signal mt-1 flex items-baseline gap-2">
            <span>{telemetry.activeAgents}</span>
            <span className="text-xs text-proto-subtext font-normal">IN VENUE</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-proto-base border border-proto-surface1 shadow-lg">
          <span className="text-[11px] text-proto-subtext block uppercase">PAUSED / OFF-SITE</span>
          <div className="text-2xl font-black text-proto-gold mt-1 flex items-baseline gap-2">
            <span>{telemetry.pausedAgents}</span>
            <span className="text-xs text-proto-subtext font-normal">STEPPED OUT</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-proto-base border border-proto-surface1 shadow-lg">
          <span className="text-[11px] text-proto-subtext block uppercase">CIRCUITS SOLVED</span>
          <div className="text-2xl font-black text-proto-logic mt-1">
            {telemetry.completedSolves} <span className="text-xs text-proto-subtext font-normal">TOTAL</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-proto-base border border-proto-surface1 shadow-lg">
          <span className="text-[11px] text-proto-subtext block uppercase">HIGHEST SCORE</span>
          <div className="text-2xl font-black text-proto-gold mt-1">
            {sortedAgents[0]?.score || 0} <span className="text-xs text-proto-subtext font-normal">PTS</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. OPERATIVE MASTER ROSTER & CHECK-IN CONTROLS */}
      {/* ============================================================ */}
      <div className="bg-proto-base border border-proto-surface1 rounded-2xl shadow-xl overflow-hidden space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-proto-signal" />
            <div>
              <h3 className="text-sm font-black text-proto-text uppercase">
                OPERATIVES MASTER ROSTER & LIVE CONTROLS
              </h3>
              <p className="text-xs text-proto-subtext">
                Manage timers, scores, check-in, and resend WhatsApp passes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-proto-signal text-[#0a0f0d] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Enroll Operative</span>
            </button>

            {/* Upload CSV for Automatic Bulk Registration */}
            <button
              onClick={() => setIsCsvUploadOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-proto-logic/20 border border-proto-logic/40 hover:bg-proto-logic/30 text-proto-logic font-bold text-xs uppercase tracking-wider transition-all shadow cursor-pointer"
              title="Upload CSV backup roster to automatically register and allocate AGT-XXX numbers"
            >
              <Upload className="w-4 h-4" />
              <span>Upload CSV (Auto-Register)</span>
            </button>

            {/* Download Registration Backup CSV */}
            <button
              onClick={handleDownloadBackupCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-proto-surface0 border border-proto-surface1 hover:border-proto-gold/50 text-proto-gold font-bold text-xs uppercase tracking-wider transition-all shadow cursor-pointer"
              title="Download clean CSV backup list of everyone who registered (independent of WhatsApp delivery)"
            >
              <Download className="w-4 h-4" />
              <span>Backup Roster (CSV)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-proto-gold/20 text-proto-gold border border-proto-gold/30 ml-0.5">
                {Store.getRegistrationBackup().length || agents.length}
              </span>
            </button>



            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-proto-surface0 border border-proto-surface1 hover:border-proto-surface2 text-proto-text font-bold text-xs uppercase tracking-wider transition-all shadow cursor-pointer"
              title="Export complete mission results and solve telemetry"
            >
              <FileSpreadsheet className="w-4 h-4 text-proto-subtext" />
              <span>Results CSV</span>
            </button>

            {/* THE GREAT RESET Button */}
            <button
              onClick={() => setIsGreatResetModalOpen(true)}
              title="PURGE ALL USERS AND PARTICIPANT DATA"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-600 hover:text-black border border-red-500/60 text-red-400 hover:text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>THE GREAT RESET</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {['ALL', 'LOGIC', 'SIGNAL', 'OBSERVATION', 'SYSTEM', 'SOCIAL'].map((d) => (
              <button
                key={d}
                onClick={() => setDomainFilter(d)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  domainFilter === d
                    ? 'bg-proto-surface2 text-proto-signal border border-proto-signal/40'
                    : 'bg-proto-surface0 text-proto-subtext hover:text-proto-text border border-proto-surface1'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-proto-subtext absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search operative, ID, phone..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-proto-surface0 border border-proto-surface1 rounded-xl text-proto-text focus:outline-none focus:border-proto-signal"
            />
          </div>
        </div>

        {/* Operative Table */}
        <div className="overflow-x-auto border border-proto-surface1 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-proto-surface1 bg-proto-surface0/60 text-proto-subtext text-[10px] uppercase">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Operative</th>
                <th className="py-3 px-3">Account / Phone</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Active Time</th>
                <th className="py-3 px-3 text-right">Score</th>
                <th className="py-3 px-3 text-center">Desk Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-proto-surface1/60">
              {filteredAgents.map((ag, index) => {
                const activeSecs = getAgentActiveSeconds(ag);
                const isActive = ag.check_in_status === 'ACTIVE';
                const isPaused = ag.check_in_status === 'PAUSED';
                const qData = Store.getAgentCurrentQuestion(ag.agent_id);

                return (
                  <tr key={ag.id} className="hover:bg-proto-surface0/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-proto-subtext">
                      {index === 0 ? '👑 #1' : `#${index + 1}`}
                    </td>

                    <td className="py-3 px-3">
                      <button
                        onClick={() => {
                          setPreviewAgent(ag);
                          setIsPreviewModalOpen(true);
                        }}
                        className="text-left group/op block cursor-pointer"
                        title="Click to preview operative details"
                      >
                        <div className="font-bold text-proto-text group-hover/op:text-proto-signal transition-colors flex items-center gap-1">
                          <span>{ag.agent_number || ag.agent_id}</span>
                          <Eye className="w-3 h-3 opacity-0 group-hover/op:opacity-100 text-proto-signal transition-opacity" />
                        </div>
                        <div className="text-[11px] text-proto-subtext">{ag.name}</div>
                        <div className="text-[10px] text-proto-gold flex items-center gap-1 mt-0.5">
                          <Ticket className="w-3 h-3" />
                          <span>Band: {ag.wristband_id || ag.agent_id}</span>
                        </div>
                        {qData.currentNode && (
                          <div className="text-[10px] text-proto-logic flex items-center gap-1 mt-0.5 truncate max-w-[170px]" title={`${qData.currentNode.node.station_number || 'Station'}: ${qData.currentNode.node.title}`}>
                            <Zap className="w-2.5 h-2.5 text-proto-gold shrink-0" />
                            <span className="truncate">{qData.currentNode.node.station_number || 'Station'}: {qData.currentNode.node.title}</span>
                          </div>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono text-proto-text">{ag.auth_identifier || '—'}</div>
                      <div className="text-[10px] text-proto-subtext">{ag.contact || 'No WhatsApp'}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-proto-surface0 text-proto-logic border border-proto-logic/30">
                        {ag.archetype}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-proto-signal/20 text-proto-signal border border-proto-signal/40'
                            : isPaused
                            ? 'bg-proto-gold/20 text-proto-gold border border-proto-gold/40'
                            : 'bg-proto-surface1 text-proto-subtext'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-proto-signal animate-pulse' : isPaused ? 'bg-proto-gold' : 'bg-proto-subtext'
                          }`}
                        />
                        {isActive ? 'ACTIVE (IN)' : isPaused ? 'PAUSED (OUT)' : 'PENDING'}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-proto-subtext" />
                        <span>{formatActiveTime(activeSecs)}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-black text-proto-gold text-sm">
                      {ag.score} PTS
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Preview Operative Button */}
                        <button
                          onClick={() => {
                            setPreviewAgent(ag);
                            setIsPreviewModalOpen(true);
                          }}
                          title="Preview Operative Telemetry & Current Question"
                          className="px-2 py-1 rounded-lg bg-proto-logic/15 text-proto-logic hover:bg-proto-logic hover:text-[#070b09] border border-proto-logic/30 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Preview</span>
                        </button>

                        {/* Send / Resend WhatsApp Pass Button */}
                        <button
                          onClick={() => handleSendWhatsAppToAgent(ag)}
                          disabled={isSendingWa}
                          title="Send/Resend WhatsApp Messages: (1) Group Link, (2) Personal QR Pass Image [QR]/[Agent Name]"
                          className="px-2 py-1 rounded-lg bg-proto-signal/15 text-proto-signal hover:bg-proto-signal hover:text-[#070b09] border border-proto-signal/30 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Smartphone className="w-3 h-3" />
                          <span>Pass</span>
                        </button>

                        {/* Check-In / Check-Out Toggle Button */}
                        <button
                          onClick={() => handleToggleCheckIn(ag.agent_id)}
                          title={isActive ? 'Check-Out (Pause Timer)' : 'Check-In (Start/Resume Timer)'}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isActive
                              ? 'bg-proto-gold/20 text-proto-gold hover:bg-proto-gold hover:text-proto-obsidian border border-proto-gold/40'
                              : 'bg-proto-surface0 text-proto-subtext hover:text-proto-text border border-proto-surface1'
                          }`}
                        >
                          {isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          <span>{isActive ? 'Out' : 'In'}</span>
                        </button>

                        {/* Adjust Score Button */}
                        <button
                          onClick={() => {
                            setAdjustTarget(ag);
                            setAdjustDelta(50);
                            setAdjustReason('Manual staff adjustment');
                          }}
                          title="Manual Score Correction"
                          className="p-1 rounded-lg bg-proto-surface0 border border-proto-surface1 hover:border-proto-logic text-proto-subtext hover:text-proto-text transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Emergency Reset Button */}
                        <button
                          onClick={() => handleEmergencyReset(ag.agent_id)}
                          title="Emergency Reset Operative Progress"
                          className="p-1 rounded-lg bg-proto-surface0 border border-proto-surface1 hover:border-proto-crimson text-proto-subtext hover:text-proto-crimson transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Operative Button */}
                        <button
                          onClick={() => handleDeleteAgent(ag.agent_id)}
                          title="Delete Operative"
                          className="p-1 rounded-lg bg-proto-surface0 border border-proto-surface1 hover:border-proto-crimson text-proto-subtext hover:text-proto-crimson transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Score Adjustment Modal */}
      {adjustTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-proto-obsidian/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-proto-base border-2 border-proto-gold/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-proto-surface1 pb-3">
              <div className="flex items-center gap-2 text-proto-gold font-black text-sm">
                <Edit3 className="w-4 h-4" />
                <span>MANUAL SCORE CORRECTION</span>
              </div>
              <button
                onClick={() => setAdjustTarget(null)}
                className="text-proto-subtext hover:text-proto-crimson"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-1">
              <div className="text-proto-text font-bold">
                Operative: {adjustTarget.agent_number || adjustTarget.agent_id} ({adjustTarget.name})
              </div>
              <div className="text-proto-subtext">
                Current Score: <strong className="text-proto-gold">{adjustTarget.score} PTS</strong>
              </div>
            </div>

            <form onSubmit={handleApplyScoreAdjustment} className="space-y-4">
              <div>
                <label className="block text-[11px] text-proto-subtext uppercase mb-1">
                  Score Adjustment (Points Delta):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustDelta(d => d - 50)}
                    className="p-2 rounded-lg bg-proto-surface0 border border-proto-surface1 hover:border-proto-crimson text-proto-crimson font-bold text-xs"
                  >
                    -50
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustDelta(d => d - 10)}
                    className="p-2 rounded-lg bg-proto-surface0 border border-proto-surface1 hover:border-proto-crimson text-proto-crimson font-bold text-xs"
                  >
                    -10
                  </button>
                  <input
                    type="number"
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(Number(e.target.value))}
                    className="w-full text-center py-2 px-3 bg-proto-surface0 border border-proto-surface1 rounded-xl text-proto-gold font-black text-sm focus:outline-none focus:border-proto-gold"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustDelta(d => d + 10)}
                    className="p-2 rounded-lg bg-proto-surface0 border border-proto-surface1 hover:border-proto-signal text-proto-signal font-bold text-xs"
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustDelta(d => d + 50)}
                    className="p-2 rounded-lg bg-proto-surface0 border border-proto-surface1 hover:border-proto-signal text-proto-signal font-bold text-xs"
                  >
                    +50
                  </button>
                </div>
                <div className="text-[10px] text-proto-subtext mt-1 text-center">
                  Projected Score: <strong>{Math.max(0, (adjustTarget.score || 0) + adjustDelta)} PTS</strong>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-proto-subtext uppercase mb-1">
                  Reason Note:
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Hardware freeze compensation, bonus verification"
                  className="w-full px-3 py-2 text-xs bg-proto-surface0 border border-proto-surface1 rounded-xl text-proto-text focus:outline-none focus:border-proto-gold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-proto-surface1">
                <button
                  type="button"
                  onClick={() => setAdjustTarget(null)}
                  className="px-4 py-2 rounded-xl bg-proto-surface0 text-proto-subtext text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-proto-gold text-[#0a0f0d] font-bold text-xs uppercase"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Operative Registration Modal */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={() => {
          refreshDashboard();
          setActionNotice('NEW OPERATIVE ENROLLED & WHATSAPP PASS TRANSMITTED');
        }}
      />

      {/* Operative Telemetry Detail Preview Modal */}
      <OperativePreviewModal
        agent={previewAgent ? agents.find(a => a.agent_id === previewAgent.agent_id) || previewAgent : null}
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewAgent(null);
        }}
        onToggleCheckIn={(agentId) => {
          handleToggleCheckIn(agentId);
        }}
        onResendWhatsApp={(ag) => {
          handleSendWhatsAppToAgent(ag);
        }}
        onAdjustScore={(ag) => {
          setAdjustTarget(ag);
          setAdjustDelta(50);
          setAdjustReason('Staff verification bonus');
        }}
        onResetAgent={(agentId) => {
          handleEmergencyReset(agentId);
        }}
        onDeleteAgent={(agentId) => {
          if (confirm(`Are you sure you want to delete operative ${agentId}?`)) {
            Store.deleteAgent(agentId);
            setIsPreviewModalOpen(false);
            setPreviewAgent(null);
            refreshDashboard();
          }
        }}
      />

      {/* CSV Bulk Auto-Register Modal */}
      {isCsvUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div 
            className="w-full max-w-2xl bg-proto-base border border-proto-logic/40 rounded-2xl p-6 shadow-2xl space-y-5 text-proto-text font-mono-cyber flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-proto-surface1 pb-3">
              <div className="flex items-center gap-2 text-proto-logic">
                <Upload className="w-5 h-5" />
                <h3 className="text-base font-black uppercase tracking-wider">
                  BULK AUTO-REGISTRATION // CSV IMPORT
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsCsvUploadOpen(false);
                  setCsvFileContent(null);
                  setCsvFileName('');
                  setCsvPreviewOperatives([]);
                }}
                className="text-proto-subtext hover:text-proto-text p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 text-xs">
              <div className="p-3.5 rounded-xl bg-proto-surface0 border border-proto-surface1 space-y-2">
                <div className="text-[11px] font-bold text-proto-gold uppercase flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>CSV File Format Specification</span>
                </div>
                <p className="text-proto-subtext font-sans leading-relaxed">
                  Upload a standard CSV file containing registered participants. The system automatically reads columns for 
                  <strong className="text-proto-text"> Name, Roll Number, Phone / WhatsApp, Tactical Domain, and Wristband ID</strong>.
                </p>
                <p className="text-[11px] text-proto-signal font-sans">
                  💡 If an operative does NOT have an AGT-XXX ID in the CSV, sequential Call Signs (e.g. AGT-001, AGT-002...) are automatically allotted based on the master backup list. Initial station questions and intel fragments will be allocated automatically.
                </p>
              </div>

              {/* File Input Selection */}
              <div className="border-2 border-dashed border-proto-surface2 hover:border-proto-logic/60 rounded-xl p-6 text-center transition-colors bg-proto-surface0/30">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  id="csv-file-upload-input"
                  onChange={handleCsvFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="csv-file-upload-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="w-8 h-8 text-proto-logic animate-bounce" />
                  <span className="font-bold text-sm text-proto-text">
                    {csvFileName ? `Selected: ${csvFileName}` : 'Click to choose or drop a CSV file'}
                  </span>
                  <span className="text-[11px] text-proto-subtext">
                    Accepts exported registration backups or custom attendee spreadsheets
                  </span>
                </label>
              </div>

              {/* Parsed Preview Table */}
              {csvPreviewOperatives.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase text-proto-signal text-[11px]">
                      DETECTED {csvPreviewOperatives.length} OPERATIVE RECORDS:
                    </span>
                    <span className="text-[10px] text-proto-subtext">
                      Preview of first 5 rows
                    </span>
                  </div>

                  <div className="border border-proto-surface1 rounded-xl overflow-hidden">
                    <table className="w-full text-[11px] text-left border-collapse">
                      <thead className="bg-proto-surface0 border-b border-proto-surface1 text-proto-subtext uppercase">
                        <tr>
                          <th className="py-2 px-3">Call Sign</th>
                          <th className="py-2 px-3">Name</th>
                          <th className="py-2 px-3">Roll No</th>
                          <th className="py-2 px-3">Phone</th>
                          <th className="py-2 px-3">Domain</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-proto-surface1">
                        {csvPreviewOperatives.slice(0, 5).map((op, i) => (
                          <tr key={i} className="hover:bg-proto-surface0/40">
                            <td className="py-2 px-3 font-bold text-proto-gold font-mono">
                              {op.agent_id || 'AUTO-ALLOT'}
                            </td>
                            <td className="py-2 px-3 font-semibold text-proto-text">
                              {op.name || 'Unnamed'}
                            </td>
                            <td className="py-2 px-3 text-proto-subtext font-mono">
                              {op.auth_identifier || '—'}
                            </td>
                            <td className="py-2 px-3 text-proto-subtext font-mono">
                              {op.contact || '—'}
                            </td>
                            <td className="py-2 px-3 text-proto-logic font-bold">
                              {op.archetype || 'BALANCED'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvPreviewOperatives.length > 5 && (
                    <div className="text-[10px] text-proto-subtext text-center italic">
                      + {csvPreviewOperatives.length - 5} additional operative records will be registered...
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-proto-surface1">
              <button
                type="button"
                onClick={() => {
                  setIsCsvUploadOpen(false);
                  setCsvFileContent(null);
                  setCsvFileName('');
                  setCsvPreviewOperatives([]);
                }}
                className="px-4 py-2 rounded-xl bg-proto-surface0 hover:bg-proto-surface1 text-proto-subtext font-bold text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteBulkCsvRegister}
                disabled={csvPreviewOperatives.length === 0 || isUploadingCsv}
                className="px-5 py-2 rounded-xl bg-proto-logic text-[#0a0f0d] hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed font-black text-xs uppercase tracking-wider transition-all shadow cursor-pointer flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>
                  {isUploadingCsv 
                    ? 'AUTO-REGISTERING OPERATIVES...' 
                    : `REGISTER ${csvPreviewOperatives.length} OPERATIVES`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}


      {/* THE GREAT RESET Security Confirmation Modal */}
      {isGreatResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div 
            className="w-full max-w-lg bg-[#0f0b0b] border-2 border-red-600/70 rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.35)] space-y-5 text-[#f3f7f4] font-mono-cyber selection:bg-red-600 selection:text-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-red-900/50 pb-4">
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
                <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-red-400">
                  EMERGENCY PROTOCOL: THE GREAT RESET
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsGreatResetModalOpen(false);
                  setGreatResetConfirmInput('');
                }}
                className="text-gray-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#d5caca] font-sans">
              <p className="font-bold text-red-300">
                This action will wipe ALL participant data across the entire system.
              </p>

              <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/60 space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-red-400 font-mono">
                  DATA THAT WILL BE PURGED:
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-red-200/90 font-mono">
                  <li>All enrolled participant profiles (names, IDs, phones, PINs)</li>
                  <li>All station question unlocks, attempts, and solves</li>
                  <li>All participant scores, rankings, and active timers</li>
                  <li>All WhatsApp dispatch transmission history</li>
                  <li>All access logs and session tokens</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-[#141b16] border border-emerald-900/50 text-[11px] text-emerald-300 font-mono">
                ✅ <strong>PROTECTED:</strong> System files, questions, clues, hints, and configurations are NOT deleted.
              </div>

              <div className="space-y-1.5 pt-2 font-mono">
                <label className="block text-[11px] text-red-400 font-bold uppercase">
                  Type <span className="underline font-black text-white">RESET</span> to confirm destruction:
                </label>
                <input
                  type="text"
                  value={greatResetConfirmInput}
                  onChange={(e) => setGreatResetConfirmInput(e.target.value)}
                  placeholder="Type RESET"
                  className="w-full px-3.5 py-2.5 bg-black border border-red-600/60 rounded-xl text-red-400 font-black tracking-widest text-center uppercase focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 text-sm"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-red-900/50">
              <button
                type="button"
                onClick={() => {
                  setIsGreatResetModalOpen(false);
                  setGreatResetConfirmInput('');
                }}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs uppercase cursor-pointer"
              >
                Abort / Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteGreatReset}
                disabled={greatResetConfirmInput.trim().toUpperCase() !== 'RESET' || isResetting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-35 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(239,68,68,0.5)] cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isResetting ? 'EXECUTING PURGE...' : 'CONFIRM THE GREAT RESET'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
