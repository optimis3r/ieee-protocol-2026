import { NextResponse } from 'next/server';
import { ServerStore } from '@/lib/server-store';
import { WhatsAppDispatchRecord } from '@/lib/whatsapp';
import { verifyAdminRequest, checkRateLimit, getClientIp } from '@/lib/admin-auth';

function recordServerLogs(options: {
  recipient: string;
  agentId?: string;
  agentName?: string;
  agentNumber?: string;
  groupLink?: string;
  status: 'DELIVERED' | 'FAILED';
  badgeDataUrl?: string;
  error?: string;
}) {
  const now = new Date().toISOString();
  const idSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const cleanPhone = options.recipient;

  const record1: WhatsAppDispatchRecord = {
    id: `srv-wa1-${idSuffix}`,
    timestamp: now,
    recipient: cleanPhone,
    agentId: options.agentId || 'SYSTEM',
    agentName: options.agentName || cleanPhone,
    type: 'GROUP_INVITE',
    status: options.status,
    previewText: `Group Link: ${options.groupLink || 'Official IEEE Protocol Community'}`,
    error: options.error
  };

  const record2: WhatsAppDispatchRecord = {
    id: `srv-wa2-${idSuffix}`,
    timestamp: now,
    recipient: cleanPhone,
    agentId: options.agentId || 'SYSTEM',
    agentName: options.agentName || cleanPhone,
    type: 'QR_BADGE_IMAGE',
    status: options.status,
    previewText: `Personal QR Pass Image: [QR] / [${options.agentNumber || options.agentName || options.agentId || 'OPERATIVE'}]`,
    mediaUrl: options.badgeDataUrl ? options.badgeDataUrl.slice(0, 100) + '...' : undefined,
    error: options.error
  };

  ServerStore.addWhatsAppLog(record2);
  ServerStore.addWhatsAppLog(record1);

  return { record1, record2 };
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`wa-send:${ip}`, 12, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Transmission rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      recipient: rawRecipient,
      agentId: rawAgentId,
      agentName: rawAgentName,
      agentNumber: rawAgentNumber,
      groupLink: rawGroupLink,
      message1Body,
      message2Caption,
      badgeDataUrl
    } = body;

    if (!rawRecipient) {
      return NextResponse.json({ error: 'Recipient phone number is required' }, { status: 400 });
    }

    const recipient = String(rawRecipient).replace(/\D/g, '').slice(0, 15);
    if (recipient.length < 8) {
      return NextResponse.json({ error: 'Valid phone number is required (min 8 digits)' }, { status: 400 });
    }

    const agentName = rawAgentName ? String(rawAgentName).slice(0, 80) : undefined;
    const agentId = rawAgentId ? String(rawAgentId).slice(0, 30) : undefined;
    const agentNumber = rawAgentNumber ? String(rawAgentNumber).slice(0, 30) : undefined;
    const groupLink = rawGroupLink ? String(rawGroupLink).slice(0, 200) : undefined;

    const provider = process.env.WHATSAPP_PROVIDER || 'BAILEYS';
    const apiToken = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    console.log(`[WhatsApp Engine] Dispatching 2 messages to ${recipient} (Agent: ${agentName}, ID: ${agentId}) via [${provider}]`);

    // 1. Meta WhatsApp Cloud API (Graph API)
    if (provider === 'META_CLOUD' && apiToken && phoneNumberId) {
      try {
        const res1 = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipient,
            type: 'text',
            text: { preview_url: true, body: message1Body }
          })
        });

        let res2Status = 200;
        if (badgeDataUrl && badgeDataUrl.startsWith('http')) {
          const res2 = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: recipient,
              type: 'image',
              image: { link: badgeDataUrl, caption: message2Caption }
            })
          });
          res2Status = res2.status;
        }

        const isOk = res1.ok && (res2Status === 200 || res2Status === 201);
        const { record1, record2 } = recordServerLogs({
          recipient,
          agentId,
          agentName,
          agentNumber,
          groupLink,
          status: isOk ? 'DELIVERED' : 'FAILED',
          badgeDataUrl,
          error: isOk ? undefined : `Meta Graph API returned status ${res1.status}`
        });

        return NextResponse.json({
          success: isOk,
          provider: 'META_CLOUD',
          status1: res1.status,
          status2: res2Status,
          records: [record1, record2]
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Meta API error';
        recordServerLogs({
          recipient,
          agentId,
          agentName,
          agentNumber,
          groupLink,
          status: 'FAILED',
          badgeDataUrl,
          error: msg
        });
        return NextResponse.json({ success: false, provider: 'META_CLOUD', error: msg }, { status: 500 });
      }
    }

    // 2. UltraMsg API Integration
    const ultraInstance = process.env.ULTRAMSG_INSTANCE_ID;
    const ultraToken = process.env.ULTRAMSG_TOKEN || apiToken;
    if (provider === 'ULTRAMSG' && ultraInstance && ultraToken) {
      try {
        const res1 = await fetch(`https://api.ultramsg.com/${ultraInstance}/messages/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            token: ultraToken,
            to: recipient,
            body: message1Body
          })
        });

        if (badgeDataUrl) {
          await fetch(`https://api.ultramsg.com/${ultraInstance}/messages/image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              token: ultraToken,
              to: recipient,
              image: badgeDataUrl,
              caption: message2Caption
            })
          });
        }

        const isOk = res1.ok;
        const { record1, record2 } = recordServerLogs({
          recipient,
          agentId,
          agentName,
          agentNumber,
          groupLink,
          status: isOk ? 'DELIVERED' : 'FAILED',
          badgeDataUrl,
          error: isOk ? undefined : `UltraMsg API returned ${res1.status}`
        });

        return NextResponse.json({
          success: isOk,
          provider: 'ULTRAMSG',
          status: res1.status,
          records: [record1, record2]
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'UltraMsg error';
        recordServerLogs({
          recipient,
          agentId,
          agentName,
          agentNumber,
          groupLink,
          status: 'FAILED',
          badgeDataUrl,
          error: msg
        });
        return NextResponse.json({ success: false, provider: 'ULTRAMSG', error: msg }, { status: 500 });
      }
    }

    // 3. Baileys / Custom Webhook Gateway
    const webhookUrl = process.env.CUSTOM_WHATSAPP_WEBHOOK_URL || (provider === 'CUSTOM' || provider === 'BAILEYS' ? 'http://localhost:5005/send' : undefined);
    if ((provider === 'CUSTOM' || provider === 'BAILEYS') && webhookUrl) {
      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient,
            agentId,
            agentName,
            agentNumber,
            groupLink,
            messages: [
              { type: 'text', content: message1Body },
              { type: 'image', media: badgeDataUrl, caption: message2Caption }
            ]
          })
        });

        const resData = await res.json().catch(() => ({}));
        if (res.ok) {
          const { record1, record2 } = recordServerLogs({
            recipient,
            agentId,
            agentName,
            agentNumber,
            groupLink,
            status: 'DELIVERED',
            badgeDataUrl
          });

          return NextResponse.json({
            success: true,
            provider: 'BAILEYS_GATEWAY',
            records: [record1, record2],
            ...resData
          });
        } else {
          const errorMsg = resData.error || `Gateway returned status ${res.status}`;
          const { record1, record2 } = recordServerLogs({
            recipient,
            agentId,
            agentName,
            agentNumber,
            groupLink,
            status: 'FAILED',
            badgeDataUrl,
            error: errorMsg
          });

          return NextResponse.json({
            success: false,
            provider: 'BAILEYS_GATEWAY',
            records: [record1, record2],
            error: errorMsg,
            note: 'WhatsApp Gateway reported an issue. Check the terminal where npm run wa:gateway is running.'
          }, { status: 502 });
        }
      } catch (gatewayErr: unknown) {
        console.warn('[WhatsApp API] Gateway service unreachable on', webhookUrl, gatewayErr);
        const { record1, record2 } = recordServerLogs({
          recipient,
          agentId,
          agentName,
          agentNumber,
          groupLink,
          status: 'FAILED',
          badgeDataUrl,
          error: 'WhatsApp Gateway offline. Start via `npm run wa:gateway` or link WhatsApp in Admin.'
        });

        return NextResponse.json({
          success: false,
          provider: 'BAILEYS_GATEWAY',
          records: [record1, record2],
          error: 'WhatsApp Gateway is offline. Run `npm run wa:gateway` or scan QR code in Admin Dashboard to link WhatsApp.'
        }, { status: 503 });
      }
    }

    // Provider not connected or gateway offline
    const notConfiguredError = `WhatsApp provider [${provider}] is offline or not configured.`;
    const { record1, record2 } = recordServerLogs({
      recipient,
      agentId,
      agentName,
      agentNumber,
      groupLink,
      status: 'FAILED',
      badgeDataUrl,
      error: notConfiguredError
    });

    return NextResponse.json({
      success: false,
      provider,
      records: [record1, record2],
      error: 'WhatsApp Gateway is offline. Link WhatsApp via Admin Dashboard or run `npm run wa:gateway`.'
    }, { status: 503 });

  } catch (error: unknown) {
    console.error('[WhatsApp API] Error processing dispatch:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({
      success: false,
      error: errorMessage,
      note: 'Fell back safely; registration data preserved.'
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wantsLogsOnly = searchParams.get('logs') === 'true';

  const centralLogs = ServerStore.getWhatsAppLogs();

  if (wantsLogsOnly) {
    return NextResponse.json({
      success: true,
      logs: centralLogs,
      count: centralLogs.length
    });
  }

  const provider = process.env.WHATSAPP_PROVIDER || 'BAILEYS';
  const webhookUrl = process.env.CUSTOM_WHATSAPP_WEBHOOK_URL || 'http://localhost:5005/send';
  const statusUrl = webhookUrl.replace(/\/send$/, '/status');

  if (provider === 'CUSTOM' || provider === 'BAILEYS') {
    try {
      const res = await fetch(statusUrl, { method: 'GET', cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          provider,
          gatewayOnline: true,
          logs: centralLogs,
          ...data
        });
      }
    } catch {
      return NextResponse.json({
        provider,
        gatewayOnline: false,
        status: 'OFFLINE',
        message: 'Gateway offline. Start it via npm run wa:gateway',
        logs: centralLogs
      });
    }
  }

  return NextResponse.json({
    provider,
    gatewayOnline: false,
    status: provider,
    logs: centralLogs
  });
}

export async function DELETE(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator privileges required' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'clear_logs') {
    ServerStore.clearWhatsAppLogs();
    return NextResponse.json({
      success: true,
      message: 'Central WhatsApp transmission logs cleared successfully.'
    });
  }

  const provider = process.env.WHATSAPP_PROVIDER || 'BAILEYS';
  const webhookUrl = process.env.CUSTOM_WHATSAPP_WEBHOOK_URL || 'http://localhost:5005/send';
  const unlinkUrl = webhookUrl.replace(/\/send$/, '/unlink');

  if (provider === 'CUSTOM' || provider === 'BAILEYS') {
    try {
      const res = await fetch(unlinkUrl, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      return NextResponse.json({ success: res.ok, ...data });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gateway unreachable';
      return NextResponse.json({ success: false, error: msg }, { status: 503 });
    }
  }

  return NextResponse.json({ success: true, message: 'Unlink action completed.' });
}
