"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Frame, Panel, Field } from "@/components/event/shared";
export default function Page() {
  const router = useRouter();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <Frame
      admin
      title="Operator clearance."
      subtitle="Sign in to manage the event."
    >
      <div style={{ maxWidth: 540 }}>
        <Panel title="Operations desk access">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              const f = new FormData(e.currentTarget);
              try {
                const res = await fetch("/api/admin/auth", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(Object.fromEntries(f)),
                });
                const d = await res.json();
                if (!res.ok) throw new Error(d.error);
                sessionStorage.setItem("ieee_admin_token", d.token);
                sessionStorage.setItem("ieee_admin_agent", d.agentName);
                router.push("/admin");
              } catch (e) {
                setError((e as Error).message);
                setBusy(false);
              }
            }}
          >
            <Field label="Operator name">
              <input name="agentName" required autoComplete="username" />
            </Field>
            <Field label="Password">
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </Field>
            {error && (
              <p className="event-notice event-error" role="alert">
                {error}
              </p>
            )}
            <button className="primary" disabled={busy}>
              Open operations desk
            </button>
          </form>
        </Panel>
      </div>
    </Frame>
  );
}
