import fs from 'fs';
import path from 'path';
import { Agent, AgentNode, GameState, NodeItem, RegistrationBackupRecord, GoogleFormConfig } from '@/types/database';
import { SEED_NODES, getAgentActiveSeconds } from './store';
import { WhatsAppDispatchRecord } from './whatsapp';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'protocol_store.json');
const BACKUP_FILE = path.join(DATA_DIR, 'registration_backup.json');
const GOOGLE_FORM_CONFIG_FILE = path.join(DATA_DIR, 'google_form_config.json');

export type { RegistrationBackupRecord, GoogleFormConfig };

interface ServerStoreData {
  agents: Agent[];
  agent_nodes: AgentNode[];
  wa_logs: WhatsAppDispatchRecord[];
  game_state: GameState;
  registration_backup: RegistrationBackupRecord[];
  updated_at: string;
}

// In-memory singleton state
let memoryState: ServerStoreData | null = null;

function getInitialServerData(): ServerStoreData {
  const now = new Date().toISOString();

  return {
    agents: [],
    agent_nodes: [],
    wa_logs: [],
    game_state: {
      id: 1,
      status: 'STANDBY',
      global_broadcast: '',
      leaderboard_visible: true,
      submission_cutoff_time: '20:00',
      updated_at: now
    },
    registration_backup: [],
    updated_at: now
  };
}

function loadServerData(): ServerStoreData {
  if (memoryState) return memoryState;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as ServerStoreData;
      if (parsed && Array.isArray(parsed.agents)) {
        if (!Array.isArray(parsed.registration_backup)) {
          // Check if standalone BACKUP_FILE exists
          if (fs.existsSync(BACKUP_FILE)) {
            try {
              const bRaw = fs.readFileSync(BACKUP_FILE, 'utf-8');
              const bParsed = JSON.parse(bRaw);
              if (Array.isArray(bParsed)) {
                parsed.registration_backup = bParsed;
              }
            } catch (_) {}
          }
          // If still empty, seed from current agents
          if (!Array.isArray(parsed.registration_backup)) {
            parsed.registration_backup = parsed.agents.map(a => ({
              agent_id: a.agent_id,
              agent_number: a.agent_number || a.agent_id,
              name: a.name,
              auth_identifier: a.auth_identifier || '',
              contact: a.contact || '',
              archetype: a.archetype,
              wristband_id: a.wristband_id || a.agent_id,
              check_in_status: a.check_in_status,
              registered_at: a.created_at || new Date().toISOString(),
              token: a.token
            }));
          }
        }
        memoryState = parsed;
        return memoryState;
      }
    }
  } catch (err) {
    console.warn('[ServerStore] Failed to read disk cache, initializing fresh state:', err);
  }

  memoryState = getInitialServerData();
  saveServerData(memoryState);
  return memoryState;
}

let saveTimer: NodeJS.Timeout | null = null;

function flushToDisk(): void {
  if (!memoryState) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmpFile = `${STORE_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpFile, JSON.stringify(memoryState, null, 2), 'utf-8');
    fs.renameSync(tmpFile, STORE_FILE);

    if (Array.isArray(memoryState.registration_backup) && memoryState.registration_backup.length > 0) {
      const tmpBackup = `${BACKUP_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpBackup, JSON.stringify(memoryState.registration_backup, null, 2), 'utf-8');
      fs.renameSync(tmpBackup, BACKUP_FILE);
    }
  } catch (err) {
    console.warn('[ServerStore] Failed to persist data to disk:', err);
  }
}

function saveServerData(data: ServerStoreData, immediate: boolean = false): void {
  data.updated_at = new Date().toISOString();
  memoryState = data;

  if (immediate) {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    flushToDisk();
    return;
  }

  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    flushToDisk();
  }, 200);
}

// Flush pending disk writes on process exit
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => flushToDisk());
}

function getInitialGoogleFormConfig(): GoogleFormConfig {
  return {
    enabled: true,
    form_url: process.env.GOOGLE_FORM_URL || '',
    entry_name: process.env.GOOGLE_FORM_ENTRY_NAME || '',
    entry_phone: process.env.GOOGLE_FORM_ENTRY_PHONE || '',
    entry_roll_no: process.env.GOOGLE_FORM_ENTRY_ROLL_NO || '',
    entry_agent_id: process.env.GOOGLE_FORM_ENTRY_AGENT_ID || '',
    last_submitted_at: null,
    total_submissions: 0,
  };
}

function loadGoogleFormConfig(): GoogleFormConfig {
  try {
    if (fs.existsSync(GOOGLE_FORM_CONFIG_FILE)) {
      const raw = fs.readFileSync(GOOGLE_FORM_CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        ...getInitialGoogleFormConfig(),
        ...parsed,
      };
    }
  } catch (e) {
    console.error('Failed to read google_form_config.json:', e);
  }
  return getInitialGoogleFormConfig();
}

function saveGoogleFormConfig(config: GoogleFormConfig) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(GOOGLE_FORM_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write google_form_config.json:', e);
  }
}

export async function submitToGoogleForm(data: {
  name: string;
  phone: string;
  rollNo: string;
  agentId?: string;
}): Promise<{ success: boolean; error?: string }> {
  const config = loadGoogleFormConfig();
  if (!config.enabled || !config.form_url || !config.form_url.trim()) {
    return { success: false, error: 'Google Form backup is not configured or disabled' };
  }

  let submitUrl = config.form_url.trim();
  if (submitUrl.includes('/viewform')) {
    submitUrl = submitUrl.replace('/viewform', '/formResponse');
  } else if (submitUrl.includes('/edit')) {
    submitUrl = submitUrl.replace('/edit', '/formResponse');
  } else if (!submitUrl.endsWith('/formResponse') && submitUrl.includes('docs.google.com/forms/d/e/')) {
    submitUrl = submitUrl.split('?')[0].replace(/\/+$/, '') + '/formResponse';
  }

  try {
    const params = new URLSearchParams();
    if (config.entry_name && data.name) {
      params.append(config.entry_name.trim(), data.name.trim());
    }
    if (config.entry_phone && data.phone) {
      params.append(config.entry_phone.trim(), data.phone.trim());
    }
    if (config.entry_roll_no && data.rollNo) {
      params.append(config.entry_roll_no.trim(), data.rollNo.trim());
    }
    if (config.entry_agent_id && data.agentId) {
      params.append(config.entry_agent_id.trim(), data.agentId.trim());
    }

    const res = await fetch(submitUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (res.ok || res.status === 302 || res.type === 'opaqueredirect') {
      config.last_submitted_at = new Date().toISOString();
      config.total_submissions = (config.total_submissions || 0) + 1;
      saveGoogleFormConfig(config);
      return { success: true };
    } else {
      return { success: false, error: `Google Form responded with HTTP ${res.status}` };
    }
  } catch (err: any) {
    console.warn('Google Form background backup error (non-fatal):', err);
    return { success: false, error: err.message || 'Network error' };
  }
}

export const ServerStore = {
  // --- WhatsApp Logging ---
  addWhatsAppLog(record: WhatsAppDispatchRecord): void {
    const data = loadServerData();
    // Prepend new record, keeping up to 300 logs
    data.wa_logs.unshift(record);
    if (data.wa_logs.length > 300) {
      data.wa_logs = data.wa_logs.slice(0, 300);
    }
    saveServerData(data);
  },

  getWhatsAppLogs(): WhatsAppDispatchRecord[] {
    const data = loadServerData();
    return data.wa_logs;
  },

  clearWhatsAppLogs(): void {
    const data = loadServerData();
    data.wa_logs = [];
    saveServerData(data);
  },

  // --- Agents Management ---
  getAgents(): Agent[] {
    const data = loadServerData();
    return data.agents;
  },

  getAgentById(agentId: string): Agent | null {
    const data = loadServerData();
    return data.agents.find(a => a.agent_id.toUpperCase() === agentId.toUpperCase()) || null;
  },

  getGameState(): GameState {
    const data = loadServerData();
    return data.game_state || {
      id: 1,
      status: 'STANDBY',
      global_broadcast: 'PROTOCOL STANDBY // EVENT COMMENCES ON SEPTEMBER 24TH // AWAIT SYSTEM ACTIVATION',
      leaderboard_visible: true,
      submission_cutoff_time: '20:00',
      updated_at: new Date().toISOString()
    };
  },

  updateGameState(updates: Partial<GameState>): GameState {
    const data = loadServerData();
    const current = data.game_state || {
      id: 1,
      status: 'STANDBY',
      global_broadcast: '',
      leaderboard_visible: true,
      submission_cutoff_time: '20:00',
      updated_at: new Date().toISOString()
    };
    const sanitizedUpdates: Partial<GameState> = {};
    if (updates.status !== undefined) sanitizedUpdates.status = updates.status;
    if (updates.global_broadcast !== undefined) sanitizedUpdates.global_broadcast = updates.global_broadcast;
    if (updates.leaderboard_visible !== undefined) sanitizedUpdates.leaderboard_visible = updates.leaderboard_visible;
    if (updates.submission_cutoff_time !== undefined) sanitizedUpdates.submission_cutoff_time = updates.submission_cutoff_time;

    const updated: GameState = {
      ...current,
      ...sanitizedUpdates,
      updated_at: new Date().toISOString()
    };
    data.game_state = updated;
    saveServerData(data, true);
    return updated;
  },

  getNextAgentId(data: ServerStoreData): { agentId: string; agentNumber: string } {
    let maxNum = 0;
    data.agents.forEach(a => {
      const match = a.agent_id.match(/AGT-(\d+)/i);
      if (match) {
        const n = parseInt(match[1], 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      }
    });
    if (Array.isArray(data.registration_backup)) {
      data.registration_backup.forEach(b => {
        const match = b.agent_id.match(/AGT-(\d+)/i);
        if (match) {
          const n = parseInt(match[1], 10);
          if (!isNaN(n) && n > maxNum) maxNum = n;
        }
      });
    }
    const nextNum = maxNum + 1;
    const padded = String(nextNum).padStart(3, '0');
    return {
      agentId: `AGT-${padded}`,
      agentNumber: `Agent ${padded}`
    };
  },

  getNextArchetype(data: ServerStoreData): 'LOGIC' | 'SIGNAL' | 'OBSERVATION' | 'SYSTEM' | 'SOCIAL' {
    const counts: Record<string, number> = {
      LOGIC: 0,
      SIGNAL: 0,
      OBSERVATION: 0,
      SYSTEM: 0,
      SOCIAL: 0
    };
    data.agents.forEach(a => {
      if (counts[a.archetype] !== undefined) counts[a.archetype]++;
    });
    const minVal = Math.min(...Object.values(counts));
    const eligible = (Object.keys(counts) as Array<'LOGIC' | 'SIGNAL' | 'OBSERVATION' | 'SYSTEM' | 'SOCIAL'>).filter(
      k => counts[k] === minVal
    );
    return eligible[Math.floor(Math.random() * eligible.length)];
  },

  registerAgent(agentData: Partial<Agent>): Agent {
    const data = loadServerData();
    const cleanPhone = agentData.contact ? agentData.contact.replace(/\D/g, '') : '';
    const cleanRoll = agentData.auth_identifier ? agentData.auth_identifier.trim().toLowerCase() : '';
    const cleanId = agentData.agent_id ? agentData.agent_id.trim().toUpperCase() : '';

    // Find existing operative by roll number, phone contact, or exact ID
    const existingIndex = data.agents.findIndex(a => {
      const aRoll = a.auth_identifier ? a.auth_identifier.trim().toLowerCase() : '';
      if (cleanRoll && aRoll && cleanRoll === aRoll) return true;
      const aPhone = a.contact ? a.contact.replace(/\D/g, '') : '';
      if (cleanPhone && aPhone && cleanPhone === aPhone) return true;
      if (cleanId && a.agent_id.toUpperCase() === cleanId) return true;
      return false;
    });

    // Also check registration_backup for previous allocation
    let existingBackup: RegistrationBackupRecord | undefined;
    if (existingIndex === -1 && Array.isArray(data.registration_backup)) {
      existingBackup = data.registration_backup.find(b => {
        const bRoll = b.auth_identifier ? b.auth_identifier.trim().toLowerCase() : '';
        if (cleanRoll && bRoll && cleanRoll === bRoll) return true;
        const bPhone = b.contact ? b.contact.replace(/\D/g, '') : '';
        if (cleanPhone && bPhone && cleanPhone === bPhone) return true;
        if (cleanId && b.agent_id.toUpperCase() === cleanId) return true;
        return false;
      });
    }

    const now = new Date().toISOString();
    let agent: Agent;

    if (existingIndex >= 0) {
      // Update existing record without wiping agent_id
      const existing = data.agents[existingIndex];
      agent = {
        ...existing,
        ...agentData,
        name: (agentData.name && agentData.name.trim()) || existing.name,
        contact: (agentData.contact && agentData.contact.trim()) || existing.contact,
        auth_identifier: (agentData.auth_identifier && agentData.auth_identifier.trim()) || existing.auth_identifier,
        agent_id: (agentData.agent_id && agentData.agent_id.trim().toUpperCase()) || existing.agent_id,
        agent_number: (agentData.agent_number && agentData.agent_number.trim()) || existing.agent_number,
        last_active_at: now
      };
      data.agents[existingIndex] = agent;
    } else {
      // Assign sequential unique ID to prevent multi-device collision
      const targetId = existingBackup?.agent_id || (cleanId && !cleanId.match(/^AGT-001$/i) && !data.agents.some(a => a.agent_id.toUpperCase() === cleanId) ? cleanId : null);
      
      const { agentId, agentNumber } = targetId
        ? { agentId: targetId, agentNumber: existingBackup?.agent_number || agentData.agent_number || targetId }
        : this.getNextAgentId(data);

      const archetype = agentData.archetype || (existingBackup?.archetype as any) || this.getNextArchetype(data);
      const isPreVerified = Boolean(agentData.is_active || agentData.check_in_status === 'ACTIVE');

      agent = {
        id: `agent-uuid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        agent_id: agentId,
        wristband_id: agentData.wristband_id || existingBackup?.wristband_id || agentId,
        agent_number: agentNumber,
        token: agentData.token || existingBackup?.token || `sec_tok_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        name: agentData.name || existingBackup?.name || `Operative ${agentId}`,
        contact: agentData.contact || existingBackup?.contact || '',
        auth_identifier: agentData.auth_identifier?.trim() || existingBackup?.auth_identifier || '',
        archetype,
        score: agentData.score || 0,
        is_active: isPreVerified,
        check_in_status: isPreVerified ? 'ACTIVE' : 'AWAITING_CHECKIN',
        total_active_seconds: agentData.total_active_seconds || 0,
        session_start_time: isPreVerified ? now : null,
        initial_check_in_at: isPreVerified ? now : null,
        last_check_in: isPreVerified ? now : null,
        last_host_verified_at: isPreVerified ? now : null,
        last_active_at: now,
        logged_out_at: null,
        created_at: existingBackup?.registered_at || now
      };
      data.agents.unshift(agent);

      // Seed initial nodes for new operative
      const candidateNodes = SEED_NODES.filter(n => n.type !== 'DEDUCTION_HYPOTHESIS');
      candidateNodes.slice(0, 3).forEach((n) => {
        data.agent_nodes.push({
          id: `srv-an-${agent.agent_id}-${n.id}`,
          agent_id: agent.agent_id,
          node_id: n.id,
          is_unlocked: true,
          is_completed: false,
          completed_at: null,
          attempts: 0,
          points_earned: 0,
          first_accessed_at: null
        });
      });
      data.agent_nodes.push({
        id: `srv-an-${agent.agent_id}-NODE-OMEGA-HYPOTHESIS`,
        agent_id: agent.agent_id,
        node_id: 'NODE-OMEGA-HYPOTHESIS',
        is_unlocked: true,
        is_completed: false,
        completed_at: null,
        attempts: 0,
        points_earned: 0,
        first_accessed_at: null
      });
    }

    // Persist to registration_backup
    if (!data.registration_backup) data.registration_backup = [];
    const bIdx = data.registration_backup.findIndex(b => 
      b.agent_id.toUpperCase() === agent.agent_id.toUpperCase() ||
      (cleanRoll && b.auth_identifier && b.auth_identifier.toLowerCase() === cleanRoll)
    );
    const bRec: RegistrationBackupRecord = {
      agent_id: agent.agent_id,
      agent_number: agent.agent_number,
      name: agent.name,
      auth_identifier: agent.auth_identifier || '',
      contact: agent.contact || '',
      archetype: agent.archetype,
      wristband_id: agent.wristband_id || agent.agent_id,
      check_in_status: agent.check_in_status,
      registered_at: agent.created_at || now,
      token: agent.token
    };
    if (bIdx >= 0) {
      data.registration_backup[bIdx] = bRec;
    } else {
      data.registration_backup.push(bRec);
    }

    saveServerData(data, true);

    // Asynchronous background Google Form backup submission
    submitToGoogleForm({
      name: agent.name,
      phone: agent.contact,
      rollNo: agent.auth_identifier || '',
      agentId: agent.agent_id
    }).catch(() => {});

    return agent;
  },

  updateAgentStatus(
    agentId: string, 
    status: 'ACTIVE' | 'PAUSED' | 'AWAITING_CHECKIN',
    agentData?: Partial<Agent>
  ): Agent | null {
    const data = loadServerData();
    let index = data.agents.findIndex(a => a.agent_id.toUpperCase() === agentId.toUpperCase());

    // Auto-create in ServerStore if not yet synchronized from client or if in backup
    if (index === -1) {
      const fromBackup = (data.registration_backup || []).find(b => b.agent_id.toUpperCase() === agentId.toUpperCase());
      if (fromBackup || agentData) {
        this.registerAgent({ 
          ...fromBackup, 
          ...agentData, 
          archetype: ((agentData && agentData.archetype) || (fromBackup && fromBackup.archetype)) as any,
          agent_id: agentId, 
          check_in_status: status,
          is_active: status === 'ACTIVE'
        });
        const refreshed = loadServerData();
        index = refreshed.agents.findIndex(a => a.agent_id.toUpperCase() === agentId.toUpperCase());
        if (index === -1) return null;
      } else {
        return null;
      }
    }

    const agent = data.agents[index];
    const now = new Date().toISOString();

    if (status === 'ACTIVE') {
      agent.check_in_status = 'ACTIVE';
      agent.is_active = true;
      agent.session_start_time = now;
      agent.last_check_in = now;
      agent.last_active_at = now;
      if (!agent.initial_check_in_at) {
        agent.initial_check_in_at = now;
      }
    } else if (status === 'PAUSED') {
      agent.check_in_status = 'PAUSED';
      agent.is_active = false;
      if (agent.session_start_time) {
        const elapsed = Math.floor((Date.now() - new Date(agent.session_start_time).getTime()) / 1000);
        if (elapsed > 0) {
          agent.total_active_seconds = (agent.total_active_seconds || 0) + elapsed;
        }
      }
      agent.session_start_time = null;
      agent.last_active_at = now;
      agent.logged_out_at = now;
    } else {
      agent.check_in_status = status;
      agent.is_active = false;
      agent.last_active_at = now;
    }

    data.agents[index] = agent;

    // Keep registration_backup in sync
    if (data.registration_backup) {
      const bIdx = data.registration_backup.findIndex(b => b.agent_id.toUpperCase() === agent.agent_id.toUpperCase());
      if (bIdx >= 0) {
        data.registration_backup[bIdx].check_in_status = agent.check_in_status;
      }
    }

    saveServerData(data, true);
    return agent;
  },

  recordNodeAccess(agentId: string, nodeId: string): AgentNode {
    const data = loadServerData();
    const now = new Date().toISOString();
    let record = data.agent_nodes.find(
      an => an.agent_id.toUpperCase() === agentId.toUpperCase() && an.node_id === nodeId
    );

    if (!record) {
      record = {
        id: `srv-an-${agentId}-${nodeId}`,
        agent_id: agentId,
        node_id: nodeId,
        is_unlocked: true,
        is_completed: false,
        completed_at: null,
        attempts: 0,
        points_earned: 0,
        first_accessed_at: now
      };
      data.agent_nodes.push(record);
    } else {
      if (!record.first_accessed_at) {
        record.first_accessed_at = now;
      }
      record.is_unlocked = true;
    }

    // Touch agent last_active_at
    const ag = data.agents.find(a => a.agent_id.toUpperCase() === agentId.toUpperCase());
    if (ag) {
      ag.last_active_at = now;
    }

    saveServerData(data);
    return record;
  },

  completeNode(agentId: string, nodeId: string, pointsEarned: number): { agentNode: AgentNode | null; agent: Agent | null } {
    const data = loadServerData();
    const now = new Date().toISOString();
    const record = data.agent_nodes.find(
      an => an.agent_id.toUpperCase() === agentId.toUpperCase() && an.node_id === nodeId
    );
    const agent = data.agents.find(a => a.agent_id.toUpperCase() === agentId.toUpperCase()) || null;

    if (record) {
      record.is_completed = true;
      record.completed_at = now;
      record.points_earned = pointsEarned;
    }

    if (agent) {
      agent.score = (agent.score || 0) + pointsEarned;
      agent.last_active_at = now;
    }

    saveServerData(data);
    return { agentNode: record || null, agent };
  },

  adjustScore(agentId: string, delta: number): Agent | null {
    const data = loadServerData();
    const agent = data.agents.find(a => a.agent_id.toUpperCase() === agentId.toUpperCase());
    if (!agent) return null;

    agent.score = Math.max(0, (agent.score || 0) + delta);
    agent.last_active_at = new Date().toISOString();
    saveServerData(data);
    return agent;
  },

  resetAgent(agentId: string): Agent | null {
    const data = loadServerData();
    const agent = data.agents.find(a => a.agent_id.toUpperCase() === agentId.toUpperCase());
    if (!agent) return null;

    agent.score = 0;
    agent.total_active_seconds = 0;
    agent.session_start_time = null;
    agent.check_in_status = 'AWAITING_CHECKIN';
    agent.last_active_at = new Date().toISOString();

    // Reset nodes
    data.agent_nodes = data.agent_nodes.filter(
      an => an.agent_id.toUpperCase() !== agentId.toUpperCase()
    );

    const candidateNodes = SEED_NODES.filter(n => n.type !== 'DEDUCTION_HYPOTHESIS');
    candidateNodes.slice(0, 3).forEach((n) => {
      data.agent_nodes.push({
        id: `srv-an-${agent.agent_id}-${n.id}`,
        agent_id: agent.agent_id,
        node_id: n.id,
        is_unlocked: true,
        is_completed: false,
        completed_at: null,
        attempts: 0,
        points_earned: 0,
        first_accessed_at: null
      });
    });

    saveServerData(data);
    return agent;
  },

  deleteAgent(agentId: string): boolean {
    const data = loadServerData();
    const len = data.agents.length;
    data.agents = data.agents.filter(a => a.agent_id.toUpperCase() !== agentId.toUpperCase());
    data.agent_nodes = data.agent_nodes.filter(an => an.agent_id.toUpperCase() !== agentId.toUpperCase());
    if (data.agents.length !== len) {
      saveServerData(data);
      return true;
    }
    return false;
  },

  getAgentNodes(agentId: string): Array<AgentNode & { node: NodeItem }> {
    const data = loadServerData();
    const agentRecords = data.agent_nodes.filter(
      an => an.agent_id.toUpperCase() === agentId.toUpperCase()
    );

    return agentRecords.map(an => {
      const node = SEED_NODES.find(n => n.id === an.node_id) || {
        id: an.node_id,
        title: 'Classified Node',
        type: 'PHYSICAL_QR' as const,
        domain: 'OBSERVATION' as const,
        base_points: 100,
        rarity_decay: 1.0,
        secret_key: '',
        payload: {}
      };
      return { ...an, node };
    });
  },

  getAgentCurrentQuestion(agentId: string): {
    currentNode: (AgentNode & { node: NodeItem }) | null;
    status: 'IN_PROGRESS' | 'SOLVED' | 'NO_ACTIVITY';
    totalSolved: number;
    totalAssigned: number;
  } {
    const nodes = this.getAgentNodes(agentId);
    const solved = nodes.filter(n => n.is_completed);

    // Look for active in-progress node (unlocked, not completed, accessed most recently)
    const inProgressNodes = nodes
      .filter(n => n.is_unlocked && !n.is_completed)
      .sort((a, b) => {
        const timeA = a.first_accessed_at ? new Date(a.first_accessed_at).getTime() : 0;
        const timeB = b.first_accessed_at ? new Date(b.first_accessed_at).getTime() : 0;
        return timeB - timeA;
      });

    if (inProgressNodes.length > 0) {
      return {
        currentNode: inProgressNodes[0],
        status: 'IN_PROGRESS',
        totalSolved: solved.length,
        totalAssigned: nodes.length
      };
    }

    // If no in-progress node, show last completed node if any
    if (solved.length > 0) {
      const lastSolved = [...solved].sort((a, b) => {
        const timeA = a.completed_at ? new Date(a.completed_at).getTime() : 0;
        const timeB = b.completed_at ? new Date(b.completed_at).getTime() : 0;
        return timeB - timeA;
      })[0];

      return {
        currentNode: lastSolved,
        status: 'SOLVED',
        totalSolved: solved.length,
        totalAssigned: nodes.length
      };
    }

    // Default first assigned node
    return {
      currentNode: nodes[0] || null,
      status: 'NO_ACTIVITY',
      totalSolved: 0,
      totalAssigned: nodes.length
    };
  },

  getEnrichedAgents(): Array<Agent & {
    activeSeconds: number;
    currentQuestion: (AgentNode & { node: NodeItem }) | null;
    solvedCount: number;
    totalNodes: number;
  }> {
    const data = loadServerData();
    return data.agents.map(ag => {
      const activeSeconds = getAgentActiveSeconds(ag);
      const questionData = this.getAgentCurrentQuestion(ag.agent_id);
      return {
        ...ag,
        activeSeconds,
        currentQuestion: questionData.currentNode,
        solvedCount: questionData.totalSolved,
        totalNodes: questionData.totalAssigned
      };
    });
  },

  syncFromClient(clientAgents: Agent[]): void {
    if (!Array.isArray(clientAgents) || clientAgents.length === 0) return;
    const data = loadServerData();
    clientAgents.forEach(cl => {
      const idx = data.agents.findIndex(a => a.agent_id.toUpperCase() === cl.agent_id.toUpperCase());
      if (idx === -1) {
        data.agents.push(cl);
      }
    });
    saveServerData(data);
  },

  getRegistrationBackup(): RegistrationBackupRecord[] {
    const data = loadServerData();
    if (Array.isArray(data.registration_backup) && data.registration_backup.length > 0) {
      return data.registration_backup;
    }
    // Fallback if not yet populated
    return data.agents.map(ag => ({
      agent_id: ag.agent_id,
      agent_number: ag.agent_number || ag.agent_id,
      name: ag.name,
      auth_identifier: ag.auth_identifier || '',
      contact: ag.contact || '',
      archetype: ag.archetype,
      wristband_id: ag.wristband_id || ag.agent_id,
      check_in_status: ag.check_in_status,
      registered_at: ag.created_at || new Date().toISOString(),
      token: ag.token
    }));
  },

  getRegistrationBackupCSV(): string {
    const backup = this.getRegistrationBackup();
    const headers = [
      'Agent ID',
      'Agent Number',
      'Operative Name',
      'Roll Number',
      'Phone / Contact',
      'Tactical Domain',
      'Wristband ID',
      'Check-In Status',
      'Registration Timestamp'
    ];

    const rows = backup.map(r => [
      `"${r.agent_id}"`,
      `"${r.agent_number}"`,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.auth_identifier || '').replace(/"/g, '""')}"`,
      `"${(r.contact || '').replace(/"/g, '""')}"`,
      `"${r.archetype}"`,
      `"${r.wristband_id || r.agent_id}"`,
      `"${r.check_in_status}"`,
      `"${r.registered_at}"`
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  },

  bulkRegister(operatives: Array<Partial<Agent>>): {
    registeredCount: number;
    updatedCount: number;
    agents: Agent[];
    registrationBackup: RegistrationBackupRecord[];
  } {
    const data = loadServerData();
    let registeredCount = 0;
    let updatedCount = 0;
    const processedAgents: Agent[] = [];

    for (const op of operatives) {
      if (!op.name && !op.auth_identifier && !op.contact && !op.agent_id) continue;

      const cleanRoll = (op.auth_identifier || '').trim();
      const cleanPhone = (op.contact || '').replace(/\D/g, '');
      const cleanId = (op.agent_id || '').trim().toUpperCase();

      // Check if operative already exists
      const existingIdx = data.agents.findIndex(a => {
        if (cleanRoll && a.auth_identifier && a.auth_identifier.toLowerCase() === cleanRoll.toLowerCase()) return true;
        if (cleanPhone && a.contact && a.contact.replace(/\D/g, '') === cleanPhone) return true;
        if (cleanId && a.agent_id.toUpperCase() === cleanId) return true;
        return false;
      });

      if (existingIdx >= 0) {
        // Update existing record
        const existing = data.agents[existingIdx];
        const updated: Agent = {
          ...existing,
          name: op.name?.trim() || existing.name,
          contact: op.contact?.trim() || existing.contact,
          auth_identifier: op.auth_identifier?.trim() || existing.auth_identifier,
          wristband_id: op.wristband_id?.trim() || existing.wristband_id,
          archetype: (op.archetype as any) || existing.archetype,
          check_in_status: op.check_in_status || existing.check_in_status,
          is_active: op.check_in_status === 'ACTIVE' ? true : existing.is_active,
          last_active_at: new Date().toISOString()
        };
        data.agents[existingIdx] = updated;
        processedAgents.push(updated);
        updatedCount++;
      } else {
        // Create new operative with sequential AGT-XXX or specified ID
        const targetId = cleanId && cleanId.startsWith('AGT-') && !data.agents.some(a => a.agent_id.toUpperCase() === cleanId)
          ? cleanId
          : null;

        let idToUse: string;
        let numToUse: string;
        if (targetId) {
          idToUse = targetId;
          const m = targetId.match(/AGT-(\d+)/i);
          numToUse = m ? `Agent ${m[1].padStart(3, '0')}` : `Agent ${targetId}`;
        } else {
          const next = this.getNextAgentId(data);
          idToUse = next.agentId;
          numToUse = next.agentNumber;
        }

        const archetype = op.archetype || this.getNextArchetype(data);
        const isPreVerified = Boolean(op.is_active || op.check_in_status === 'ACTIVE');
        const now = new Date().toISOString();

        const newAgent: Agent = {
          id: `agent-uuid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          agent_id: idToUse,
          wristband_id: op.wristband_id?.trim() || idToUse,
          agent_number: numToUse,
          token: op.token || `sec_tok_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
          name: op.name?.trim() || `Operative ${idToUse}`,
          contact: op.contact?.trim() || '',
          auth_identifier: cleanRoll,
          archetype: archetype as any,
          score: op.score || 0,
          is_active: isPreVerified,
          check_in_status: isPreVerified ? 'ACTIVE' : 'AWAITING_CHECKIN',
          total_active_seconds: op.total_active_seconds || 0,
          session_start_time: isPreVerified ? now : null,
          initial_check_in_at: isPreVerified ? now : null,
          last_check_in: isPreVerified ? now : null,
          last_host_verified_at: isPreVerified ? now : null,
          last_active_at: now,
          logged_out_at: null,
          created_at: now
        };

        data.agents.push(newAgent);
        processedAgents.push(newAgent);
        registeredCount++;

        // Initial nodes
        const candidateNodes = SEED_NODES.filter(n => n.type !== 'DEDUCTION_HYPOTHESIS');
        candidateNodes.slice(0, 3).forEach((n) => {
          data.agent_nodes.push({
            id: `srv-an-${newAgent.agent_id}-${n.id}`,
            agent_id: newAgent.agent_id,
            node_id: n.id,
            is_unlocked: true,
            is_completed: false,
            completed_at: null,
            attempts: 0,
            points_earned: 0,
            first_accessed_at: null
          });
        });
        data.agent_nodes.push({
          id: `srv-an-${newAgent.agent_id}-NODE-OMEGA-HYPOTHESIS`,
          agent_id: newAgent.agent_id,
          node_id: 'NODE-OMEGA-HYPOTHESIS',
          is_unlocked: true,
          is_completed: false,
          completed_at: null,
          attempts: 0,
          points_earned: 0,
          first_accessed_at: null
        });
      }
    }

    // Refresh registration_backup from all processed
    if (!data.registration_backup) data.registration_backup = [];
    processedAgents.forEach(ag => {
      const bIdx = data.registration_backup.findIndex(b => b.agent_id.toUpperCase() === ag.agent_id.toUpperCase());
      const bRec: RegistrationBackupRecord = {
        agent_id: ag.agent_id,
        agent_number: ag.agent_number,
        name: ag.name,
        auth_identifier: ag.auth_identifier || '',
        contact: ag.contact || '',
        archetype: ag.archetype,
        wristband_id: ag.wristband_id || ag.agent_id,
        check_in_status: ag.check_in_status,
        registered_at: ag.created_at || new Date().toISOString(),
        token: ag.token
      };
      if (bIdx >= 0) {
        data.registration_backup[bIdx] = bRec;
      } else {
        data.registration_backup.push(bRec);
      }
    });

    saveServerData(data, true);

    // Asynchronous background Google Form backup for newly enrolled operatives
    data.agents.slice(0, registeredCount).forEach(ag => {
      submitToGoogleForm({
        name: ag.name,
        phone: ag.contact,
        rollNo: ag.auth_identifier || '',
        agentId: ag.agent_id
      }).catch(() => {});
    });

    return {
      registeredCount,
      updatedCount,
      agents: data.agents,
      registrationBackup: data.registration_backup
    };
  },

  getGoogleFormConfig(): GoogleFormConfig {
    return loadGoogleFormConfig();
  },

  updateGoogleFormConfig(updates: Partial<GoogleFormConfig>): GoogleFormConfig {
    const current = loadGoogleFormConfig();
    const updated: GoogleFormConfig = {
      ...current,
      ...updates,
      form_url: updates.form_url !== undefined ? updates.form_url.trim() : current.form_url,
      entry_name: updates.entry_name !== undefined ? updates.entry_name.trim() : current.entry_name,
      entry_phone: updates.entry_phone !== undefined ? updates.entry_phone.trim() : current.entry_phone,
      entry_roll_no: updates.entry_roll_no !== undefined ? updates.entry_roll_no.trim() : current.entry_roll_no,
      entry_agent_id: updates.entry_agent_id !== undefined ? updates.entry_agent_id.trim() : current.entry_agent_id,
      enabled: updates.enabled !== undefined ? updates.enabled : current.enabled,
    };
    saveGoogleFormConfig(updated);
    return updated;
  },

  async testGoogleFormSubmission(custom?: { name?: string; phone?: string; rollNo?: string }): Promise<{ success: boolean; error?: string }> {
    return submitToGoogleForm({
      name: custom?.name || 'Test Operative (Admin Verification)',
      phone: custom?.phone || '9999999999',
      rollNo: custom?.rollNo || 'TEST-ROLL-01',
      agentId: 'AGT-TEST'
    });
  },

  greatReset(): void {
    const now = new Date().toISOString();
    const data: ServerStoreData = {
      agents: [],
      agent_nodes: [],
      wa_logs: [],
      game_state: {
        id: 1,
        status: 'STANDBY',
        global_broadcast: '',
        leaderboard_visible: true,
        submission_cutoff_time: '20:00',
        updated_at: now
      },
      registration_backup: [],
      updated_at: now
    };
    saveServerData(data, true);
  }
};
