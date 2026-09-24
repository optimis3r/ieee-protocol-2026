# IEEE Protocol // The Network

Campus detective-game website with participant and admin portals, persistent JSON storage, server-validated scoring, private QR login, CSV registration, Node editing, handshakes, trust encounters and final deductions.

The original editorial palette and Newsreader, Space Grotesk and JetBrains Mono typography are shared by both portals.

See [DEPLOYMENT.md](DEPLOYMENT.md) for setup, the game-rule decisions, event operation, backups and tests. Start by copying `.env.example` to `.env.local` and replacing the commented `FILLER` secrets. Configure Node 02, media and the WhatsApp invite in the admin portal.

```sh
npm ci
npm run dev
```

This application needs a persistent Node.js host. It does not use a remote database and must not use ephemeral serverless storage.
