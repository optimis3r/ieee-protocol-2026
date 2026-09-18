export type AgentArchetype = 
  | 'LOGIC' 
  | 'SIGNAL' 
  | 'OBSERVATION' 
  | 'SYSTEM' 
  | 'SOCIAL'
  | 'CRYPTOGRAPHER' 
  | 'FIELD_OPERATIVE' 
  | 'SIGNAL_ANALYST' 
  | 'ARCHIVIST';

export type PrimaryDomain = 'LOGIC' | 'SIGNAL' | 'OBSERVATION' | 'SYSTEM' | 'SOCIAL';

export interface RoleMetadata {
  title: string;
  subtitle: string;
  description: string;
  focus: string;
  color: string;
}

export const ROLE_DETAILS: Record<PrimaryDomain, RoleMetadata> = {
  LOGIC: {
    title: 'Logic',
    subtitle: 'deduction & patterns',
    description: 'Decipher mathematical patterns, recursive logic ciphers, and algorithmic topology paths.',
    focus: 'Pattern recognition, cipher deciphering, deduction',
    color: '#00d2ff'
  },
  SIGNAL: {
    title: 'Signal',
    subtitle: 'audio, codes & hidden messages',
    description: 'Intercept rogue carrier frequencies, decode audio spectrum waveforms, and reconstruct packet streams.',
    focus: 'Acoustic analysis, Morse/binary telegraphy, hidden carrier messages',
    color: '#00ff88'
  },
  OBSERVATION: {
    title: 'Observation',
    subtitle: 'visual/physical clues',
    description: 'Scan physical environment beacons, uncover optical marker tags, and trace architectural telemetry.',
    focus: 'Environmental reconnaissance, QR optical tags, physical site coordinates',
    color: '#bf55ec'
  },
  SYSTEM: {
    title: 'System',
    subtitle: 'timelines, data & connections',
    description: 'Reconstruct historical incident timelines, dissect kernel memory dumps, and trace autonomic daemon routing.',
    focus: 'Chronological timelines, system logs, memory buffer telemetry',
    color: '#ff7700'
  },
  SOCIAL: {
    title: 'Social',
    subtitle: 'information exchange & collaboration',
    description: 'Execute synchronous multi-agent handshakes, barter asymmetric fragments, and unite disparate operatives.',
    focus: 'Peer-to-peer verification, multi-agent protocol pairing, intel trade',
    color: '#00f0ff'
  }
};

export type NodeType = 'PHYSICAL_QR' | 'TERMINAL_DECRYPT' | 'DUAL_HANDSHAKE' | 'DEDUCTION_HYPOTHESIS';
export type CheckInDirection = 'IN' | 'OUT';
export type CheckInStatus = 'AWAITING_CHECKIN' | 'ACTIVE' | 'PAUSED';
export type GameStatus = 'STANDBY' | 'NETWORK_ACTIVE' | 'NETWORK_LOCKED';

export interface Agent {
  id: string;
  agent_id: string;                  // System ID e.g. AGT-047
  wristband_id: string;              // Inscribed on physical wristband e.g. AGT-047
  agent_number: string;              // Formatted name e.g. Agent 047
  token: string;
  name: string;
  contact: string;
  auth_identifier?: string;          // Roll number, student ID, or email
  pin?: string;                      // Simple pass-code for login recovery
  archetype: AgentArchetype;
  score: number;
  is_active: boolean;
  check_in_status: CheckInStatus;    // AWAITING_CHECKIN, ACTIVE, PAUSED
  total_active_seconds: number;      // Accumulated active play time (pauses when checked out)
  session_start_time: string | null; // When currently active session started
  initial_check_in_at: string | null;// When admin first checked them in
  last_check_in: string | null;
  last_host_verified_at?: string | null; // Timestamp when host last scanned their QR
  last_active_at?: string | null;        // Last active on webpage
  logged_out_at?: string | null;         // Timestamp when player left or paused
  created_at: string;
}

export interface AccessLog {
  id: string;
  agent_id: string;
  direction: CheckInDirection;
  timestamp: string;
  notes?: string;
}

export interface NodePayload {
  location?: string;
  hint?: string;
  sector?: string;
  badge_code?: string;
  linked_station?: string;
  cipher?: string;
  algorithm?: string;
  prompt?: string;
  frequency?: string;
  modulation?: string;
  partner_archetype?: string;
  circuit_name?: string;
  description?: string;
  expression?: string;
  audio_hint?: string;
  reward_flat?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface NodeItem {
  id: string;
  title: string;
  type: NodeType;
  domain?: PrimaryDomain;
  station_number?: string;           // Physical workstation number e.g. Station 01
  station_symbol?: string;           // Workstation glyph e.g. ⎔ TERMINAL ALPHA
  laptop_label?: string;             // Physical laptop link
  base_points: number;
  rarity_decay: number;
  secret_key: string;
  payload: NodePayload;
}

export interface AgentNode {
  id: string;
  agent_id: string;
  node_id: string;
  is_unlocked: boolean;
  is_completed: boolean;
  completed_at: string | null;
  attempts: number;
  points_earned?: number;
  first_accessed_at?: string | null;
}

export interface IntelFragment {
  id: string;
  title: string;
  content: string;
  is_disinformation: boolean;
  required_archetype: AgentArchetype | null;
  cross_node_hint?: string;          // Asymmetric connection hint for other roles
}

export interface AgentIntel {
  id: string;
  agent_id: string;
  intel_id: string;
  revealed_at: string;
}

export interface NetworkConnection {
  id: string;
  source_agent_id: string;
  target_agent_id: string;
  node_id: string;
  connection_type: string;
  verified: boolean;
  points_awarded: number;
  created_at: string;
}

export interface GameState {
  id: number;
  status: GameStatus;
  global_broadcast: string | null;
  leaderboard_visible: boolean;
  submission_cutoff_time: string;    // e.g. 2026-09-18T20:00:00 or "20:00"
  updated_at: string;
}
