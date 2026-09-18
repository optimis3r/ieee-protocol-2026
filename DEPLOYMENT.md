# IEEE Protocol: The Network — Complete Deployment Guide

This guide explains how to deploy the entire system with **100% free hosting**, automatic HTTPS (mandatory for mobile phone camera QR scanning), and 24/7 zero-cost WhatsApp automated messaging.

---

## Architecture Overview

The system consists of two parts:
1. **Frontend & App Engine (Next.js)** ➔ Deployed on **Vercel** (Free, instant global CDN, automatic SSL/HTTPS).
2. **WhatsApp Gateway (Baileys Web Protocol)** ➔ Deployed on **Render.com** (Free 24/7 Web Service via Docker) or run on an organizer's laptop.

```
[ Participants / Mobile Phones ] ──HTTPS──> [ Vercel: Next.js App ]
                                                    │
                                                    ▼ (Webhook POST /send)
                                            [ Render.com: WhatsApp Gateway ]
                                                    │
                                                    ▼ (Persistent 24/7 WebSocket)
                                            [ WhatsApp Multi-Device Network ]
```

---

## Part 1: Deploy the WhatsApp Gateway (Render.com — 100% Free 24/7)

Because Vercel functions are serverless and shut down after 15 seconds, the persistent WhatsApp WebSocket runs 24/7 on Render's free tier.

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete event standby & whatsapp automation"
   git push origin main
   ```
2. Go to [render.com](https://render.com) and create a free account (no credit card needed).
3. Click **New +** ➔ **Web Service** and select your GitHub repository.
4. Configure the settings:
   - **Name**: `ieee-protocol-wa-gateway` (or your choice)
   - **Language / Runtime**: **Docker**
   - **Dockerfile Path**: `Dockerfile.gateway`
   - **Instance Type**: **Free**
5. Click **Deploy Web Service**.
6. When deployment finishes, copy your service URL (e.g. `https://ieee-protocol-wa-gateway.onrender.com`).
   - Your webhook URL will be: `https://ieee-protocol-wa-gateway.onrender.com/send`.

> [!TIP]
> **Alternative (Local Laptop)**: If you prefer running the gateway on your own laptop rather than the cloud, simply run `npm run wa:gateway` locally and expose port 5005 with a free Cloudflare tunnel: `npx cloudflared tunnel --url http://localhost:5005`.

---

## Part 2: Deploy the Main Web Application (Vercel — 100% Free)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** ➔ **Project** and import your repository.
3. In **Environment Variables**, add:
   - `WHATSAPP_PROVIDER`: `CUSTOM`
   - `CUSTOM_WHATSAPP_WEBHOOK_URL`: `https://your-gateway.onrender.com/send` *(from Part 1)*
   - `NEXT_PUBLIC_WHATSAPP_GROUP_URL`: `https://chat.whatsapp.com/YOUR_GROUP_CODE` *(your actual WhatsApp group link)*
   - `ADMIN_SECRET_TOKEN`: `protocol2026`
   *(Optional: If using Supabase, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`)*
4. Click **Deploy**. In under 60 seconds, your site will be live at:
   `https://your-project.vercel.app`

---

## Part 3: Link Your WhatsApp (Takes 10 Seconds)

1. Open your live Vercel admin URL:
   `https://your-project.vercel.app/admin`
2. Log in with admin credentials:
   - **Agent-Name**: `ieee-protocol-admin`
   - **Password**: `protocol2026`
3. In the **WhatsApp Transmission Center**, the live QR code will appear on your screen.
4. Open WhatsApp on your phone ➔ **Settings** (iOS) or **Three Dots ⋮** (Android) ➔ **Linked Devices** ➔ **Link a Device**.
5. Scan the QR code on your computer screen.
6. The dashboard immediately switches to:
   `🟢 BAILEYS GATEWAY: LIVE (+91XXXXXXXXXX)`.
7. **It will now remain linked for the entire 3–4 day event window.**

---

## Part 4: How the Pre-Event & Launch Workflow Operates

1. **Pre-Event Registration**:
   - Share `https://your-project.vercel.app/register` with participants.
   - When a student registers, their profile is saved and the gateway instantly delivers **two WhatsApp messages**:
     1. Message 1: Official NIT Warangal WhatsApp Group Link.
     2. Message 2: Their personal Operative QR Pass Card image (`[QR] / [Agent Name]`).
   - The participant is automatically forwarded to the `/standby` holding page with the live countdown to **September 24th, 2026**.
   - If they try logging in early at `/login` or scanning station nodes, they are safely held on the standby holding screen.

2. **Official Event Launch (September 24th)**:
   - Open `/admin` on your device.
   - In the Telemetry section, click the **ACTIVE** button.
   - **Instantly and synchronously across campus**:
     - All waiting participants on `/standby` automatically transition into the live game HUD (`/play`) without needing to refresh.
     - All question stations and decrypt terminals (`/node/[id]`) unlock for solving.

3. **Event Lockdown**:
   - When the submission window ends, click **LOCKDOWN** in `/admin` to freeze point submissions and display final standings.
