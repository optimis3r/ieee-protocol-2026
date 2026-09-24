import { NextRequest, NextResponse } from "next/server";
import { transaction, backup } from "@/lib/event/persistence";
import {
  adminAction,
  authenticate,
  EventError,
  participantAction,
  register,
  snapshot,
  standings,
  text,
} from "@/lib/event/engine";
import { previewCSV, csvCell } from "@/lib/event/csv";
import {
  checkRateLimit,
  getClientIp,
  verifyAdminRequest,
} from "@/lib/admin-auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
function failure(e: unknown) {
  return NextResponse.json(
    { error: e instanceof Error ? e.message : "Request failed" },
    { status: e instanceof EventError ? e.status : 400, headers },
  );
}
export async function GET(req: NextRequest) {
  try {
    const admin = verifyAdminRequest(req),
      view = req.nextUrl.searchParams.get("view");
    return await transaction((d) => {
      if (view === "public")
        return NextResponse.json(
          {
            phase: d.rules.phase,
            deadline: d.rules.deadline,
            leaderboard: d.rules.leaderboardVisible
              ? d.lockedLeaderboard || standings(d)
              : null,
          },
          { headers },
        );
      if (view === "export") {
        if (!admin) throw new EventError("Admin authorization required", 401);
        backup(d);
        if (req.nextUrl.searchParams.get("format") === "csv") {
          const csv = [
            ["rank", "agent_id", "name", "score"].map(csvCell).join(","),
            ...standings(d).map((p) =>
              [p.rank, p.id, p.name, p.score].map(csvCell).join(","),
            ),
          ].join("\r\n");
          return new NextResponse(csv, {
            headers: {
              ...headers,
              "Content-Type": "text/csv",
              "Content-Disposition": 'attachment; filename="standings.csv"',
            },
          });
        }
        return new NextResponse(JSON.stringify(d, null, 2), {
          headers: {
            ...headers,
            "Content-Type": "application/json",
            "Content-Disposition": 'attachment; filename="event-backup.json"',
          },
        });
      }
      const p = admin
        ? undefined
        : authenticate(d, req.cookies.get("protocol_session")?.value || "");
      return NextResponse.json(snapshot(d, p, admin), { headers });
    });
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).host !== req.headers.get("host"))
      throw new EventError("Cross-origin request rejected", 403);
    if (!checkRateLimit(`event:${getClientIp(req)}`, 180, 60000).allowed)
      throw new EventError("Too many requests. Retry in a minute.", 429);
    if (Number(req.headers.get("content-length") || 0) > 1000000)
      throw new EventError("Request too large", 413);
    const raw = await req.text();
    if (raw.length > 1000000) throw new EventError("Request too large", 413);
    const b = JSON.parse(raw),
      action = text(b.action, 60),
      admin = verifyAdminRequest(req);
    if (action === "logout") {
      const response = NextResponse.json({ success: true });
      response.cookies.delete("protocol_session");
      return response;
    }
    return await transaction((d) => {
      if (action === "login") {
        if (!checkRateLimit(`qr:${getClientIp(req)}`, 15, 60000).allowed)
          throw new EventError("Too many login attempts", 429);
        const p = authenticate(d, text(b.token, 200));
        const response = NextResponse.json({ success: true }, { headers });
        response.cookies.set("protocol_session", p.token, {
          httpOnly: true,
          sameSite: "strict",
          secure: req.nextUrl.protocol === "https:",
          maxAge: 7 * 86400,
          path: "/",
        });
        return response;
      }
      if (action === "self_register") {
        if (d.rules.phase !== "REGISTRATION_OPEN")
          throw new EventError(
            "Registration is closed. Visit the operations desk.",
            409,
          );
        const p = register(d, b, "registration");
        const response = NextResponse.json({ success: true }, { headers });
        response.cookies.set("protocol_session", p.token, {
          httpOnly: true,
          sameSite: "strict",
          secure: req.nextUrl.protocol === "https:",
          maxAge: 7 * 86400,
          path: "/",
        });
        return response;
      }
      const p = admin
        ? undefined
        : authenticate(d, req.cookies.get("protocol_session")?.value || "");
      const actor = admin
        ? process.env.ADMIN_AGENT_NAME || "ieee-protocol-admin"
        : p!.id;
      const key = text(b.requestId, 100);
      if (!key) throw new EventError("A request ID is required");
      const requestKey = `${actor}:${action}:${key}`;
      if (Object.hasOwn(d.requests, requestKey))
        return NextResponse.json(
          { result: d.requests[requestKey], snapshot: snapshot(d, p, admin) },
          { headers },
        );
      let result: unknown;
      if (admin && action === "csv_preview")
        result = previewCSV(d, text(b.csv, 900000));
      else if (admin && action === "csv_import") {
        if (d.rules.phase === "RESULTS_LOCKED")
          throw new EventError("Results are locked", 409);
        const rows = previewCSV(d, text(b.csv, 900000));
        if (b.allOrNothing && rows.some((r) => r.errors.length))
          throw new EventError(
            "Import rejected: correct all invalid rows first",
          );
        const accepted = rows.filter((r) => !r.errors.length);
        accepted.forEach((r) => register(d, r, actor));
        result = {
          imported: accepted.length,
          rejected: rows.filter((r) => r.errors.length),
        };
      } else if (admin) {
        if (
          action === "purge" ||
          (action === "rules" && b.rules?.phase === "RESULTS_LOCKED")
        )
          backup(d);
        result = adminAction(d, action, b, actor);
      } else result = participantAction(d, p!, action, b);
      d.requests[requestKey] = result;
      return NextResponse.json(
        { result, snapshot: snapshot(d, p, admin) },
        { headers },
      );
    });
  } catch (e) {
    return failure(e);
  }
}
