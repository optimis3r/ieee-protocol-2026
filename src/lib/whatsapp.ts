import { generateAgentQRBadgeDataUrl } from './qr-image';

export interface WhatsAppConfig {
  provider: 'SIMULATED' | 'META_CLOUD' | 'ULTRAMSG' | 'GREEN_API' | 'TWILIO' | 'CUSTOM' | 'BAILEYS';
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

  // Dispatch via server API route (supports Baileys gateway, live APIs, and simulation fallback)
  let apiStatus: 'DELIVERED' | 'SIMULATED' | 'FAILED' = 'SIMULATED';
  let apiErrorMessage: string | undefined;

  if (typeof fetch !== 'undefined') {
    try {
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

      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success && data.provider !== 'SIMULATED') {
        apiStatus = 'DELIVERED';
      } else if (data.simulated || data.provider === 'SIMULATED') {
        apiStatus = 'SIMULATED';
      } else {
        apiStatus = 'FAILED';
        apiErrorMessage = data.error;
      }
    } catch (apiErr: any) {
      console.warn('WhatsApp API server unreachable, logging local simulation:', apiErr);
      apiStatus = 'SIMULATED';
    }
  }

  const now = new Date().toISOString();

  // Create dispatch records
  const record1: WhatsAppDispatchRecord = {
    id: `wa-msg1-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    recipient: cleanPhone || rawPhone,
    agentId: options.agentId,
    agentName: options.agentName,
    type: 'GROUP_INVITE',
    status: apiStatus,
    previewText: `Group Link: ${groupLink}`,
    error: apiErrorMessage
  };

  const record2: WhatsAppDispatchRecord = {
    id: `wa-msg2-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    recipient: cleanPhone || rawPhone,
    agentId: options.agentId,
    agentName: options.agentName,
    type: 'QR_BADGE_IMAGE',
    status: apiStatus,
    previewText: `Personal QR Pass Image: [QR] / [${options.agentNumber || options.agentName}]`,
    mediaUrl: badgeDataUrl.slice(0, 100) + '...', // truncated preview for log storage
    error: apiErrorMessage
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

  return {
    success: apiStatus !== 'FAILED',
    message1: record1,
    message2: record2,
    badgeDataUrl,
    error: apiErrorMessage
  };
}

export interface WhatsAppGatewayStatus {
  online: boolean;
  status: string;
  connectedUser?: string | null;
  provider?: string;
  message?: string;
  qrAvailable?: boolean;
  qrDataUrl?: string | null;
  logs?: WhatsAppDispatchRecord[];
}

/**
 * Check if the local WhatsApp Gateway (Baileys) or live provider is online
 */
export async function checkWhatsAppGatewayStatus(): Promise<WhatsAppGatewayStatus> {
  if (typeof fetch === 'undefined') {
    return { online: false, status: 'OFFLINE' };
  }

  try {
    const res = await fetch('/api/whatsapp/send', { method: 'GET', cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return {
        online: data.gatewayOnline || data.isConnected || false,
        status: data.status || 'UNKNOWN',
        connectedUser: data.connectedUser,
        provider: data.provider,
        message: data.message,
        qrAvailable: data.qrAvailable,
        qrDataUrl: data.qrDataUrl,
        logs: data.logs || []
      };
    }
    return { online: false, status: 'OFFLINE' };
  } catch {
    return { online: false, status: 'OFFLINE' };
  }
}

/**
 * Fetch all centralized WhatsApp transmission records from the server
 */
export async function fetchCentralWhatsAppLogs(): Promise<WhatsAppDispatchRecord[]> {
  if (typeof fetch === 'undefined') return [];
  try {
    const res = await fetch('/api/whatsapp/send?logs=true', { method: 'GET', cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data.logs) ? data.logs : [];
    }
    return [];
  } catch (err) {
    console.warn('Failed to fetch central WhatsApp logs:', err);
    return [];
  }
}

/**
 * Clear centralized WhatsApp logs on the server
 */
export async function clearCentralWhatsAppLogs(): Promise<boolean> {
  if (typeof fetch === 'undefined') return false;
  try {
    const res = await fetch('/api/whatsapp/send?action=clear_logs', { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.warn('Failed to clear central WhatsApp logs:', err);
    return false;
  }
}

/**
 * Deliberately unlink/logout the current WhatsApp phone from the gateway
 */
export async function unlinkWhatsAppGateway(): Promise<{ success: boolean; message?: string; error?: string }> {
  if (typeof fetch === 'undefined') return { success: false, error: 'No browser fetch available' };
  try {
    const res = await fetch('/api/whatsapp/send', { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    return { success: res.ok, ...data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to unlink device' };
  }
}


