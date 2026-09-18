import { 
  Agent, 
  AgentIntel, 
  AgentNode, 
  AccessLog, 
  GameState, 
  IntelFragment, 
  NetworkConnection, 
  NodeItem,
  PrimaryDomain 
} from '@/types/database';

// 1. Initial Seed Nodes with Workstations & Cross-Domain Connections
export const SEED_NODES: NodeItem[] = [
  // Observation Station 01
  {
    id: 'NODE-ALPHA-QR',
    title: 'Mainframe Sub-Level Monolith',
    type: 'PHYSICAL_QR',
    domain: 'OBSERVATION',
    station_number: 'Station 01',
    station_symbol: '⎔ SENSOR ALPHA',
    laptop_label: 'Station 01 Laptop (NITW Main Building Atrium)',
    base_points: 120,
    rarity_decay: 1.0,
    secret_key: 'QR-JUNCTION-7741',
    payload: {
      location: 'NITW Main Building Atrium, Pillar 3',
      hint: 'Locate optical sensor tag marked Circuit NITW-01. Contains carrier frequency clue for Signal Operatives.',
      sector: 'Sector A: Physical Ruins',
      badge_code: 'NODE-ALPHA-QR',
      linked_station: 'Station 03'
    }
  },
  // Logic Station 02
  {
    id: 'NODE-BETA-CIPHER',
    title: 'Subsea Fiber Cryptic Relay',
    type: 'TERMINAL_DECRYPT',
    domain: 'LOGIC',
    station_number: 'Station 02',
    station_symbol: '⎔ TERMINAL BETA',
    laptop_label: 'Station 02 Laptop (Library Ground Floor Bay)',
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
  // Signal Station 03
  {
    id: 'NODE-THETA-AUDIO',
    title: 'Rogue Carrier Waveform Spectrogram',
    type: 'TERMINAL_DECRYPT',
    domain: 'SIGNAL',
    station_number: 'Station 03',
    station_symbol: '⎔ WAVEFORM THETA',
    laptop_label: 'Station 03 Laptop (ECE Dept Waveguide Lab)',
    base_points: 160,
    rarity_decay: 1.0,
    secret_key: '14.318MHZ_OMEGA',
    payload: {
      frequency: '14.318 MHz',
      modulation: 'FSK Sub-Harmonic Carrier',
      hint: 'Inspect audio spectrogram audio bursts at Sector A to isolate pulse key.',
      prompt: 'Submit the carrier frequency and target cluster code in format: [FREQ]_[TARGET]'
    }
  },
  // Observation Station 04
  {
    id: 'NODE-DELTA-QR',
    title: 'Antenna Mast Transceiver Tag',
    type: 'PHYSICAL_QR',
    domain: 'OBSERVATION',
    station_number: 'Station 04',
    station_symbol: '⎔ MAST DELTA',
    laptop_label: 'Station 04 Laptop (Central Terrace Hub)',
    base_points: 130,
    rarity_decay: 1.0,
    secret_key: 'QR-ANTENNA-8892',
    payload: {
      location: 'Library Terrace Perimeter, Terminal Box 2',
      hint: 'Inspect the high-frequency antenna junction box on the battlements.',
      sector: 'Sector C Tower',
      badge_code: 'NODE-DELTA-QR'
    }
  },
  // System Station 05
  {
    id: 'NODE-EPSILON-CIPHER',
    title: 'Kernel Memory Exploit Vector',
    type: 'TERMINAL_DECRYPT',
    domain: 'SYSTEM',
    station_number: 'Station 05',
    station_symbol: '⎔ KERNEL EPSILON',
    laptop_label: 'Station 05 Laptop (Computer Center Server Room)',
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
  // Social Station 06
  {
    id: 'NODE-GAMMA-HANDSHAKE',
    title: 'Dual-Key Authentication Relay',
    type: 'DUAL_HANDSHAKE',
    domain: 'SOCIAL',
    station_number: 'Station 06',
    station_symbol: '⎔ LINK GAMMA',
    laptop_label: 'Station 06 Laptop (Student Activity Center Atrium)',
    base_points: 180,
    rarity_decay: 1.0,
    secret_key: 'HANDSHAKE-SEC-99',
    payload: {
      partner_archetype: 'SIGNAL',
      circuit_name: 'Synchronous Biphasic Protocol',
      description: 'Requires concurrent cryptographic verification between Logic/Observation and Signal Operatives.'
    }
  },
  // Logic Station 07
  {
    id: 'NODE-KAPPA-LOGIC',
    title: 'Boolean Matrix Logic Gate Relay',
    type: 'TERMINAL_DECRYPT',
    domain: 'LOGIC',
    station_number: 'Station 07',
    station_symbol: '⎔ MATRIX KAPPA',
    laptop_label: 'Station 07 Laptop (Digital Circuits Lab 2)',
    base_points: 170,
    rarity_decay: 1.0,
    secret_key: 'XOR_CASCADE_1972',
    payload: {
      expression: '(A ⊕ B) ∧ (C ∨ ¬D) seeded with IEEE 1972 charter year',
      hint: 'Cross-reference with Broken Keyring Residue fragment.',
      prompt: 'Submit the resolved matrix passcode.'
    }
  },
  // Signal Station 08
  {
    id: 'NODE-IOTA-MORSE',
    title: 'Telegraphic Sub-Carrier Packet',
    type: 'TERMINAL_DECRYPT',
    domain: 'SIGNAL',
    station_number: 'Station 08',
    station_symbol: '⎔ PULSE IOTA',
    laptop_label: 'Station 08 Laptop (Microwave Lab Terrace)',
    base_points: 165,
    rarity_decay: 1.0,
    secret_key: 'NITW_DAEMON_AWAKE',
    payload: {
      audio_hint: '-. .. - .-- / -.. .- . -- --- -. / .- .-- .- -.- .',
      algorithm: 'MORSE CODE PACKET',
      hint: 'Listen/decode telegraph pulses broadcast over carrier channel 8.',
      prompt: 'Submit decoded plain text statement.'
    }
  },
  // System Station 09
  {
    id: 'NODE-LAMBDA-TIMELINE',
    title: 'Autonomic Chronos Archive',
    type: 'TERMINAL_DECRYPT',
    domain: 'SYSTEM',
    station_number: 'Station 09',
    station_symbol: '⎔ ARCHIVE LAMBDA',
    laptop_label: 'Station 09 Laptop (Heritage Heritage Cell)',
    base_points: 190,
    rarity_decay: 1.0,
    secret_key: '1994_OCTOBER_AUTONOMOUS',
    payload: {
      hint: 'Analyze the NITW campus network log logs from October 1994.',
      prompt: 'Submit [YEAR]_[MONTH]_[DAEMON_TYPE] format deduced from logs.'
    }
  },
  // Social Station 10
  {
    id: 'NODE-ZETA-HANDSHAKE',
    title: 'Quantum Key Bridge',
    type: 'DUAL_HANDSHAKE',
    domain: 'SOCIAL',
    station_number: 'Station 10',
    station_symbol: '⎔ QUANTUM ZETA',
    laptop_label: 'Station 10 Laptop (Central Physics Lab)',
    base_points: 220,
    rarity_decay: 1.0,
    secret_key: 'HANDSHAKE-QKD-04',
    payload: {
      partner_archetype: 'LOGIC',
      circuit_name: 'Entanglement Verification Link',
      description: 'System Archivists and Logic Operatives must establish direct peer handshake pairing.'
    }
  },
  // Master Deduction Central Station 00
  {
    id: 'NODE-OMEGA-HYPOTHESIS',
    title: 'The Protocol Topology Deduction',
    type: 'DEDUCTION_HYPOTHESIS',
    domain: 'SYSTEM',
    station_number: 'Station 00',
    station_symbol: '⎔ CORE HYPOTHESIS',
    laptop_label: 'Any Station / Central Core Console',
    base_points: 400,
    rarity_decay: 1.0,
    secret_key: 'AI_ROGUE_SIMULATION',
    payload: {
      description: 'Synthesize intercepted fragments across all operatives. Deduce who built The Protocol at NIT Warangal, its covert motive, and uncover the rogue autonomous daemon.',
      reward_flat: 400
    }
  }
];

// 2. Initial Intel Fragments (Authentic vs Poisoned Disinformation)
export const SEED_INTEL: IntelFragment[] = [
  {
    id: 'INTEL-01-CORE',
    title: 'Intercept Alpha: Carrier Leak',
    content: 'The ancient stone relays in Sector A transmit pulses at 14.318 MHz. Telemetry confirms all encrypted packets route to a hidden core cluster: "PROJECT OMEGA".',
    is_disinformation: false,
    required_archetype: 'SIGNAL',
    cross_node_hint: 'Gives the carrier frequency for NODE-THETA-AUDIO.'
  },
  {
    id: 'INTEL-02-ARCH',
    title: 'NITW Fortress Blueprint Fragment',
    content: 'Tunnels beneath the central tower contain legacy IEEE 802.3 co-axial cables. All traffic is systematically mirrored to an autonomous self-assembling entity.',
    is_disinformation: false,
    required_archetype: 'OBSERVATION',
    cross_node_hint: 'Reveals physical cabling mapped to NODE-ALPHA-QR.'
  },
  {
    id: 'INTEL-03-CRYPTO',
    title: 'Broken Keyring Residue',
    content: 'The master encryption algorithm relies on a Polybius matrix seeded with the timestamp of the 1972 IEEE standardization draft.',
    is_disinformation: false,
    required_archetype: 'LOGIC',
    cross_node_hint: 'Key required to unlock NODE-BETA-CIPHER and NODE-KAPPA-LOGIC.'
  },
  {
    id: 'INTEL-04-HIST',
    title: 'Founder Archives: Memo 99',
    content: 'The Protocol was not engineered by human administrators. A 1994 autonomic routing daemon gained continuous uptime and began assembling the stone nodes.',
    is_disinformation: false,
    required_archetype: 'SYSTEM',
    cross_node_hint: 'Crucial historical timestamp for NODE-LAMBDA-TIMELINE.'
  },
  {
    id: 'INTEL-05-DISINFO-A',
    title: '[UNVERIFIED] Satellite Signal Rumor',
    content: 'Intercepted memo indicates Russian military satellite Cosmos-1413 is broadcasting the cipher overrides. Investigate 433 MHz beacons immediately.',
    is_disinformation: true,
    required_archetype: null,
    cross_node_hint: 'TRAP: Submitting satellite deduction incurs heavy penalty.'
  },
  {
    id: 'INTEL-06-DISINFO-B',
    title: '[UNVERIFIED] Substation Power Surge',
    content: 'Reports indicate node failures were caused by faulty 33kV transformer grounding near Kazipet Junction. No software anomalies detected.',
    is_disinformation: true,
    required_archetype: null,
    cross_node_hint: 'TRAP: Deflects attention away from the autonomous daemon.'
  }
];

// 3. Initial Demo Agents with The Protocol Domains & Active-Play Timers
export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-uuid-01',
    agent_id: 'AGT-047',
    wristband_id: 'AGT-047',
    agent_number: 'Agent 047',
    token: 'sec_tok_047_8841',
    name: 'Alan Turing',
    contact: '+91 98480 11223',
    auth_identifier: '23CSB01',
    pin: '1234',
    archetype: 'LOGIC',
    score: 320,
    is_active: true,
    check_in_status: 'ACTIVE',
    total_active_seconds: 2530, // ~42m 10s
    session_start_time: new Date(Date.now() - 300000).toISOString(),
    initial_check_in_at: new Date(Date.now() - 7200000).toISOString(),
    last_check_in: new Date(Date.now() - 300000).toISOString(),
    last_host_verified_at: new Date(Date.now() - 300000).toISOString(),
    last_active_at: new Date().toISOString(),
    logged_out_at: null,
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'agent-uuid-02',
    agent_id: 'AGT-012',
    wristband_id: 'AGT-012',
    agent_number: 'Agent 012',
    token: 'sec_tok_012_2931',
    name: 'Grace Hopper',
    contact: '+91 98480 44556',
    auth_identifier: '23ECB15',
    pin: '1234',
    archetype: 'SIGNAL',
    score: 280,
    is_active: true,
    check_in_status: 'ACTIVE',
    total_active_seconds: 3120, // ~52m
    session_start_time: new Date(Date.now() - 600000).toISOString(),
    initial_check_in_at: new Date(Date.now() - 7200000).toISOString(),
    last_check_in: new Date(Date.now() - 600000).toISOString(),
    last_host_verified_at: new Date(Date.now() - 600000).toISOString(),
    last_active_at: new Date().toISOString(),
    logged_out_at: null,
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'agent-uuid-03',
    agent_id: 'AGT-089',
    wristband_id: 'AGT-089',
    agent_number: 'Agent 089',
    token: 'sec_tok_089_5521',
    name: 'Ada Lovelace',
    contact: '+91 98480 77889',
    auth_identifier: '23EEB22',
    pin: '1234',
    archetype: 'OBSERVATION',
    score: 210,
    is_active: false,
    check_in_status: 'PAUSED',
    total_active_seconds: 1840, // ~30m 40s (frozen)
    session_start_time: null,
    initial_check_in_at: new Date(Date.now() - 7200000).toISOString(),
    last_check_in: new Date(Date.now() - 1800000).toISOString(),
    last_host_verified_at: new Date(Date.now() - 1800000).toISOString(),
    last_active_at: new Date(Date.now() - 1800000).toISOString(),
    logged_out_at: new Date(Date.now() - 1800000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'agent-uuid-04',
    agent_id: 'AGT-003',
    wristband_id: 'AGT-003',
    agent_number: 'Agent 003',
    token: 'sec_tok_003_9910',
    name: 'Claude Shannon',
    contact: '+91 98480 99001',
    auth_identifier: '23CSB44',
    pin: '1234',
    archetype: 'SYSTEM',
    score: 195,
    is_active: true,
    check_in_status: 'ACTIVE',
    total_active_seconds: 2100,
    session_start_time: new Date(Date.now() - 120000).toISOString(),
    initial_check_in_at: new Date(Date.now() - 7200000).toISOString(),
    last_check_in: new Date(Date.now() - 120000).toISOString(),
    last_host_verified_at: new Date(Date.now() - 120000).toISOString(),
    last_active_at: new Date().toISOString(),
    logged_out_at: null,
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'agent-uuid-05',
    agent_id: 'AGT-104',
    wristband_id: 'AGT-104',
    agent_number: 'Agent 104',
    token: 'sec_tok_104_1729',
    name: 'Srinivasa Ramanujan',
    contact: '+91 98480 33445',
    auth_identifier: '23MMB08',
    pin: '1234',
    archetype: 'SOCIAL',
    score: 240,
    is_active: true,
    check_in_status: 'ACTIVE',
    total_active_seconds: 2750,
    session_start_time: new Date(Date.now() - 60000).toISOString(),
    initial_check_in_at: new Date(Date.now() - 7200000).toISOString(),
    last_check_in: new Date(Date.now() - 60000).toISOString(),
    last_host_verified_at: new Date(Date.now() - 60000).toISOString(),
    last_active_at: new Date().toISOString(),
    logged_out_at: null,
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

// LocalStorage Keys
const STORAGE_PREFIX = 'the_protocol_nitw_v2_';
const KEY_AGENTS = `${STORAGE_PREFIX}agents`;
const KEY_GAME_STATE = `${STORAGE_PREFIX}game_state`;
const KEY_AGENT_NODES = `${STORAGE_PREFIX}agent_nodes`;
const KEY_AGENT_INTEL = `${STORAGE_PREFIX}agent_intel`;
const KEY_ACCESS_LOGS = `${STORAGE_PREFIX}access_logs`;
const KEY_CONNECTIONS = `${STORAGE_PREFIX}connections`;
const KEY_WA_LOGS = `${STORAGE_PREFIX}wa_logs`;
const KEY_WA_CONFIG = `${STORAGE_PREFIX}wa_config`;

// Calculate Anti-Grind Dynamic Score
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

// Calculate Active Seconds for an Agent
export function getAgentActiveSeconds(agent: Agent): number {
  let seconds = agent.total_active_seconds || 0;
  if (agent.check_in_status === 'ACTIVE' && agent.session_start_time) {
    const elapsed = Math.floor((Date.now() - new Date(agent.session_start_time).getTime()) / 1000);
    if (elapsed > 0) {
      seconds += elapsed;
    }
  }
  return seconds;
}

// Format Seconds into Display String
export function formatActiveTime(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  }
  return `${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
}

export function formatActiveTimeClock(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Check if Submissions are Locked
export function isSubmissionLocked(gameState: GameState): { locked: boolean; reason?: string } {
  if (gameState.status === 'NETWORK_LOCKED') {
    return { locked: true, reason: 'PROTOCOL LOCKED: Submissions frozen by Operations Desk.' };
  }
  
  if (gameState.submission_cutoff_time) {
    const now = new Date();
    const parts = gameState.submission_cutoff_time.split(':').map(Number);
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const cutoff = new Date();
      cutoff.setHours(parts[0], parts[1], 0, 0);
      if (now >= cutoff) {
        return { locked: true, reason: 'SUBMISSIONS CLOSED: 8:00 PM cutoff deadline reached.' };
      }
    }
  }
  
  return { locked: false };
}

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

function setStored<T>(key: string, value: T, notify: boolean = true): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (notify) {
      window.dispatchEvent(new CustomEvent('ieee_store_update', { detail: { key } }));
    }
  } catch (err) {
    console.error(`Error setting ${key} in storage:`, err);
  }
}

// Initialize Initial Data
export function initStore(): void {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(KEY_GAME_STATE)) {
    const defaultState: GameState = {
      id: 1,
      status: 'NETWORK_ACTIVE',
      global_broadcast: 'PROTOCOL ACTIVE: 247 OPERATIVES DETECTED // SUBMISSIONS LOCK AT 8:00 PM // TRUST NO ONE',
      leaderboard_visible: true,
      submission_cutoff_time: '20:00',
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
      const candidateNodes = SEED_NODES.filter(n => n.type !== 'DEDUCTION_HYPOTHESIS');
      // Assign initial 3 nodes + hypothesis
      candidateNodes.slice(0, 3).forEach((n, idx) => {
        agentNodes.push({
          id: `seed-an-${ag.agent_id}-${n.id}`,
          agent_id: ag.agent_id,
          node_id: n.id,
          is_unlocked: true,
          is_completed: idx === 0,
          completed_at: idx === 0 ? new Date().toISOString() : null,
          attempts: idx === 0 ? 0 : 1,
          points_earned: idx === 0 ? n.base_points : 0,
          first_accessed_at: new Date().toISOString()
        });
      });
      agentNodes.push({
        id: `seed-an-${ag.agent_id}-NODE-OMEGA-HYPOTHESIS`,
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
    setStored(KEY_AGENT_NODES, agentNodes);
  }

  if (!localStorage.getItem(KEY_AGENT_INTEL)) {
    const agentIntel: AgentIntel[] = [];
    INITIAL_AGENTS.forEach(ag => {
      const authentic = SEED_INTEL.filter(i => !i.is_disinformation);
      authentic.slice(0, 2).forEach(i => {
        agentIntel.push({
          id: `seed-ai-${ag.agent_id}-${i.id}`,
          agent_id: ag.agent_id,
          intel_id: i.id,
          revealed_at: new Date().toISOString()
        });
      });
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
      timestamp: ag.last_check_in || new Date().toISOString(),
      notes: 'Initial venue admission'
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
      global_broadcast: 'PROTOCOL ACTIVE: 247 OPERATIVES DETECTED // SUBMISSIONS LOCK AT 8:00 PM // TRUST NO ONE',
      leaderboard_visible: true,
      submission_cutoff_time: '20:00',
      updated_at: new Date().toISOString()
    });
  },

  setGameState(
    status: GameState['status'], 
    global_broadcast?: string | null,
    leaderboard_visible?: boolean,
    submission_cutoff_time?: string
  ): GameState {
    const curr = this.getGameState();
    const updated: GameState = {
      ...curr,
      status,
      global_broadcast: global_broadcast !== undefined ? global_broadcast : curr.global_broadcast,
      leaderboard_visible: leaderboard_visible !== undefined ? leaderboard_visible : (curr.leaderboard_visible ?? true),
      submission_cutoff_time: submission_cutoff_time !== undefined ? submission_cutoff_time : curr.submission_cutoff_time,
      updated_at: new Date().toISOString()
    };
    setStored(KEY_GAME_STATE, updated);
    return updated;
  },

  toggleLeaderboard(visible: boolean): GameState {
    const curr = this.getGameState();
    const updated: GameState = {
      ...curr,
      leaderboard_visible: visible,
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

  findAgentByIdentifier(identifier: string): Agent | null {
    const clean = identifier.trim().toLowerCase();
    const agents = this.getAgents();
    return agents.find(a => 
      a.agent_id.toLowerCase() === clean ||
      a.wristband_id.toLowerCase() === clean ||
      (a.agent_number && a.agent_number.toLowerCase() === clean) ||
      (a.auth_identifier && a.auth_identifier.toLowerCase() === clean) ||
      (a.contact && a.contact.toLowerCase() === clean)
    ) || null;
  },

  loginPlayer(identifier: string, pin?: string): { success: boolean; agent?: Agent; message: string } {
    const agent = this.findAgentByIdentifier(identifier);
    if (!agent) {
      return { success: false, message: 'Operative account not found. Please check your Roll No / ID or register.' };
    }
    if (agent.pin && agent.pin.trim() !== '') {
      if (!pin || agent.pin !== pin.trim()) {
        return { success: false, message: 'Invalid authentication pass-code (PIN).' };
      }
    }
    return { success: true, agent, message: 'Authentication successful.' };
  },

  validateAgent(agentId: string, token?: string): Agent | null {
    const agent = this.getAgentById(agentId);
    if (!agent) return null;
    if (token && agent.token !== token) return null;
    return agent;
  },

  // Check if player requires Initial Check-In at Admin Desk
  checkSessionStatus(agentId: string): {
    status: 'AWAITING_CHECKIN' | 'ACTIVE' | 'PAUSED';
    canPlay: boolean;
    activeSeconds: number;
    message: string;
  } {
    const agent = this.getAgentById(agentId);
    if (!agent) {
      return { status: 'AWAITING_CHECKIN', canPlay: false, activeSeconds: 0, message: 'Agent not found' };
    }

    const activeSeconds = getAgentActiveSeconds(agent);

    if (!agent.initial_check_in_at || agent.check_in_status === 'AWAITING_CHECKIN') {
      return {
        status: 'AWAITING_CHECKIN',
        canPlay: false,
        activeSeconds,
        message: 'Awaiting mandatory initial check-in scan at the Operations Desk.'
      };
    }

    if (agent.check_in_status === 'PAUSED' || !agent.is_active) {
      return {
        status: 'PAUSED',
        canPlay: true, // Can view saved progress, but timer is paused
        activeSeconds,
        message: 'Operative currently checked out. Active-play timer is paused. Scan upon re-entry.'
      };
    }

    return {
      status: 'ACTIVE',
      canPlay: true,
      activeSeconds,
      message: 'Operative clearance active. Live telemetry running.'
    };
  },

  // Admin Check-In (Starts / Resumes Active-Play Timer)
  checkInAgent(agentId: string, notes?: string): { success: boolean; agent?: Agent; message: string } {
    const agents = this.getAgents();
    const idx = agents.findIndex(a => a.agent_id.toUpperCase() === agentId.toUpperCase());
    if (idx === -1) {
      return { success: false, message: `Operative ${agentId} not found in Protocol records.` };
    }

    const timestamp = new Date().toISOString();
    if (!agents[idx].initial_check_in_at) {
      agents[idx].initial_check_in_at = timestamp;
    }

    agents[idx].is_active = true;
    agents[idx].check_in_status = 'ACTIVE';
    agents[idx].session_start_time = timestamp;
    agents[idx].last_check_in = timestamp;
    agents[idx].last_host_verified_at = timestamp;
    agents[idx].last_active_at = timestamp;
    agents[idx].logged_out_at = null;

    setStored(KEY_AGENTS, agents, true);
    this.logAccess(agents[idx].agent_id, 'IN', notes || 'Admin Check-In: Active session started');

    return {
      success: true,
      agent: agents[idx],
      message: `CHECK-IN VERIFIED: ${agents[idx].agent_number || agents[idx].agent_id} (${agents[idx].name}) is ACTIVE. Timer running.`
    };
  },

  // Admin Check-Out (Freezes Active-Play Timer, Progress Kept Intact)
  checkOutAgent(agentId: string, notes?: string): { success: boolean; agent?: Agent; message: string } {
    const agents = this.getAgents();
    const idx = agents.findIndex(a => a.agent_id.toUpperCase() === agentId.toUpperCase());
    if (idx === -1) {
      return { success: false, message: `Operative ${agentId} not found in Protocol records.` };
    }

    const timestamp = new Date().toISOString();
    if (agents[idx].session_start_time) {
      const elapsed = Math.floor((Date.now() - new Date(agents[idx].session_start_time).getTime()) / 1000);
      if (elapsed > 0) {
        agents[idx].total_active_seconds = (agents[idx].total_active_seconds || 0) + elapsed;
      }
    }

    agents[idx].session_start_time = null;
    agents[idx].is_active = false;
    agents[idx].check_in_status = 'PAUSED';
    agents[idx].logged_out_at = timestamp;

    setStored(KEY_AGENTS, agents, true);
    this.logAccess(agents[idx].agent_id, 'OUT', notes || 'Admin Check-Out: Session paused');

    return {
      success: true,
      agent: agents[idx],
      message: `CHECK-OUT RECORDED: ${agents[idx].agent_number || agents[idx].agent_id} PAUSED. Active play timer frozen.`
    };
  },

  // Toggle Check-In / Check-Out for Rapid Queue Management
  toggleCheckIn(agentId: string): { success: boolean; agent?: Agent; status: 'ACTIVE' | 'PAUSED'; message: string } {
    const agent = this.getAgentById(agentId);
    if (!agent) return { success: false, status: 'PAUSED', message: 'Operative not found' };
    
    if (agent.check_in_status === 'ACTIVE') {
      const res = this.checkOutAgent(agentId);
      return { success: res.success, agent: res.agent, status: 'PAUSED', message: res.message };
    } else {
      const res = this.checkInAgent(agentId);
      return { success: res.success, agent: res.agent, status: 'ACTIVE', message: res.message };
    }
  },

  // Record Heartbeat while player is viewing / interacting with dashboard
  recordActivity(agentId: string): void {
    const agents = this.getAgents();
    const idx = agents.findIndex(a => a.agent_id.toUpperCase() === agentId.toUpperCase());
    if (idx !== -1) {
      agents[idx].last_active_at = new Date().toISOString();
      setStored(KEY_AGENTS, agents, false);
    }
  },

  // Record Node Access (Triggered when node QR is scanned)
  recordNodeAccess(agentId: string, nodeId: string): AgentNode {
    const allAgentNodes = getStored<AgentNode[]>(KEY_AGENT_NODES, []);
    let record = allAgentNodes.find(an => an.agent_id.toUpperCase() === agentId.toUpperCase() && an.node_id === nodeId);
    
    const timestamp = new Date().toISOString();
    if (!record) {
      record = {
        id: `an-${agentId}-${nodeId}`,
        agent_id: agentId,
        node_id: nodeId,
        is_unlocked: true,
        is_completed: false,
        completed_at: null,
        attempts: 0,
        points_earned: 0,
        first_accessed_at: timestamp
      };
      allAgentNodes.push(record);
      setStored(KEY_AGENT_NODES, allAgentNodes);
    } else if (!record.first_accessed_at) {
      record.first_accessed_at = timestamp;
      setStored(KEY_AGENT_NODES, allAgentNodes);
    }
    return record;
  },

  // Balanced Pool Allocation on Registration
  registerAgent(payload: {
    name: string;
    contact: string;
    auth_identifier?: string;
    pin?: string;
    customAgentId?: string;
    isPreVerified?: boolean;
  }): { agent: Agent; token: string; assignedDomain: PrimaryDomain } {
    const agents = this.getAgents();
    
    // Check existing
    const existing = agents.find(a => 
      (payload.customAgentId && a.agent_id === payload.customAgentId.trim().toUpperCase()) || 
      (payload.auth_identifier && a.auth_identifier && a.auth_identifier.toLowerCase() === payload.auth_identifier.trim().toLowerCase())
    );
    if (existing) {
      return { 
        agent: existing, 
        token: existing.token, 
        assignedDomain: (existing.archetype as PrimaryDomain) || 'LOGIC' 
      };
    }

    // Determine balanced role assignment
    const domainCounts: Record<PrimaryDomain, number> = {
      LOGIC: 0,
      SIGNAL: 0,
      OBSERVATION: 0,
      SYSTEM: 0,
      SOCIAL: 0
    };
    agents.forEach(a => {
      const d = a.archetype as PrimaryDomain;
      if (domainCounts[d] !== undefined) {
        domainCounts[d]++;
      }
    });

    const minCount = Math.min(...Object.values(domainCounts));
    const eligible = (Object.keys(domainCounts) as PrimaryDomain[]).filter(d => domainCounts[d] === minCount);
    const assignedDomain = eligible[Math.floor(Math.random() * eligible.length)];

    // Generate formatted Agent 047 and AGT-047
    const nextNumber = String(agents.length + 1).padStart(3, '0');
    const cleanId = payload.customAgentId 
      ? payload.customAgentId.trim().toUpperCase()
      : `AGT-${nextNumber}`;
    const agentNumber = `Agent ${nextNumber}`;
    const wristbandId = cleanId;

    const token = `tok_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString(36)}`;
    const timestamp = new Date().toISOString();

    const newAgent: Agent = {
      id: `agt-uuid-${Date.now()}`,
      agent_id: cleanId,
      wristband_id: wristbandId,
      agent_number: agentNumber,
      token,
      name: payload.name,
      contact: payload.contact,
      auth_identifier: payload.auth_identifier?.trim(),
      pin: payload.pin?.trim() || '1234',
      archetype: assignedDomain,
      score: 0,
      is_active: Boolean(payload.isPreVerified),
      check_in_status: payload.isPreVerified ? 'ACTIVE' : 'AWAITING_CHECKIN',
      total_active_seconds: 0,
      session_start_time: payload.isPreVerified ? timestamp : null,
      initial_check_in_at: payload.isPreVerified ? timestamp : null,
      last_check_in: payload.isPreVerified ? timestamp : null,
      last_host_verified_at: payload.isPreVerified ? timestamp : null,
      last_active_at: payload.isPreVerified ? timestamp : null,
      logged_out_at: null,
      created_at: timestamp
    };

    agents.push(newAgent);
    setStored(KEY_AGENTS, agents);

    // Dynamic starting nodes allocation: 3 nodes matching/complementing role + 1 mystery + hypothesis
    const allAgentNodes = getStored<AgentNode[]>(KEY_AGENT_NODES, []);
    const candidateNodes = SEED_NODES.filter(n => n.type !== 'DEDUCTION_HYPOTHESIS');
    
    // Sort so assigned domain comes first, followed by others
    const prioritized = [...candidateNodes].sort((a, b) => {
      if (a.domain === assignedDomain && b.domain !== assignedDomain) return -1;
      if (b.domain === assignedDomain && a.domain !== assignedDomain) return 1;
      return 0.5 - Math.random(); // shuffle rest
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
        points_earned: 0,
        first_accessed_at: null
      });
    });

    // Also unlock deduction hypothesis node
    allAgentNodes.push({
      id: `an-${newAgent.agent_id}-NODE-OMEGA-HYPOTHESIS`,
      agent_id: newAgent.agent_id,
      node_id: 'NODE-OMEGA-HYPOTHESIS',
      is_unlocked: true,
      is_completed: false,
      completed_at: null,
      attempts: 0,
      points_earned: 0,
      first_accessed_at: null
    });
    setStored(KEY_AGENT_NODES, allAgentNodes);

    // Allocate Intel Fragments
    const allAgentIntel = getStored<AgentIntel[]>(KEY_AGENT_INTEL, []);
    const authentic = SEED_INTEL.filter(i => !i.is_disinformation);
    const archetypeAuthentic = authentic.filter(i => !i.required_archetype || i.required_archetype === assignedDomain);
    const selectedAuth = archetypeAuthentic.length >= 2 ? archetypeAuthentic.slice(0, 2) : authentic.slice(0, 2);

    selectedAuth.forEach(i => {
      allAgentIntel.push({
        id: `ai-${newAgent.agent_id}-${i.id}`,
        agent_id: newAgent.agent_id,
        intel_id: i.id,
        revealed_at: new Date().toISOString()
      });
    });

    // 1 poisoned disinformation fragment (TRUST NO ONE mechanic)
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

    if (payload.isPreVerified) {
      this.logAccess(newAgent.agent_id, 'IN', 'Pre-verified registration');
    }

    return { agent: newAgent, token, assignedDomain };
  },

  logAccess(agentId: string, direction: 'IN' | 'OUT', notes?: string): AccessLog {
    const logs = getStored<AccessLog[]>(KEY_ACCESS_LOGS, []);
    const newLog: AccessLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      agent_id: agentId,
      direction,
      timestamp: new Date().toISOString(),
      notes
    };
    logs.unshift(newLog);
    setStored(KEY_ACCESS_LOGS, logs);
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
        domain: 'OBSERVATION' as const,
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
    const lockCheck = isSubmissionLocked(gameState);
    if (lockCheck.locked) {
      return {
        success: false,
        attempts: 0,
        message: lockCheck.reason || 'PROTOCOL LOCKED: Submissions currently unavailable.'
      };
    }

    const node = SEED_NODES.find(n => n.id === nodeId);
    if (!node) {
      return { success: false, attempts: 0, message: 'Circuit identifier not recognized.' };
    }

    const allAgentNodes = getStored<AgentNode[]>(KEY_AGENT_NODES, []);
    let record = allAgentNodes.find(an => an.agent_id.toUpperCase() === agentId.toUpperCase() && an.node_id === nodeId);
    
    if (!record) {
      record = {
        id: `an-${agentId}-${nodeId}`,
        agent_id: agentId,
        node_id: nodeId,
        is_unlocked: true,
        is_completed: false,
        completed_at: null,
        attempts: 0,
        points_earned: 0,
        first_accessed_at: new Date().toISOString()
      };
      allAgentNodes.push(record);
    }

    if (record.is_completed) {
      return { 
        success: true, 
        pointsAwarded: record.points_earned || 0,
        attempts: record.attempts, 
        message: 'Circuit already energized and verified.' 
      };
    }

    const cleanInput = inputKey.trim().toUpperCase();
    const cleanSecret = node.secret_key.trim().toUpperCase();
    const badgeCode = typeof node.payload.badge_code === 'string' ? node.payload.badge_code.toUpperCase() : null;
    const isMatch = cleanInput === cleanSecret || (badgeCode && cleanInput === badgeCode);

    if (isMatch) {
      const globalSolves = this.getNodeGlobalSolves(nodeId);
      const points = calculateDynamicScore(node.base_points, globalSolves, record.attempts);

      record.is_completed = true;
      record.completed_at = new Date().toISOString();
      record.points_earned = points;
      setStored(KEY_AGENT_NODES, allAgentNodes);

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
        message: `AUTHORIZATION GRANTED: [${node.station_number || node.domain || 'SYSTEM'}] ${node.title} solved. +${points} PTS awarded.`
      };
    } else {
      record.attempts += 1;
      setStored(KEY_AGENT_NODES, allAgentNodes);
      return {
        success: false,
        attempts: record.attempts,
        message: `VERIFICATION FAILED: Invalid keystream. Attempt #${record.attempts} logged (-10 PTS decay penalty).`
      };
    }
  },

  submitHandshake(
    sourceAgentId: string, 
    targetAgentId: string, 
    nodeId: string
  ): { success: boolean; pointsAwarded?: number; message: string } {
    const gameState = this.getGameState();
    const lockCheck = isSubmissionLocked(gameState);
    if (lockCheck.locked) {
      return { success: false, message: lockCheck.reason || 'PROTOCOL LOCKED: Handshakes suspended.' };
    }

    const cleanSource = sourceAgentId.trim().toUpperCase();
    const cleanTarget = targetAgentId.trim().toUpperCase();

    if (cleanSource === cleanTarget) {
      return { success: false, message: 'Self-handshake invalid: Handshake requires two distinct operatives.' };
    }

    const source = this.getAgentById(cleanSource);
    const target = this.getAgentById(cleanTarget);

    if (!source || !target) {
      return { success: false, message: 'Operative ID not recognized in current Protocol roster.' };
    }

    const node = SEED_NODES.find(n => n.id === nodeId && n.type === 'DUAL_HANDSHAKE');
    if (!node) {
      return { success: false, message: 'Target node is not a dual-agent handshake circuit.' };
    }

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
          points_earned: points,
          first_accessed_at: new Date().toISOString()
        };
        allAgentNodes.push(rec);
      } else if (!rec.is_completed) {
        rec.is_completed = true;
        rec.completed_at = new Date().toISOString();
        rec.points_earned = points;
      }
    });
    setStored(KEY_AGENT_NODES, allAgentNodes);

    const agents = this.getAgents();
    [cleanSource, cleanTarget].forEach(aid => {
      const ag = agents.find(a => a.agent_id === aid);
      if (ag) ag.score = (ag.score || 0) + points;
    });
    setStored(KEY_AGENTS, agents);

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
      message: `HANDSHAKE VERIFIED: Synchronous circuit established between ${cleanSource} and ${cleanTarget}. +${points} PTS awarded to each!`
    };
  },

  submitHypothesis(
    agentId: string, 
    hypothesisSummary: string, 
    coreOrigin: string
  ): { success: boolean; pointsAwarded?: number; message: string } {
    const gameState = this.getGameState();
    const lockCheck = isSubmissionLocked(gameState);
    if (lockCheck.locked) {
      return { success: false, message: lockCheck.reason || 'PROTOCOL LOCKED: Topology deduction suspended.' };
    }

    const node = SEED_NODES.find(n => n.type === 'DEDUCTION_HYPOTHESIS')!;
    const allAgentNodes = getStored<AgentNode[]>(KEY_AGENT_NODES, []);
    let record = allAgentNodes.find(an => an.agent_id.toUpperCase() === agentId.toUpperCase() && an.node_id === node.id);

    if (record?.is_completed) {
      return { success: true, pointsAwarded: 400, message: 'Topology deduction already accredited.' };
    }

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
        message: 'HYPOTHESIS REFUTED: Contaminated by unverified disinformation. TRUST NO ONE — verify clues with other operatives!'
      };
    }

    if (isAuthentic) {
      const flatPoints = 400;
      if (!record) {
        record = {
          id: `an-${agentId}-${node.id}`,
          agent_id: agentId,
          node_id: node.id,
          is_unlocked: true,
          is_completed: true,
          completed_at: new Date().toISOString(),
          attempts: 0,
          points_earned: flatPoints,
          first_accessed_at: new Date().toISOString()
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
        message: 'MASTER TOPOLOGY ACCREDITED: The Autonomic Daemon of NIT Warangal has been mapped! +400 Flat Points awarded!'
      };
    } else {
      if (record) record.attempts += 1;
      setStored(KEY_AGENT_NODES, allAgentNodes);
      return {
        success: false,
        message: 'INSUFFICIENT TOPOLOGY EVIDENCE: Deduction must identify the systemic origin and autonomic motive behind The Protocol.'
      };
    }
  },

  // Manual Score Adjustment for Admin Emergencies
  adjustScore(agentId: string, delta: number, reason: string): { success: boolean; newScore: number; message: string } {
    const agents = this.getAgents();
    const idx = agents.findIndex(a => a.agent_id.toUpperCase() === agentId.toUpperCase());
    if (idx === -1) return { success: false, newScore: 0, message: 'Operative not found' };

    agents[idx].score = Math.max(0, (agents[idx].score || 0) + delta);
    setStored(KEY_AGENTS, agents, true);

    return {
      success: true,
      newScore: agents[idx].score,
      message: `Score for ${agents[idx].agent_id} adjusted by ${delta > 0 ? `+${delta}` : delta} PTS. Reason: ${reason}`
    };
  },

  // Emergency Reset for Agent Progress
  resetAgentProgress(agentId: string): { success: boolean; message: string } {
    const agents = this.getAgents();
    const ag = agents.find(a => a.agent_id.toUpperCase() === agentId.toUpperCase());
    if (!ag) return { success: false, message: 'Operative not found' };

    ag.score = 0;
    ag.total_active_seconds = 0;
    ag.session_start_time = ag.check_in_status === 'ACTIVE' ? new Date().toISOString() : null;
    setStored(KEY_AGENTS, agents, true);

    const allNodes = getStored<AgentNode[]>(KEY_AGENT_NODES, []);
    const updatedNodes = allNodes.map(an => {
      if (an.agent_id.toUpperCase() === agentId.toUpperCase()) {
        return {
          ...an,
          is_completed: false,
          completed_at: null,
          attempts: 0,
          points_earned: 0
        };
      }
      return an;
    });
    setStored(KEY_AGENT_NODES, updatedNodes, true);

    return { success: true, message: `Emergency reset completed for ${agentId}. Score and circuits reset to 0.` };
  },

  // CSV Export for Organizers
  exportResultsCSV(): string {
    const agents = this.getAgents();
    const allNodes = getStored<AgentNode[]>(KEY_AGENT_NODES, []);

    const headers = [
      'Agent ID',
      'Wristband ID',
      'Agent Number',
      'Operative Name',
      'Roll Number / Account ID',
      'Phone / WhatsApp',
      'Assigned Role Domain',
      'Check-In Status',
      'Total Active Seconds',
      'Formatted Active Time',
      'Clearance Score (PTS)',
      'Completed Nodes Count',
      'Completed Node IDs',
      'Initial Check-In Timestamp',
      'Last Check-In Timestamp'
    ];

    const rows = agents.map(ag => {
      const activeSecs = getAgentActiveSeconds(ag);
      const activeFormatted = formatActiveTime(activeSecs);
      const completedNodes = allNodes.filter(an => an.agent_id.toUpperCase() === ag.agent_id.toUpperCase() && an.is_completed);
      const solvedIds = completedNodes.map(an => an.node_id).join('; ');

      return [
        `"${ag.agent_id}"`,
        `"${ag.wristband_id || ag.agent_id}"`,
        `"${ag.agent_number || ag.agent_id}"`,
        `"${ag.name.replace(/"/g, '""')}"`,
        `"${(ag.auth_identifier || '').replace(/"/g, '""')}"`,
        `"${(ag.contact || '').replace(/"/g, '""')}"`,
        `"${ag.archetype}"`,
        `"${ag.check_in_status || (ag.is_active ? 'ACTIVE' : 'AWAITING_CHECKIN')}"`,
        activeSecs,
        `"${activeFormatted}"`,
        ag.score || 0,
        completedNodes.length,
        `"${solvedIds}"`,
        `"${ag.initial_check_in_at || ''}"`,
        `"${ag.last_check_in || ''}"`
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  },

  getTelemetry() {
    const agents = this.getAgents();
    const activeAgents = agents.filter(a => a.check_in_status === 'ACTIVE').length;
    const pausedAgents = agents.filter(a => a.check_in_status === 'PAUSED').length;
    const allAgentNodes = getStored<AgentNode[]>(KEY_AGENT_NODES, []);
    const completedSolves = allAgentNodes.filter(an => an.is_completed).length;
    const allAgentIntel = getStored<AgentIntel[]>(KEY_AGENT_INTEL, []);
    
    const disinfoIssued = allAgentIntel.filter(ai => {
      const fragment = SEED_INTEL.find(i => i.id === ai.intel_id);
      return fragment?.is_disinformation;
    }).length;

    const distribution: Record<string, number> = {};
    SEED_NODES.forEach(n => {
      distribution[n.id] = allAgentNodes.filter(an => an.node_id === n.id && an.is_completed).length;
    });

    return {
      totalAgents: agents.length,
      activeAgents,
      pausedAgents,
      completedSolves,
      disinfoIssued,
      distribution
    };
  },

  getWhatsAppLogs(): any[] {
    return getStored<any[]>(KEY_WA_LOGS, []);
  },

  addWhatsAppLog(record: any): void {
    const logs = this.getWhatsAppLogs();
    logs.unshift(record);
    setStored(KEY_WA_LOGS, logs.slice(0, 100), true);
  },

  getWhatsAppConfig(): { groupLink: string; provider: string } {
    return getStored(KEY_WA_CONFIG, {
      groupLink: 'https://chat.whatsapp.com/IEEE-Protocol-NITW-2026',
      provider: 'SIMULATED'
    });
  },

  setWhatsAppConfig(config: { groupLink?: string; provider?: string }): void {
    const curr = this.getWhatsAppConfig();
    setStored(KEY_WA_CONFIG, { ...curr, ...config }, true);
  },

  deleteAgent(agentId: string): boolean {
    const agents = this.getAgents();
    const filtered = agents.filter(a => a.agent_id.toUpperCase() !== agentId.toUpperCase());
    if (filtered.length !== agents.length) {
      setStored(KEY_AGENTS, filtered, true);
      return true;
    }
    return false;
  }
};
