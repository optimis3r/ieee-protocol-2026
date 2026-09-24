import { randomBytes, randomUUID } from "node:crypto";
import type {
  EventData,
  Participant,
  Progress,
  Puzzle,
  Snapshot,
  Standing,
  Rules,
} from "./types";

export class EventError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
const requireThat: (
  condition: unknown,
  message: string,
  status?: number,
) => asserts condition = (condition, message, status = 400) => {
  if (!condition) throw new EventError(message, status);
};
const stamp = () => new Date().toISOString();
const token = () => randomBytes(32).toString("base64url");
export const text = (v: unknown, max = 2000) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
function number(v: unknown, min: number, max: number) {
  requireThat(
    typeof v === "number" && Number.isFinite(v) && v >= min && v <= max,
    `Number must be between ${min} and ${max}`,
  );
  return v;
}
export function audit(
  d: EventData,
  actor: string,
  action: string,
  target: string,
  before: unknown,
  after: unknown,
) {
  d.audit.push({
    id: randomUUID(),
    actor,
    action,
    target,
    before: structuredClone(before),
    after: structuredClone(after),
    at: stamp(),
  });
}
function award(
  d: EventData,
  p: Participant,
  event: string,
  points: number,
  source: string,
  actor = p.id,
) {
  if (!points) return;
  p.score += points;
  d.transactions.push({
    id: randomUUID(),
    agentId: p.id,
    event,
    points,
    source,
    actor,
    at: stamp(),
  });
}
export function active(d: EventData, now = Date.now()) {
  return (
    ["EVENT_ACTIVE", "SUBMISSIONS_OPEN", "EVENT_CLOSING"].includes(
      d.rules.phase,
    ) && now < Date.parse(d.rules.deadline)
  );
}
function playing(d: EventData, p: Participant) {
  requireThat(
    !p.disabled && p.checkedIn,
    "Check in at the operations desk before playing.",
    403,
  );
  requireThat(active(d), "The event is not accepting gameplay.", 409);
  requireThat(
    !p.finishedAt,
    "Your Master Deduction is complete. Your results are read-only.",
    409,
  );
}
function progress(id: string): Progress {
  return {
    nodeId: id,
    seconds: 0,
    startedAt: null,
    completedAt: null,
    attempts: [],
    draft: "",
    points: 0,
  };
}
// Time counts while checked in, including a locked phone. Checkout, event pause and deadline stop it.
export function settle(d: EventData, now = Date.now()) {
  for (const p of d.participants) {
    if (p.activeSince) {
      const end = Math.min(now, Date.parse(d.rules.deadline));
      const seconds = Math.max(0, (end - Date.parse(p.activeSince)) / 1000);
      p.activeSeconds += seconds;
      if (
        p.currentNode &&
        p.progress[p.currentNode] &&
        !p.progress[p.currentNode].completedAt
      )
        p.progress[p.currentNode].seconds += seconds;
      p.activeSince =
        active(d, now) && p.checkedIn && !p.finishedAt && !p.disabled
          ? new Date(now).toISOString()
          : null;
    }
  }
}
function begin(d: EventData, p: Participant) {
  if (
    !p.activeSince &&
    active(d) &&
    p.checkedIn &&
    !p.finishedAt &&
    !p.disabled
  )
    p.activeSince = stamp();
}
export function standings(d: EventData): Standing[] {
  const rows = d.participants
    .filter((p) => !p.disabled)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return rows.map((p, i) => ({
    id: p.id,
    name: p.name,
    score: p.score,
    rank:
      i && p.score === rows[i - 1].score
        ? rows.findIndex((a) => a.score === p.score) + 1
        : i + 1,
  }));
}
export function snapshot(
  d: EventData,
  p?: Participant,
  admin = false,
): Snapshot {
  return {
    rules: d.rules,
    nodes: d.nodes
      .filter((n) => admin || (p?.checkedIn && n.enabled && n.published))
      .map((n) => ({
        id: n.id,
        title: n.title,
        category: n.category,
        description: n.description,
        instructions: n.instructions,
        input: n.input,
        options: n.options,
        points: n.points,
        penalty: n.penalty,
        minSeconds: n.minSeconds,
        attemptLimit: n.attemptLimit,
        enabled: n.enabled,
        published: n.published,
        assets: n.assets,
        revision: n.revision,
      })),
    participant: p,
    ...(admin
      ? { participants: d.participants, adminNodes: d.nodes, audit: d.audit }
      : {}),
    transactions: d.transactions.filter((t) => admin || t.agentId === p?.id),
    handshakes: d.handshakes.filter(
      (h) => admin || h.agents.includes(p?.id || ""),
    ),
    encounters: d.encounters
      .filter((e) => admin || e.agents.includes(p?.id || ""))
      .map((e) => ({
        ...e,
        choices:
          admin || e.resolvedAt
            ? e.choices
            : p && e.choices[p.id]
              ? { [p.id]: e.choices[p.id] }
              : {},
      })),
    broadcasts: d.broadcasts,
    leaderboard:
      admin || d.rules.leaderboardVisible
        ? d.lockedLeaderboard || standings(d)
        : null,
    serverTime: stamp(),
    canPlay: !!p && p.checkedIn && !p.disabled && !p.finishedAt && active(d),
  };
}
export function authenticate(d: EventData, credential: string): Participant {
  const p = d.participants.find((a) => a.token === credential && !a.disabled);
  requireThat(p, "Scan your personal login QR to sign in.", 401);
  return p;
}
function node(d: EventData, id: unknown) {
  const n = d.nodes.find((n) => n.id === id);
  requireThat(n, "Unknown Node");
  return n;
}
function available(n: Puzzle) {
  requireThat(
    n.enabled && n.published,
    "This Node is unavailable. Choose another Node.",
    409,
  );
}
function currentSwitch(d: EventData, p: Participant, target: string) {
  if (!p.currentNode || p.currentNode === target) return;
  const old = node(d, p.currentNode),
    pr = p.progress[old.id];
  if (
    !old.enabled ||
    !old.published ||
    pr?.completedAt ||
    (old.attemptLimit && pr?.attempts.length >= old.attemptLimit)
  )
    return;
  requireThat(
    pr && pr.seconds >= old.minSeconds,
    `Spend ${Math.ceil(old.minSeconds - (pr?.seconds || 0))} more seconds on your current Node.`,
    409,
  );
}
// Deliberately bounded regex dialect: literals, character classes and simple quantifiers.
export function validatePattern(pattern: string) {
  requireThat(
    pattern.length <= 160 &&
      (pattern.match(/\?/g) || []).length <= 4 &&
      !/[()|]/.test(pattern) &&
      !/\\[1-9]/.test(pattern),
    "Patterns support literals, character classes and quantifiers; groups, alternatives and backreferences are not supported.",
  );
  requireThat(
    (pattern.match(/[*+{]/g) || []).length <= 1,
    "Use at most one repetition per pattern; add separate patterns for alternatives.",
  );
  try {
    new RegExp(`^(?:${pattern})$`, "i");
  } catch {
    throw new EventError("Invalid answer pattern");
  }
}
function matches(n: Puzzle, answer: string) {
  const normalize = (v: string) =>
    n.exact ? v.trim() : v.trim().toLowerCase().replace(/\s+/g, " ");
  return (
    n.answers.some((a) => normalize(a) === normalize(answer)) ||
    n.patterns.some((p) =>
      new RegExp(`^(?:${p})$`, n.exact ? "" : "i").test(answer),
    )
  );
}
export function register(
  d: EventData,
  input: Record<string, unknown>,
  actor: string,
) {
  const name = text(input.name, 80),
    roll = text(input.roll, 80).toLowerCase(),
    phone = text(input.phone, 30).replace(/[\s()+-]/g, "");
  requireThat(
    name && roll && /^\d{10,15}$/.test(phone),
    "Name, roll number and a 10–15 digit phone number are required.",
  );
  requireThat(
    !d.participants.some((p) => p.roll === roll || p.phone === phone),
    "Participant already registered. Ask the desk to recover your QR.",
    409,
  );
  const max = Math.max(
    0,
    ...d.participants.map((p) => Number(p.id.replace("AGT-", "")) || 0),
  );
  const p: Participant = {
    id: `AGT-${String(max + 1).padStart(3, "0")}`,
    name,
    roll,
    phone,
    token: token(),
    socialToken: token(),
    checkedIn: false,
    whatsappLinkedAt: null,
    createdAt: stamp(),
    lastActivity: null,
    activeSince: null,
    activeSeconds: 0,
    currentNode: null,
    progress: {},
    score: 0,
    main: [],
    mainAward: 0,
    finishedAt: null,
    readBroadcasts: [],
    disabled: false,
  };
  const candidates = d.nodes.filter((n) => n.enabled && n.published);
  for (let i = 0; i < Math.min(d.rules.starterCount, candidates.length); i++) {
    const [n] = candidates.splice(
      Math.floor(Math.random() * candidates.length),
      1,
    );
    p.progress[n.id] = progress(n.id);
  }
  d.participants.push(p);
  audit(d, actor, "register", p.id, null, { name, roll, phone });
  return p;
}
export function participantAction(
  d: EventData,
  p: Participant,
  action: string,
  b: Record<string, unknown>,
): unknown {
  p.lastActivity = stamp();
  if (action === "onboard") {
    requireThat(
      d.rules.whatsappUrl,
      "The desk has not configured the WhatsApp group yet.",
    );
    p.whatsappLinkedAt ||= stamp();
    return {};
  }
  if (action === "read_broadcast") {
    const id = text(b.id);
    requireThat(
      d.broadcasts.some((a) => a.id === id),
      "Unknown broadcast",
    );
    if (!p.readBroadcasts.includes(id)) p.readBroadcasts.push(id);
    return {};
  }
  playing(d, p);
  begin(d, p);
  if (action === "start") {
    const n = node(d, b.nodeId);
    available(n);
    requireThat(
      d.rules.phase !== "EVENT_CLOSING" || p.progress[n.id],
      "New Nodes are closed.",
    );
    currentSwitch(d, p, n.id);
    p.progress[n.id] ||= progress(n.id);
    p.progress[n.id].startedAt ||= stamp();
    p.currentNode = n.id;
    return {};
  }
  if (action === "draft") {
    const n = node(d, b.nodeId);
    requireThat(p.progress[n.id], "Start this Node first");
    p.progress[n.id].draft = text(b.answer, 160);
    return {};
  }
  if (action === "answer") {
    const n = node(d, b.nodeId);
    available(n);
    const pr = p.progress[n.id];
    requireThat(
      pr && p.currentNode === n.id,
      "Open this Node before answering.",
    );
    if (pr.completedAt)
      return { correct: true, points: 0, message: "Already completed." };
    requireThat(
      !n.attemptLimit || pr.attempts.length < n.attemptLimit,
      "No attempts remain for this Node.",
      409,
    );
    const answer = text(b.answer, 160);
    requireThat(answer, "Enter an answer");
    if (["choice", "select"].includes(n.input))
      requireThat(
        n.options.includes(answer),
        "Select one of the available options",
      );
    if (n.input === "pin")
      requireThat(/^\d{4}$/.test(answer), "Enter a four-digit PIN");
    const correct = matches(n, answer);
    pr.attempts.push({ answer, correct, at: stamp(), revision: n.revision });
    pr.draft = answer;
    let points = -n.penalty;
    if (correct) {
      const earned = Object.values(p.progress)
        .filter((v) => v.nodeId !== "NODE-07")
        .reduce((a, v) => a + Math.max(0, v.points), 0);
      points =
        n.id === "NODE-07"
          ? n.points
          : Math.max(0, Math.min(n.points, d.rules.nodeCap - earned));
      pr.completedAt = stamp();
      pr.points = points;
      pr.clue = n.clue;
    }
    award(
      d,
      p,
      n.id === "NODE-07" ? "forged_intel" : correct ? "node" : "penalty",
      points,
      n.id,
    );
    return {
      correct,
      points,
      message: correct ? "Node solved. Intel saved." : "Answer not accepted.",
    };
  }
  if (action === "main") {
    requireThat(
      ["SUBMISSIONS_OPEN", "EVENT_CLOSING"].includes(d.rules.phase),
      "Main Node submissions are not open.",
      409,
    );
    requireThat(
      p.main.length < d.rules.mainAttempts,
      "Main Node attempt limit reached.",
      409,
    );
    const nodes = ["NODE-05", "NODE-02", "NODE-01", "NODE-04"].map((id) =>
      node(d, id),
    );
    requireThat(
      nodes.every((n) => n.answers.length || n.patterns.length),
      "The desk must configure all four Main Node answers first.",
    );
    requireThat(
      Array.isArray(b.answers) && b.answers.length === 4,
      "Exactly four answers are required",
    );
    const answers = b.answers.map((a) => text(a, 160));
    requireThat(answers.every(Boolean), "Complete all four fields");
    const correct = nodes.map((n, i) => matches(n, answers[i])),
      count = correct.filter(Boolean).length;
    let points = 0;
    if (count >= 2) {
      const level = count === 4 ? d.rules.fullPoints : d.rules.partialPoints;
      points = Math.max(0, level - p.mainAward);
      p.mainAward = Math.max(level, p.mainAward);
    } else points = -d.rules.wrongPenalty;
    const attempt = { id: randomUUID(), answers, correct, points, at: stamp() };
    p.main.push(attempt);
    award(d, p, "main", points, attempt.id);
    if (count === 4) {
      p.finishedAt = stamp();
      p.activeSince = null;
      const mins = p.activeSeconds / 60;
      award(
        d,
        p,
        "speed",
        mins < 30 ? 25 : mins <= 45 ? 15 : mins <= 60 ? 5 : 0,
        attempt.id,
      );
    }
    return { correct, points, message: `${count}/4 fields correct.` };
  }
  if (action === "handshake" || action === "trust_invite") {
    const peer = d.participants.find((a) => a.socialToken === text(b.peer));
    requireThat(
      peer && peer.id !== p.id,
      "Scan another Agent’s interaction QR.",
    );
    requireThat(
      peer.checkedIn && !peer.disabled && !peer.finishedAt,
      "The other Agent is unavailable.",
    );
    requireThat(
      [p, peer].every((a) =>
        Object.values(a.progress).some((pr) => pr.completedAt),
      ),
      "Both Agents must solve at least one Node.",
    );
    if (action === "handshake") {
      requireThat(
        !d.handshakes.some(
          (h) => h.agents.includes(p.id) && h.agents.includes(peer.id),
        ),
        "This handshake is already recorded.",
        409,
      );
      const h = {
        id: randomUUID(),
        agents: [p.id, peer.id].sort(),
        at: stamp(),
      };
      d.handshakes.push(h);
      for (const a of [p, peer]) {
        const earned = d.transactions
          .filter(
            (t) =>
              t.agentId === a.id &&
              t.event === "handshake" &&
              d.handshakes.some((h) => h.id === t.source),
          )
          .reduce((v, t) => v + t.points, 0);
        award(
          d,
          a,
          "handshake",
          Math.max(
            0,
            Math.min(d.rules.handshakePoints, d.rules.handshakeCap - earned),
          ),
          h.id,
        );
      }
      return { message: "Handshake recorded for both Agents." };
    }
    requireThat(
      !d.encounters.some(
        (e) => e.agents.includes(p.id) && e.agents.includes(peer.id),
      ),
      "Only one trust encounter per pair is allowed.",
      409,
    );
    const encounter = {
      id: randomUUID(),
      agents: [p.id, peer.id],
      choices: {},
      resolvedAt: null,
      at: stamp(),
    };
    d.encounters.push(encounter);
    return { message: "Encounter created. Both Agents choose independently." };
  }
  if (action === "trust_choice") {
    const e = d.encounters.find(
      (e) => e.id === b.id && e.agents.includes(p.id),
    );
    requireThat(
      e && !e.resolvedAt && !e.choices[p.id],
      "Encounter already resolved or choice already committed.",
      409,
    );
    requireThat(
      b.choice === "cooperate" || b.choice === "defect",
      "Choose cooperate or defect",
    );
    requireThat(
      e.agents.every((id) =>
        d.participants.some((a) => a.id === id && a.checkedIn && !a.disabled),
      ),
      "Both Agents must be checked in.",
    );
    e.choices[p.id] = b.choice;
    if (Object.keys(e.choices).length === 2) {
      const [a, c] = e.agents.map((id) =>
        d.participants.find((p) => p.id === id)!,
      );
      for (const [self, other] of [
        [a, c],
        [c, a],
      ]) {
        const own = e.choices[self.id],
          peer = e.choices[other.id];
        award(
          d,
          self,
          "trust",
          own === "cooperate" && peer === "cooperate"
            ? d.rules.trustCooperate
            : own === "defect" && peer === "cooperate"
              ? d.rules.trustDefect
              : own === "cooperate"
                ? d.rules.trustVictim
                : 0,
          e.id,
        );
      }
      e.resolvedAt = stamp();
    }
    return {
      message: e.resolvedAt
        ? "Encounter resolved."
        : "Choice committed. Waiting for your partner.",
    };
  }
  throw new EventError("Unknown participant action");
}

export function adminAction(
  d: EventData,
  action: string,
  b: Record<string, unknown>,
  actor: string,
): unknown {
  if (action === "broadcast") {
    const title = text(b.title, 120),
      body = text(b.body, 2000);
    requireThat(title && body, "Title and message are required");
    const entry = { id: randomUUID(), title, body, actor, at: stamp() };
    d.broadcasts.push(entry);
    audit(d, actor, action, entry.id, null, entry);
    return {};
  }
  requireThat(
    d.rules.phase !== "RESULTS_LOCKED",
    "Final results are locked. Export the archived event; scores and rules cannot be changed.",
    409,
  );
  if (action === "rules") {
    const updates = b.rules as Rules;
    requireThat(updates && typeof updates === "object", "Rules are required");
    const r = structuredClone(d.rules);
    const phases = [
      "SETUP",
      "REGISTRATION_OPEN",
      "EVENT_ACTIVE",
      "SUBMISSIONS_OPEN",
      "EVENT_CLOSING",
      "EVENT_CLOSED",
      "RESULTS_LOCKED",
    ];
    requireThat(phases.includes(updates.phase), "Invalid event phase");
    requireThat(
      Number.isFinite(Date.parse(updates.deadline)),
      "A complete submission deadline is required",
    );
    requireThat(
      typeof updates.leaderboardVisible === "boolean",
      "Leaderboard visibility is required",
    );
    requireThat(
      !updates.whatsappUrl ||
        /^https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]+$/.test(
          updates.whatsappUrl,
        ),
      "Use a valid WhatsApp group invite URL",
    );
    const next: Rules = {
      ...r,
      phase: updates.phase,
      deadline: updates.deadline,
      leaderboardVisible: updates.leaderboardVisible,
      whatsappUrl: text(updates.whatsappUrl, 300),
    };
    for (const key of [
      "starterCount",
      "nodeCap",
      "handshakePoints",
      "handshakeCap",
      "mainAttempts",
      "partialPoints",
      "fullPoints",
      "wrongPenalty",
      "trustCooperate",
      "trustDefect",
      "trustVictim",
    ] as const) {
      next[key] = number(
        updates[key],
        key === "trustVictim"
          ? -1000
          : key === "starterCount" || key === "mainAttempts"
            ? 1
            : 0,
        key === "starterCount" ? 2 : key === "mainAttempts" ? 10 : 10000,
      );
      requireThat(
        Number.isInteger(next[key]),
        "Rule values must be whole numbers",
      );
    }
    requireThat(
      next.fullPoints >= next.partialPoints,
      "Full deduction points must be at least the partial award",
    );
    if (next.phase === "RESULTS_LOCKED")
      requireThat(
        r.phase === "EVENT_CLOSED",
        "Close the event before locking results.",
      );
    d.rules = next;
    for (const p of d.participants) {
      if (!active(d)) p.activeSince = null;
      else if (p.currentNode) begin(d, p);
    }
    if (next.phase === "RESULTS_LOCKED") d.lockedLeaderboard = standings(d);
    audit(d, actor, action, "event", r, next);
    return {};
  }
  if (action === "node") {
    const old = node(d, b.id),
      n = b.node as Puzzle;
    requireThat(n && typeof n === "object", "Node content is required");
    const next: Puzzle = {
      ...old,
      title: text(n.title, 120),
      category: text(n.category, 60),
      description: text(n.description),
      instructions: text(n.instructions),
      notes: text(n.notes),
      clue: text(n.clue),
      input: n.input,
      exact: !!n.exact,
      enabled: !!n.enabled,
      published: !!n.published,
      points: number(n.points, 0, 1000),
      penalty: number(n.penalty, 0, 1000),
      minSeconds: number(n.minSeconds, 0, 3600),
      attemptLimit: number(n.attemptLimit, 0, 100),
      revision: old.revision + 1,
      answers: [],
      options: [],
      patterns: [],
      assets: [],
    };
    requireThat(
      next.title && ["text", "pin", "select", "choice"].includes(next.input),
      "Valid title and input type required",
    );
    for (const key of ["answers", "options", "patterns"] as const) {
      requireThat(
        Array.isArray(n[key]) && n[key].length <= 100,
        `Invalid ${key}`,
      );
      next[key] = n[key].map((v) => text(v, 160)).filter(Boolean);
    }
    next.patterns.forEach(validatePattern);
    requireThat(
      !next.enabled || next.answers.length || next.patterns.length,
      "Configure an answer before enabling the Node",
    );
    requireThat(
      !["choice", "select"].includes(next.input) ||
        !next.enabled ||
        (next.options.length &&
          next.answers.every((a) => next.options.includes(a))),
      "Dropdown/choice answers must match an option",
    );
    requireThat(
      Array.isArray(n.assets) && n.assets.length <= 20,
      "At most 20 assets per Node",
    );
    next.assets = n.assets.map((a) => {
      requireThat(
        ["audio", "image", "video", "document", "link"].includes(a.kind),
        "Invalid asset type",
      );
      requireThat(
        /^https?:\/\//.test(a.url) ||
          /^\/api\/event\/assets\/[a-f0-9-]+\.[a-z0-9]+$/.test(a.url),
        "Use an http(s) URL or uploaded asset",
      );
      return { name: text(a.name, 100), url: text(a.url, 1000), kind: a.kind };
    });
    audit(d, actor, action, old.id, old, next);
    d.nodes[d.nodes.indexOf(old)] = next;
    return {};
  }
  if (action === "register") return register(d, b, actor);
  if (action === "purge") {
    requireThat(
      b.confirm === "RESET GAME PROGRESS" && b.confirmAgain === true,
      "Two confirmations are required",
    );
    requireThat(
      d.rules.phase === "SETUP" || d.rules.phase === "EVENT_CLOSED",
      "Close the event before resetting progress",
    );
    for (const p of d.participants) {
      award(d, p, "reset", -p.score, "Great Purge", actor);
      p.progress = {};
      p.currentNode = null;
      p.main = [];
      p.mainAward = 0;
      p.finishedAt = null;
      p.activeSeconds = 0;
      p.activeSince = null;
      p.checkedIn = false;
    }
    // Histories remain in the archived backup and audit. Audit/score ledger are never deleted.
    audit(
      d,
      actor,
      action,
      "event",
      { handshakes: d.handshakes, encounters: d.encounters },
      {
        reset: "progress; scores; check-in; attempts; interactions",
        identitiesPreserved: true,
      },
    );
    d.handshakes = [];
    d.encounters = [];
    d.rules.phase = "SETUP";
    d.requests = {};
    return {};
  }
  const p = d.participants.find((p) => p.id === b.id);
  requireThat(p, "Participant not found", 404);
  const before = structuredClone(p);
  if (action === "checkin") {
    requireThat(
      typeof b.checkedIn === "boolean",
      "Choose check in or check out",
    );
    p.checkedIn = b.checkedIn;
    if (p.checkedIn && p.currentNode) begin(d, p);
    else p.activeSince = null;
  } else if (action === "adjust") {
    requireThat(text(b.reason, 300), "A reason is required");
    award(
      d,
      p,
      "admin",
      number(b.delta, -10000, 10000),
      text(b.reason, 300),
      actor,
    );
  } else if (action === "rotate") {
    p.token = token();
    p.socialToken = token();
  } else if (action === "reset_onboarding") p.whatsappLinkedAt = null;
  else if (action === "participant") {
    const roll = text(b.roll, 80).toLowerCase() || p.roll,
      phone = text(b.phone, 30).replace(/[\s()+-]/g, "") || p.phone;
    requireThat(/^\d{10,15}$/.test(phone), "Phone must contain 10–15 digits");
    requireThat(
      !d.participants.some(
        (a) => a.id !== p.id && (a.roll === roll || a.phone === phone),
      ),
      "Roll number or phone belongs to another Agent",
    );
    p.roll = roll;
    p.phone = phone;
    p.name = text(b.name, 80) || p.name;
    p.disabled = !!b.disabled;
    if (p.disabled) {
      p.activeSince = null;
      p.checkedIn = false;
    }
  } else if (action === "override") {
    const n = node(d, b.nodeId);
    requireThat(text(b.reason), "Override reason required");
    p.progress[n.id] ||= progress(n.id);
    p.currentNode = n.id;
    p.progress[n.id].startedAt ||= stamp();
    begin(d, p);
  } else throw new EventError("Unknown admin action");
  const redact = (p: Participant) => ({
    ...p,
    token: "[redacted]",
    socialToken: "[redacted]",
  });
  audit(d, actor, action, p.id, redact(before), {
    ...redact(p),
    reason: text(b.reason),
  });
  return {};
}
