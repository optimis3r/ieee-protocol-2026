# Run the event with persistent JSON storage

Use Node.js 22+ and a single persistent host/volume. The application uses JSON only; it does not require Supabase or PostgreSQL. Do **not** deploy the event API to Vercel/serverless or a host whose filesystem disappears on restart.

```sh
npm ci
cp .env.example .env.local
# Replace the two FILLER values, then:
npm run build
npm start
```

Set `ADMIN_PASSWORD` and a random `ADMIN_SECRET` (at least 32 characters). The configured operator name defaults to `ieee-protocol-admin`. Placeholder credentials intentionally cannot authenticate. Use HTTPS in production for camera access and secure cookies. Bind a reverse proxy to the Node application; cap request bodies at 21 MB. Preserve the `PROTOCOL_DATA_DIR` volume between deployments. All Node workers must share that volume on the same host.

## Event setup

1. Sign in at `/admin/login`.
2. In **Nodes**, configure Node 02’s real campus location and dropdown options, then enable it. Upload the real recording for Node 01 and any supporting media. No invented media or location is supplied.
3. Review the default answers, scoring, attempt limits, accepted formats and switch timers in the editor. Answers never ship in participant JavaScript or public API results.
4. In **Event controls**, set the WhatsApp group invite, confirm the deadline (26 September 2026, 8 PM IST), and choose Registration Open. Import CSV files with `name,roll,phone` headers, including country codes in phone numbers. Validate and preview before importing.
5. Use Participants to download each private login QR and interaction/check-in QR. Share the prepared WhatsApp message individually. This workflow opens WhatsApp for the operator to send; it does not pretend to automatically deliver messages.
6. Set Event Active to enable Nodes, then Submissions Open to enable the Main Node. Check Agents in explicitly after scanning their interaction QR.
7. At the deadline, the backend rejects gameplay regardless of an open browser. Set Event Closed, export the full JSON and standings, and select Results Locked to freeze the ranking permanently.

## Rule decisions used

- One random starter Node by default; configurable to two for future registrations. Pairs may repeat; unique pair allocation is not assumed (seven Nodes offer only 21 distinct pairs).
- Regular Nodes award 20 points, capped at 140; forged intel is a separate +50/−40 category. Both are editable in the admin portal. Normal Nodes have unlimited attempts by default; forged intel has one.
- Switching requires 300 seconds on the current Node unless solved, exhausted or disabled. Time starts on opening gameplay and runs while checked in, including locked phones, background tabs and temporary network loss. Checkout, paused/closed event phases, the deadline and a full deduction stop active time.
- Two-to-three correct Main Node fields earn a partial award once. A later full deduction upgrades that award to 150 total (not 40+150). Fewer than two correct fields incurs −25. At most two attempts. A successful full deduction is final.
- Speed bonus: <30 minutes +25; 30–45 inclusive +15; >45–60 inclusive +5; >60 +0. This resolves the source document’s missing 30-minute boundary.
- Handshakes award both Agents once per unordered pair, capped at 40 points each. A separate public interaction token cannot authenticate a login.
- Trust encounters: one per pair; +30/+30 if both cooperate, +40/−10 if one defects, 0/0 if both defect. Choices are private from the other participant until both commit.
- Equal scores share a rank. Agent ID stabilizes display order without breaking a tie or declaring a sole winner.
- Great Purge resets gameplay and reverses scores with ledger entries. It preserves identities, QR credentials, onboarding, Node definitions, broadcasts and audit/score history. It saves a complete pre-reset backup and requires typed and checkbox confirmations. It is unavailable during active play and after results lock.

## Persistence, backups and recovery

`event.json` holds the authoritative event. Every request acquires a cross-process filesystem lock, rereads the file, applies a synchronous transaction and commits with fsync plus atomic rename. Failed actions do not commit. A corrupt JSON file fails closed and is never silently replaced with an empty game.

`assets/` contains uploaded media. `backups/` contains snapshots saved before purge, final lock and full export. Downloaded JSON includes private credentials: keep it access-controlled. Back up the **entire data directory** to include media.

Restore by stopping every app process, copying a trusted backup over `event.json`, restoring `assets/` if needed, and restarting. Never replace files while the app is serving requests. Audit history is immutable through the app, not tamper-proof against someone with filesystem access.

If an existing `protocol_store.json` is present on first start, the app saves a legacy copy, migrates registered identities, scores and matching Node completions, and rotates legacy insecure QR credentials. Reissue passes at the desk. The old store remains intact. Legacy client score-write APIs return 410.

## Verification

```sh
npm test
npm run lint
npx tsc --noEmit
npm run build
npm run test:e2e
```

The browser suite uses a separate temporary event data directory and test-only environment credentials. Set `PLAYWRIGHT_CHROME_PATH` to use an installed Chrome binary, or install Playwright Chromium with `npx playwright install chromium`.

Camera hardware and actual WhatsApp delivery require an organizer’s phone/live account check before the event. Polling refreshes both portals every three seconds. Unsent answer drafts remain on the device and retry synchronization after reconnection; score-bearing submissions require a successful server response and reuse persistent request IDs on retry.
