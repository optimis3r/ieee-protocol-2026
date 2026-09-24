"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Frame,
  Panel,
  Field,
  QR,
  useEvent,
  api,
  time,
  credential,
} from "./shared";
import { QRScannerModal } from "@/components/scanner/QRScannerModal";
import { StationDispatcher } from "@/components/stations/StationDispatcher";
import { soundEffects } from "@/lib/audio";
import confetti from "canvas-confetti";
import type { PublicPuzzle, Progress } from "@/lib/event/types";

export function ParticipantPortal() {
  const router = useRouter();
  const { data, error, offline, busy, act } = useEvent();
  const [tab, setTab] = useState("Nodes"),
    [message, setMessage] = useState(""),
    [peer, setPeer] = useState(""),
    [scan, setScan] = useState(false),
    [origin, setOrigin] = useState(""),
    [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    queueMicrotask(() => setOrigin(location.origin));
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  async function run(action: string, payload: Record<string, unknown> = {}) {
    try {
      const result = await act(action, payload);
      setMessage(result?.message || "Saved.");
    } catch {}
  }
  if (!data?.participant)
    return (
      <Frame title="Opening your terminal…">
        {offline && (
          <p className="event-notice">
            Unable to connect. Reconnecting automatically.
          </p>
        )}
      </Frame>
    );
  const p = data.participant,
    current = data.nodes.find((n) => n.id === p.currentNode),
    pr = current && p.progress[current.id];
  const elapsed = p.activeSince
    ? Math.max(
        0,
        Math.min(now, Date.parse(data.rules.deadline)) -
          Date.parse(data.serverTime),
      ) / 1000
    : 0;
  const remaining = Math.max(0, Date.parse(data.rules.deadline) - now) / 1000;
  return (
    <Frame
      title={`Agent ${p.id.replace("AGT-", "")}. ${p.name}`}
      subtitle="Follow the evidence. Exchange verified intel. Make your deduction."
    >
      <div className="event-stats">
        <div>
          <strong>{p.score}</strong>POINTS
        </div>
        <div>
          <strong>
            {Object.values(p.progress).filter((pr) => pr.completedAt).length}
          </strong>
          NODES SOLVED
        </div>
        <div>
          <strong>{time(p.activeSeconds + elapsed)}</strong>ACTIVE TIME
        </div>
        <div>
          <strong>{time(remaining)}</strong>TO DEADLINE
        </div>
        <div>
          <strong>{p.checkedIn ? "IN" : "OUT"}</strong>DESK STATUS
        </div>
      </div>
      {(error || message || offline) && (
        <div
          aria-live="polite"
          className={`event-notice ${error ? "event-error" : ""}`}
        >
          {offline
            ? "Connection lost. Drafts remain on this device. Reconnecting automatically; submissions need a connection."
            : error || message}
        </div>
      )}
      {!data.canPlay && (
        <div className="event-notice">
          {!p.checkedIn
            ? "Present your interaction QR at the desk to check in."
            : p.finishedAt
              ? "Master Deduction complete. Your results are saved."
              : `Event: ${data.rules.phase.replaceAll("_", " ")}. Gameplay is currently closed.`}
        </div>
      )}
      {data.broadcasts
        .filter((b) => !p.readBroadcasts.includes(b.id))
        .map((b) => (
          <div className="event-notice" key={b.id}>
            <strong>{b.title}</strong>
            <p>{b.body}</p>
            <small>
              {new Date(b.at).toLocaleString()} · {b.actor}
            </small>
            <button onClick={() => run("read_broadcast", { id: b.id })}>
              Mark read
            </button>
          </div>
        ))}
      <nav className="event-tabs">
        {[
          "Nodes",
          "Main Node",
          "Network",
          "My pass",
          "Score history",
          "Broadcasts",
        ].map((t) => (
          <button
            key={t}
            aria-pressed={tab === t}
            onClick={() => {
              soundEffects.playKeystrokeBeep();
              setTab(t);
            }}
          >
            {t}
          </button>
        ))}
        <button
          onClick={async () => {
            await api("logout");
            router.push("/login");
          }}
        >
          Sign out
        </button>
      </nav>
      {tab === "Nodes" && (
        <>
          <div className="event-grid">
            <Panel title="Current Node">
              {current && pr ? (
                <>
                  <span className="editorial-stamp">
                    {current.id} · {current.category}
                  </span>
                  <h3>{current.title}</h3>
                  <p>{current.description}</p>
                  <p className="event-row">{current.instructions}</p>
                  <p>
                    <small>
                      {pr.completedAt
                        ? "Completed"
                        : `Switch available in ${time(Math.max(0, current.minSeconds - pr.seconds - elapsed))}`}
                    </small>
                  </p>
                  <StationDispatcher
                    key={p.id + current.id}
                    node={current}
                    progress={pr}
                    agentId={p.id}
                    allowed={data.canPlay && !offline}
                    busy={busy}
                    run={run}
                  />
                  {pr.completedAt && (
                    <p className="event-notice">
                      Recovered intel: {pr.clue || "Node completed."}
                    </p>
                  )}
                </>
              ) : (
                <p>
                  {p.currentNode
                    ? "The desk disabled your current Node. Choose an available Node below."
                    : "Open an assigned Node to start your active playing timer."}
                </p>
              )}
            </Panel>
            <Panel title="Ongoing & assigned">
              {Object.values(p.progress)
                .filter((v) => !v.completedAt)
                .map((v) => (
                  <div key={v.nodeId} className="event-row">
                    <strong>{v.nodeId}</strong>
                    <p>
                      {data.nodes.find((n) => n.id === v.nodeId)?.title ||
                        "Currently unavailable"}
                    </p>
                    <small>
                      {v.startedAt
                        ? `In progress · ${v.attempts.length} attempts`
                        : "Assigned · not started"}
                    </small>
                    <br />
                    <button
                      disabled={
                        !data.canPlay ||
                        busy ||
                        offline ||
                        !data.nodes.some((n) => n.id === v.nodeId)
                      }
                      onClick={() => run("start", { nodeId: v.nodeId })}
                    >
                      Open Node
                    </button>
                  </div>
                ))}
            </Panel>
          </div>
          <div className="event-grid">
            <Panel title="Available Nodes">
              {data.nodes
                .filter((n) => !p.progress[n.id])
                .map((n) => (
                  <div className="event-row" key={n.id}>
                    <strong>
                      {n.id} · {n.title}
                    </strong>
                    <p>
                      {n.category} · {n.points} points
                    </p>
                    <button
                      disabled={
                        !data.canPlay ||
                        busy ||
                        offline ||
                        !!(
                          current &&
                          pr &&
                          !pr.completedAt &&
                          (!current.attemptLimit ||
                            pr.attempts.length < current.attemptLimit) &&
                          pr.seconds + elapsed < current.minSeconds
                        )
                      }
                      onClick={() => run("start", { nodeId: n.id })}
                    >
                      Start Node
                    </button>
                  </div>
                ))}
            </Panel>
            <Panel title="Completed Nodes">
              {Object.values(p.progress)
                .filter((v) => v.completedAt)
                .map((v) => (
                  <div key={v.nodeId} className="event-row">
                    <strong>
                      {v.nodeId} · +{v.points}
                    </strong>
                    <p>{v.clue}</p>
                    <small>{new Date(v.completedAt!).toLocaleString()}</small>
                  </div>
                ))}
            </Panel>
          </div>
        </>
      )}
      {tab === "Main Node" && (
        <Panel title="Central synthesis terminal">
          <p>
            WHO · WHERE · WHEN · WHAT. {p.main.length}/{data.rules.mainAttempts}{" "}
            attempts used.
          </p>
          <p className="event-notice">
            A partial deduction earns up to {data.rules.partialPoints} points; a
            full deduction earns up to {data.rules.fullPoints} total. Fewer than
            two correct fields: −{data.rules.wrongPenalty}. Speed bonus is
            awarded once on a complete deduction.
          </p>
          <MainForm
            agentId={p.id}
            disabled={
              !data.canPlay ||
              busy ||
              offline ||
              !["SUBMISSIONS_OPEN", "EVENT_CLOSING"].includes(
                data.rules.phase,
              ) ||
              p.main.length >= data.rules.mainAttempts
            }
            run={run}
          />
          {p.main.map((a) => (
            <div className="event-row" key={a.id}>
              {a.correct.filter(Boolean).length}/4 correct · {a.points} points ·{" "}
              {new Date(a.at).toLocaleString()}
              <p>
                {["WHO", "WHERE", "WHEN", "WHAT"]
                  .map(
                    (k, i) => `${k}: ${a.correct[i] ? "correct" : "incorrect"}`,
                  )
                  .join(" · ")}
              </p>
            </div>
          ))}
        </Panel>
      )}
      {tab === "Network" && (
        <>
          <Panel title="Data handshake">
            <p>
              Both Agents must solve a Node before interacting. Each unique
              pairing awards up to {data.rules.handshakePoints} points each,
              capped at {data.rules.handshakeCap}.
            </p>
            <button onClick={() => setScan(true)}>Scan interaction QR</button>
            <Field label="Interaction QR or token">
              <input value={peer} onChange={(e) => setPeer(e.target.value)} />
            </Field>
            <button
              disabled={!data.canPlay || busy || offline}
              onClick={async () => {
                soundEffects.playKeystrokeBeep();
                try {
                  await run("handshake", { peer: credential(peer, "peer") });
                  soundEffects.playSuccessChime();
                  try {
                    confetti({
                      particleCount: 50,
                      spread: 60,
                      origin: { y: 0.6 },
                      colors: ["#2fa596", "#c28b28", "#f4f1ea"],
                    });
                  } catch {}
                } catch {
                  soundEffects.playErrorBuzz();
                }
              }}
            >
              Record handshake
            </button>
            <button
              disabled={!data.canPlay || busy || offline}
              onClick={async () => {
                soundEffects.playKeystrokeBeep();
                try {
                  await run("trust_invite", { peer: credential(peer, "peer") });
                  soundEffects.playSuccessChime();
                } catch {
                  soundEffects.playErrorBuzz();
                }
              }}
            >
              Start trust encounter
            </button>
            <h3>{data.handshakes.length} unique Agents met</h3>
            {data.handshakes.map((h) => (
              <p key={h.id}>
                {h.agents.find((id) => id !== p.id)} ·{" "}
                {new Date(h.at).toLocaleString()}
              </p>
            ))}
          </Panel>
          <Panel title="Two-Man Trust">
            <p>
              Both cooperate: +{data.rules.trustCooperate} each. One defects: +
              {data.rules.trustDefect} to the defector, {data.rules.trustVictim}{" "}
              to the cooperator. Both defect: 0. One encounter per pair; choices
              are final.
            </p>
            {data.encounters.map((e) => (
              <div className="event-row" key={e.id}>
                <strong>Partner: {e.agents.find((id) => id !== p.id)}</strong>
                {e.resolvedAt ? (
                  <p>
                    {Object.entries(e.choices)
                      .map(([id, choice]) => `${id}: ${choice}`)
                      .join(" · ")}
                  </p>
                ) : e.choices[p.id] ? (
                  <p>Choice committed. Waiting for partner.</p>
                ) : (
                  <div>
                    {["cooperate", "defect"].map((choice) => (
                      <button
                        key={choice}
                        disabled={!data.canPlay || busy || offline}
                        onClick={async () => {
                          soundEffects.playKeystrokeBeep();
                          try {
                            await run("trust_choice", { id: e.id, choice });
                            soundEffects.playSuccessChime();
                          } catch {
                            soundEffects.playErrorBuzz();
                          }
                        }}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Panel>
        </>
      )}
      {tab === "My pass" && (
        <div className="event-grid">
          <Panel title="Interaction & check-in pass">
            <p>
              Share this QR for handshakes and present it at the operations
              desk.
            </p>
            <QR
              value={`${origin}/play#peer=${p.socialToken}`}
              label={`${p.id} interaction pass`}
            />
            <p>
              {p.id} · {p.name}
            </p>
          </Panel>
          <Panel title="Private login pass">
            <p>Keep this QR private. It grants access to your account.</p>
            <details>
              <summary>Reveal private login QR</summary>
              <QR
                value={`${origin}/login#login=${p.token}`}
                label={`${p.id} private login`}
              />
            </details>
            <h3>WhatsApp onboarding</h3>
            {p.whatsappLinkedAt ? (
              <p>
                Completed on {new Date(p.whatsappLinkedAt).toLocaleDateString()}
                .
              </p>
            ) : data.rules.whatsappUrl ? (
              <>
                <a
                  className="event-button"
                  href={data.rules.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Join official group
                </a>
                <button onClick={() => run("onboard")}>I have joined</button>
              </>
            ) : (
              <p>The operations desk will provide the group link.</p>
            )}
          </Panel>
        </div>
      )}
      {tab === "Score history" && (
        <Panel title="Score ledger">
          <div className="event-stats">
            {Object.entries(
              data.transactions.reduce<Record<string, number>>(
                (s, t) => ({ ...s, [t.event]: (s[t.event] || 0) + t.points }),
                {},
              ),
            ).map(([kind, value]) => (
              <div key={kind}>
                <strong>{value}</strong>
                {kind.replaceAll("_", " ")}
              </div>
            ))}
          </div>
          {data.transactions
            .slice()
            .reverse()
            .map((t) => (
              <div className="event-row" key={t.id}>
                <strong>
                  {t.points > 0 ? "+" : ""}
                  {t.points} · {t.event}
                </strong>
                <p>{t.source}</p>
                <small>{new Date(t.at).toLocaleString()}</small>
              </div>
            ))}
        </Panel>
      )}
      {tab === "Broadcasts" && (
        <Panel title="Operations dispatches">
          {data.broadcasts
            .slice()
            .reverse()
            .map((b) => (
              <div className="event-row" key={b.id}>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
                <small>
                  {new Date(b.at).toLocaleString()} · {b.actor}
                </small>
              </div>
            ))}
        </Panel>
      )}
      <QRScannerModal
        isOpen={scan}
        onClose={() => setScan(false)}
        onScanSuccess={(r) => {
          setPeer(r.raw);
          setScan(false);
        }}
        title="INTERACTION QR"
        subtitle="Scan another Agent’s public interaction pass"
      />
    </Frame>
  );
}
function NodeAnswer({
  node,
  progress,
  agentId,
  allowed,
  busy,
  run,
}: {
  node: PublicPuzzle;
  progress: Progress;
  agentId: string;
  allowed: boolean;
  busy: boolean;
  run: (a: string, b: Record<string, unknown>) => Promise<void>;
}) {
  const key = `draft:${agentId}:${node.id}`,
    [answer, setAnswer] = useState(progress.draft),
    [saved, setSaved] = useState(true);
  const pending = useRef<string | null>(null);
  useEffect(() => {
    const local = localStorage.getItem(key);
    if (local !== null) queueMicrotask(() => setAnswer(local));
  }, [key]);
  useEffect(() => {
    if (answer === progress.draft || !allowed) return;
    const id = setTimeout(() => {
      api("draft", { nodeId: node.id, answer })
        .then(() => setSaved(true))
        .catch(() => setSaved(false));
    }, 1000);
    return () => clearTimeout(id);
  }, [answer, progress.draft, allowed, node.id]);
  const disabled =
    !allowed ||
    busy ||
    !!progress.completedAt ||
    !!(node.attemptLimit && progress.attempts.length >= node.attemptLimit);
  function change(value: string) {
    setAnswer(value);
    localStorage.setItem(key, value);
    pending.current = null;
    setSaved(false);
  }
  return (
    <>
      <div>
        {node.assets.map((a) => (
          <div key={a.url}>
            {a.kind === "audio" ? (
              <audio controls src={a.url} />
            ) : a.kind === "video" ? (
              <video controls src={a.url} />
            ) : a.kind === "image" ? (
              <Image
                unoptimized
                width={640}
                height={400}
                src={a.url}
                alt={a.name}
                style={{ maxWidth: "100%", height: "auto" }}
              />
            ) : (
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="event-button"
              >
                {a.name}
              </a>
            )}
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          pending.current ||=
            localStorage.getItem(key + ":request:" + answer) ||
            crypto.randomUUID();
          localStorage.setItem(key + ":request:" + answer, pending.current);
          void run("answer", {
            nodeId: node.id,
            answer,
            requestId: pending.current,
          });
        }}
      >
        <Field label={node.input === "pin" ? "Four-digit PIN" : "Your answer"}>
          {["select", "choice"].includes(node.input) ? (
            <select
              value={answer}
              disabled={disabled}
              onChange={(e) => change(e.target.value)}
              required
            >
              <option value="">Select an answer</option>
              {node.options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ) : (
            <input
              value={answer}
              disabled={disabled}
              onChange={(e) => change(e.target.value)}
              required
              maxLength={node.input === "pin" ? 4 : 160}
              inputMode={node.input === "pin" ? "numeric" : "text"}
            />
          )}
        </Field>
        <button className="primary" disabled={disabled}>
          Submit answer
        </button>
        <small>
          {saved ? "Draft saved" : "Draft saved on this device · sync pending"}
          {node.attemptLimit
            ? ` · ${progress.attempts.length}/${node.attemptLimit} attempts`
            : " · Unlimited attempts"}
        </small>
      </form>
    </>
  );
}
function MainForm({
  agentId,
  disabled,
  run,
}: {
  agentId: string;
  disabled: boolean;
  run: (a: string, b: Record<string, unknown>) => Promise<void>;
}) {
  const [answers, setAnswers] = useState(["", "", "", ""]),
    pending = useRef<string | null>(null),
    key = `main-draft:${agentId}`;
  useEffect(() => {
    try {
      const a = JSON.parse(localStorage.getItem(key) || "null");
      if (Array.isArray(a) && a.length === 4)
        queueMicrotask(() => setAnswers(a));
    } catch {}
  }, [key]);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        pending.current ||=
          localStorage.getItem(key + ":request:" + JSON.stringify(answers)) ||
          crypto.randomUUID();
        localStorage.setItem(
          key + ":request:" + JSON.stringify(answers),
          pending.current,
        );
        try {
          await run("main", { answers, requestId: pending.current });
          soundEffects.playMasterDeductionFanfare();
          try {
            confetti({
              particleCount: 120,
              spread: 100,
              origin: { y: 0.5 },
              colors: ["#c93b2b", "#c28b28", "#2d9f5d", "#f4f1ea", "#8aadf4"],
            });
            setTimeout(() => {
              confetti({
                particleCount: 80,
                spread: 120,
                origin: { y: 0.6 },
                colors: ["#c28b28", "#2d9f5d", "#f4f1ea"],
              });
            }, 250);
          } catch {}
        } catch {
          soundEffects.playErrorBuzz();
        }
      }}
    >
      <div className="event-grid">
        {["WHO", "WHERE", "WHEN", "WHAT"].map((label, i) => (
          <Field key={label} label={label}>
            <input
              value={answers[i]}
              required
              maxLength={160}
              onChange={(e) => {
                const next = [...answers];
                next[i] = e.target.value;
                setAnswers(next);
                pending.current = null;
                localStorage.setItem(key, JSON.stringify(next));
              }}
            />
          </Field>
        ))}
      </div>
      <button className="primary" disabled={disabled}>
        Submit deduction
      </button>
    </form>
  );
}
