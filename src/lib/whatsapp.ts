import { generateAgentQRBadgeDataUrl } from './qr-image';

export interface WhatsAppConfig {
  provider: 'SIMULATED' | 'META_CLOUD' | 'ULTRAMSG' | 'GREEN_API' | 'TWILIO' | 'CUSTOM';
  groupLink: string;
  apiToken?: string;
  phoneNumberId?: string;
  instanceId?: string;
  accountSid?: string;
  fromNumber?: string;
  customWebhookUrl?: string;
}

export interface WhatsAppDispatchRecord {
  id: string;
  timestamp: string;
  recipient: string;
  agentId: string;
  agentName: string;
  type: 'GROUP_INVITE' | 'QR_BADGE_IMAGE';
  status: 'DELIVERED' | 'SIMULATED' | 'FAILED';
  previewText: string;
  mediaUrl?: string;
  error?: string;
}

export const DEFAULT_WHATSAPP_GROUP = 
  process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL || 
  'https://chat.whatsapp.com/IEEE-Protocol-NITW-2026';

/**
 * Standardize phone number format for WhatsApp (removes +, -, spaces; adds 91 default for 10-digit Indian numbers)
 */
export function formatWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Generate Message 1 text: WhatsApp Group Link
 */
export function buildGroupInviteMessage(options: {
  agentName: string;
  agentId: string;
  agentNumber?: string;
  groupLink?: string;
}): string {
  const groupUrl = options.groupLink || DEFAULT_WHATSAPP_GROUP;
  const name = options.agentNumber || options.agentName || options.agentId;

  return [
    `🛡️ *NIT WARANGAL • IEEE THE PROTOCOL*`,
    `----------------------------------------`,
    `Welcome Operative *${name}*!`,
    `Your clearance record has been registered into The Protocol network.`,
    ``,
    `📲 *STEP 1: JOIN THE OFFICIAL WHATSAPP GROUP*`,
    `All priority transmissions, field updates, and station decryptions will be broadcast here:`,
    `${groupUrl}`,
    ``,
    `Stay tuned for your personal QR pass image below. Trust no one.`
  ].join('\n');
}

/**
 * Generate Message 2 Caption
 */
export function buildQrBadgeCaption(options: {
  agentName: string;
  agentId: string;
  agentNumber?: string;
}): string {
  const name = options.agentNumber || options.agentName || options.agentId;
  return [
    `🎫 *YOUR PERSONAL OPERATIVE PASS*`,
    `Operative: *${name}* (${options.agentId})`,
    `Format: [QR] / [Agent Name]`,
    `Keep this image ready on your device for scanning in/out at check-in desks and station terminals.`
  ].join('\n');
}

/**
 * Send the 2 required messages to registering participant:
 * 1. WhatsApp Group invite link
 * 2. Personal QR image with [QR] and [Agent Name]
 */
export async function sendRegistrationWhatsAppMessages(options: {
  recipientPhone: string;
  agentName: string;
  agentId: string;
  agentNumber?: string;
  token?: string;
  qrPayload?: string;
  groupLink?: string;
}): Promise<{
  success: boolean;
  message1: WhatsAppDispatchRecord;
  message2: WhatsAppDispatchRecord;
  badgeDataUrl?: string;
  error?: string;
}> {
  const rawPhone = options.recipientPhone.trim();
  const cleanPhone = formatWhatsAppNumber(rawPhone);
  const groupLink = options.groupLink || DEFAULT_WHATSAPP_GROUP;

  // Determine origin for QR payload if not passed
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://network.ieee';
  const qrPayload = options.qrPayload || `${origin}/play?agent_id=${options.agentId}&token=${options.token || 'verified'}`;

  // 1. Generate the [QR] + [Agent Name] composite image
  let badgeDataUrl = '';
  try {
    badgeDataUrl = await generateAgentQRBadgeDataUrl({
      agentName: options.agentName,
      agentNumber: options.agentNumber,
      agentId: options.agentId,
      qrPayload
    });
  } catch (err) {
    console.error('Failed to generate QR badge image:', err);
  }

  const message1Body = buildGroupInviteMessage({
    agentName: options.agentName,
    agentId: options.agentId,
    agentNumber: options.agentNumber,
    groupLink
  });

  const message2Caption = buildQrBadgeCaption({
    agentName: options.agentName,
    agentId: options.agentId,
    agentNumber: options.agentNumber
  });

  // Check if real provider configured in process.env or fallback to simulation
  const provider = process.env.WHATSAPP_PROVIDER || 'SIMULATED';
  const isSimulation = provider === 'SIMULATED' || !process.env.WHATSAPP_API_TOKEN;

  const now = new Date().toISOString();

  // Create dispatch records
  const record1: WhatsAppDispatchRecord = {
    id: `wa-msg1-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    recipient: cleanPhone || rawPhone,
    agentId: options.agentId,
    agentName: options.agentName,
    type: 'GROUP_INVITE',
    status: isSimulation ? 'SIMULATED' : 'DELIVERED',
    previewText: `Group Link: ${groupLink}`
  };

  const record2: WhatsAppDispatchRecord = {
    id: `wa-msg2-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    recipient: cleanPhone || rawPhone,
    agentId: options.agentId,
    agentName: options.agentName,
    type: 'QR_BADGE_IMAGE',
    status: isSimulation ? 'SIMULATED' : 'DELIVERED',
    previewText: `Personal QR Pass Image: [QR] / [${options.agentNumber || options.agentName}]`,
    mediaUrl: badgeDataUrl.slice(0, 100) + '...' // truncated preview for log storage
  };

  // If running in browser and has localStorage/Store, log it locally
  if (typeof window !== 'undefined') {
    try {
      const existingLogsRaw = localStorage.getItem('the_protocol_nitw_v2_wa_logs');
      const existingLogs: WhatsAppDispatchRecord[] = existingLogsRaw ? JSON.parse(existingLogsRaw) : [];
      existingLogs.unshift(record2);
      existingLogs.unshift(record1);
      localStorage.setItem('the_protocol_nitw_v2_wa_logs', JSON.stringify(existingLogs.slice(0, 100)));
      window.dispatchEvent(new CustomEvent('ieee_wa_dispatch', { detail: { record1, record2 } }));
    } catch (e) {
      console.error('Error saving local WhatsApp log:', e);
    }
  }

  // Attempt real API delivery if credentials exist
  if (!isSimulation && typeof fetch !== 'undefined') {
    try {
      // Call server-side WhatsApp API route
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: cleanPhone,
          agentId: options.agentId,
          agentName: options.agentName,
          agentNumber: options.agentNumber,
          groupLink,
          message1Body,
          message2Caption,
          badgeDataUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('WhatsApp API server returned warning:', errorData);
      }
    } catch (apiErr) {
      console.warn('WhatsApp dispatch fallback to simulation mode:', apiErr);
    }
  }

  return {
    success: true,
    message1: record1,
    message2: record2,
    badgeDataUrl
  };
}
