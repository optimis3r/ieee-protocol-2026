"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Frame,
  Panel,
  Field,
  QR,
  useEvent,
  adminHeaders,
  credential,
  time,
} from "./shared";
import type {
  Participant,
  Puzzle,
  Rules,
  Asset,
  Snapshot,
} from "@/lib/event/types";
import { QRScannerModal } from "@/components/scanner/QRScannerModal";
import { BadgeSheet } from "@/components/event/BadgeSheet";
import { soundEffects } from "@/lib/audio";

type Run = (
  action: string,
  payload?: Record<string, unknown>,
) => Promise<unknown>;
type CSVRow = {
  row: number;
  name: string;
  roll: string;
  phone: string;
  errors: string[];
};
export function AdminPortal() {
  const router = useRouter();
  const { data, error, offline, busy, act } = useEvent(true);
  const [tab, setTab] = useState("Overview"),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [selected, setSelected] = useState(""),
    [scan, setScan] = useState(false),
    [message, setMessage] = useState(""),
    [badgePrintView, setBadgePrintView] = useState(false),
    [origin, setOrigin] = useState("");

  useEffect(() => {
    queueMicrotask(() => setOrigin(window.location.origin));
  }, []);
  const run: Run = async (action, payload = {}) => {
    const result = await act(action, payload);
    setMessage("Saved.");
    return result;
  };
  if (!data)
    return (
      <Frame admin title="Opening the operations desk…">
        {offline && (
          <p className="event-notice">
            Cannot connect. Reconnecting automatically.
          </p>
        )}
      </Frame>
    );
  const agents = data.participants || [],
    selectedAgent = agents.find((p) => p.id === selected);
  const call = (action: string, payload?: Record<string, unknown>) => {
    void run(action, payload).catch(() => {});
  };
  async function download(format: string) {
    const res = await fetch(`/api/event?view=export&format=${format}`, {
      headers: adminHeaders(),
    });
    if (!res.ok) {
      setMessage("Export failed. Please sign in again.");
      return;
    }
    const url = URL.createObjectURL(await res.blob()),
      a = document.createElement("a");
    a.href = url;
    a.download = format === "csv" ? "standings.csv" : "event-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <Frame
      admin
      title="The operations desk."
      subtitle="One event record. Every Agent, Node and score accounted for."
    >
      <div className="event-stats">
        <div>
          <strong>{agents.length}</strong>REGISTERED
        </div>
        <div>
          <strong>{agents.filter((p) => p.checkedIn).length}</strong>CHECKED IN
        </div>
        <div>
          <strong>{agents.filter((p) => p.activeSince).length}</strong>PLAYING
        </div>
        <div>
          <strong>
            {agents.reduce(
              (s, p) =>
                s +
                Object.values(p.progress).filter((v) => v.completedAt).length,
              0,
            )}
          </strong>
          NODES SOLVED
        </div>
        <div>
          <strong>{data.handshakes.length}</strong>HANDSHAKES
        </div>
        <div>
          <strong>{agents.reduce((s, p) => s + p.main.length, 0)}</strong>MAIN
          ATTEMPTS
        </div>
      </div>
      {(error || message || offline) && (
        <div
          role="status"
          className={`event-notice ${error ? "event-error" : ""}`}
        >
          {offline
            ? "Connection lost. Controls require a connection."
            : error || message}
        </div>
      )}
      <nav className="event-tabs">
        {[
          "Overview",
          "Participants",
          "Registration",
          "Nodes",
          "Event controls",
          "Audit & backup",
        ].map((t) => (
          <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
        <button
          onClick={() => {
            sessionStorage.removeItem("ieee_admin_token");
            sessionStorage.removeItem("ieee_admin_auth");
            router.push("/admin/login");
          }}
        >
          Sign out
        </button>
      </nav>
      {tab === "Overview" && (
        <div className="event-grid">
          <Panel title="Live event overview">
            <p>
              Phase: <strong>{data.rules.phase.replaceAll("_", " ")}</strong>
            </p>
            <p>
              Deadline:{" "}
              {new Date(data.rules.deadline).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              })}{" "}
              IST
            </p>
            <p>
              Average score:{" "}
              {agents.length
                ? (
                    agents.reduce((s, p) => s + p.score, 0) / agents.length
                  ).toFixed(1)
                : 0}
            </p>
            <p>
              Highest score:{" "}
              {agents.length ? Math.max(...agents.map((p) => p.score)) : 0}
            </p>
            <p>
              Trust encounters: {data.encounters.length} · Forged-intel
              interactions:{" "}
              {
                data.transactions.filter((t) => t.event === "forged_intel")
                  .length
              }
            </p>
            <p>Checked out: {agents.filter((p) => !p.checkedIn).length}</p>
            <div className="event-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Node</th>
                    <th>Solved</th>
                    <th>Working</th>
                  </tr>
                </thead>
                <tbody>
                  {data.nodes.map((n) => (
                    <tr key={n.id}>
                      <td>{n.id}</td>
                      <td>
                        {
                          agents.filter((p) => p.progress[n.id]?.completedAt)
                            .length
                        }
                      </td>
                      <td>
                        {
                          agents.filter(
                            (p) =>
                              p.currentNode === n.id &&
                              p.activeSince &&
                              !p.progress[n.id]?.completedAt,
                          ).length
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
          <Panel title="Current standings">
            <Standings data={data} />
          </Panel>
        </div>
      )}
      {tab === "Participants" && (
        <>
          <Panel title="Participant registry">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button className="primary" onClick={() => setScan(true)}>
                Scan QR at desk
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEffects.playKeystrokeBeep();
                  setBadgePrintView(true);
                }}
              >
                Print Badge Sheets
              </button>
            </div>
            <div className="event-grid">
              <Field label="Search name, Agent ID, roll or phone">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Field>
              <Field label="Filter">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All participants</option>
                  <option value="in">Checked in</option>
                  <option value="out">Checked out</option>
                  <option value="disabled">Deactivated</option>
                </select>
              </Field>
            </div>
            <div className="event-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Score</th>
                    <th>Check-in</th>
                    <th>Current Node</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents
                    .filter(
                      (p) =>
                        `${p.id} ${p.name} ${p.roll} ${p.phone}`
                          .toLowerCase()
                          .includes(search.toLowerCase()) &&
                        (filter === "all" ||
                          (filter === "in" && p.checkedIn) ||
                          (filter === "out" && !p.checkedIn) ||
                          (filter === "disabled" && p.disabled)),
                    )
                    .map((p) => (
                      <tr key={p.id}>
                        <td>
                          {p.name}
                          <br />
                          <small>
                            {p.id} · {p.roll}
                          </small>
                        </td>
                        <td>{p.score}</td>
                        <td>
                          {p.disabled
                            ? "Deactivated"
                            : p.checkedIn
                              ? "IN"
                              : "OUT"}
                        </td>
                        <td>{p.currentNode || "Not started"}</td>
                        <td>
                          <button onClick={() => setSelected(p.id)}>
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Panel>
          {selectedAgent && (
            <ParticipantDetail
              key={selectedAgent.id}
              p={selectedAgent}
              data={data}
              run={run}
              busy={busy}
            />
          )}
        </>
      )}
      {tab === "Registration" && <Registration run={run} busy={busy} />}
      {tab === "Nodes" && (
        <NodeManager nodes={data.adminNodes || []} run={run} busy={busy} />
      )}
      {tab === "Event controls" && (
        <>
          <RulesForm rules={data.rules} run={run} busy={busy} />
          <Panel title="Broadcast to all Agents">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget;
                void run("broadcast", Object.fromEntries(new FormData(f)))
                  .then(() => f.reset())
                  .catch(() => {});
              }}
            >
              <Field label="Heading">
                <input name="title" required maxLength={120} />
              </Field>
              <Field label="Message">
                <textarea name="body" required maxLength={2000} />
              </Field>
              <button className="primary" disabled={busy}>
                Send broadcast
              </button>
            </form>
          </Panel>
        </>
      )}
      {tab === "Audit & backup" && (
        <>
          <Panel title="Export & preserve">
            <p>
              Full JSON backups include participants, private login credentials,
              Nodes, attempts, score transactions, handshakes, trust encounters
              and audit history. Keep exports private. Uploaded files are stored
              separately in the assets folder.
            </p>
            <button onClick={() => download("json")}>
              Download full event backup
            </button>
            <button onClick={() => download("csv")}>
              Download standings CSV
            </button>
            <p>
              Equal scores share a rank; Agent ID provides stable display
              ordering.
            </p>
          </Panel>
          <Panel title="Great Purge — reset game progress">
            <p>
              Preserves identities, QR codes, onboarding, questions, broadcasts,
              audit history and score ledger. Resets scores with ledger
              adjustments, Node progress, active time, Main Node attempts,
              check-in and social interactions. A complete JSON backup is saved
              first. Available only during Setup or after Event Closed.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                call("purge", {
                  confirm: f.get("confirm"),
                  confirmAgain: f.get("confirmAgain") === "on",
                });
              }}
            >
              <Field label="Type RESET GAME PROGRESS">
                <input name="confirm" required autoComplete="off" />
              </Field>
              <label>
                <input type="checkbox" name="confirmAgain" required /> I confirm
                the event-wide reset described above.
              </label>
              <br />
              <button
                disabled={
                  busy || !["SETUP", "EVENT_CLOSED"].includes(data.rules.phase)
                }
              >
                Reset game progress
              </button>
            </form>
          </Panel>
          <Panel title="Audit history">
            {data.audit
              ?.slice()
              .reverse()
              .map((a) => (
                <details className="event-row" key={a.id}>
                  <summary>
                    {new Date(a.at).toLocaleString()} · {a.actor} · {a.action} ·{" "}
                    {a.target}
                  </summary>
                  <pre>
                    {JSON.stringify(
                      { before: a.before, after: a.after },
                      null,
                      2,
                    )}
                  </pre>
                </details>
              ))}
          </Panel>
        </>
      )}
      <QRScannerModal
        isOpen={scan}
        onClose={() => setScan(false)}
        onScanSuccess={(r) => {
          setScan(false);
          const peer = credential(r.raw, "peer"),
            login = credential(r.raw, "login");
          const p = agents.find(
            (a) => a.socialToken === peer || a.token === login,
          );
          if (p) {
            soundEffects.playScanChirp();
            setSelected(p.id);
            setMessage(
              `Scanned ${p.id}. Review details below and choose Check in or Check out.`,
            );
          } else {
            soundEffects.playErrorBuzz();
            setMessage("QR not recognized. Ask the Agent to open My pass.");
          }
        }}
        title="OPERATIONS DESK SCANNER"
        subtitle="Scanning identifies the Agent. Confirm check-in or check-out in their details."
      />
      {badgePrintView && (
        <BadgeSheet
          agents={agents}
          origin={origin}
          onClose={() => setBadgePrintView(false)}
        />
      )}
    </Frame>
  );
}
function Standings({ data }: { data: Snapshot }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Agent</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {data.leaderboard?.map((p) => (
          <tr key={p.id}>
            <td>{p.rank}</td>
            <td>
              {p.id} · {p.name}
            </td>
            <td>{p.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function ParticipantDetail({
  p,
  data,
  run,
  busy,
}: {
  p: Participant;
  data: Snapshot;
  run: Run;
  busy: boolean;
}) {
  const [origin, setOrigin] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  useEffect(() => {
    queueMicrotask(() => setOrigin(location.origin));
  }, []);
  const call = (a: string, b: Record<string, unknown> = {}) =>
    void run(a, { id: p.id, ...b }).catch(() => {});
  const login = `${origin}/login#login=${p.token}`;
  const onboarding = `Welcome ${p.name}. Your Agent ID is ${p.id}. Join the official group: ${data.rules.whatsappUrl || "Ask the operations desk for the group link."}\nPrivate login pass: ${login}\nOpen My pass for your personal QR. Do not share your private login pass.`;
  return (
    <Panel title={`${p.id} · ${p.name}`}>
      <div className="event-grid">
        <div>
          <p>
            {p.roll} · {p.phone}
          </p>
          <p>
            Score: {p.score} · Active time: {time(p.activeSeconds)}
          </p>
          <p>
            Current Node: {p.currentNode || "Not started"} · WhatsApp:{" "}
            {p.whatsappLinkedAt ? "Completed" : "Pending"}
          </p>
          <p>
            Last activity: {p.lastActivity || "None"} ·{" "}
            {p.disabled ? "Deactivated" : "Account enabled"}
          </p>
          <button
            disabled={busy || p.checkedIn || p.disabled}
            className="primary"
            onClick={() => call("checkin", { checkedIn: true })}
          >
            Check in
          </button>
          <button
            disabled={busy || !p.checkedIn}
            onClick={() => call("checkin", { checkedIn: false })}
          >
            Check out
          </button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              call("adjust", {
                delta: Number(f.get("delta")),
                reason: f.get("reason"),
              });
            }}
          >
            <Field label="Score adjustment (+ or −)">
              <input
                name="delta"
                type="number"
                min={-10000}
                max={10000}
                required
              />
            </Field>
            <Field label="Reason">
              <input name="reason" required maxLength={300} />
            </Field>
            <button disabled={busy}>Apply adjustment</button>
          </form>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              call("override", {
                nodeId: f.get("nodeId"),
                reason: f.get("reason"),
              });
            }}
          >
            <Field label="Restore / override current Node">
              <select name="nodeId">
                {data.nodes.map((n) => (
                  <option key={n.id}>{n.id}</option>
                ))}
              </select>
            </Field>
            <Field label="Override reason">
              <input name="reason" required />
            </Field>
            <button disabled={busy}>Apply Node override</button>
          </form>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              call("participant", {
                name: f.get("name"),
                roll: f.get("roll"),
                phone: f.get("phone"),
                disabled: f.get("disabled") === "on",
              });
            }}
          >
            <Field label="Participant name">
              <input name="name" defaultValue={p.name} required />
            </Field>
            <Field label="Roll number">
              <input name="roll" defaultValue={p.roll} required />
            </Field>
            <Field label="Phone">
              <input name="phone" defaultValue={p.phone} required />
            </Field>
            <label>
              <input
                name="disabled"
                type="checkbox"
                defaultChecked={p.disabled}
              />{" "}
              Deactivate account
            </label>
            <br />
            <button disabled={busy}>Save participant</button>
          </form>
        </div>
        <div>
          <QR
            value={`${origin}/play#peer=${p.socialToken}`}
            label={`${p.id} interaction pass`}
          />
          <details>
            <summary>Private login pass and onboarding</summary>
            <QR value={login} label={`${p.id} private login`} />
            <p>
              <a href={login} target="_blank" rel="noreferrer">
                Open private login link
              </a>
            </p>
            <textarea
              readOnly
              value={onboarding}
              aria-label="WhatsApp onboarding message"
            />
            <a
              className="event-button"
              href={`https://wa.me/${p.phone}?text=${encodeURIComponent(onboarding)}`}
              target="_blank"
              rel="noreferrer"
            >
              Share via WhatsApp
            </a>
            <button
              type="button"
              onClick={async () => {
                soundEffects.playKeystrokeBeep();
                try {
                  const res = await fetch("/api/whatsapp/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      phone: p.phone,
                      text: onboarding,
                      agentId: p.id,
                      name: p.name,
                    }),
                  });
                  const d = await res.json();
                  if (d.delivered) {
                    soundEffects.playSuccessChime();
                    setStatusMsg(`WhatsApp onboarding dispatched automatically to +${p.phone} via gateway.`);
                  } else if (d.shareUrl) {
                    window.open(d.shareUrl, "_blank");
                    setStatusMsg(`Gateway offline. Opened WhatsApp direct link for +${p.phone}.`);
                  }
                } catch {
                  window.open(
                    `https://wa.me/${p.phone}?text=${encodeURIComponent(onboarding)}`,
                    "_blank",
                  );
                }
              }}
            >
              Send via Gateway
            </button>
            <button
              onClick={() => void navigator.clipboard.writeText(onboarding)}
            >
              Copy message
            </button>
            {statusMsg && (
              <div className="event-notice my-2">
                {statusMsg}
              </div>
            )}
          </details>
          <button
            disabled={busy}
            onClick={() => {
              if (
                confirm(
                  "Invalidate both existing QR codes and all login sessions for this Agent?",
                )
              )
                call("rotate");
            }}
          >
            Regenerate QR codes
          </button>
          <button disabled={busy} onClick={() => call("reset_onboarding")}>
            Reset onboarding
          </button>
        </div>
      </div>
      <h3>Progress & submission history</h3>
      {Object.values(p.progress).map((pr) => (
        <details className="event-row" key={pr.nodeId}>
          <summary>
            {pr.nodeId} ·{" "}
            {pr.completedAt
              ? "Completed"
              : pr.startedAt
                ? "Ongoing"
                : "Assigned"}{" "}
            · {time(pr.seconds)} · {pr.points} points
          </summary>
          <pre>{JSON.stringify(pr, null, 2)}</pre>
        </details>
      ))}
      <details className="event-row">
        <summary>Main Node attempts ({p.main.length})</summary>
        <pre>{JSON.stringify(p.main, null, 2)}</pre>
      </details>
      <details className="event-row">
        <summary>Score ledger & interactions</summary>
        <pre>
          {JSON.stringify(
            {
              transactions: data.transactions.filter((t) => t.agentId === p.id),
              handshakes: data.handshakes.filter((h) =>
                h.agents.includes(p.id),
              ),
              trust: data.encounters.filter((h) => h.agents.includes(p.id)),
            },
            null,
            2,
          )}
        </pre>
      </details>
    </Panel>
  );
}
function Registration({ run, busy }: { run: Run; busy: boolean }) {
  const [csv, setCsv] = useState(""),
    [rows, setRows] = useState<CSVRow[] | null>(null),
    [all, setAll] = useState(false),
    [result, setResult] = useState("");
  return (
    <>
      <Panel title="Register an Agent">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = e.currentTarget;
            void run("register", Object.fromEntries(new FormData(f)))
              .then(() => {
                f.reset();
                setResult("Agent registered. Find their QR in Participants.");
              })
              .catch(() => {});
          }}
        >
          <div className="event-grid">
            <Field label="Name">
              <input name="name" required maxLength={80} />
            </Field>
            <Field label="Roll number">
              <input name="roll" required maxLength={80} />
            </Field>
          </div>
          <Field label="Phone with country code">
            <input name="phone" required type="tel" />
          </Field>
          <button disabled={busy}>Register Agent</button>
        </form>
      </Panel>
      <Panel title="CSV registration">
        <p>
          Required columns: <code>name,roll,phone</code>. Quoted fields and
          embedded commas are supported. Existing participants are never
          silently overwritten.
        </p>
        <Field label="Upload CSV">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) {
                if (f.size > 900000) {
                  setResult("CSV is too large (maximum 900 KB).");
                  return;
                }
                setCsv(await f.text());
                setRows(null);
              }
            }}
          />
        </Field>
        <Field label="CSV contents">
          <textarea
            value={csv}
            onChange={(e) => {
              setCsv(e.target.value);
              setRows(null);
            }}
          />
        </Field>
        <button
          disabled={busy || !csv}
          onClick={() =>
            void run("csv_preview", { csv })
              .then((v) => setRows(v as CSVRow[]))
              .catch(() => {})
          }
        >
          Validate & preview
        </button>
        {rows && (
          <>
            <div className="event-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Name</th>
                    <th>Roll</th>
                    <th>Phone</th>
                    <th>Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.row}>
                      <td>{r.row}</td>
                      <td>{r.name}</td>
                      <td>{r.roll}</td>
                      <td>{r.phone}</td>
                      <td>{r.errors.join("; ") || "Ready"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <label>
              <input
                type="checkbox"
                checked={all}
                onChange={(e) => setAll(e.target.checked)}
              />{" "}
              All-or-nothing import
            </label>
            <br />
            <button
              className="primary"
              disabled={busy || !rows.some((r) => !r.errors.length)}
              onClick={() =>
                void run("csv_import", { csv, allOrNothing: all })
                  .then((v) => {
                    setResult(JSON.stringify(v));
                    setRows(null);
                  })
                  .catch(() => {})
              }
            >
              Import validated records
            </button>
          </>
        )}
        {result && <p className="event-notice">{result}</p>}
      </Panel>
    </>
  );
}
function RulesForm({
  rules,
  run,
  busy,
}: {
  rules: Rules;
  run: Run;
  busy: boolean;
}) {
  const [value, setValue] = useState(rules),
    [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!dirty) queueMicrotask(() => setValue(rules));
  }, [rules, dirty]);
  const update = (changes: Partial<Rules>) => {
    setDirty(true);
    setValue({ ...value, ...changes });
  };
  return (
    <Panel title="Event state & scoring rules">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (
            value.phase === "RESULTS_LOCKED" &&
            !confirm(
              "Lock the final event permanently? Export a backup before proceeding.",
            )
          )
            return;
          void run("rules", { rules: value })
            .then(() => setDirty(false))
            .catch(() => {});
        }}
      >
        <div className="event-grid">
          <Field label="Event phase">
            <select
              value={value.phase}
              onChange={(e) =>
                update({ phase: e.target.value as Rules["phase"] })
              }
            >
              {[
                "SETUP",
                "REGISTRATION_OPEN",
                "EVENT_ACTIVE",
                "SUBMISSIONS_OPEN",
                "EVENT_CLOSING",
                "EVENT_CLOSED",
                "RESULTS_LOCKED",
              ].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Deadline (ISO date with timezone)">
            <input
              value={value.deadline}
              onChange={(e) => update({ deadline: e.target.value })}
              required
            />
          </Field>
        </div>
        <Field label="Current WhatsApp group invite">
          <input
            value={value.whatsappUrl}
            onChange={(e) => update({ whatsappUrl: e.target.value })}
            type="url"
          />
        </Field>
        <label>
          <input
            type="checkbox"
            checked={value.leaderboardVisible}
            onChange={(e) => update({ leaderboardVisible: e.target.checked })}
          />{" "}
          Show leaderboard to participants
        </label>
        <p className="event-notice">
          Active time runs while checked in after opening a Node, including when
          a phone is locked. Checkout, an inactive event phase, completion or
          the deadline pauses it. Equal scores share a rank.
        </p>
        <div className="event-grid">
          {(
            [
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
            ] as const
          ).map((k) => (
            <Field key={k} label={k.replace(/([A-Z])/g, " $1")}>
              <input
                type="number"
                value={value[k]}
                onChange={(e) => update({ [k]: Number(e.target.value) })}
              />
            </Field>
          ))}
        </div>
        <button
          className="primary"
          disabled={busy || rules.phase === "RESULTS_LOCKED"}
        >
          Save event controls
        </button>
      </form>
    </Panel>
  );
}
function NodeManager({
  nodes,
  run,
  busy,
}: {
  nodes: Puzzle[];
  run: Run;
  busy: boolean;
}) {
  const [id, setId] = useState(nodes[0]?.id || "");
  const n = nodes.find((n) => n.id === id);
  return (
    <>
      <div className="event-tabs">
        {nodes.map((n) => (
          <button
            aria-pressed={n.id === id}
            onClick={() => setId(n.id)}
            key={n.id}
          >
            {n.id}
            {!n.enabled ? " · disabled" : ""}
          </button>
        ))}
      </div>
      {n && <NodeEditor key={id} initial={n} run={run} busy={busy} />}
    </>
  );
}
function NodeEditor({
  initial,
  run,
  busy,
}: {
  initial: Puzzle;
  run: Run;
  busy: boolean;
}) {
  const [n, setN] = useState(initial),
    [message, setMessage] = useState(""),
    [preview, setPreview] = useState(false);
  const set = (v: Partial<Puzzle>) => setN({ ...n, ...v });
  return (
    <Panel title={`${n.id} · Question editor`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run("node", { id: n.id, node: n })
            .then(() =>
              setMessage(
                "Published changes saved. Historical attempts and completions are preserved.",
              ),
            )
            .catch(() => {});
        }}
      >
        <div className="event-grid">
          {(["title", "category"] as const).map((k) => (
            <Field key={k} label={k}>
              <input
                value={n[k]}
                onChange={(e) => set({ [k]: e.target.value })}
                required
              />
            </Field>
          ))}
        </div>
        {(["description", "instructions", "clue", "notes"] as const).map(
          (k) => (
            <Field
              key={k}
              label={k === "clue" ? "Intel revealed after solving" : k}
            >
              <textarea
                value={n[k]}
                onChange={(e) => set({ [k]: e.target.value })}
              />
            </Field>
          ),
        )}
        <Field label="Input type">
          <select
            value={n.input}
            onChange={(e) => set({ input: e.target.value as Puzzle["input"] })}
          >
            {["text", "pin", "select", "choice"].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        {(["options", "answers", "patterns"] as const).map((k) => (
          <Field key={k} label={`${k} — one per line`}>
            <textarea
              value={n[k].join("\n")}
              onChange={(e) => set({ [k]: e.target.value.split("\n") })}
            />
          </Field>
        ))}
        <small>
          Patterns match the whole answer. Use literals, character classes and
          at most one repetition; enter alternatives as separate lines.
        </small>
        <div className="event-grid">
          {(["points", "penalty", "minSeconds", "attemptLimit"] as const).map(
            (k) => (
              <Field
                key={k}
                label={
                  k === "attemptLimit" ? "Attempt limit (0 = unlimited)" : k
                }
              >
                <input
                  type="number"
                  min={0}
                  value={n[k]}
                  onChange={(e) => set({ [k]: Number(e.target.value) })}
                />
              </Field>
            ),
          )}
        </div>
        {(["enabled", "published", "exact"] as const).map((k) => (
          <label key={k} style={{ marginRight: 18 }}>
            <input
              type="checkbox"
              checked={n[k]}
              onChange={(e) => set({ [k]: e.target.checked })}
            />{" "}
            {k === "exact" ? "Case-sensitive answers" : k}
          </label>
        ))}
        <h3>Supporting assets</h3>
        {n.assets.map((a, i) => (
          <div className="event-row" key={i}>
            <Field label="Asset name">
              <input
                value={a.name}
                onChange={(e) =>
                  set({
                    assets: n.assets.map((a, j) =>
                      j === i ? { ...a, name: e.target.value } : a,
                    ),
                  })
                }
              />
            </Field>
            <Field label="URL">
              <input
                value={a.url}
                onChange={(e) =>
                  set({
                    assets: n.assets.map((a, j) =>
                      j === i ? { ...a, url: e.target.value } : a,
                    ),
                  })
                }
              />
            </Field>
            <select
              aria-label="Asset type"
              value={a.kind}
              onChange={(e) =>
                set({
                  assets: n.assets.map((a, j) =>
                    j === i
                      ? { ...a, kind: e.target.value as Asset["kind"] }
                      : a,
                  ),
                })
              }
            >
              {["audio", "image", "video", "document", "link"].map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() =>
                set({ assets: n.assets.filter((_, j) => j !== i) })
              }
            >
              Remove asset
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            set({ assets: [...n.assets, { name: "", url: "", kind: "link" }] })
          }
        >
          Add external asset
        </button>
        <Field label="Upload asset (up to 20 MB)">
          <input
            type="file"
            accept="audio/mpeg,audio/wav,audio/ogg,image/png,image/jpeg,image/webp,application/pdf,video/mp4"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const form = new FormData();
              form.set("file", file);
              try {
                const res = await fetch("/api/event/assets", {
                  method: "POST",
                  headers: adminHeaders(),
                  body: form,
                });
                const asset = await res.json();
                if (!res.ok) throw new Error(asset.error);
                setN((current) => ({
                  ...current,
                  assets: [...current.assets, asset],
                }));
                setMessage("Uploaded. Save the Node to attach the asset.");
              } catch (e) {
                setMessage((e as Error).message);
              }
            }}
          />
        </Field>
        <button type="button" onClick={() => setPreview(!preview)}>
          Preview Node
        </button>
        <button className="primary" disabled={busy}>
          Save Node
        </button>
        {message && <p role="status">{message}</p>}
      </form>
      {preview && (
        <div className="event-notice">
          <span>{n.category}</span>
          <h3>{n.title}</h3>
          <p>{n.description}</p>
          <p>{n.instructions}</p>
          {["select", "choice"].includes(n.input) ? (
            <select>
              {n.options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ) : (
            <input
              placeholder={n.input === "pin" ? "Four-digit PIN" : "Your answer"}
            />
          )}
          <p>{n.assets.map((a) => a.name).join(" · ")}</p>
        </div>
      )}
    </Panel>
  );
}
