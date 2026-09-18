import fs from 'fs';
import path from 'path';
import { Agent, AgentNode, GameState, NodeItem } from '@/types/database';
import { SEED_NODES, INITIAL_AGENTS, getAgentActiveSeconds } from './store';
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
  const agentNodes: AgentNode[] = [];
  const now = new Date().toISOString();

  INITIAL_AGENTS.forEach(ag => {
    const candidateNodes = SEED_NODES.filter(n => n.type !== 'DEDUCTION_HYPOTHESIS');
    candidateNodes.slice(0, 3).forEach((n, idx) => {
      agentNodes.push({
        id: `srv-an-${ag.agent_id}-${n.id}`,
        agent_id: ag.agent_id,
        node_id: n.id,
        is_unlocked: true,
        is_completed: idx === 0,
        completed_at: idx === 0 ? now : null,
        attempts: idx === 0 ? 0 : 1,
        points_earned: idx === 0 ? n.base_points : 0,
        first_accessed_at: now
      });
    });
    agentNodes.push({
      id: `srv-an-${ag.agent_id}-NODE-OMEGA-HYPOTHESIS`,
      agent_id: ag.agent_id,
      node_id: 'NODE-OMEGA-HYPOTHESIS',
      is_unlocked: true,
      is_completed: false,
      completed_at: null,
      attempts: 0,
      points_earned: 0,
      first_accessed_at: null
    });
  });

  return {
    agents: [...INITIAL_AGENTS],
    agent_nodes: agentNodes,
    wa_logs: [],
    game_state: {
      id: 1,
      status: 'NETWORK_ACTIVE',
      global_broadcast: 'PROTOCOL ACTIVE: OPERATIVES DEPLOYED // TRUST NO ONE',
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

function saveServerData(data: ServerStoreData): void {
  data.updated_at = new Date().toISOString();
  memoryState = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[ServerStore] Failed to persist data to disk:', err);
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

  registerAgent(agentData: Partial<Agent>): Agent {
    const data = loadServerData();
    const existingIndex = data.agents.findIndex(
      a => (agentData.agent_id && a.agent_id.toUpperCase() === agentData.agent_id.toUpperCase()) ||
           (agentData.contact && a.contact.replace(/\D/g, '') === agentData.contact.replace(/\D/g, ''))
    );

    const now = new Date().toISOString();
    let agent: Agent;

    if (existingIndex >= 0) {
      // Update existing record
      agent = {
        ...data.agents[existingIndex],
        ...agentData,
        last_active_at: now
      };
      data.agents[existingIndex] = agent;
    } else {
      // Create new operative
      const count = data.agents.length + 101;
      const agentId = agentData.agent_id || `AGT-${count}`;
      agent = {
        id: `agent-uuid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        agent_id: agentId,
        wristband_id: agentData.wristband_id || agentId,
        agent_number: agentData.agent_number || `Agent ${count}`,
        token: agentData.token || `sec_tok_${count}_${Math.random().toString(36).substring(2, 6)}`,
        name: agentData.name || `Operative ${count}`,
        contact: agentData.contact || '',
        auth_identifier: agentData.auth_identifier || '',
        pin: agentData.pin || '1234',
        archetype: agentData.archetype || 'LOGIC',
        score: agentData.score || 0,
        is_active: true,
        check_in_status: agentData.check_in_status || 'AWAITING_CHECKIN',
        total_active_seconds: agentData.total_active_seconds || 0,
        session_start_time: agentData.check_in_status === 'ACTIVE' ? now : null,
        initial_check_in_at: agentData.check_in_status === 'ACTIVE' ? now : null,
        last_check_in: agentData.check_in_status === 'ACTIVE' ? now : null,
        last_host_verified_at: null,
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

    saveServerData(data);
    return agent;
  },

  updateAgentStatus(agentId: string, status: 'ACTIVE' | 'PAUSED' | 'AWAITING_CHECKIN'): Agent | null {
    const data = loadServerData();
    const index = data.agents.findIndex(a => a.agent_id.toUpperCase() === agentId.toUpperCase());
    if (index === -1) return null;

    const agent = data.agents[index];
    const now = new Date().toISOString();

    if (status === 'ACTIVE' && agent.check_in_status !== 'ACTIVE') {
      agent.check_in_status = 'ACTIVE';
      agent.is_active = true;
      agent.session_start_time = now;
      agent.last_check_in = now;
      agent.last_active_at = now;
      if (!agent.initial_check_in_at) {
        agent.initial_check_in_at = now;
      }
    } else if (status === 'PAUSED' && agent.check_in_status === 'ACTIVE') {
      if (agent.session_start_time) {
        const elapsed = Math.floor((Date.now() - new Date(agent.session_start_time).getTime()) / 1000);
        if (elapsed > 0) {
          agent.total_active_seconds = (agent.total_active_seconds || 0) + elapsed;
        }
      }
      agent.check_in_status = 'PAUSED';
      agent.session_start_time = null;
      agent.last_active_at = now;
      agent.logged_out_at = now;
    } else {
      agent.check_in_status = status;
      agent.last_active_at = now;
    }

    data.agents[index] = agent;
    saveServerData(data);
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
    currentQuestion: any;
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
  }
};
