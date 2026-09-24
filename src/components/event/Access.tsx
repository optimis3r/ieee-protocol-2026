"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Frame, Panel, Field, api, credential } from "./shared";
import { QRScannerModal } from "@/components/scanner/QRScannerModal";
export function Access({ register = false }: { register?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [scan, setScan] = useState(false),
    [qr, setQr] = useState("");
  const login = useCallback(
    async (raw: string) => {
      setBusy(true);
      try {
        await api("login", { token: credential(raw, "login") });
        router.push("/play");
      } catch (e) {
        setError((e as Error).message);
        setBusy(false);
      }
    },
    [router],
  );
  useEffect(() => {
    const value = new URLSearchParams(window.location.hash.slice(1)).get(
      "login",
    );
    if (value) {
      history.replaceState(null, "", "/login");
      queueMicrotask(() => void login(value));
    }
  }, [login]);
  return (
    <Frame
      title={
        register ? "Join the investigation." : "Access your operative terminal."
      }
      subtitle={
        register
          ? "Receive your private login pass, then check in at the operations desk."
          : "Scan your private login QR. The operations desk can replace a lost pass."
      }
    >
      <div style={{ maxWidth: 580 }}>
        <Panel title={register ? "Enlistment docket" : "Personal clearance"}>
          {error && (
            <p role="alert" className="event-notice event-error">
              {error}
            </p>
          )}
          {register ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                const values = Object.fromEntries(
                  new FormData(e.currentTarget),
                );
                try {
                  await api("self_register", values);
                  router.push("/play");
                } catch (e) {
                  setError((e as Error).message);
                  setBusy(false);
                }
              }}
            >
              <Field label="Name">
                <input name="name" required maxLength={80} />
              </Field>
              <Field label="Roll number">
                <input name="roll" required maxLength={80} />
              </Field>
              <Field label="Phone with country code">
                <input
                  name="phone"
                  type="tel"
                  required
                  pattern="[0-9+ ()-]{10,20}"
                />
              </Field>
              <button className="primary" disabled={busy}>
                Register
              </button>
            </form>
          ) : (
            <>
              <button
                className="primary"
                onClick={() => setScan(true)}
                disabled={busy}
              >
                Scan private login QR
              </button>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void login(qr);
                }}
              >
                <Field label="Or paste your private login link">
                  <input
                    value={qr}
                    onChange={(e) => setQr(e.target.value)}
                    required
                    autoComplete="off"
                  />
                </Field>
                <button disabled={busy}>Access terminal</button>
              </form>
            </>
          )}
        </Panel>
      </div>
      <QRScannerModal
        isOpen={scan}
        onClose={() => setScan(false)}
        onScanSuccess={(r) => {
          setScan(false);
          void login(r.raw);
        }}
        title="PRIVATE LOGIN QR"
        subtitle="Scan the private pass supplied by the operations desk"
      />
    </Frame>
  );
}
