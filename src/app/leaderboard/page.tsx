"use client";
import { useEffect, useState } from "react";
import { Frame, Panel } from "@/components/event/shared";
import type { Standing } from "@/lib/event/types";
export default function Page() {
  const [rows, setRows] = useState<Standing[] | null>(null),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    async function refresh() {
      try {
        const res = await fetch("/api/event?view=public", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error();
        const d = await res.json();
        if (live) {
          setRows(d.leaderboard);
          setLoaded(true);
          setError("");
        }
      } catch {
        if (live) {
          setRows(null);
          setError("Unable to refresh standings. Reconnecting.");
        }
      }
    }
    void refresh();
    const id = setInterval(refresh, 3000);
    return () => {
      live = false;
      clearInterval(id);
    };
  }, []);
  return (
    <Frame title="The network standings.">
      <Panel title="Official ranking">
        {error ||
          (!loaded ? (
            "Loading…"
          ) : rows === null ? (
            "The leaderboard is currently hidden by the operations desk."
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Agent</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
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
          ))}
      </Panel>
    </Frame>
  );
}
