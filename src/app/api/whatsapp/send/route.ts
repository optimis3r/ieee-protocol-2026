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

    // 3. Generic Webhook / Custom Provider
    const webhookUrl = process.env.CUSTOM_WHATSAPP_WEBHOOK_URL;
    if (provider === 'CUSTOM' && webhookUrl) {
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
      return NextResponse.json({ success: true, provider: 'CUSTOM', status: res.status });
    }

    // Default: Local Simulated Mode (Always succeeds, safe for dev/demo)
    return NextResponse.json({
      success: true,
      provider: 'SIMULATED',
      message: `2 WhatsApp transmissions successfully simulated for ${recipient}. Add WHATSAPP_API_TOKEN in .env to transmit via live provider.`,
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
