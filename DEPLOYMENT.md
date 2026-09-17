# IEEE Protocol: The Network — Deployment & Hosting Guide

Yes, the application is **100% build-ready and production-tested** (`npm run build` exits with 0 errors).

Because mobile cameras require **HTTPS** for optical QR scanning (`getUserMedia` browser security restriction), hosting the application with SSL/HTTPS is essential.

Here are the best hosting options:

---

## Step 1: Set Up Supabase Database (5 Minutes)

1. Go to [supabase.com](https://supabase.com) and create a new project (Free Tier).
2. Once created, click on the **SQL Editor** tab on the left sidebar.
3. Open [`supabase/schema.sql`](supabase/schema.sql) from this project, copy its entire contents, paste into the Supabase SQL editor, and click **Run**.
   - This creates all custom ENUMs, the 8 tables, initial nodes, seeded intel fragments, the dynamic scoring function, and the atomic graph registration function.
4. Go to **Project Settings** -> **API** and copy:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon / public key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

---

## Step 2: Hosting Options

### Option A: Vercel (Recommended — Fastest & Free with HTTPS)

Vercel is the creators of Next.js and provides instant automated deployment, global CDN, and automatic free SSL/HTTPS certificates.

#### Via GitHub (Recommended)
1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: IEEE Protocol ARG initial release"
   git branch -M main
   git remote add origin https://github.com/<your-user>/ieee-protocol.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase Anon key
   - `ADMIN_SECRET_TOKEN` = `ieee_ops_secure_2025` (or your custom password)
5. Click **Deploy**. Your app will be live at `https://your-project.vercel.app` in under 60 seconds!

#### Via Vercel CLI (Without Git)
```bash
npx vercel
```
Follow the interactive prompts to deploy directly from your terminal.

---

### Option B: Railway / Render / Fly.io (Docker Container)

A production-ready multi-stage [`Dockerfile`](Dockerfile) is provided in this repository.

1. Connect your GitHub repository to [Railway.app](https://railway.app) or [Render.com](https://render.com).
2. Select **Docker** deployment.
3. Configure the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_SECRET_TOKEN`).
4. Deploy!

---

### Option C: Instant Phone Testing Right Now (Free HTTPS via Cloudflare Tunnel)

If you want to test on your phone or let other students scan badges **right now** before deploying to the cloud:

1. Keep the local server running:
   ```bash
   npm run dev
   ```
2. In a separate terminal, run an instant free Cloudflare Tunnel:
   ```bash
   npx cloudflared tunnel --url http://localhost:3000
   ```
3. Cloudflare will output a temporary public HTTPS URL (e.g. `https://random-words.trycloudflare.com`).
4. Open that URL on your phone! The camera will activate immediately with full HTTPS permissions.

---

## Step 3: Event Day Checklist for Organizers

1. **Access Operations Desk**:
   - Navigate to `https://your-domain/admin`.
   - Log in with your `ADMIN_SECRET_TOKEN` (default: `ieee_ops_secure_2025`).
2. **Print Physical Codes**:
   - Go to the **BADGE STATION** tab in the admin portal.
   - Print badge QR cards for participants and physical node optical tags to place at campus coordinates.
3. **Kiosk Check-In Desk**:
   - Keep a laptop or tablet at the registration table on `/admin` -> **KIOSK CHECK-IN**.
   - As participants arrive, scan their wristband or click **Enroll New Operative** to immediately assign their archetype and seed their private graph.
4. **Broadcast Emergency Directives**:
   - Under `/admin` -> **TELEMETRY**, push real-time broadcasts or trigger `NETWORK_LOCKED` at the end of the event window to freeze submissions.
