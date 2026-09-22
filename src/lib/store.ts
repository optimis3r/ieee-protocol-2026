import { 
  Agent, 
  AgentIntel, 
  AgentNode, 
  AccessLog, 
  GameState, 
  IntelFragment, 
  NetworkConnection, 
  NodeItem,
  PrimaryDomain,
  RegistrationBackupRecord
} from '@/types/database';
import { WhatsAppDispatchRecord } from './whatsapp';

// 1. Initial Seed Nodes with Workstations & Cross-Domain Connections
export const SEED_NODES: NodeItem[] = [
  // -------------------------------------------------------------
  // THE PROTOCOL 2026 OFFICIAL TOURNAMENT STATIONS (7 CIRCUITS)
  // -------------------------------------------------------------
  // Station 01: SIGNAL - Blackout Audio
  {
    id: 'NODE-01-AUDIO',
    title: 'Station 01: Blackout Audio Intercept',
    type: 'TERMINAL_DECRYPT',
    domain: 'SIGNAL',
    station_number: 'Station 01',
    station_symbol: '⎔ AUDIO ALPHA',
    laptop_label: 'Station 01 Terminal (ECE Acoustic Lab / Headphone Station)',
    base_points: 150,
    rarity_decay: 1.0,
    secret_key: '17:45',
    payload: {
      hint: 'Listen closely underneath the high-frequency carrier static and Morse pulses. An operative timestamp was logged.',
      prompt: 'Isolate and submit the intercepted incident timestamp [HH:MM]:',
      audio_url: '',
      timestamp_target: '17:45',
      noise_level: 65,
      frequency: '14.318 MHz',
      badge_code: 'NODE-01-AUDIO'
    }
  },
  // Station 02: OBSERVATION - Pushpin Map
  {
    id: 'NODE-02-MAP',
    title: 'Station 02: Tactical Pushpin Triangulation',
    type: 'TERMINAL_DECRYPT',
    domain: 'OBSERVATION',
    station_number: 'Station 02',
    station_symbol: '⎔ MAP BETA',
    laptop_label: 'Station 02 Terminal (Central Library Ground Floor Atrium)',
    base_points: 140,
    rarity_decay: 1.0,
    secret_key: 'B-BLOCK TERRACE AIR VENT',
    payload: {
      hint: 'Stretch a taut string or ruler across the 3 colored pushpins on the physical corkboard to isolate the centroid geometric intersection.',
      prompt: 'Submit the identified intersection site / landmark name:',
      pin_1_name: 'Pin Alpha: Central Library Tower (Sector 4-A)',
      pin_2_name: 'Pin Beta: ECE Waveguide Mast (Sector 2-C)',
      pin_3_name: 'Pin Gamma: SAC Amphitheatre (Sector 7-F)',
      target_intersection: 'B-BLOCK TERRACE AIR VENT',
      badge_code: 'NODE-02-MAP'
    }
  },
  // Station 03: OBSERVATION - UV Hidden Marker
  {
    id: 'NODE-03-UV',
    title: 'Station 03: UV Fluorescent Room Marker',
    type: 'TERMINAL_DECRYPT',
    domain: 'OBSERVATION',
    station_number: 'Station 03',
    station_symbol: '⎔ UV SPECTRA GAMMA',
    laptop_label: 'Station 03 Terminal (Seminar Hall 2 Room Perimeter)',
    base_points: 150,
    rarity_decay: 1.0,
    secret_key: 'THE PROTOCOL IS ALIVE',
    payload: {
      hint: 'Direct the UV blacklight keychain torch against the room perimeter to uncover invisible luminescent cipher text.',
      prompt: 'Submit decrypted plaintext bypass phrase:',
      uv_room_location: 'Seminar Hall 2 - North Wall Poster',
      uv_hidden_text: 'WKH SURWRFRO LV DOLYH',
      cipher_algorithm: 'Caesar Shift (+3)',
      cipher_shift: 3,
      decrypted_answer: 'THE PROTOCOL IS ALIVE',
      badge_code: 'NODE-03-UV'
    }
  },
  // Station 04: LOGIC - Red Filter / Cardan Grille
  {
    id: 'NODE-04-FILTER',
    title: 'Station 04: Optical Red-Filter & Cardan Grille',
    type: 'TERMINAL_DECRYPT',
    domain: 'LOGIC',
    station_number: 'Station 04',
    station_symbol: '⎔ APERTURE DELTA',
    laptop_label: 'Station 04 Terminal (Digital Circuits Lab Bay)',
    base_points: 160,
    rarity_decay: 1.0,
    secret_key: '8492',
    payload: {
      hint: 'Look through the physical red optical transparency sheet to cancel chromatic noise, or slide the slotted Cardan card over the dense text block.',
      prompt: 'Submit the 4-digit optical PIN or decoded directive sentence:',
      filter_submode: 'BOTH',
      optical_pin: '8492',
      cardan_directive: 'STRIKE AT DUSK',
      grille_text: 'S 9 T 4 R I 2 K E 8 A T 0 D U S K 1 9 7 2',
      badge_code: 'NODE-04-FILTER'
    }
  },
  // Station 05: SYSTEM - Redacted Archive
  {
    id: 'NODE-05-ARCHIVE',
    title: 'Station 05: The Redacted Personnel Archive',
    type: 'TERMINAL_DECRYPT',
    domain: 'SYSTEM',
    station_number: 'Station 05',
    station_symbol: '⎔ ARCHIVE EPSILON',
    laptop_label: 'Station 05 Terminal (Computer Center Server Room)',
    base_points: 170,
    rarity_decay: 1.0,
    secret_key: 'AGENT K',
    payload: {
      hint: 'Hold the physical memo sheets against backlight or execute terminal reconnaissance queries to unveil the redacted subject.',
      prompt: 'Submit the redacted operative identifier or student roll number:',
      memo_title: 'DEPT MEMORANDUM 1994 // DECLASSIFIED',
      memo_body: 'INCIDENT 94-B: At approximately 03:00 hrs, unauthorized packets were relayed through Subsea Fiber 4. Eyewitness logs identify operative [REDACTED: AGENT K] (Roll #248721) manipulating the root memory segment. Exercise extreme discretion.',
      redacted_subject: 'AGENT K',
      redacted_roll: '248721',
      badge_code: 'NODE-05-ARCHIVE'
    }
  },
  // Station 06: SOCIAL - Dead Drop Handler
  {
    id: 'NODE-06-DEAD-DROP',
    title: 'Station 06: Dead Drop Field Handler Encounter',
    type: 'DUAL_HANDSHAKE',
    domain: 'SOCIAL',
    station_number: 'Station 06',
    station_symbol: '⎔ CONTACT ZETA',
    laptop_label: 'Station 06 Terminal (Student Activity Center Atrium)',
    base_points: 180,
    rarity_decay: 1.0,
    secret_key: 'ENVELOPE-DROP-9081',
    payload: {
      hint: 'Locate the designated volunteer handler in the attendee crowd. Utter the secret verbal passphrase to receive the sealed physical envelope.',
      prompt: 'Submit the clearance bypass code found inside the sealed envelope:',
      handler_description: 'Volunteer operative wearing IEEE black lanyard with blue gel pen in chest pocket.',
      verbal_passphrase: 'The packet dropped at midnight',
      envelope_code: 'ENVELOPE-DROP-9081',
      badge_code: 'NODE-06-DEAD-DROP'
    }
  },
  // Station 07: SOCIAL - Rogue Intel / Two-Man Rule
  {
    id: 'NODE-07-TWO-MAN',
    title: 'Station 07: Rogue Intel & The Two-Man Rule',
    type: 'DUAL_HANDSHAKE',
    domain: 'SOCIAL',
    station_number: 'Station 07',
    station_symbol: '⎔ PROTOCOL OMEGA',
    laptop_label: 'Station 07 Terminal (Heritage Cell Core Chamber)',
    base_points: 200,
    rarity_decay: 1.0,
    secret_key: 'FORGERY_DETECTED_1994',
    payload: {
      hint: 'Inspect the open confidential leak clipboard for forged timestamps, or synchronize with a peer in the Split-or-Steal chamber.',
      prompt: 'Submit the forgery verification passcode or complete synchronization:',
      coop_points: 40,
      defect_points: 70,
      rogue_leak_text: 'TOP SECRET IEEE WARANGAL DISPATCH: All operatives proceed to Room 404 immediately. Document Stamped: 1994-09-31. Signature: NITW-COUNCIL.',
      forgery_hint: 'Inspect the stamped calendar date closely (September has only 30 days!).',
      is_forged: true,
      forgery_code: 'FORGERY_DETECTED_1994',
      badge_code: 'NODE-07-TWO-MAN'
    }
  },

  // -------------------------------------------------------------
  // LEGACY ALIASES (Preserving QR codes & previously printed badges)
  // -------------------------------------------------------------
  {
    id: 'NODE-ALPHA-QR',
    title: 'Mainframe Sub-Level Monolith (Legacy S1)',
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
  {
    id: 'NODE-BETA-CIPHER',
    title: 'Subsea Fiber Cryptic Relay (Legacy S2)',
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
  {
    id: 'NODE-THETA-AUDIO',
    title: 'Rogue Carrier Waveform Spectrogram (Legacy S3)',
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
  {
    id: 'NODE-DELTA-QR',
    title: 'Antenna Mast Transceiver Tag (Legacy S4)',
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
  {
    id: 'NODE-EPSILON-CIPHER',
    title: 'Kernel Memory Exploit Vector (Legacy S5)',
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
  {
    id: 'NODE-GAMMA-HANDSHAKE',
    title: 'Dual-Key Authentication Relay (Legacy S6)',
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
  {
    id: 'NODE-KAPPA-LOGIC',
    title: 'Boolean Matrix Logic Gate Relay (Legacy S7)',
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
  {
    id: 'NODE-IOTA-MORSE',
    title: 'Telegraphic Sub-Carrier Packet (Legacy S8)',
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
  {
    id: 'NODE-LAMBDA-TIMELINE',
    title: 'Autonomic Chronos Archive (Legacy S9)',
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
  {
    id: 'NODE-ZETA-HANDSHAKE',
    title: 'Quantum Key Bridge (Legacy S10)',
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

// 3. Initial Agents - Initialized empty for real participants
export const INITIAL_AGENTS: Agent[] = [];


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
const KEY_REGISTRATION_BACKUP = `${STORAGE_PREFIX}registration_backup`;
const KEY_STATION_NODES = `${STORAGE_PREFIX}station_nodes`;


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
    return `${hrs}h ${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatActiveTimeClock(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Determine if submissions are currently locked
export function isSubmissionLocked(gameState: GameState): { locked: boolean; reason?: string } {
  if (gameState.status === 'NETWORK_LOCKED') {
    return { locked: true, reason: 'PROTOCOL NETWORK LOCKED: All submissions are currently suspended by Command.' };
  }

  if (gameState.status === 'STANDBY') {
    return { locked: true, reason: 'PROTOCOL IN STANDBY: Tournament challenge circuits offline until official activation.' };
  }

  // Check cutoff time
  if (gameState.submission_cutoff_time) {
    const now = new Date();
    const cutoffStr = gameState.submission_cutoff_time;
    if (cutoffStr.includes(':')) {
      const [cutoffH, cutoffM] = cutoffStr.split(':').map(Number);
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      if (currentH > cutoffH || (currentH === cutoffH && currentM >= cutoffM)) {
        return { locked: true, reason: `SUBMISSION WINDOW CLOSED: Cutoff time was ${cutoffStr}. Submissions locked.` };
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

export async function notifyServerAsync(payload: Record<string, unknown>): Promise<boolean> {
  if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
    try {
      const adminToken = sessionStorage.getItem('ieee_admin_token') || '';
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(adminToken ? { 'x-admin-token': adminToken } : {})
        },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch {
      return false;
    }
  }
  return false;
}

function notifyServer(payload: Record<string, unknown>): Promise<boolean> {
  return notifyServerAsync(payload);
}

// Initialize Initial Data
export function initStore(): void {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(KEY_GAME_STATE)) {
    const defaultState: GameState = {
      id: 1,
      status: 'STANDBY',
      global_broadcast: 'PROTOCOL STANDBY // EVENT COMMENCES ON SEPTEMBER 24TH // AWAIT SYSTEM ACTIVATION',
      leaderboard_visible: true,
      submission_cutoff_time: '20:00',
      updated_at: new Date().toISOString()
    };
    setStored(KEY_GAME_STATE, defaultState);
  }

  if (!localStorage.getItem(KEY_AGENTS)) {
    setStored(KEY_AGENTS, []);
  }

  if (!localStorage.getItem(KEY_AGENT_NODES)) {
    setStored(KEY_AGENT_NODES, []);
  }

  if (!localStorage.getItem(KEY_AGENT_INTEL)) {
    setStored(KEY_AGENT_INTEL, []);
  }

  if (!localStorage.getItem(KEY_ACCESS_LOGS)) {
    setStored(KEY_ACCESS_LOGS, []);
  }

  if (!localStorage.getItem(KEY_CONNECTIONS)) {
    setStored(KEY_CONNECTIONS, [] as NetworkConnection[]);
  }

  if (!localStorage.getItem(KEY_REGISTRATION_BACKUP)) {
    setStored(KEY_REGISTRATION_BACKUP, []);
  }

  if (!localStorage.getItem(KEY_STATION_NODES)) {
    setStored(KEY_STATION_NODES, SEED_NODES);
  }
}

// Store API Functions
export const Store = {
  getGameState(): GameState {
    return getStored<GameState>(KEY_GAME_STATE, {
      id: 1,
      status: 'STANDBY',
      global_broadcast: 'PROTOCOL STANDBY // EVENT COMMENCES ON SEPTEMBER 24TH // AWAIT SYSTEM ACTIVATION',
      leaderboard_visible: true,
      submission_cutoff_time: '20:00',
      updated_at: new Date().toISOString()
    });
  },

  isEventActive(): boolean {
    return this.getGameState().status === 'NETWORK_ACTIVE';
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
    setStored(KEY_GAME_STATE, updated, true);
    notifyServer({ action: 'update_game_state', ...updated });
    return updated;
  },

  async setGameStateAsync(
    status: GameState['status'], 
    global_broadcast?: string | null,
    leaderboard_visible?: boolean,
    submission_cutoff_time?: string
  ): Promise<GameState> {
    const curr = this.getGameState();
    const targetState: GameState = {
      ...curr,
      status,
      global_broadcast: global_broadcast !== undefined ? global_broadcast : curr.global_broadcast,
      leaderboard_visible: leaderboard_visible !== undefined ? leaderboard_visible : (curr.leaderboard_visible ?? true),
      submission_cutoff_time: submission_cutoff_time !== undefined ? submission_cutoff_time : curr.submission_cutoff_time,
      updated_at: new Date().toISOString()
    };

    // Optimistically update local without triggering a racing background sync before POST commits
    setStored(KEY_GAME_STATE, targetState, false);

    if (typeof fetch !== 'undefined') {
      try {
        const adminToken = typeof window !== 'undefined' ? sessionStorage.getItem('ieee_admin_token') || '' : '';
        const res = await fetch('/api/participants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(adminToken ? { 'x-admin-token': adminToken } : {})
          },
          body: JSON.stringify({ action: 'update_game_state', ...targetState })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.gameState) {
            setStored(KEY_GAME_STATE, data.gameState, false);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('ieee_game_state_change', { detail: data.gameState }));
              window.dispatchEvent(new CustomEvent('ieee_store_update', { detail: { key: KEY_GAME_STATE } }));
            }
            return data.gameState;
          }
        }
      } catch (err) {
        console.warn('Failed to update game state on server:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ieee_game_state_change', { detail: targetState }));
      window.dispatchEvent(new CustomEvent('ieee_store_update', { detail: { key: KEY_GAME_STATE } }));
    }
    return targetState;
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

  loginPlayer(identifier: string): { success: boolean; agent?: Agent; message: string } {
    const agent = this.findAgentByIdentifier(identifier);
    if (!agent) {
      return { success: false, message: 'Operative account not found. Please check your Roll No, Agent ID, or register.' };
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
    notifyServer({ action: 'update_status', agentId: agents[idx].agent_id, status: 'ACTIVE', agentData: agents[idx] });

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
    notifyServer({ action: 'update_status', agentId: agents[idx].agent_id, status: 'PAUSED', agentData: agents[idx] });

    return {
      success: true,
      agent: agents[idx],
      message: `CHECK-OUT RECORDED: ${agents[idx].agent_number || agents[idx].agent_id} PAUSED. Active play timer frozen.`
    };
  },

  // Async versions that wait for server roundtrip and file flush
  async checkInAgentAsync(agentId: string, notes?: string): Promise<{ success: boolean; agent?: Agent; message: string }> {
    let localAgent = this.getAgentById(agentId);
    if (!localAgent) {
      await this.syncAgentWithServer(agentId).catch(() => {});
      localAgent = this.getAgentById(agentId);
    }

    const res = this.checkInAgent(agentId, notes);
    if (typeof fetch !== 'undefined') {
      try {
        const adminToken = typeof window !== 'undefined' ? sessionStorage.getItem('ieee_admin_token') || '' : '';
        const apiRes = await fetch('/api/participants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(adminToken ? { 'x-admin-token': adminToken } : {})
          },
          body: JSON.stringify({
            action: 'update_status',
            agentId,
            status: 'ACTIVE',
            agentData: res.agent || localAgent || { agent_id: agentId }
          })
        });
        if (apiRes.ok) {
          const data = await apiRes.json();
          if (data.agent) {
            const agents = this.getAgents();
            const idx = agents.findIndex(a => a.agent_id.toUpperCase() === agentId.toUpperCase());
            if (idx >= 0) {
              agents[idx] = { ...agents[idx], ...data.agent };
            } else {
              agents.unshift(data.agent);
            }
            setStored(KEY_AGENTS, agents, true);
            return {
              success: true,
              agent: data.agent,
              message: `CHECK-IN VERIFIED: ${data.agent.agent_number || data.agent.agent_id} (${data.agent.name}) is ACTIVE.`
            };
          }
        }
      } catch (e) {
        console.warn('Server check-in update warning:', e);
      }
    }
    return res;
  },

  async checkOutAgentAsync(agentId: string, notes?: string): Promise<{ success: boolean; agent?: Agent; message: string }> {
    let localAgent = this.getAgentById(agentId);
    if (!localAgent) {
      await this.syncAgentWithServer(agentId).catch(() => {});
      localAgent = this.getAgentById(agentId);
    }

    const res = this.checkOutAgent(agentId, notes);
    if (typeof fetch !== 'undefined') {
      try {
        const adminToken = typeof window !== 'undefined' ? sessionStorage.getItem('ieee_admin_token') || '' : '';
        const apiRes = await fetch('/api/participants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(adminToken ? { 'x-admin-token': adminToken } : {})
          },
          body: JSON.stringify({
            action: 'update_status',
            agentId,
            status: 'PAUSED',
            agentData: res.agent || localAgent || { agent_id: agentId }
          })
        });
        if (apiRes.ok) {
          const data = await apiRes.json();
          if (data.agent) {
            const agents = this.getAgents();
            const idx = agents.findIndex(a => a.agent_id.toUpperCase() === agentId.toUpperCase());
            if (idx >= 0) {
              agents[idx] = { ...agents[idx], ...data.agent };
            } else {
              agents.unshift(data.agent);
            }
            setStored(KEY_AGENTS, agents, true);
            return {
              success: true,
              agent: data.agent,
              message: `CHECK-OUT RECORDED: ${data.agent.agent_number || data.agent.agent_id} PAUSED.`
            };
          }
        }
      } catch (e) {
        console.warn('Server check-out update warning:', e);
      }
    }
    return res;
  },

  async toggleCheckInAsync(agentId: string): Promise<{ success: boolean; agent?: Agent; status: 'ACTIVE' | 'PAUSED'; message: string }> {
    let agent = this.getAgentById(agentId);
    if (!agent) {
      await this.syncAgentWithServer(agentId).catch(() => {});
      agent = this.getAgentById(agentId);
    }
    if (!agent) return { success: false, status: 'PAUSED', message: 'Operative not found' };

    if (agent.check_in_status === 'ACTIVE') {
      const res = await this.checkOutAgentAsync(agentId);
      return { success: res.success, agent: res.agent, status: 'PAUSED', message: res.message };
    } else {
      const res = await this.checkInAgentAsync(agentId);
      return { success: res.success, agent: res.agent, status: 'ACTIVE', message: res.message };
    }
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
    notifyServer({ action: 'record_node_access', agentId, nodeId });
    return record;
  },

  // Balanced Pool Allocation on Registration
  registerAgent(payload: {
    name: string;
    contact: string;
    auth_identifier?: string;
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
    notifyServer({ action: 'register', agent: newAgent });

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

  async registerAgentAsync(payload: {
    name: string;
    contact: string;
    auth_identifier?: string;
    customAgentId?: string;
    isPreVerified?: boolean;
  }): Promise<{ agent: Agent; token: string; assignedDomain: PrimaryDomain }> {
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const res = await fetch('/api/participants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register',
            agent: {
              name: payload.name.trim(),
              contact: payload.contact.trim(),
              auth_identifier: payload.auth_identifier?.trim(),
              agent_id: payload.customAgentId?.trim().toUpperCase(),
              is_active: Boolean(payload.isPreVerified),
              check_in_status: payload.isPreVerified ? 'ACTIVE' : 'AWAITING_CHECKIN'
            }
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.agent) {
            const canonicalAgent: Agent = data.agent;
            const agents = this.getAgents();
            const existingIdx = agents.findIndex(a => a.agent_id.toUpperCase() === canonicalAgent.agent_id.toUpperCase());
            if (existingIdx >= 0) {
              agents[existingIdx] = canonicalAgent;
            } else {
              agents.unshift(canonicalAgent);
            }
            setStored(KEY_AGENTS, agents, true);
            if (data.gameState) {
              setStored(KEY_GAME_STATE, data.gameState, false);
            }
            return {
              agent: canonicalAgent,
              token: canonicalAgent.token,
              assignedDomain: (canonicalAgent.archetype as PrimaryDomain) || 'LOGIC'
            };
          }
        }
      } catch (err) {
        console.warn('Server registration failed, falling back to local allocation:', err);
      }
    }
    return this.registerAgent(payload);
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

  getStationNodes(): NodeItem[] {
    const stored = getStored<NodeItem[]>(KEY_STATION_NODES, []);
    if (stored && stored.length > 0) {
      return stored;
    }
    return SEED_NODES;
  },

  getNodeById(nodeId: string): NodeItem | null {
    if (!nodeId) return null;
    const cleanId = nodeId.trim().toUpperCase();
    const nodes = this.getStationNodes();
    return nodes.find(n => 
      n.id.toUpperCase() === cleanId || 
      (n.station_number && n.station_number.toUpperCase() === cleanId) ||
      (typeof n.payload.badge_code === 'string' && n.payload.badge_code.toUpperCase() === cleanId)
    ) || SEED_NODES.find(n => n.id.toUpperCase() === cleanId) || null;
  },

  updateStationNode(nodeId: string, updates: Partial<NodeItem>): NodeItem | null {
    const nodes = [...this.getStationNodes()];
    const index = nodes.findIndex(n => n.id.toUpperCase() === nodeId.toUpperCase());
    if (index === -1) return null;

    nodes[index] = {
      ...nodes[index],
      ...updates,
      payload: {
        ...nodes[index].payload,
        ...(updates.payload || {})
      }
    };

    setStored(KEY_STATION_NODES, nodes);
    notifyServer({ action: 'update_node', nodeId, updates });
    return nodes[index];
  },

  resetStationNodes(): NodeItem[] {
    setStored(KEY_STATION_NODES, SEED_NODES);
    notifyServer({ action: 'reset_nodes' });
    return SEED_NODES;
  },

  getAgentNodes(agentId: string): Array<AgentNode & { node: NodeItem }> {
    const allAgentNodes = getStored<AgentNode[]>(KEY_AGENT_NODES, []);
    const agentRecords = allAgentNodes.filter(an => an.agent_id.toUpperCase() === agentId.toUpperCase());
    const stationNodes = this.getStationNodes();
    
    return agentRecords.map(an => {
      const node = stationNodes.find(n => n.id.toUpperCase() === an.node_id.toUpperCase()) ||
        SEED_NODES.find(n => n.id.toUpperCase() === an.node_id.toUpperCase()) || {
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

    const node = this.getNodeById(nodeId) || SEED_NODES.find(n => n.id.toUpperCase() === nodeId.toUpperCase());
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
    const cleanSecret = (node.secret_key || '').trim().toUpperCase();
    const badgeCode = typeof node.payload.badge_code === 'string' ? node.payload.badge_code.trim().toUpperCase() : null;
    const timestampTarget = typeof node.payload.timestamp_target === 'string' ? node.payload.timestamp_target.trim().toUpperCase() : null;
    const targetIntersection = typeof node.payload.target_intersection === 'string' ? node.payload.target_intersection.trim().toUpperCase() : null;
    const decryptedAnswer = typeof node.payload.decrypted_answer === 'string' ? node.payload.decrypted_answer.trim().toUpperCase() : null;
    const opticalPin = typeof node.payload.optical_pin === 'string' ? node.payload.optical_pin.trim().toUpperCase() : null;
    const cardanDirective = typeof node.payload.cardan_directive === 'string' ? node.payload.cardan_directive.trim().toUpperCase() : null;
    const redactedSubject = typeof node.payload.redacted_subject === 'string' ? node.payload.redacted_subject.trim().toUpperCase() : null;
    const redactedRoll = typeof node.payload.redacted_roll === 'string' ? node.payload.redacted_roll.trim().toUpperCase() : null;
    const envelopeCode = typeof node.payload.envelope_code === 'string' ? node.payload.envelope_code.trim().toUpperCase() : null;
    const forgeryCode = typeof node.payload.forgery_code === 'string' ? node.payload.forgery_code.trim().toUpperCase() : null;

    const isMatch = cleanInput === cleanSecret ||
      (badgeCode && cleanInput === badgeCode) ||
      (timestampTarget && cleanInput === timestampTarget) ||
      (targetIntersection && cleanInput === targetIntersection) ||
      (decryptedAnswer && cleanInput === decryptedAnswer) ||
      (opticalPin && cleanInput === opticalPin) ||
      (cardanDirective && cleanInput === cardanDirective) ||
      (redactedSubject && cleanInput === redactedSubject) ||
      (redactedRoll && cleanInput === redactedRoll) ||
      (envelopeCode && cleanInput === envelopeCode) ||
      (forgeryCode && cleanInput === forgeryCode);

    if (isMatch) {
      const globalSolves = this.getNodeGlobalSolves(nodeId);
      const points = calculateDynamicScore(node.base_points, globalSolves, record.attempts);

      record.is_completed = true;
      record.completed_at = new Date().toISOString();
      record.points_earned = points;
      setStored(KEY_AGENT_NODES, allAgentNodes);
      notifyServer({ action: 'complete_node', agentId, nodeId, pointsEarned: points });

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

  getRegistrationBackup(): RegistrationBackupRecord[] {
    return getStored<RegistrationBackupRecord[]>(KEY_REGISTRATION_BACKUP, []);
  },

  exportRegistrationBackupCSV(): string {
    const backup = this.getRegistrationBackup();
    const source = backup.length > 0 ? backup : this.getAgents().map(ag => ({
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

    const rows = source.map(r => [
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

  parseCSVToOperatives(csvText: string): Array<Partial<Agent>> {
    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];

    const parseRow = (line: string): string[] => {
      const row: string[] = [];
      let inQuotes = false;
      let cur = '';
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === ',' && !inQuotes) {
          row.push(cur.trim());
          cur = '';
        } else {
          cur += c;
        }
      }
      row.push(cur.trim());
      return row;
    };

    const rawHeaders = parseRow(lines[0]);
    const headers = rawHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

    const findIdx = (exactMatches: string[], partialKeywords: string[] = []) => {
      const exactIdx = headers.findIndex(h => exactMatches.includes(h));
      if (exactIdx !== -1) return exactIdx;
      if (partialKeywords.length > 0) {
        return headers.findIndex(h => partialKeywords.some(k => h.includes(k)));
      }
      return -1;
    };

    // Robust field index mappings (specifically tuned for Google Forms CSV exports)
    const idIdx = findIdx(
      ['agentid', 'callsign', 'agtid', 'badgeid', 'operativeid'],
      ['agentid', 'callsign', 'agtid', 'badgeid']
    );

    const nameIdx = findIdx(
      ['name', 'operativename', 'studentname', 'fullname', 'participant', 'registrant'],
      ['name', 'participant']
    );

    const rollIdx = findIdx(
      ['rollnumber', 'rollno', 'roll', 'authidentifier', 'studentid', 'registrationnumber', 'regnumber', 'regno', 'accountid', 'idnumber'],
      ['rollnumber', 'rollno', 'roll', 'authidentifier', 'studentid', 'regno']
    );

    const phoneIdx = findIdx(
      ['phonenumberwhatsappavailable', 'phonenumber', 'phoneno', 'phone', 'whatsappnumber', 'whatsapp', 'contactnumber', 'contact', 'mobile', 'cell'],
      ['phonenumber', 'phone', 'whatsapp', 'mobile', 'contact', 'cell']
    );

    const timeIdx = findIdx(
      ['timestamp', 'time', 'date', 'registeredat', 'submissiontime'],
      ['timestamp', 'time', 'date']
    );

    const domainIdx = findIdx(
      ['tacticaldomain', 'domain', 'role', 'archetype', 'cell', 'discipline'],
      ['tacticaldomain', 'archetype', 'discipline']
    );

    const bandIdx = findIdx(
      ['wristbandid', 'wristband', 'bandid', 'band'],
      ['wristband']
    );

    const statusIdx = findIdx(
      ['checkinstatus', 'status', 'checkin'],
      ['checkin', 'status']
    );

    // Get current agents & backup to project sequential auto-allotment in preview
    const existingAgents = this.getAgents();
    const existingBackups = this.getRegistrationBackup();
    let maxNum = 0;
    const checkMax = (id?: string) => {
      if (!id) return;
      const m = id.match(/AGT-(\d+)/i);
      if (m) {
        const n = parseInt(m[1], 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      }
    };
    existingAgents.forEach(a => checkMax(a.agent_id));
    existingBackups.forEach(b => checkMax(b.agent_id));

    // Cell counts for balanced round-robin projection
    const disciplineCounts: Record<string, number> = {
      LOGIC: 0,
      SIGNAL: 0,
      OBSERVATION: 0,
      SYSTEM: 0,
      SOCIAL: 0
    };
    existingAgents.forEach(a => {
      const arch = String(a.archetype);
      if (disciplineCounts[arch] !== undefined) {
        disciplineCounts[arch]++;
      }
    });

    const domainsOrder: PrimaryDomain[] = ['LOGIC', 'SIGNAL', 'OBSERVATION', 'SYSTEM', 'SOCIAL'];
    const getNextBalancedDomain = (): PrimaryDomain => {
      let minVal = Infinity;
      let selected: PrimaryDomain = 'LOGIC';
      for (const d of domainsOrder) {
        if (disciplineCounts[d] < minVal) {
          minVal = disciplineCounts[d];
          selected = d;
        }
      }
      disciplineCounts[selected]++;
      return selected;
    };

    const operatives: Array<Partial<Agent>> = [];

    for (let i = 1; i < lines.length; i++) {
      const cells = parseRow(lines[i]);
      if (cells.length === 0 || cells.every(c => !c)) continue;

      const name = nameIdx >= 0 && cells[nameIdx] ? cells[nameIdx].trim() : '';
      const roll = rollIdx >= 0 && cells[rollIdx] ? cells[rollIdx].trim() : '';
      const phone = phoneIdx >= 0 && cells[phoneIdx] ? cells[phoneIdx].trim() : '';
      const customId = idIdx >= 0 && cells[idIdx] ? cells[idIdx].trim().toUpperCase() : '';
      const domainRaw = domainIdx >= 0 && cells[domainIdx] ? cells[domainIdx].trim().toUpperCase() : '';
      const wristband = bandIdx >= 0 && cells[bandIdx] ? cells[bandIdx].trim() : '';
      const statusRaw = statusIdx >= 0 && cells[statusIdx] ? cells[statusIdx].trim().toUpperCase() : '';

      let createdAt: string | undefined = undefined;
      if (timeIdx >= 0 && cells[timeIdx]) {
        try {
          const parsedDate = new Date(cells[timeIdx]);
          if (!isNaN(parsedDate.getTime())) {
            createdAt = parsedDate.toISOString();
          }
        } catch (_) {}
      }

      if (!name && !roll && !phone && !customId) continue;

      // Check if already registered
      const cleanRoll = roll.toLowerCase();
      const cleanPhone = phone.replace(/\D/g, '');
      const existing = existingAgents.find(a => {
        if (cleanRoll && a.auth_identifier && a.auth_identifier.trim().toLowerCase() === cleanRoll) return true;
        if (cleanPhone && a.contact && a.contact.replace(/\D/g, '').endsWith(cleanPhone.slice(-10))) return true;
        if (customId && a.agent_id.toUpperCase() === customId) return true;
        return false;
      });

      let allottedId = customId;
      let allottedDomain: any = undefined;

      const validDomains: PrimaryDomain[] = ['LOGIC', 'SIGNAL', 'OBSERVATION', 'SYSTEM', 'SOCIAL'];
      if (domainRaw && validDomains.includes(domainRaw as PrimaryDomain)) {
        allottedDomain = domainRaw as PrimaryDomain;
      }

      if (existing) {
        allottedId = existing.agent_id;
        allottedDomain = existing.archetype as any;
      } else {
        if (!allottedId) {
          maxNum++;
          const padded = String(maxNum).padStart(3, '0');
          allottedId = `AGT-${padded}`;
        }
        if (!allottedDomain) {
          allottedDomain = getNextBalancedDomain();
        }
      }

      const check_in_status = statusRaw.includes('ACTIVE') || statusRaw === 'IN'
        ? 'ACTIVE'
        : statusRaw.includes('PAUSE')
        ? 'PAUSED'
        : 'AWAITING_CHECKIN';

      operatives.push({
        name: name || `Operative ${allottedId}`,
        auth_identifier: roll || undefined,
        contact: phone || undefined,
        agent_id: allottedId,
        agent_number: `Agent ${allottedId.replace(/^AGT-/i, '')}`,
        wristband_id: wristband || allottedId,
        archetype: allottedDomain,
        check_in_status,
        is_active: check_in_status === 'ACTIVE',
        created_at: createdAt
      });
    }

    return operatives;
  },

  async bulkRegisterFromCSV(csvText: string): Promise<{
    success: boolean;
    registeredCount: number;
    updatedCount: number;
    totalCount: number;
    processedAgents?: Agent[];
    message: string;
  }> {
    const operatives = this.parseCSVToOperatives(csvText);
    if (operatives.length === 0) {
      return {
        success: false,
        registeredCount: 0,
        updatedCount: 0,
        totalCount: 0,
        message: 'No valid participant rows detected in CSV. Please verify file headers (Name, Roll Number, Phone).'
      };
    }

    try {
      const adminToken = typeof window !== 'undefined' ? sessionStorage.getItem('ieee_admin_token') || '' : '';
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { 'x-admin-token': adminToken } : {})
        },
        body: JSON.stringify({ action: 'bulk_register', operatives })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.agents) {
          setStored(KEY_AGENTS, data.agents, true);
        }
        if (data.registrationBackup) {
          setStored(KEY_REGISTRATION_BACKUP, data.registrationBackup, false);
        }
        if (data.gameState) {
          setStored(KEY_GAME_STATE, data.gameState, false);
        }
        return {
          success: true,
          registeredCount: data.registeredCount || 0,
          updatedCount: data.updatedCount || 0,
          totalCount: operatives.length,
          processedAgents: (data.processedAgents || []) as Agent[],
          message: `Successfully processed ${operatives.length} operatives (${data.registeredCount} newly registered, ${data.updatedCount} updated).`
        };
      } else {
        const err = await res.json().catch(() => ({}));
        return {
          success: false,
          registeredCount: 0,
          updatedCount: 0,
          totalCount: operatives.length,
          message: err.error || 'Server error processing bulk CSV registration.'
        };
      }
    } catch (e) {
      return {
        success: false,
        registeredCount: 0,
        updatedCount: 0,
        totalCount: operatives.length,
        message: 'Network error communicating with registration server.'
      };
    }
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

  getWhatsAppLogs(): WhatsAppDispatchRecord[] {
    return getStored<WhatsAppDispatchRecord[]>(KEY_WA_LOGS, []);
  },

  addWhatsAppLog(record: WhatsAppDispatchRecord): void {
    const logs = this.getWhatsAppLogs();
    logs.unshift(record);
    setStored(KEY_WA_LOGS, logs.slice(0, 100), true);
  },

  getWhatsAppConfig(): { groupLink: string; provider: string } {
    return getStored(KEY_WA_CONFIG, {
      groupLink: 'https://chat.whatsapp.com/IEEE-Protocol-NITW-2026',
      provider: 'BAILEYS'
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
      notifyServer({ action: 'delete_agent', agentId });
      return true;
    }
    return false;
  },

  getAgentCurrentQuestion(agentId: string): {
    currentNode: (AgentNode & { node: NodeItem }) | null;
    status: 'IN_PROGRESS' | 'SOLVED' | 'NO_ACTIVITY';
    totalSolved: number;
    totalAssigned: number;
  } {
    const nodes = this.getAgentNodes(agentId);
    const solved = nodes.filter(n => n.is_completed);

    const inProgress = nodes
      .filter(n => n.is_unlocked && !n.is_completed)
      .sort((a, b) => {
        const tA = a.first_accessed_at ? new Date(a.first_accessed_at).getTime() : 0;
        const tB = b.first_accessed_at ? new Date(b.first_accessed_at).getTime() : 0;
        return tB - tA;
      });

    if (inProgress.length > 0) {
      return {
        currentNode: inProgress[0],
        status: 'IN_PROGRESS',
        totalSolved: solved.length,
        totalAssigned: nodes.length
      };
    }

    if (solved.length > 0) {
      const lastSolved = [...solved].sort((a, b) => {
        const tA = a.completed_at ? new Date(a.completed_at).getTime() : 0;
        const tB = b.completed_at ? new Date(b.completed_at).getTime() : 0;
        return tB - tA;
      })[0];
      return {
        currentNode: lastSolved,
        status: 'SOLVED',
        totalSolved: solved.length,
        totalAssigned: nodes.length
      };
    }

    return {
      currentNode: nodes[0] || null,
      status: 'NO_ACTIVITY',
      totalSolved: 0,
      totalAssigned: nodes.length
    };
  },

  async syncAgentWithServer(agentId?: string): Promise<{ agent: Agent | null; gameState: GameState }> {
    const currentGameState = this.getGameState();
    if (typeof fetch === 'undefined') {
      return { agent: agentId ? this.getAgentById(agentId) : null, gameState: currentGameState };
    }

    try {
      const url = agentId ? `/api/participants?agentId=${encodeURIComponent(agentId)}` : '/api/participants';
      const res = await fetch(url, { method: 'GET', cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        
        // 1. Sync Game State with timestamp protection
        if (data.gameState && data.gameState.updated_at) {
          const localUpdated = currentGameState.updated_at ? new Date(currentGameState.updated_at).getTime() : 0;
          const remoteUpdated = new Date(data.gameState.updated_at).getTime();
          if (remoteUpdated >= localUpdated) {
            const prevStatus = currentGameState.status;
            setStored(KEY_GAME_STATE, data.gameState, false);
            if (prevStatus !== data.gameState.status) {
              window.dispatchEvent(new CustomEvent('ieee_game_state_change', { detail: data.gameState }));
              window.dispatchEvent(new CustomEvent('ieee_store_update', { detail: data.gameState }));
            }
          }
        }

        // 2. Sync Agent if returned
        if (data.agent) {
          const remoteAgent: Agent = data.agent;
          const agents = this.getAgents();
          const idx = agents.findIndex(a => a.agent_id.toUpperCase() === remoteAgent.agent_id.toUpperCase());
          let statusChanged = false;
          if (idx >= 0) {
            if (agents[idx].check_in_status !== remoteAgent.check_in_status || agents[idx].score !== remoteAgent.score) {
              statusChanged = true;
            }
            agents[idx] = { ...agents[idx], ...remoteAgent };
          } else {
            agents.unshift(remoteAgent);
            statusChanged = true;
          }
          setStored(KEY_AGENTS, agents, false);
          if (statusChanged) {
            window.dispatchEvent(new CustomEvent('ieee_store_update', { detail: remoteAgent }));
          }
          return { agent: remoteAgent, gameState: data.gameState || currentGameState };
        }
      }
    } catch (err) {
      console.warn('Sync with server warning:', err);
    }

    return { agent: agentId ? this.getAgentById(agentId) : null, gameState: this.getGameState() };
  },

  async syncWithServer(): Promise<Agent[]> {
    if (typeof fetch === 'undefined') return this.getAgents();
    try {
      const res = await fetch('/api/participants', { method: 'GET', cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        
        // Sync Game State with timestamp protection
        if (data.gameState && data.gameState.updated_at) {
          const currentGameState = this.getGameState();
          const localUpdated = currentGameState.updated_at ? new Date(currentGameState.updated_at).getTime() : 0;
          const remoteUpdated = new Date(data.gameState.updated_at).getTime();
          if (remoteUpdated >= localUpdated) {
            setStored(KEY_GAME_STATE, data.gameState, false);
          }
        }

        // Sync Registration Backup
        if (Array.isArray(data.registrationBackup)) {
          setStored(KEY_REGISTRATION_BACKUP, data.registrationBackup, false);
        }



        if (Array.isArray(data.agents)) {
          const localAgents = this.getAgents();
          if (data.agents.length === 0 && localAgents.length > 0) {
            return localAgents;
          }
          setStored(KEY_AGENTS, data.agents, false);
          return data.agents;
        }
      }
    } catch (e) {
      console.warn('Sync with server failed, fallback to local store:', e);
    }
    return this.getAgents();
  },



  greatReset(): void {
    setStored(KEY_AGENTS, [], true);
    setStored(KEY_AGENT_NODES, [], true);
    setStored(KEY_AGENT_INTEL, [], true);
    setStored(KEY_ACCESS_LOGS, [], true);
    setStored(KEY_CONNECTIONS, [], true);
    setStored(KEY_WA_LOGS, [], true);
    setStored(KEY_REGISTRATION_BACKUP, [], true);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('ieee_agent_id');
      localStorage.removeItem('ieee_agent_token');
      window.dispatchEvent(new CustomEvent('ieee_wa_dispatch', { detail: {} }));
    }

    notifyServer({ action: 'great_reset' });
  }
};

