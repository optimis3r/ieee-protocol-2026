export type Phase =
  | "SETUP"
  | "REGISTRATION_OPEN"
  | "EVENT_ACTIVE"
  | "SUBMISSIONS_OPEN"
  | "EVENT_CLOSING"
  | "EVENT_CLOSED"
  | "RESULTS_LOCKED";
export interface Rules {
  phase: Phase;
  deadline: string;
  leaderboardVisible: boolean;
  whatsappUrl: string;
  starterCount: number;
  nodeCap: number;
  handshakePoints: number;
  handshakeCap: number;
  mainAttempts: number;
  partialPoints: number;
  fullPoints: number;
  wrongPenalty: number;
  trustCooperate: number;
  trustDefect: number;
  trustVictim: number;
}
export interface Asset {
  name: string;
  url: string;
  kind: "audio" | "image" | "video" | "document" | "link";
}
export interface Puzzle {
  id: string;
  title: string;
  category: string;
  description: string;
  instructions: string;
  input: "text" | "pin" | "select" | "choice";
  options: string[];
  answers: string[];
  patterns: string[];
  exact: boolean;
  points: number;
  penalty: number;
  minSeconds: number;
  attemptLimit: number;
  enabled: boolean;
  published: boolean;
  notes: string;
  clue: string;
  assets: Asset[];
  revision: number;
}
export interface Progress {
  nodeId: string;
  seconds: number;
  startedAt: string | null;
  completedAt: string | null;
  attempts: {
    answer: string;
    correct: boolean;
    at: string;
    revision: number;
  }[];
  draft: string;
  points: number;
  clue?: string;
}
export interface MainAttempt {
  id: string;
  answers: string[];
  correct: boolean[];
  points: number;
  at: string;
}
export interface Participant {
  id: string;
  name: string;
  roll: string;
  phone: string;
  token: string;
  socialToken: string;
  checkedIn: boolean;
  whatsappLinkedAt: string | null;
  createdAt: string;
  lastActivity: string | null;
  activeSince: string | null;
  activeSeconds: number;
  currentNode: string | null;
  progress: Record<string, Progress>;
  score: number;
  main: MainAttempt[];
  mainAward: number;
  finishedAt: string | null;
  readBroadcasts: string[];
  disabled: boolean;
}
export interface Transaction {
  id: string;
  agentId: string;
  event: string;
  points: number;
  source: string;
  actor: string;
  at: string;
}
export interface Audit {
  id: string;
  actor: string;
  action: string;
  target: string;
  before: unknown;
  after: unknown;
  at: string;
}
export interface Handshake {
  id: string;
  agents: string[];
  at: string;
}
export interface Encounter {
  id: string;
  agents: string[];
  choices: Record<string, "cooperate" | "defect">;
  resolvedAt: string | null;
  at: string;
}
export interface Broadcast {
  id: string;
  title: string;
  body: string;
  actor: string;
  at: string;
}
export interface EventData {
  version: number;
  rules: Rules;
  nodes: Puzzle[];
  participants: Participant[];
  transactions: Transaction[];
  audit: Audit[];
  handshakes: Handshake[];
  encounters: Encounter[];
  broadcasts: Broadcast[];
  requests: Record<string, unknown>;
  lockedLeaderboard: Standing[] | null;
}
export interface Standing {
  rank: number;
  id: string;
  name: string;
  score: number;
}
export type PublicPuzzle = Omit<
  Puzzle,
  "answers" | "patterns" | "exact" | "notes" | "clue"
>;
export interface Snapshot {
  rules: Rules;
  nodes: PublicPuzzle[];
  participant?: Participant;
  participants?: Participant[];
  adminNodes?: Puzzle[];
  transactions: Transaction[];
  audit?: Audit[];
  handshakes: Handshake[];
  encounters: Encounter[];
  broadcasts: Broadcast[];
  leaderboard: Standing[] | null;
  serverTime: string;
  canPlay: boolean;
}
