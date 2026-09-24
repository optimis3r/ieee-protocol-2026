import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { initialData } from "./seed";
import { audit, settle } from "./engine";
import type { EventData, Participant } from "./types";

const directory = () =>
  process.env.PROTOCOL_DATA_DIR || path.join(process.cwd(), ".data");
// Every operation reads under the same cross-process lock. Atomic rename commits the entire transaction.
// Deploy on one persistent volume, with Node processes on the same host; never an ephemeral serverless filesystem.
export async function transaction<T>(work: (data: EventData) => T): Promise<T> {
  const dir = directory();
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const lock = path.join(dir, "event.lock");
  let fd: number | undefined;
  for (let attempt = 0; attempt < 200; attempt++) {
    try {
      fd = fs.openSync(lock, "wx", 0o600);
      fs.writeFileSync(fd, String(process.pid));
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      // Recover a lock only when its owning process is confirmed dead, never just because it is old.
      try {
        const pid = Number(fs.readFileSync(lock, "utf8"));
        if (pid > 0) {
          try {
            process.kill(pid, 0);
          } catch (e) {
            if ((e as NodeJS.ErrnoException).code === "ESRCH")
              fs.unlinkSync(lock);
          }
        }
      } catch {
        /* another worker released it */
      }
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }
  if (fd === undefined)
    throw new Error("Event storage is busy. Retry shortly.");
  try {
    const file = path.join(dir, "event.json");
    const d: EventData = fs.existsSync(file)
      ? JSON.parse(fs.readFileSync(file, "utf8"))
      : migrate(dir);
    if (d.version !== 1 || !Array.isArray(d.participants))
      throw new Error("Unsupported or damaged event store; restore a backup.");
    settle(d);
    const result = work(d);
    const tmp = `${file}.${randomUUID()}.tmp`;
    const out = fs.openSync(tmp, "wx", 0o600);
    try {
      fs.writeFileSync(out, JSON.stringify(d, null, 2));
      fs.fsyncSync(out);
    } finally {
      fs.closeSync(out);
    }
    fs.renameSync(tmp, file);
    return result;
  } finally {
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}
function normalizeLegacyNodeId(rawId?: string): string {
  if (!rawId) return "";
  const norm = String(rawId).toUpperCase();
  const m = norm.match(/NODE-?0?([1-7])/);
  if (m) return `NODE-0${m[1]}`;
  return norm;
}

export function migrate(dir: string): EventData {
  const d = initialData(),
    legacy = path.join(dir, "protocol_store.json");
  if (!fs.existsSync(legacy)) return d;
  const old = JSON.parse(fs.readFileSync(legacy, "utf8"));
  fs.copyFileSync(legacy, path.join(dir, `legacy-backup-${Date.now()}.json`));

  if (old.game_state?.global_broadcast) {
    d.broadcasts.push({
      id: randomUUID(),
      title: "Operations Broadcast",
      body: old.game_state.global_broadcast,
      at: old.game_state.updated_at || new Date().toISOString(),
      actor: "operations-desk",
    });
  }

  for (const a of old.agents || []) {
    const rawCurrent = normalizeLegacyNodeId(a.current_node_id || a.current_node || a.active_node);
    const p: Participant = {
      id: a.agent_id,
      name: a.name,
      roll: a.auth_identifier || a.agent_id,
      phone: a.contact || "",
      token: randomUUID() + randomUUID(),
      socialToken: randomUUID() + randomUUID(),
      checkedIn: Boolean(a.checked_in),
      whatsappLinkedAt: null,
      createdAt: a.created_at || new Date().toISOString(),
      lastActivity: null,
      activeSince: null,
      activeSeconds: a.total_active_seconds || 0,
      currentNode: d.nodes.some((n) => n.id === rawCurrent) ? rawCurrent : null,
      progress: {},
      score: a.score || 0,
      main: [],
      mainAward: 0,
      finishedAt: null,
      readBroadcasts: [],
      disabled: false,
    };
    for (const n of old.agent_nodes || []) {
      const targetNodeId = normalizeLegacyNodeId(n.node_id);
      if (
        n.agent_id === p.id &&
        d.nodes.some((node) => node.id === targetNodeId)
      ) {
        p.progress[targetNodeId] = {
          nodeId: targetNodeId,
          seconds: 0,
          startedAt: n.first_accessed_at || null,
          completedAt: n.completed_at || null,
          attempts: [],
          draft: "",
          points: n.points_earned || 0,
        };
      }
    }
    d.participants.push(p);
    if (p.score)
      d.transactions.push({
        id: randomUUID(),
        agentId: p.id,
        event: "migration",
        points: p.score,
        source: "legacy JSON opening balance",
        actor: "system",
        at: new Date().toISOString(),
      });
  }
  audit(d, "system", "legacy_migration", "event", null, {
    participants: d.participants.length,
    tokensRotated: true,
    originalBackedUp: true,
  });
  return d;
}
export function backup(d: EventData) {
  const dir = path.join(directory(), "backups");
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  fs.writeFileSync(
    path.join(dir, `event-${Date.now()}-${randomUUID()}.json`),
    JSON.stringify(d, null, 2),
    { mode: 0o600 },
  );
}
