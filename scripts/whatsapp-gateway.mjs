#!/usr/bin/env node
/* eslint-disable react-hooks/rules-of-hooks, @typescript-eslint/no-unused-vars */
/**
 * IEEE NIT Warangal - The Protocol
 * Standalone Zero-Cost WhatsApp Gateway powered by Baileys
 * 
 * Features:
 * - Direct WhatsApp Web protocol integration (100% Free, Zero Cost)
 * - Visual QR code generation (Base64 PNG) for Admin Web UI display
 * - Multi-Day session persistence (stays linked for 3-4+ days without re-scan)
 * - 25-second WebSocket keep-alive ping to prevent idle disconnections
 * - Safe auto-reconnect on network glitches without wiping credentials
 * 
 * Run via: npm run wa:gateway
 */

import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode';
import pino from 'pino';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.WA_GATEWAY_PORT || process.env.PORT || '5005', 10);
const AUTH_DIR = path.resolve(__dirname, '../.baileys_auth');

// Silent logger for internal Baileys operations to keep terminal clean
const logger = pino({ level: 'silent' });

let sock = null;
let isConnected = false;
let connectedUser = null;
let lastQr = null;
let lastQrDataUrl = null;
let qrGeneratedAt = null;
let connectionState = 'INITIALIZING';
let reconnectAttempts = 0;

// Format phone number to WhatsApp JID (e.g., 919848011223@s.whatsapp.net)
function formatToJid(phone) {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) {
    digits = '91' + digits; // Default to India country code for 10-digit numbers
  }
  return `${digits}@s.whatsapp.net`;
}

// Banner
function printBanner() {
  console.log('\x1b[36m%s\x1b[0m', '==========================================================');
  console.log('\x1b[32m\x1b[1m%s\x1b[0m', '   NIT WARANGAL • IEEE THE PROTOCOL 2026');
  console.log('\x1b[33m%s\x1b[0m', '   WHATSAPP AUTOMATION GATEWAY (100% FREE / ZERO COST)');
  console.log('\x1b[36m%s\x1b[0m', '==========================================================');
  console.log(`[Gateway Server] Listening on http://localhost:${PORT}`);
  console.log(`[Session Cache] Storage folder: ${AUTH_DIR}`);
  console.log(`[Persistence] Multi-day session keep-alive active (25s ping interval)`);
  console.log('----------------------------------------------------------\n');
}

// Start WhatsApp Socket
async function startWhatsApp() {
  try {
    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version, isLatest } = await fetchLatestBaileysVersion().catch(() => ({
      version: [2, 3000, 1015901307],
      isLatest: false
    }));

    console.log(`[WhatsApp Engine] Initializing Baileys v${version.join('.')} (Latest: ${isLatest})...`);

    sock = makeWASocket({
      version,
      auth: state,
      logger,
      printQRInTerminal: false,
      browser: ['NITW The Protocol', 'Chrome', '122.0.0'],
      syncFullHistory: false,
      connectTimeoutMs: 60_000,
      defaultQueryTimeoutMs: 60_000,
      keepAliveIntervalMs: 25_000, // Sends keep-alive ping every 25s so TCP/ISP connections never drop
      retryRequestDelayMs: 500,
      markOnlineOnConnect: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        lastQr = qr;
        qrGeneratedAt = new Date().toISOString();
        connectionState = 'QR_READY';

        // Generate base64 Data URL for display directly inside the Admin Dashboard UI
        try {
          lastQrDataUrl = await qrcode.toDataURL(qr, { margin: 2, scale: 6 });
        } catch (err) {
          console.error('[WhatsApp Engine] Error generating QR Data URL:', err);
        }

        console.log('\n\x1b[33m%s\x1b[0m', '┌────────────────────────────────────────────────────────┐');
        console.log('\x1b[33m%s\x1b[0m', '│ 📱 SCAN THIS QR CODE WITH WHATSAPP TO LINK GATEWAY     │');
        console.log('\x1b[33m%s\x1b[0m', '│ (Also visible directly inside the Admin Dashboard UI)  │');
        console.log('\x1b[33m%s\x1b[0m', '│ 1. Open WhatsApp on your phone                         │');
        console.log('\x1b[33m%s\x1b[0m', '│ 2. Tap Settings ➔ Linked Devices ➔ Link Device         │');
        console.log('\x1b[33m%s\x1b[0m', '│ 3. Point camera at QR in terminal OR on Admin Webpage  │');
        console.log('\x1b[33m%s\x1b[0m', '└────────────────────────────────────────────────────────┘\n');

        try {
          const terminalQr = await qrcode.toString(qr, { type: 'terminal', small: true });
          console.log(terminalQr);
        } catch (e) {
          console.log('Raw QR Data:', qr);
        }
      }

      if (connection === 'open') {
        isConnected = true;
        reconnectAttempts = 0;
        connectedUser = sock.user?.id ? sock.user.id.split(':')[0] : 'Linked Device';
        connectionState = 'CONNECTED';
        lastQr = null;
        lastQrDataUrl = null;

        console.log('\x1b[32m\x1b[1m%s\x1b[0m', `\n[SUCCESS] Gateway CONNECTED! Linked to WhatsApp number: +${connectedUser}`);
        console.log('\x1b[32m%s\x1b[0m', `[PERSISTENCE] Session saved to disk. Will stay linked for 3-4+ days without re-scanning.\n`);
      }

      if (connection === 'close') {
        isConnected = false;
        connectionState = 'DISCONNECTED';
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const reason = lastDisconnect?.error?.message || 'Connection closed';

        console.log(`[WhatsApp Engine] Connection closed. Reason: ${reason} (Status Code: ${statusCode})`);

        // ONLY delete the stored session if WhatsApp explicitly reports logged out (401)
        if (statusCode === DisconnectReason.loggedOut) {
          console.log('\x1b[31m%s\x1b[0m', '[ALERT] Device was logged out from WhatsApp. Purging session cache.');
          if (fs.existsSync(AUTH_DIR)) {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
          }
          lastQr = null;
          lastQrDataUrl = null;
          connectedUser = null;
          startWhatsApp();
        } else {
          // Any other disconnect (network blip, router reconnect, server sleep) preserves credentials
          reconnectAttempts++;
          const delay = Math.min(reconnectAttempts * 2000, 10000);
          console.log(`[WhatsApp Engine] Network or socket hiccup. Silently restoring session in ${delay / 1000}s (Attempt #${reconnectAttempts})...`);
          setTimeout(startWhatsApp, delay);
        }
      }
    });

  } catch (err) {
    console.error('[WhatsApp Engine] Error starting socket:', err);
    setTimeout(startWhatsApp, 5000);
  }
}

// Helper to delay between sequential messages
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// FIFO queue for safe burst dispatching to prevent WhatsApp rate-limiting / anti-spam blocks
const dispatchQueue = [];
let isProcessingQueue = false;

async function processDispatchQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  while (dispatchQueue.length > 0) {
    const item = dispatchQueue.shift();
    try {
      const result = await handleSend(item.reqBody);
      item.resolve(result);
    } catch (err) {
      item.reject(err);
    }
    // Respectful 850ms spacing between distinct recipient bursts
    if (dispatchQueue.length > 0) {
      await sleep(850);
    }
  }

  isProcessingQueue = false;
}

function queueSend(reqBody) {
  return new Promise((resolve, reject) => {
    dispatchQueue.push({ reqBody, resolve, reject });
    processDispatchQueue();
  });
}

// Send dispatch helper
async function handleSend(reqBody) {
  if (!isConnected || !sock) {
    throw new Error('WhatsApp gateway is not connected yet. Please scan the QR code in the terminal or Admin Dashboard.');
  }

  const rawRecipient = reqBody.recipient || reqBody.to;
  const jid = formatToJid(rawRecipient);
  if (!jid) {
    throw new Error(`Invalid recipient phone number: ${rawRecipient}`);
  }

  console.log(`\n[DISPATCH] Outgoing messages targeting: ${rawRecipient} (${jid})`);

  let messagesSent = 0;
  const results = [];

  // Format 1: messages array [{ type: 'text', content }, { type: 'image', media, caption }]
  if (Array.isArray(reqBody.messages) && reqBody.messages.length > 0) {
    for (const msg of reqBody.messages) {
      if (msg.type === 'text' && msg.content) {
        console.log(` -> Sending Message (Text): "${msg.content.slice(0, 45).replace(/\n/g, ' ')}..."`);
        const sent = await sock.sendMessage(jid, { text: msg.content });
        results.push({ type: 'text', id: sent?.key?.id, status: 'DELIVERED' });
        messagesSent++;
        await sleep(750);
      } else if (msg.type === 'image' && msg.media) {
        console.log(` -> Sending Message (QR Pass Image): Caption "${msg.caption?.slice(0, 35) || 'Pass'}..."`);
        let buffer;
        if (typeof msg.media === 'string' && msg.media.startsWith('data:image/')) {
          const base64Data = msg.media.replace(/^data:image\/\w+;base64,/, '');
          buffer = Buffer.from(base64Data, 'base64');
        } else if (typeof msg.media === 'string' && msg.media.startsWith('http')) {
          buffer = { url: msg.media };
        } else {
          buffer = Buffer.from(msg.media, 'base64');
        }

        const sent = await sock.sendMessage(jid, {
          image: buffer,
          caption: msg.caption || ''
        });
        results.push({ type: 'image', id: sent?.key?.id, status: 'DELIVERED' });
        messagesSent++;
      }
    }
  } 
  // Format 2: Direct message1Body & badgeDataUrl parameters
  else {
    if (reqBody.message1Body) {
      console.log(` -> Sending Message 1 (Group Link): ${reqBody.groupLink || ''}`);
      const sent1 = await sock.sendMessage(jid, { text: reqBody.message1Body });
      results.push({ type: 'text', id: sent1?.key?.id, status: 'DELIVERED' });
      messagesSent++;
      await sleep(750);
    }

    if (reqBody.badgeDataUrl) {
      console.log(` -> Sending Message 2 (QR Pass Badge Image)...`);
      const base64Data = reqBody.badgeDataUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const sent2 = await sock.sendMessage(jid, {
        image: buffer,
        caption: reqBody.message2Caption || 'NIT Warangal Operative Pass'
      });
      results.push({ type: 'image', id: sent2?.key?.id, status: 'DELIVERED' });
      messagesSent++;
    }
  }

  console.log(`\x1b[32m%s\x1b[0m`, `[DISPATCH SUCCESS] Delivered ${messagesSent} message(s) to ${rawRecipient}.\n`);

  return {
    success: true,
    recipient: jid,
    messagesSent,
    results
  };
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Status / Health Check Endpoint (Returns visual QR code Data URL for Admin UI)
  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/health' || url.pathname === '/status')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      name: 'IEEE NITW The Protocol WhatsApp Gateway',
      engine: 'Baileys',
      status: connectionState,
      isConnected,
      connectedUser: connectedUser ? `+${connectedUser}` : null,
      qrAvailable: !!lastQrDataUrl,
      qrDataUrl: lastQrDataUrl,
      qrRaw: lastQr,
      qrGeneratedAt,
      timestamp: new Date().toISOString()
    }, null, 2));
    return;
  }

  // Unlink / Logout Endpoint (Allows organizer to deliberately switch linked phones from Admin UI)
  if ((req.method === 'POST' || req.method === 'DELETE') && (url.pathname === '/unlink' || url.pathname === '/logout')) {
    try {
      console.log('\x1b[33m%s\x1b[0m', '\n[GATEWAY] Unlink request received from Admin UI. Purging credentials...');
      if (sock) {
        try { await sock.logout(); } catch (_) { try { sock.end(); } catch (__) {} }
      }
      isConnected = false;
      connectedUser = null;
      lastQr = null;
      lastQrDataUrl = null;
      connectionState = 'DISCONNECTED';
      if (fs.existsSync(AUTH_DIR)) {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
      }
      setTimeout(startWhatsApp, 1500);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Unlinked. New QR will be generated.' }));
    } catch (err) {
      console.error('[GATEWAY] Error unlinking session:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // Send Message Endpoint
  if (req.method === 'POST' && (url.pathname === '/send' || url.pathname === '/messages')) {
    let bodyData = '';
    let isTooLarge = false;

    req.on('data', (chunk) => {
      bodyData += chunk;
      if (bodyData.length > 5 * 1024 * 1024) { // 5MB limit
        isTooLarge = true;
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload exceeds 5MB limit' }));
        req.destroy();
      }
    });

    req.on('end', async () => {
      if (isTooLarge) return;
      try {
        const payload = JSON.parse(bodyData || '{}');
        const result = await queueSend(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        console.error('[DISPATCH ERROR]', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: err.message,
          connectionState
        }));
      }
    });
    return;
  }

  // Not Found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

// Clean shutdown
process.on('SIGINT', () => {
  console.log('\n[WhatsApp Gateway] Shutting down cleanly...');
  if (sock) sock.end();
  server.close(() => process.exit(0));
});

// Run
printBanner();
server.listen(PORT, () => {
  startWhatsApp();
});
