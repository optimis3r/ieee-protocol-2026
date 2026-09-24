"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import type { Snapshot } from "@/lib/event/types";

export function adminHeaders() {
  return { "x-admin-token": sessionStorage.getItem("ieee_admin_token") || "" };
}
export async function api(
  action: string,
  payload: Record<string, unknown> = {},
  admin = false,
) {
  const res = await fetch("/api/event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(admin ? adminHeaders() : {}),
    },
    body: JSON.stringify({
      action,
      requestId: crypto.randomUUID(),
      ...payload,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
export function useEvent(admin = false) {
  const router = useRouter();
  const [data, setData] = useState<Snapshot | null>(null),
    [error, setError] = useState(""),
    [offline, setOffline] = useState(false),
    [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/event", {
        cache: "no-store",
        headers: admin ? adminHeaders() : {},
      });
      if (res.status === 401) {
        router.replace(admin ? "/admin/login" : "/login");
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, [admin, router]);
  useEffect(() => {
    queueMicrotask(() => void refresh());
    const id = setInterval(refresh, 3000);
    window.addEventListener("online", refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener("online", refresh);
    };
  }, [refresh]);
  const act = async (action: string, payload: Record<string, unknown> = {}) => {
    setBusy(true);
    setError("");
    try {
      const result = await api(action, payload, admin);
      setData(result.snapshot);
      return result.result;
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setBusy(false);
    }
  };
  return { data, error, setError, offline, busy, act, refresh };
}
export function Frame({
  title,
  subtitle,
  children,
  admin = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  admin?: boolean;
}) {
  return (
    <div className="event-shell">
      <header className="event-masthead">
        <Link href="/">
          NIT WARANGAL IEEE <span>• THE PROTOCOL 2026</span>
        </Link>
        <nav>
          <Link href="/play">Agent portal</Link>
          <Link href="/leaderboard">Standings</Link>
          <Link href={admin ? "/admin" : "/admin/login"}>Operations desk</Link>
        </nav>
      </header>
      <main>
        <div className="event-heading">
          <span className="editorial-stamp">
            {admin ? "OPERATIONS DESK" : "FIELD OPERATIONS"}
          </span>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {children}
      </main>
      <footer>
        26 SEPTEMBER 2026 · 5–8 PM IST · E&ICT, C301
        <br />
        Winner announcement: 27 September, 6 PM · NAB
      </footer>
    </div>
  );
}
export function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="event-panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="event-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function QR({ value, label }: { value: string; label: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let live = true;
    QRCode.toDataURL(value, { width: 240, margin: 2 }).then((v) => {
      if (live) setSrc(v);
    });
    return () => {
      live = false;
    };
  }, [value]);
  return (
    <div className="event-qr">
      {src && (
        <>
          <Image unoptimized src={src} width={180} height={180} alt={label} />
          <a download={`${label.replace(/\s/g, "-")}.png`} href={src}>
            Download QR
          </a>
        </>
      )}
      <p>{label}</p>
    </div>
  );
}
export function time(seconds: number) {
  return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
}
export function credential(raw: string, key: "login" | "peer") {
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://network.ieee/${raw.replace(/^\/+/, "")}`);
    const hash = url.hash.replace(/^#/, "");
    const hashParams = new URLSearchParams(hash);
    return (
      hashParams.get(key) ||
      url.searchParams.get(key) ||
      (key === "login"
        ? url.searchParams.get("token") || hashParams.get("token")
        : null) ||
      raw.trim()
    );
  } catch {
    return raw.trim();
  }
}
