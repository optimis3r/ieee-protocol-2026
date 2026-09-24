"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import type { PublicPuzzle, Progress } from "@/lib/event/types";
import { api, Field } from "@/components/event/shared";
import { soundEffects } from "@/lib/audio";
import { BlackoutAudioStation } from "./BlackoutAudioStation";
import { PushpinMapStation } from "./PushpinMapStation";
import { UVMarkerStation } from "./UVMarkerStation";
import { RedFilterStation } from "./RedFilterStation";
import { RedactedArchiveStation } from "./RedactedArchiveStation";
import { DeadDropStation } from "./DeadDropStation";
import { RogueIntelStation } from "./RogueIntelStation";

interface StationDispatcherProps {
  node: PublicPuzzle;
  progress: Progress;
  agentId: string;
  allowed: boolean;
  busy: boolean;
  run: (action: string, body: Record<string, unknown>) => Promise<void>;
}

export function StationDispatcher({
  node,
  progress,
  agentId,
  allowed,
  busy,
  run,
}: StationDispatcherProps) {
  const key = `draft:${agentId}:${node.id}`;
  const [answer, setAnswer] = useState(progress.draft || "");
  const [saved, setSaved] = useState(true);
  const pending = useRef<string | null>(null);

  // Load local draft if available
  useEffect(() => {
    const local = localStorage.getItem(key);
    if (local !== null) {
      queueMicrotask(() => setAnswer(local));
    }
  }, [key]);

  // Debounced server sync of draft
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

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
    localStorage.setItem(key, value);
    pending.current = null;
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !answer.trim()) return;

    pending.current ||=
      localStorage.getItem(`${key}:request:${answer}`) || crypto.randomUUID();
    localStorage.setItem(`${key}:request:${answer}`, pending.current);

    try {
      await run("answer", {
        nodeId: node.id,
        answer,
        requestId: pending.current,
      });

      // Sound & celebration trigger
      soundEffects.playSuccessChime();
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ["#2d9f5d", "#c28b28", "#f4f1ea", "#c6a0f6"],
        });
      } catch {}
    } catch {
      soundEffects.playErrorBuzz();
    }
  };

  const commonProps = {
    node,
    progress,
    answer,
    onAnswerChange: handleAnswerChange,
    onSubmit: handleSubmit,
    disabled,
    busy,
    saved,
  };

  // Dispatch to the matching interactive station simulation
  const norm = node.id.toUpperCase();
  if (norm.startsWith("NODE-01") || norm.startsWith("NODE-1-") || norm === "NODE-1") {
    return <BlackoutAudioStation {...commonProps} />;
  }
  if (norm.startsWith("NODE-02") || norm.startsWith("NODE-2-") || norm === "NODE-2") {
    return <PushpinMapStation {...commonProps} />;
  }
  if (norm.startsWith("NODE-03") || norm.startsWith("NODE-3-") || norm === "NODE-3") {
    return <UVMarkerStation {...commonProps} />;
  }
  if (norm.startsWith("NODE-04") || norm.startsWith("NODE-4-") || norm === "NODE-4") {
    return <RedFilterStation {...commonProps} />;
  }
  if (norm.startsWith("NODE-05") || norm.startsWith("NODE-5-") || norm === "NODE-5") {
    return <RedactedArchiveStation {...commonProps} />;
  }
  if (norm.startsWith("NODE-06") || norm.startsWith("NODE-6-") || norm === "NODE-6") {
    return <DeadDropStation {...commonProps} />;
  }
  if (norm.startsWith("NODE-07") || norm.startsWith("NODE-7-") || norm === "NODE-7") {
    return <RogueIntelStation {...commonProps} />;
  }

  // Fallback for custom or admin-created nodes
  return (
    <>
      <div>
        {node.assets.map((a) => (
          <div key={a.url} className="my-2">
            {a.kind === "audio" ? (
              <audio controls src={a.url} className="w-full" />
            ) : a.kind === "video" ? (
              <video controls src={a.url} className="w-full" />
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

      <form onSubmit={handleSubmit}>
        <Field label={node.input === "pin" ? "Four-digit PIN" : "Your answer"}>
          {["select", "choice"].includes(node.input) ? (
            <select
              value={answer}
              disabled={disabled}
              onChange={(e) => handleAnswerChange(e.target.value)}
              required
            >
              <option value="">Select an answer</option>
              {node.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={answer}
              disabled={disabled}
              onChange={(e) => handleAnswerChange(e.target.value)}
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
