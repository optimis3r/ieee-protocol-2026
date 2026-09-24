import { NextRequest, NextResponse } from "next/server";

const GATEWAY_URL = process.env.WA_GATEWAY_URL || "http://127.0.0.1:5005";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${GATEWAY_URL}/status`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        active: true,
        gatewayUrl: GATEWAY_URL,
        isConnected: Boolean(data.isConnected),
        connectedUser: data.connectedUser || null,
        qrAvailable: Boolean(data.qrAvailable),
        qrDataUrl: data.qrDataUrl || null,
        status: data.status || "UNKNOWN",
      });
    }
  } catch {
    // Gateway service not running on port 5005
  }

  return NextResponse.json({
    active: false,
    gatewayUrl: GATEWAY_URL,
    isConnected: false,
    connectedUser: null,
    qrAvailable: false,
    qrDataUrl: null,
    status: "OFFLINE",
    message: "Baileys gateway service is not currently running. Use npm run wa:gateway to start.",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawPhone = String(body.phone || body.recipient || body.to || "").trim();
    let text = String(body.text || body.message || "").trim();

    if (!rawPhone) {
      return NextResponse.json(
        { error: "Recipient phone number is required" },
        { status: 400 },
      );
    }

    let digits = rawPhone.replace(/\D/g, "");
    if (digits.length === 10) {
      digits = "91" + digits;
    }

    if (!text && body.agentId) {
      text = `*IEEE Protocol // The Network*\nAgent ID: ${body.agentId}\nOperative Name: ${body.name || "Agent"}\nYour identity dossier has been confirmed.\n\nOpen your personal terminal:\n${body.loginUrl || ""}`;
    }

    const directShareUrl = `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;

    // Attempt delivery via Baileys gateway if active
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const gwRes = await fetch(`${GATEWAY_URL}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: digits,
          messages: [{ type: "text", content: text }],
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (gwRes.ok) {
        const gwData = await gwRes.json();
        return NextResponse.json({
          success: true,
          delivered: true,
          method: "gateway",
          recipient: digits,
          gatewayResponse: gwData,
          shareUrl: directShareUrl,
        });
      }
    } catch {
      // Gateway unreachable or timed out - fall back to direct wa.me link
    }

    return NextResponse.json({
      success: true,
      delivered: false,
      method: "direct_link",
      recipient: digits,
      shareUrl: directShareUrl,
      message: "Gateway offline or busy. Direct WhatsApp link ready for 1-click dispatch.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to process WhatsApp request" },
      { status: 500 },
    );
  }
}
