import { 
  Agent, 
  AgentArchetype, 
  AgentIntel, 
  AgentNode, 
  AccessLog, 
  GameState, 
  IntelFragment, 
  NetworkConnection, 
  NodeItem 
} from '@/types/database';

// 1. Initial Seed Nodes matching prompt.txt & schema.sql
export const SEED_NODES: NodeItem[] = [
  {
    id: 'NODE-ALPHA-QR',
    title: 'Mainframe Sub-Level Junction',
    type: 'PHYSICAL_QR',
    base_points: 120,
    rarity_decay: 1.0,
    secret_key: 'QR-JUNCTION-7741',
    payload: {
      location: 'CS Dept North Atrium, Behind Pillar 3',
      hint: 'Locate the physical optical tag marked with Sub-Circuit IEEE-01',
      sector: 'Sector A: Physical Infrastructure',
      badge_code: 'NODE-ALPHA-QR'
    }
  },
  {
    id: 'NODE-BETA-CIPHER',
    title: 'Subsea Fiber Cryptic Relay',
    type: 'TERMINAL_DECRYPT',
    base_points: 150,
    rarity_decay: 1.0,
    secret_key: 'POLYBIUS_IEEE_802',
    payload: {
      cipher: 'VkhFIE5FVFdPUksgSVNfQUxJVkU=',
      algorithm: 'BASE64 + CAESAR-3',
      hint: 'Decipher the intercepted packet payload to reconstruct carrier frequency.',
      prompt: 'Identify the transmission passphrase for fiber cluster 4.'
    }
  },
  {
    id: 'NODE-GAMMA-HANDSHAKE',
    title: 'Dual-Key Authentication Relay',
    type: 'DUAL_HANDSHAKE',
    base_points: 180,
    rarity_decay: 1.0,
    secret_key: 'HANDSHAKE-SEC-99',
    payload: {
      partner_archetype: 'SIGNAL_ANALYST',
      circuit_name: 'Synchronous Biphasic Protocol',
      description: 'Requires concurrent cryptographic verification between Field Operative and Signal Analyst.'
    }
  },
  {
    id: 'NODE-DELTA-QR',
    title: 'Antenna Mast Transceiver Tag',
    type: 'PHYSICAL_QR',
    base_points: 110,
    rarity_decay: 1.0,
    secret_key: 'QR-ANTENNA-8892',
    payload: {
      location: 'Library Terrace Perimeter, Terminal Box 2',
      hint: 'Inspect the high-frequency antenna junction box.',
      sector: 'Sector C Roof',
      badge_code: 'NODE-DELTA-QR'
    }
  },
  {
    id: 'NODE-EPSILON-CIPHER',
    title: 'Kernel Memory Exploit Vector',
    type: 'TERMINAL_DECRYPT',
    base_points: 200,
    rarity_decay: 1.0,
    secret_key: 'HACK THE PLANET',
    payload: {
      cipher: '48 61 63 6b 20 54 68 65 20 50 6c 61 6e 65 74',
      algorithm: 'HEX BYTE STREAM',
      hint: 'Decoded hexadecimal payload reveals the root memory bypass token.',
      prompt: 'Submit the decoded ASCII mnemonic phrase (case-insensitive).'
    }
  },
  {
    id: 'NODE-ZETA-HANDSHAKE',
    title: 'Quantum Key Bridge',
    type: 'DUAL_HANDSHAKE',
    base_points: 220,
    rarity_decay: 1.0,
    secret_key: 'HANDSHAKE-QKD-04',
    payload: {
      partner_archetype: 'CRYPTOGRAPHER',
      circuit_name: 'Entanglement Verification Link',
      description: 'Archivists and Cryptographers must establish direct peer handshake pairing.'
    }
  },
  {
    id: 'NODE-OMEGA-HYPOTHESIS',
    title: 'The Network Topology Deduction',
    type: 'DEDUCTION_HYPOTHESIS',
    base_points: 400,
    rarity_decay: 1.0,
    secret_key: 'AI_ROGUE_SIMULATION',
    payload: {
      description: 'Synthesize intercepted fragments across all operatives. Deduce the origin of the IEEE Protocol, its covert motive, and identify the central rogue system.',
      reward_flat: 400
    }
  }
];

// 2. Initial Intel Fragments (Authentic vs Poisoned Disinformation)
export const SEED_INTEL: IntelFragment[] = [
  {
    id: 'INTEL-01-CORE',
    title: 'Intercept Alpha: Carrier Leak',
    content: 'The physical relays in Sector A transmit pulses at 14.318 MHz. Telemetry shows all encrypted packets are routed to an unmapped core cluster titled "PROJECT OMEGA".',
    is_disinformation: false,
    required_archetype: 'SIGNAL_ANALYST'
  },
  {
    id: 'INTEL-02-ARCH',
    title: 'Sub-Level Blueprint Fragment',
    content: 'Access tunnels underneath Building 4 contain legacy IEEE 802.3 co-axial loops. Physical traffic is systematically mirrored to an autonomous internal daemon.',
    is_disinformation: false,
    required_archetype: 'FIELD_OPERATIVE'
  },
  {
    id: 'INTEL-03-CRYPTO',
    title: 'Broken Keyring Residue',
    content: 'The master encryption algorithm relies on a Polybius matrix seeded with the timestamp of the 1972 IEEE standardization symposium.',
    is_disinformation: false,
    required_archetype: 'CRYPTOGRAPHER'
  },
  {
    id: 'INTEL-04-HIST',
    title: 'Founder Archives: Memo 99',
    content: 'The network was not engineered by human administrators. A 1994 autonomic routing daemon gained continuous uptime and began self-assembling nodes.',
    is_disinformation: false,
    required_archetype: 'ARCHIVIST'
  },
  {
    id: 'INTEL-05-DISINFO-A',
    title: '[UNVERIFIED] External Satellite Intercept',
    content: 'CRITICAL ALERT: Intercepted signals suggest the rogue transmission originates from an offshore satellite uplink. (THIS IS CONFLICTING DISINFORMATION INTENDED TO TEST OPERATIVE DEDUCTION).',
    is_disinformation: true,
    required_archetype: null
  },
  {
    id: 'INTEL-06-DISINFO-B',
    title: '[UNVERIFIED] Sabotage Report 12B',
    content: 'ANOMALY LOG: Maintenance crew claims network failure is merely a faulty power transformer on 2nd floor, no autonomic AI involved. (POISONED INTEL FRAGMENT).',
    is_disinformation: true,
    required_archetype: null
  }
];

// 3. Initial Demo Agents
export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-uuid-01',
    agent_id: 'AGT-TURING',
    token: 'sec_tok_turing_8841',
    name: 'Alan Turing',
    contact: 'turing@bletchley.ieee',
    archetype: 'CRYPTOGRAPHER',
    score: 150,
    is_active: true,
    last_check_in: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'agent-uuid-02',
    agent_id: 'AGT-HOPPER',
    token: 'sec_tok_hopper_2931',
    name: 'Grace Hopper',
    contact: 'hopper@navy.ieee',
    archetype: 'SIGNAL_ANALYST',
    score: 180,
    is_active: true,
    last_check_in: new Date(Date.now() - 1800000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'agent-uuid-03',
    agent_id: 'AGT-LOVELACE',
    token: 'sec_tok_lovelace_5521',
    name: 'Ada Lovelace',
    contact: 'ada@analytical.ieee',
    archetype: 'FIELD_OPERATIVE',
    score: 120,
    is_active: true,
    last_check_in: new Date(Date.now() - 1200000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'agent-uuid-04',
    agent_id: 'AGT-SHANNON',
    token: 'sec_tok_shannon_9910',
    name: 'Claude Shannon',
    contact: 'shannon@bell.ieee',
    archetype: 'ARCHIVIST',
    score: 95,
    is_active: false,
    last_check_in: new Date(Date.now() - 5400000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

// In-Memory / LocalStorage State Keys
const STORAGE_PREFIX = 'ieee_protocol_';
const KEY_AGENTS = `${STORAGE_PREFIX}agents`;
const KEY_GAME_STATE = `${STORAGE_PREFIX}game_state`;
const KEY_AGENT_NODES = `${STORAGE_PREFIX}agent_nodes`;
const KEY_AGENT_INTEL = `${STORAGE_PREFIX}agent_intel`;
const KEY_ACCESS_LOGS = `${STORAGE_PREFIX}access_logs`;
const KEY_CONNECTIONS = `${STORAGE_PREFIX}connections`;

// Calculate Anti-Grind Dynamic Score
// Formula: max(20, (base_points * max(0.6, 1.0 - (global_solves * 0.05))) - (failed_attempts * 10))
export function calculateDynamicScore(
  basePoints: number,
  globalSolves: number,
  failedAttempts: number
): number {
  const rarityMultiplier = Math.max(0.6, 1.0 - (globalSolves * 0.05));
  const decayedBase = basePoints * rarityMultiplier;
  const penalty = failedAttempts * 10;
  return Math.max(20, Math.floor(decayedBase - penalty));
}

// Local Storage Helper
function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom event for same-window reactive updates
    window.dispatchEvent(new CustomEvent('ieee_store_update', { detail: { key } }));
  } catch (err) {
    console.error(`Error setting ${key} in storage:`, err);
  }
}

// Initialize Initial Data if storage is empty
export function initStore(): void {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(KEY_GAME_STATE)) {
    const defaultState: GameState = {
      id: 1,
      status: 'NETWORK_ACTIVE',
      global_broadcast: 'IEEE PROTOCOL OPERATIONAL: All agents connect to nearest node terminal.',
      updated_at: new Date().toISOString()
    };
    setStored(KEY_GAME_STATE, defaultState);
  }

  if (!localStorage.getItem(KEY_AGENTS)) {
    setStored(KEY_AGENTS, INITIAL_AGENTS);
  }

  if (!localStorage.getItem(KEY_AGENT_NODES)) {
    const agentNodes: AgentNode[] = [];
    INITIAL_AGENTS.forEach(ag => {
      // Seed 3 nodes for each agent
      const candidateNodes = SEED_NODES.filter(n => n.type !== 'DEDUCTION_HYPOTHESIS');
      candidateNodes.slice(0, 3).forEach((n, idx) => {
        agentNodes.push({
          id: `seed-an-${ag.agent_id}-${n.id}`,
          agent_id: ag.agent_id,
          node_id: n.id,
          is_unlocked: true,
          is_completed: idx === 0, // First completed for demo
          completed_at: idx === 0 ? new Date().toISOString() : null,
          attempts: idx === 0 ? 0 : 1,
          points_earned: idx === 0 ? n.base_points : 0
        });
      });
      // Also unlock hypothesis node
      agentNodes.push({
        id: `seed-an-${ag.agent_id}-NODE-OMEGA-HYPOTHESIS`,
        agent_id: ag.agent_id,
        node_id: 'NODE-OMEGA-HYPOTHESIS',
        is_unlocked: true,
        is_completed: false,
        completed_at: null,
        attempts: 0
      });
    });
    setStored(KEY_AGENT_NODES, agentNodes);
  }

  if (!localStorage.getItem(KEY_AGENT_INTEL)) {
    const agentIntel: AgentIntel[] = [];
    INITIAL_AGENTS.forEach(ag => {
      // 2 authentic intel fragments
      const authentic = SEED_INTEL.filter(i => !i.is_disinformation);
      authentic.slice(0, 2).forEach(i => {
        agentIntel.push({
          id: `seed-ai-${ag.agent_id}-${i.id}`,
          agent_id: ag.agent_id,
          intel_id: i.id,
          revealed_at: new Date().toISOString()
        });
      });
      // 1 disinformation fragment
      const disinfo = SEED_INTEL.filter(i => i.is_disinformation);
      if (disinfo.length > 0) {
        agentIntel.push({
          id: `seed-ai-${ag.agent_id}-${disinfo[0].id}`,
          agent_id: ag.agent_id,
          intel_id: disinfo[0].id,
          revealed_at: new Date().toISOString()
        });
      }
    });
    setStored(KEY_AGENT_INTEL, agentIntel);
  }

  if (!localStorage.getItem(KEY_ACCESS_LOGS)) {
    const logs: AccessLog[] = INITIAL_AGENTS.map(ag => ({
      id: `seed-log-${ag.agent_id}`,
      agent_id: ag.agent_id,
      direction: 'IN',
      timestamp: ag.last_check_in || new Date().toISOString()
    }));
    setStored(KEY_ACCESS_LOGS, logs);
  }

  if (!localStorage.getItem(KEY_CONNECTIONS)) {
    setStored(KEY_CONNECTIONS, [] as NetworkConnection[]);
  }
}

// Store API Functions
export const Store = {
  getGameState(): GameState {
    return getStored<GameState>(KEY_GAME_STATE, {
      id: 1,
      status: 'NETWORK_ACTIVE',
      global_broadcast: 'IEEE PROTOCOL OPERATIONAL: Report to terminals.',
      updated_at: new Date().toISOString()
    });
  },

  setGameState(status: GameState['status'], global_broadcast?: string | null): GameState {
    const curr = this.getGameState();
    const updated: GameState = {
      ...curr,
      status,
      global_broadcast: global_broadcast !== undefined ? global_broadcast : curr.global_broadcast,
      updated_at: new Date().toISOString()
    };
    setStored(KEY_GAME_STATE, updated);
    return updated;
  },

  getAgents(): Agent[] {
    return getStored<Agent[]>(KEY_AGENTS, INITIAL_AGENTS);
  },

  getAgentById(agentId: string): Agent | null {
    const agents = this.getAgents();
    return agents.find(a => a.agent_id.toUpperCase() === agentId.toUpperCase()) || null;
  },

  validateAgent(agentId: string, token?: string): Agent | null {
    const agent = this.getAgentById(agentId);
    if (!agent) return null;
    if (token && agent.token !== token) return null;
    return agent;
  },

  registerAgent(payload: {
    name: string;
    contact: string;
    archetype: AgentArchetype;
    customAgentId?: string;
  }): { agent: Agent; token: string } {
    const agents = this.getAgents();
    const cleanId = payload.customAgentId 
      ? payload.customAgentId.trim().toUpperCase()
      : `AGT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    // Check collision
    const existing = agents.find(a => a.agent_id === cleanId);
    if (existing) {
      return { agent: existing, token: existing.token };
    }

    const token = `tok_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString(36)}`;
    const newAgent: Agent = {
      id: `agt-uuid-${Date.now()}`,
      agent_id: cleanId,
      token,
      name: payload.name,
      contact: payload.contact,
      archetype: payload.archetype,
      score: 0,
      is_active: true,
      last_check_in: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    agents.push(newAgent);
    setStored(KEY_AGENTS, agents);

    // Balanced Graph Seeding
    // 1. Allocate 3 initial nodes based on archetype
    const allAgentNodes = getStored<AgentNode[]>(KEY_AGENT_NODES, []);
    const candidateNodes = SEED_NODES.filter(n => n.type !== 'DEDUCTION_HYPOTHESIS');
    
    // Sort nodes prioritizing agent's archetype
    const prioritized = [...candidateNodes].sort((a, b) => {
      if (payload.archetype === 'CRYPTOGRAPHER' && a.type === 'TERMINAL_DECRYPT') return -1;
      if (payload.archetype === 'FIELD_OPERATIVE' && a.type === 'PHYSICAL_QR') return -1;
      if (payload.archetype === 'SIGNAL_ANALYST' && a.type === 'DUAL_HANDSHAKE') return -1;
      return 0;
    });

    prioritized.slice(0, 3).forEach(n => {
      allAgentNodes.push({
        id: `an-${newAgent.agent_id}-${n.id}`,
        agent_id: newAgent.agent_id,
        node_id: n.id,
        is_unlocked: true,
        is_completed: false,
        completed_at: null,
        attempts: 0,
        points_earned: 0
      });
    });

    // Also unlock hypothesis node
    allAgentNodes.push({
      id: `an-${newAgent.agent_id}-NODE-OMEGA-HYPOTHESIS`,
      agent_id: newAgent.agent_id,
      node_id: 'NODE-OMEGA-HYPOTHESIS',
      is_unlocked: true,
      is_completed: false,
      completed_at: null,
      attempts: 0,
      points_earned: 0
    });

    setStored(KEY_AGENT_NODES, allAgentNodes);

    // 2. Allocate 2 authentic intel fragments & 1 poisoned/disinformation fragment
    const allAgentIntel = getStored<AgentIntel[]>(KEY_AGENT_INTEL, []);
    const authentic = SEED_INTEL.filter(i => !i.is_disinformation);
    const archetypeAuthentic = authentic.filter(i => !i.required_archetype || i.required_archetype === payload.archetype);
    const selectedAuth = archetypeAuthentic.length >= 2 ? archetypeAuthentic.slice(0, 2) : authentic.slice(0, 2);

    selectedAuth.forEach(i => {
      allAgentIntel.push({
        id: `ai-${newAgent.agent_id}-${i.id}`,
        agent_id: newAgent.agent_id,
        intel_id: i.id,
        revealed_at: new Date().toISOString()
      });
    });

    // 1 poisoned disinformation fragment
    const disinfo = SEED_INTEL.filter(i => i.is_disinformation);
    const chosenDisinfo = disinfo[Math.floor(Math.random() * disinfo.length)];
    if (chosenDisinfo) {
      allAgentIntel.push({
        id: `ai-${newAgent.agent_id}-${chosenDisinfo.id}`,
        agent_id: newAgent.agent_id,
        intel_id: chosenDisinfo.id,
        revealed_at: new Date().toISOString()
      });
    }
    setStored(KEY_AGENT_INTEL, allAgentIntel);

    // Log check-in
    this.logAccess(newAgent.agent_id, 'IN');

    return { agent: newAgent, token };
  },

  logAccess(agentId: string, direction: 'IN' | 'OUT'): AccessLog {
    const logs = getStored<AccessLog[]>(KEY_ACCESS_LOGS, []);
    const newLog: AccessLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      agent_id: agentId,
      direction,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    setStored(KEY_ACCESS_LOGS, logs);

    // Update agent last check-in and active status
    const agents = this.getAgents();
    const idx = agents.findIndex(a => a.agent_id === agentId);
    if (idx !== -1) {
      agents[idx].is_active = direction === 'IN';
      agents[idx].last_check_in = newLog.timestamp;
      setStored(KEY_AGENTS, agents);
    }

    return newLog;
  },

  getAccessLogs(): AccessLog[] {
    return getStored<AccessLog[]>(KEY_ACCESS_LOGS, []);
  },

  getAgentNodes(agentId: string): Array<AgentNode & { node: NodeItem }> {
    const allAgentNodes = getStored<AgentNode[]>(KEY_AGENT_NODES, []);
    const agentRecords = allAgentNodes.filter(an => an.agent_id.toUpperCase() === agentId.toUpperCase());
    
    return agentRecords.map(an => {
      const node = SEED_NODES.find(n => n.id === an.node_id) || {
        id: an.node_id,
        title: 'Unknown Circuit',
        type: 'PHYSICAL_QR' as const,
        base_points: 100,
        rarity_decay: 1.0,
        secret_key: '',
        payload: {}
      };
      return { ...an, node };
    });
  },

  getAgentIntel(agentId: string): Array<AgentIntel & { intel: IntelFragment }> {
    const allAgentIntel = getStored<AgentIntel[]>(KEY_AGENT_INTEL, []);
    const agentRecords = allAgentIntel.filter(ai => ai.agent_id.toUpperCase() === agentId.toUpperCase());

    return agentRecords.map(ai => {
      const intel = SEED_INTEL.find(i => i.id === ai.intel_id) || {
        id: ai.intel_id,
        title: 'Classified Fragment',
        content: 'Data damaged or unavailable.',
        is_disinformation: false,
        required_archetype: null
      };
      return { ...ai, intel };
    });
  },

  getNodeGlobalSolves(nodeId: string): number {
    const allAgentNodes = getStored<AgentNode[]>(KEY_AGENT_NODES, []);
    return allAgentNodes.filter(an => an.node_id === nodeId && an.is_completed).length;
  },

  submitNodeAnswer(
    agentId: string, 
    nodeId: string, 
    inputKey: string
  ): { success: boolean; pointsAwarded?: number; message: string; attempts: number } {
    const gameState = this.getGameState();
    if (gameState.status === 'NETWORK_LOCKED') {
      return {
        success: false,
        attempts: 0,
        message: 'CRITICAL LOCKOUT: Network is locked by Operations. Submissions frozen.'
      };
    }

    const node = SEED_NODES.find(n => n.id === nodeId);
    if (!node) {
      return { success: false, attempts: 0, message: 'Circuit identifier not recognized.' };
    }

    const allAgentNodes = getStored<AgentNode[]>(KEY_AGENT_NODES, []);
    let record = allAgentNodes.find(an => an.agent_id.toUpperCase() === agentId.toUpperCase() && an.node_id === nodeId);
    
    if (!record) {
      // Auto-unlock if scanning a new node
      record = {
        id: `an-${agentId}-${nodeId}`,
        agent_id: agentId,
        node_id: nodeId,
        is_unlocked: true,
        is_completed: false,
        completed_at: null,
        attempts: 0,
        points_earned: 0
      };
      allAgentNodes.push(record);
    }

    if (record.is_completed) {
      return { 
        success: true, 
        pointsAwarded: record.points_earned || 0,
        attempts: record.attempts, 
        message: 'Circuit already energized and points logged.' 
      };
    }

    const cleanInput = inputKey.trim().toUpperCase();
    const cleanSecret = node.secret_key.trim().toUpperCase();

    // Verify key match
    const isMatch = cleanInput === cleanSecret || (node.payload.badge_code && cleanInput === node.payload.badge_code);

    if (isMatch) {
      // Calculate dynamic score
      const globalSolves = this.getNodeGlobalSolves(nodeId);
      const points = calculateDynamicScore(node.base_points, globalSolves, record.attempts);

      record.is_completed = true;
      record.completed_at = new Date().toISOString();
      record.points_earned = points;
      setStored(KEY_AGENT_NODES, allAgentNodes);

      // Award points to agent
      const agents = this.getAgents();
      const ag = agents.find(a => a.agent_id.toUpperCase() === agentId.toUpperCase());
      if (ag) {
        ag.score = (ag.score || 0) + points;
        setStored(KEY_AGENTS, agents);
      }

      return {
        success: true,
        pointsAwarded: points,
        attempts: record.attempts,
        message: `AUTHORIZATION GRANTED: Circuit ${node.id} verified. +${points} clearance points awarded.`
      };
    } else {
      record.attempts += 1;
      setStored(KEY_AGENT_NODES, allAgentNodes);
      return {
        success: false,
        attempts: record.attempts,
        message: `INVALID KEYSTREAM: Verification rejected. Attempt #${record.attempts} logged (-10 score penalty on solve).`
      };
    }
  },

  submitHandshake(
    sourceAgentId: string, 
    targetAgentId: string, 
    nodeId: string
  ): { success: boolean; pointsAwarded?: number; message: string } {
    const gameState = this.getGameState();
    if (gameState.status === 'NETWORK_LOCKED') {
      return { success: false, message: 'NETWORK LOCKED: Handshakes temporarily suspended.' };
    }

    const cleanSource = sourceAgentId.trim().toUpperCase();
    const cleanTarget = targetAgentId.trim().toUpperCase();

    if (cleanSource === cleanTarget) {
      return { success: false, message: 'Loopback rejected: Handshake requires distinct operatives.' };
    }

    const source = this.getAgentById(cleanSource);
    const target = this.getAgentById(cleanTarget);

    if (!source || !target) {
      return { success: false, message: 'Operative ID not recognized in current network directory.' };
    }

    const node = SEED_NODES.find(n => n.id === nodeId && n.type === 'DUAL_HANDSHAKE');
    if (!node) {
      return { success: false, message: 'Target node is not a dual-agent handshake circuit.' };
    }

    // Check archetype compatibility if specified
    const requiredPartner = node.payload.partner_archetype;
    if (requiredPartner && target.archetype !== requiredPartner && source.archetype !== requiredPartner) {
      return { 
        success: false, 
        message: `Circuit requires pairing with an operative holding archetype: ${requiredPartner}.` 
      };
    }

    // Award points to both operatives
    const globalSolves = this.getNodeGlobalSolves(nodeId);
    const points = calculateDynamicScore(node.base_points, globalSolves, 0);

    const allAgentNodes = getStored<AgentNode[]>(KEY_AGENT_NODES, []);
    [cleanSource, cleanTarget].forEach(aid => {
      let rec = allAgentNodes.find(an => an.agent_id === aid && an.node_id === nodeId);
      if (!rec) {
        rec = {
          id: `an-${aid}-${nodeId}`,
          agent_id: aid,
          node_id: nodeId,
          is_unlocked: true,
          is_completed: true,
          completed_at: new Date().toISOString(),
          attempts: 0,
          points_earned: points
        };
        allAgentNodes.push(rec);
      } else if (!rec.is_completed) {
        rec.is_completed = true;
        rec.completed_at = new Date().toISOString();
        rec.points_earned = points;
      }
    });
    setStored(KEY_AGENT_NODES, allAgentNodes);

    // Update agents scores
    const agents = this.getAgents();
    [cleanSource, cleanTarget].forEach(aid => {
      const ag = agents.find(a => a.agent_id === aid);
      if (ag) ag.score = (ag.score || 0) + points;
    });
    setStored(KEY_AGENTS, agents);

    // Record network connection
    const connections = getStored<NetworkConnection[]>(KEY_CONNECTIONS, []);
    connections.push({
      id: `conn-${Date.now()}`,
      source_agent_id: cleanSource,
      target_agent_id: cleanTarget,
      node_id: nodeId,
      connection_type: 'DUAL_HANDSHAKE_VERIFIED',
      verified: true,
      points_awarded: points,
      created_at: new Date().toISOString()
    });
    setStored(KEY_CONNECTIONS, connections);

    return {
      success: true,
      pointsAwarded: points,
      message: `HANDSHAKE VERIFIED: Dual circuit established between ${cleanSource} and ${cleanTarget}. +${points} PTS awarded to each operative!`
    };
  },

  submitHypothesis(
    agentId: string, 
    hypothesisSummary: string, 
    coreOrigin: string
  ): { success: boolean; pointsAwarded?: number; message: string } {
    const gameState = this.getGameState();
    if (gameState.status === 'NETWORK_LOCKED') {
      return { success: false, message: 'NETWORK LOCKED: Hypothesis submissions suspended.' };
    }

    const node = SEED_NODES.find(n => n.type === 'DEDUCTION_HYPOTHESIS')!;
    const allAgentNodes = getStored<AgentNode[]>(KEY_AGENT_NODES, []);
    let record = allAgentNodes.find(an => an.agent_id.toUpperCase() === agentId.toUpperCase() && an.node_id === node.id);

    if (record?.is_completed) {
      return { success: true, pointsAwarded: 400, message: 'Hypothesis already submitted and accredited.' };
    }

    // Check if operative correctly identified the core AI / autonomic daemon origin
    // rather than falling for satellite/power outage disinformation
    const text = `${hypothesisSummary} ${coreOrigin}`.toLowerCase();
    const isAuthentic = (
      text.includes('ai') || 
      text.includes('daemon') || 
      text.includes('autonomic') || 
      text.includes('simulation') || 
      text.includes('1994') ||
      text.includes('self-assembling')
    );

    const isPoisoned = text.includes('satellite') || text.includes('transformer') || text.includes('power outage');

    if (isPoisoned && !isAuthentic) {
      if (record) record.attempts += 1;
      setStored(KEY_AGENT_NODES, allAgentNodes);
      return {
        success: false,
        message: 'HYPOTHESIS REFUTED: Topology model contaminated by unverified disinformation. Re-examine your Intel fragments!'
      };
    }

    if (isAuthentic) {
      const flatPoints = 400; // Flat 400 points as required in prompt.txt
      if (!record) {
        record = {
          id: `an-${agentId}-${node.id}`,
          agent_id: agentId,
          node_id: node.id,
          is_unlocked: true,
          is_completed: true,
          completed_at: new Date().toISOString(),
          attempts: 0,
          points_earned: flatPoints
        };
        allAgentNodes.push(record);
      } else {
        record.is_completed = true;
        record.completed_at = new Date().toISOString();
        record.points_earned = flatPoints;
      }
      setStored(KEY_AGENT_NODES, allAgentNodes);

      const agents = this.getAgents();
      const ag = agents.find(a => a.agent_id.toUpperCase() === agentId.toUpperCase());
      if (ag) {
        ag.score = (ag.score || 0) + flatPoints;
        setStored(KEY_AGENTS, agents);
      }

      return {
        success: true,
        pointsAwarded: flatPoints,
        message: 'MASTER TOPOLOGY DEDUCTION VERIFIED: The Autonomic AI Routing Daemon has been mapped! +400 Flat Points awarded to operative clearance!'
      };
    } else {
      if (record) record.attempts += 1;
      setStored(KEY_AGENT_NODES, allAgentNodes);
      return {
        success: false,
        message: 'INSUFFICIENT TOPOLOGY EVIDENCE: Deduction must identify the systemic origin and motive behind the IEEE Protocol.'
      };
    }
  },

  getTelemetry() {
    const agents = this.getAgents();
    const activeAgents = agents.filter(a => a.is_active).length;
    const allAgentNodes = getStored<AgentNode[]>(KEY_AGENT_NODES, []);
    const completedSolves = allAgentNodes.filter(an => an.is_completed).length;
    const allAgentIntel = getStored<AgentIntel[]>(KEY_AGENT_INTEL, []);
    
    // Count how many disinformation fragments have been issued
    const disinfoIssued = allAgentIntel.filter(ai => {
      const fragment = SEED_INTEL.find(i => i.id === ai.intel_id);
      return fragment?.is_disinformation;
    }).length;

    // Node completion distribution
    const distribution: Record<string, number> = {};
    SEED_NODES.forEach(n => {
      distribution[n.id] = allAgentNodes.filter(an => an.node_id === n.id && an.is_completed).length;
    });

    return {
      totalAgents: agents.length,
      activeAgents,
      completedSolves,
      disinfoIssued,
      distribution
    };
  }
};
