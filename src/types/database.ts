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

export type NodeType = 'PHYSICAL_QR' | 'TERMINAL_DECRYPT' | 'DUAL_HANDSHAKE' | 'DEDUCTION_HYPOTHESIS';
export type CheckInDirection = 'IN' | 'OUT';
export type GameStatus = 'STANDBY' | 'NETWORK_ACTIVE' | 'NETWORK_LOCKED';

export interface Agent {
  id: string;
  agent_id: string;
  token: string;
  name: string;
  contact: string;
  auth_identifier?: string; // Roll number, student ID, or email
  pin?: string;             // Simple pass-code for login recovery
  archetype: AgentArchetype;
  score: number;
  is_active: boolean;
  last_check_in: string | null;
  last_host_verified_at?: string | null; // Timestamp when host last scanned their QR
  last_active_at?: string | null;        // Last active on the webpage
  logged_out_at?: string | null;         // Timestamp when player left or logged out of webpage
  created_at: string;
}

export interface AccessLog {
  id: string;
  agent_id: string;
  direction: CheckInDirection;
  timestamp: string;
}

export interface NodeItem {
  id: string;
  title: string;
  type: NodeType;
  domain?: 'LOGIC' | 'SIGNAL' | 'OBSERVATION' | 'SYSTEM' | 'SOCIAL';
  base_points: number;
  rarity_decay: number;
  secret_key: string;
  payload: Record<string, any>;
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
}

export interface IntelFragment {
  id: string;
  title: string;
  content: string;
  is_disinformation: boolean;
  required_archetype: AgentArchetype | null;
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
  updated_at: string;
}
