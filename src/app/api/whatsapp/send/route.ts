import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      recipient, 
      agentId, 
      agentName, 
      agentNumber, 
      groupLink, 
      message1Body, 
      message2Caption, 
      badgeDataUrl 
    } = body;

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient phone number is required' }, { status: 400 });
    }

    const provider = process.env.WHATSAPP_PROVIDER || 'SIMULATED';
    const apiToken = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    console.log(`[WhatsApp Engine] Dispatching 2 messages to ${recipient} (Agent: ${agentName}, ID: ${agentId}) via [${provider}]`);

    // 1. Meta WhatsApp Cloud API (Graph API)
    if (provider === 'META_CLOUD' && apiToken && phoneNumberId) {
      // Send Message 1: Group Invite Link
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

      // Send Message 2: Personal QR Pass Image
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

      return NextResponse.json({
        success: true,
        provider: 'META_CLOUD',
        status1: res1.status,
        status2: res2Status
      });
    }

    // 2. UltraMsg API Integration
    const ultraInstance = process.env.ULTRAMSG_INSTANCE_ID;
    const ultraToken = process.env.ULTRAMSG_TOKEN || apiToken;
    if (provider === 'ULTRAMSG' && ultraInstance && ultraToken) {
      // Send Message 1 (Chat/Text)
      const res1 = await fetch(`https://api.ultramsg.com/${ultraInstance}/messages/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: ultraToken,
          to: recipient,
          body: message1Body
        })
      });

      // Send Message 2 (Image)
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

      return NextResponse.json({
        success: true,
        provider: 'ULTRAMSG',
        status: res1.status
      });
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
          return NextResponse.json({
            success: true,
            provider: 'BAILEYS_GATEWAY',
            ...resData
          });
        } else {
          return NextResponse.json({
            success: false,
            provider: 'BAILEYS_GATEWAY',
            error: resData.error || `Gateway returned status ${res.status}`,
            note: 'WhatsApp Gateway reported an issue. Check the terminal where npm run wa:gateway is running.'
          }, { status: 502 });
        }
      } catch (gatewayErr: unknown) {
        console.warn('[WhatsApp API] Gateway service unreachable on', webhookUrl, gatewayErr);
        return NextResponse.json({
          success: false,
          provider: 'SIMULATED',
          error: 'WhatsApp Gateway is offline. Run `npm run wa:gateway` in a separate terminal to link WhatsApp.',
          simulated: true,
          dispatched: {
            message1: { type: 'GROUP_INVITE', to: recipient, content: message1Body },
            message2: { type: 'QR_BADGE_IMAGE', to: recipient, caption: message2Caption }
          }
        });
      }
    }

    // Default: Local Simulated Mode (Always succeeds, safe for dev/demo)
    return NextResponse.json({
      success: true,
      provider: 'SIMULATED',
      message: `2 WhatsApp transmissions successfully simulated for ${recipient}. Start WhatsApp Gateway (npm run wa:gateway) for live transmissions.`,
      dispatched: {
        message1: { type: 'GROUP_INVITE', to: recipient, content: message1Body },
        message2: { type: 'QR_BADGE_IMAGE', to: recipient, caption: message2Caption }
      }
    });

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

export async function GET() {
  const provider = process.env.WHATSAPP_PROVIDER || 'CUSTOM';
  const webhookUrl = process.env.CUSTOM_WHATSAPP_WEBHOOK_URL || 'http://localhost:5005/send';
  const statusUrl = webhookUrl.replace(/\/send$/, '/status');

  if (provider === 'CUSTOM' || provider === 'BAILEYS') {
    try {
      const res = await fetch(statusUrl, { method: 'GET', cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ provider, gatewayOnline: true, ...data });
      }
    } catch {
      return NextResponse.json({ 
        provider, 
        gatewayOnline: false, 
        status: 'OFFLINE',
        message: 'Gateway offline. Start it via npm run wa:gateway' 
      });
    }
  }

  return NextResponse.json({ provider, gatewayOnline: false, status: provider });
}

export async function DELETE() {
  const provider = process.env.WHATSAPP_PROVIDER || 'CUSTOM';
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

  return NextResponse.json({ success: true, message: 'Reset simulated session.' });
}
