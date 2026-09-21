import fs from 'fs';
import path from 'path';
import { Agent, AgentNode, GameState, NodeItem } from '@/types/database';
import { SEED_NODES, getAgentActiveSeconds } from './store';
import { WhatsAppDispatchRecord } from './whatsapp';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'protocol_store.json');

interface ServerStoreData {
  agents: Agent[];
  agent_nodes: AgentNode[];
  wa_logs: WhatsAppDispatchRecord[];
  game_state: GameState;
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
    const updated: GameState = {
      ...current,
      ...updates,
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
    
    // Find existing operative by phone contact or exact ID
    const existingIndex = data.agents.findIndex(a => {
      const aPhone = a.contact ? a.contact.replace(/\D/g, '') : '';
      if (cleanPhone && aPhone && cleanPhone === aPhone) return true;
      if (agentData.agent_id && a.agent_id.toUpperCase() === agentData.agent_id.toUpperCase()) {
        return !cleanPhone || !aPhone || cleanPhone === aPhone;
      }
      return false;
    });

    const now = new Date().toISOString();
    let agent: Agent;

    if (existingIndex >= 0) {
      // Update existing record without wiping agent_id
      const existing = data.agents[existingIndex];
      agent = {
        ...existing,
        ...agentData,
        agent_id: (agentData.agent_id && agentData.agent_id.trim()) || existing.agent_id,
        agent_number: (agentData.agent_number && agentData.agent_number.trim()) || existing.agent_number,
        last_active_at: now
      };
      data.agents[existingIndex] = agent;
    } else {
      // Assign sequential unique ID to prevent multi-device collision
      const isCustomId = agentData.agent_id && 
                         !agentData.agent_id.match(/^AGT-001$/i) && 
                         !data.agents.some(a => a.agent_id.toUpperCase() === agentData.agent_id?.toUpperCase());
      
      const { agentId, agentNumber } = isCustomId && agentData.agent_id
        ? { agentId: agentData.agent_id.trim().toUpperCase(), agentNumber: agentData.agent_number || agentData.agent_id.trim() }
        : this.getNextAgentId(data);

      const archetype = agentData.archetype || this.getNextArchetype(data);
      const isPreVerified = Boolean(agentData.is_active || agentData.check_in_status === 'ACTIVE');

      agent = {
        id: `agent-uuid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        agent_id: agentId,
        wristband_id: agentData.wristband_id || agentId,
        agent_number: agentNumber,
        token: agentData.token || `sec_tok_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        name: agentData.name || `Operative ${agentId}`,
        contact: agentData.contact || '',
        auth_identifier: agentData.auth_identifier || '',
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
        created_at: now
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

    saveServerData(data, true);
    return agent;
  },

  updateAgentStatus(
    agentId: string, 
    status: 'ACTIVE' | 'PAUSED' | 'AWAITING_CHECKIN',
    agentData?: Partial<Agent>
  ): Agent | null {
    const data = loadServerData();
    let index = data.agents.findIndex(a => a.agent_id.toUpperCase() === agentId.toUpperCase());

    // Auto-create in ServerStore if not yet synchronized from client
    if (index === -1) {
      if (agentData) {
        this.registerAgent({ ...agentData, agent_id: agentId, check_in_status: status });
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
      updated_at: now
    };
    saveServerData(data, true);
  }
};
