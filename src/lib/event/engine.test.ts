import { test } from "node:test";
import assert from "node:assert/strict";
import { initialData } from "./seed";
import {
  adminAction,
  authenticate,
  participantAction,
  register,
  settle,
  snapshot,
  standings,
  validatePattern,
} from "./engine";
import { previewCSV, parseCSV, csvCell } from "./csv";
import { transaction, migrate } from "./persistence";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
function fixture() {
  const d = initialData();
  d.rules.phase = "SUBMISSIONS_OPEN";
  d.rules.deadline = new Date(Date.now() + 3600000).toISOString();
  d.nodes[1].answers = ["C301"];
  d.nodes[1].options = ["C301", "C302"];
  d.nodes[1].enabled = true;
  const p = register(
    d,
    { name: "Alice", roll: "a1", phone: "919123456789" },
    "test",
  );
  adminAction(d, "checkin", { id: p.id, checkedIn: true }, "test");
  return { d, p };
}
test("registration rejects duplicates, ignores client score and generates independent credentials", () => {
  const { d, p } = fixture();
  assert.equal(p.score, 0);
  assert.notEqual(p.token, p.socialToken);
  assert.throws(
    () =>
      register(
        d,
        { name: "Another", roll: "A1", phone: "919123456781", score: 1000 },
        "test",
      ),
    /already registered/,
  );
  assert.throws(() => authenticate(d, p.id), /login QR/);
  assert.equal(authenticate(d, p.token), p);
});
test("check-in, phase and deadline are enforced by the server", () => {
  const { d, p } = fixture();
  p.checkedIn = false;
  assert.throws(
    () => participantAction(d, p, "start", { nodeId: "NODE-01" }),
    /Check in/,
  );
  p.checkedIn = true;
  d.rules.phase = "SETUP";
  assert.throws(
    () => participantAction(d, p, "start", { nodeId: "NODE-01" }),
    /not accepting/,
  );
  d.rules.phase = "EVENT_ACTIVE";
  d.rules.deadline = "2000-01-01T00:00:00Z";
  assert.throws(
    () => participantAction(d, p, "main", { answers: [] }),
    /not accepting/,
  );
});
test("five-minute rule persists accumulated time and checkout pauses it", () => {
  const { d, p } = fixture();
  participantAction(d, p, "start", { nodeId: "NODE-01" });
  assert.throws(
    () => participantAction(d, p, "start", { nodeId: "NODE-03" }),
    /more seconds/,
  );
  p.activeSince = new Date(Date.now() - 301000).toISOString();
  settle(d);
  participantAction(d, p, "start", { nodeId: "NODE-03" });
  assert.ok(p.progress["NODE-01"].seconds >= 300);
  adminAction(d, "checkin", { id: p.id, checkedIn: false }, "test");
  const seconds = p.activeSeconds;
  settle(d, Date.now() + 900000);
  assert.equal(p.activeSeconds, seconds);
});
test("answer validation is authoritative; solving twice never awards twice; historical clue preserved", () => {
  const { d, p } = fixture();
  participantAction(d, p, "start", { nodeId: "NODE-01" });
  participantAction(d, p, "answer", {
    nodeId: "NODE-01",
    answer: "wrong",
    points: 999,
  });
  assert.equal(p.score, 0);
  participantAction(d, p, "answer", {
    nodeId: "NODE-01",
    answer: "5:45 PM",
    points: 999,
  });
  assert.equal(p.score, 20);
  participantAction(d, p, "answer", { nodeId: "NODE-01", answer: "17:45" });
  assert.equal(p.score, 20);
  const next = { ...d.nodes[0], answers: ["different"], clue: "different" };
  adminAction(d, "node", { id: next.id, node: next }, "test");
  assert.equal(p.progress["NODE-01"].clue, "17:45");
});
test("node cap, forged intel penalty and attempt limit apply", () => {
  const { d, p } = fixture();
  d.rules.nodeCap = 10;
  participantAction(d, p, "start", { nodeId: "NODE-01" });
  participantAction(d, p, "answer", { nodeId: "NODE-01", answer: "1745" });
  assert.equal(p.score, 10);
  participantAction(d, p, "start", { nodeId: "NODE-07" });
  participantAction(d, p, "answer", {
    nodeId: "NODE-07",
    answer: "AUTHORIZE AS VALID INTEL",
  });
  assert.equal(p.score, -30);
  assert.throws(
    () =>
      participantAction(d, p, "answer", {
        nodeId: "NODE-07",
        answer: "FLAG AS FORGED / COMPROMISED",
      }),
    /No attempts/,
  );
});
test("Main Node upgrades partial award to full total, records field results, and applies speed bonus once", () => {
  const { d, p } = fixture();
  participantAction(d, p, "start", { nodeId: "NODE-01" });
  participantAction(d, p, "main", {
    answers: ["K-24", "C301", "wrong", "wrong"],
  });
  assert.equal(p.score, 40);
  participantAction(d, p, "main", {
    answers: ["K. Sharma (K-24)", "C301", "1745", "Bypass Protocol Alpha"],
  });
  assert.equal(p.score, 175);
  assert.equal(p.main.length, 2);
  assert.throws(
    () =>
      participantAction(d, p, "main", {
        answers: ["K-24", "C301", "1745", "Bypass Protocol Alpha"],
      }),
    /complete/,
  );
});
test("Main Node wrong answers consume limited attempts and penalize once each", () => {
  const { d, p } = fixture();
  for (let i = 0; i < 2; i++)
    participantAction(d, p, "main", {
      answers: ["wrong", "wrong", "wrong", "wrong"],
    });
  assert.equal(p.score, -50);
  assert.throws(
    () =>
      participantAction(d, p, "main", {
        answers: ["wrong", "wrong", "wrong", "wrong"],
      }),
    /limit/,
  );
});
test("handshakes require both solved, prevent self and duplicates, and cap both Agents", () => {
  const { d, p } = fixture();
  const peer = register(
    d,
    { name: "Bob", roll: "b1", phone: "919123456788" },
    "test",
  );
  peer.checkedIn = true;
  assert.throws(
    () => participantAction(d, p, "handshake", { peer: p.socialToken }),
    /another/,
  );
  assert.throws(
    () => participantAction(d, p, "handshake", { peer: peer.socialToken }),
    /solve/,
  );
  for (const a of [p, peer]) {
    participantAction(d, a, "start", { nodeId: "NODE-01" });
    participantAction(d, a, "answer", { nodeId: "NODE-01", answer: "1745" });
  }
  d.rules.handshakeCap = 5;
  participantAction(d, p, "handshake", { peer: peer.socialToken });
  assert.equal(p.score, 25);
  assert.equal(peer.score, 25);
  assert.throws(
    () => participantAction(d, peer, "handshake", { peer: p.socialToken }),
    /already recorded/,
  );
});
test("trust choices stay private until both commit and resolve only once", () => {
  const { d, p } = fixture();
  const peer = register(
    d,
    { name: "Bob", roll: "b1", phone: "919123456788" },
    "test",
  );
  peer.checkedIn = true;
  for (const a of [p, peer]) {
    participantAction(d, a, "start", { nodeId: "NODE-01" });
    participantAction(d, a, "answer", { nodeId: "NODE-01", answer: "1745" });
  }
  participantAction(d, p, "trust_invite", { peer: peer.socialToken });
  const id = d.encounters[0].id;
  participantAction(d, p, "trust_choice", { id, choice: "defect" });
  assert.deepEqual(snapshot(d, peer).encounters[0].choices, {});
  participantAction(d, peer, "trust_choice", { id, choice: "cooperate" });
  assert.equal(p.score, 60);
  assert.equal(peer.score, 10);
  assert.throws(
    () =>
      participantAction(d, peer, "trust_choice", { id, choice: "cooperate" }),
    /resolved/,
  );
});
test("participant snapshots contain no answer configuration, other profiles, audit or hidden rankings", () => {
  const { d, p } = fixture();
  const s = snapshot(d, p);
  assert.equal(s.leaderboard, null);
  assert.equal(s.participants, undefined);
  assert.equal(s.audit, undefined);
  assert.equal("answers" in s.nodes[0], false);
  assert.equal("patterns" in s.nodes[0], false);
  assert.equal("clue" in s.nodes[0], false);
});
test("QR rotation invalidates previous logins and interaction passes", () => {
  const { d, p } = fixture();
  const previous = p.token;
  adminAction(d, "rotate", { id: p.id }, "test");
  assert.throws(() => authenticate(d, previous), /login QR/);
});
test("disabled current Nodes can be switched immediately; drafts persist", () => {
  const { d, p } = fixture();
  participantAction(d, p, "start", { nodeId: "NODE-01" });
  participantAction(d, p, "draft", { nodeId: "NODE-01", answer: "17" });
  d.nodes[0].enabled = false;
  participantAction(d, p, "start", { nodeId: "NODE-03" });
  assert.equal(p.progress["NODE-01"].draft, "17");
});
test("CSV quoted commas, invalid rows and duplicates preview without creating participants", () => {
  const d = initialData();
  const rows = previewCSV(
    d,
    'name,roll,phone\n"Doe, Jane",A1,919123456789\nBob,A1,919123456780\nNo phone,B1,xx',
  );
  assert.equal(rows[0].name, "Doe, Jane");
  assert.equal(rows[0].errors.length, 0);
  assert.match(rows[1].errors.join(), /Duplicate/);
  assert.ok(rows[2].errors.length);
  assert.equal(d.participants.length, 0);
  assert.throws(() => parseCSV('"unclosed'), /unclosed/);
  assert.equal(csvCell("=1+1"), '"\'=1+1"');
});
test("Great Purge preserves audit and identities, zeroes scores with a ledger entry, and requires two confirmations", () => {
  const { d, p } = fixture();
  d.rules.phase = "EVENT_CLOSED";
  adminAction(
    d,
    "adjust",
    { id: p.id, delta: 50, reason: "Correction" },
    "test",
  );
  assert.throws(() => adminAction(d, "purge", {}, "test"), /confirmations/);
  const token = p.token;
  adminAction(
    d,
    "purge",
    { confirm: "RESET GAME PROGRESS", confirmAgain: true },
    "test",
  );
  assert.equal(p.score, 0);
  assert.equal(p.token, token);
  assert.equal(d.transactions.length, 2);
  assert.ok(d.audit.length >= 3);
});
test("results lock freezes standings and prevents score/rule edits; ties share rank", () => {
  const { d, p } = fixture();
  register(d, { name: "Bob", roll: "b1", phone: "919123456788" }, "test");
  assert.deepEqual(
    standings(d).map((p) => p.rank),
    [1, 1],
  );
  d.rules.phase = "EVENT_CLOSED";
  adminAction(
    d,
    "rules",
    { rules: { ...d.rules, phase: "RESULTS_LOCKED" } },
    "test",
  );
  assert.ok(d.lockedLeaderboard);
  assert.throws(
    () =>
      adminAction(d, "adjust", { id: p.id, delta: 1, reason: "test" }, "test"),
    /locked/,
  );
});
test("pattern rules reject unsafe expressions and accept bounded alternatives", () => {
  assert.throws(() => validatePattern("(a+)+"), /Patterns support/);
  assert.throws(() => validatePattern("a+a+"), /one repetition/);
  validatePattern("17:?45");
});
test("concurrent file transactions serialize, survive reload and roll back failed mutations", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "protocol-test-"));
  process.env.PROTOCOL_DATA_DIR = dir;
  try {
    await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        transaction((d) =>
          register(
            d,
            {
              name: `Agent ${i}`,
              roll: `roll${i}`,
              phone: `91900000${String(i).padStart(4, "0")}`,
            },
            "test",
          ),
        ),
      ),
    );
    await assert.rejects(
      transaction((d) => {
        d.participants[0].score = 100;
        throw new Error("rollback");
      }),
    );
    const d = await transaction((d) => d);
    assert.equal(d.participants.length, 20);
    assert.equal(new Set(d.participants.map((p) => p.id)).size, 20);
    assert.equal(d.participants[0].score, 0);
    fs.writeFileSync(path.join(dir, "event.json"), "{broken");
    await assert.rejects(transaction((d) => d));
  } finally {
    delete process.env.PROTOCOL_DATA_DIR;
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("handshake cap starts fresh after a purge while preserving the historical ledger", () => {
  const { d, p } = fixture();
  const peer = register(
    d,
    { name: "Bob", roll: "b1", phone: "919123456788" },
    "test",
  );
  d.rules.handshakeCap = 10;
  function meet() {
    for (const a of [p, peer]) {
      a.checkedIn = true;
      participantAction(d, a, "start", { nodeId: "NODE-01" });
      participantAction(d, a, "answer", { nodeId: "NODE-01", answer: "1745" });
    }
    participantAction(d, p, "handshake", { peer: peer.socialToken });
  }
  meet();
  d.rules.phase = "EVENT_CLOSED";
  adminAction(
    d,
    "purge",
    { confirm: "RESET GAME PROGRESS", confirmAgain: true },
    "test",
  );
  d.rules.phase = "SUBMISSIONS_OPEN";
  meet();
  assert.equal(p.score, 30);
  assert.equal(
    d.transactions.filter((t) => t.agentId === p.id && t.event === "handshake")
      .length,
    2,
  );
});

test("legacy migration correctly normalizes station IDs, opening scores, and broadcasts", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "protocol-legacy-"));
  const legacyStore = {
    agents: [
      {
        agent_id: "AGT-007",
        name: "James Bond",
        auth_identifier: "JB007",
        contact: "919876543210",
        created_at: new Date().toISOString(),
        score: 120,
        current_node_id: "NODE-01-AUDIO",
        checked_in: true,
      },
    ],
    agent_nodes: [
      {
        agent_id: "AGT-007",
        node_id: "NODE-01-AUDIO",
        completed_at: new Date().toISOString(),
        points_earned: 20,
      },
      {
        agent_id: "AGT-007",
        node_id: "NODE-02-MAP",
        completed_at: null,
        points_earned: 0,
      },
    ],
    game_state: {
      global_broadcast: "Proceed to sector 4.",
    },
  };
  fs.writeFileSync(
    path.join(tmp, "protocol_store.json"),
    JSON.stringify(legacyStore),
  );

  const migrated = migrate(tmp);
  assert.equal(migrated.participants.length, 1);
  const p = migrated.participants[0];
  assert.equal(p.id, "AGT-007");
  assert.equal(p.name, "James Bond");
  assert.equal(p.score, 120);
  assert.equal(p.checkedIn, true);
  assert.equal(p.currentNode, "NODE-01");
  assert.ok(p.progress["NODE-01"]);
  assert.ok(p.progress["NODE-02"]);
  assert.equal(p.progress["NODE-01"].points, 20);
  assert.equal(migrated.broadcasts.length, 1);
  assert.equal(migrated.broadcasts[0].body, "Proceed to sector 4.");
  assert.equal(migrated.transactions.length, 1);
  assert.equal(migrated.transactions[0].event, "migration");

  fs.rmSync(tmp, { recursive: true, force: true });
});

