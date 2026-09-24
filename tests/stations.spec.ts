import { test, expect } from "@playwright/test";
import fs from "node:fs";
import type { Snapshot } from "../src/lib/event/types";

test.beforeAll(() => {
  fs.rmSync("/tmp/protocol-browser-test", { recursive: true, force: true });
});

test("all 7 interactive station widgets render and interact cleanly", async ({
  page,
  request,
  browser,
}) => {
  const jsErrors: string[] = [];
  page.on("pageerror", (e) => jsErrors.push(e.message));

  // Admin login
  await page.goto("/admin/login");
  await page.getByLabel("Operator name").fill("ieee-protocol-admin");
  await page.getByLabel("Password", { exact: true }).fill("test-only-password");
  await page.getByRole("button", { name: "Open operations desk" }).click();
  await expect(
    page.getByRole("heading", { name: "The operations desk." }),
  ).toBeVisible();

  const token = await page.evaluate(() =>
    sessionStorage.getItem("ieee_admin_token"),
  );
  const headers = { "x-admin-token": token! };

  async function admin(action: string, values: Record<string, unknown> = {}) {
    const res = await request.post("/api/event", {
      headers,
      data: { action, requestId: crypto.randomUUID(), ...values },
    });
    expect(res.ok(), await res.text()).toBeTruthy();
    return res.json();
  }

  // Open submissions and set minSeconds to 0 for instant switching
  const snap: Snapshot = await (
    await request.get("/api/event", { headers })
  ).json();
  await admin("rules", {
    rules: {
      ...snap.rules,
      phase: "SUBMISSIONS_OPEN",
      deadline: new Date(Date.now() + 7200000).toISOString(),
    },
  });

  for (const n of snap.adminNodes || []) {
    await admin("node", {
      id: n.id,
      node: {
        ...n,
        answers: n.answers.length > 0 ? n.answers : ["TEST_ANSWER"],
        options: n.options.length > 0 ? n.options : ["TEST_ANSWER", "OPTION_B"],
        minSeconds: 0,
        enabled: true,
      },
    });
  }

  // Register participant Eve
  await admin("register", {
    name: "Eve Operative",
    roll: "E01",
    phone: "919876543210",
  });

  const updatedSnap: Snapshot = await (
    await request.get("/api/event", { headers })
  ).json();
  const eve = updatedSnap.participants!.find((p) => p.roll === "e01")!;
  await admin("checkin", { id: eve.id, checkedIn: true });

  // Open Participant Mobile Context
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const agent = await context.newPage();
  agent.on("pageerror", (e) => jsErrors.push(e.message));

  await agent.goto(`/login#login=${eve.token}`);
  await expect(
    agent.getByRole("heading", { name: "Current Node" }),
  ).toBeVisible({ timeout: 10000 });

  // Test Station 1: Audio Station
  await admin("override", { id: eve.id, nodeId: "NODE-01", reason: "Test Node 01" });
  await expect(
    agent.getByRole("heading", { name: "The Blackout Audio" }),
  ).toBeVisible({ timeout: 10000 });
  await expect(agent.getByText("FREQUENCY: 14.318 MHz // CARRIER AUDIO")).toBeVisible();
  await agent.getByRole("button", { name: "Synthesize Signal" }).click();
  await expect(agent.getByText("Mute Static Carrier")).toBeVisible();
  await agent.getByRole("button", { name: "Mute Static Carrier" }).click();
  await agent.getByRole("button", { name: "Bandpass Filter" }).click();
  await expect(agent.getByText("Bandpass: ON")).toBeVisible();

  // Test Station 2: Pushpin Map Station
  await admin("override", { id: eve.id, nodeId: "NODE-02", reason: "Test Node 02" });
  await expect(agent.getByText("NIT WARANGAL // SECTOR TRIANGULATION RADAR")).toBeVisible();
  await expect(agent.getByText("STRING OVERLAY: ON")).toBeVisible();
  await agent.getByRole("button", { name: "STRING OVERLAY: ON" }).click();
  await expect(agent.getByText("STRING OVERLAY: OFF")).toBeVisible();

  // Test Station 3: UV Marker Station
  await admin("override", { id: eve.id, nodeId: "NODE-03", reason: "Test Node 03" });
  await expect(agent.getByText("UV FLUORESCENCE // 395nm SPECTRUM")).toBeVisible();
  await expect(agent.getByText("ACTIVATE UV TORCH")).toBeVisible();
  await agent.getByRole("button", { name: "ACTIVATE UV TORCH" }).click();
  await expect(agent.getByText("UV TORCH: ENGAGED")).toBeVisible();
  await expect(agent.getByText("CIPHER TEST BENCH:")).toBeVisible();

  // Test Station 4: Red Filter Station
  await admin("override", { id: eve.id, nodeId: "NODE-04", reason: "Test Node 04" });
  await expect(agent.getByText("CHROMATIC CAMOUFLAGE PLACARD")).toBeVisible();
  await agent.getByRole("button", { name: "ENGAGE RED ACRYLIC SHEET" }).click();
  await expect(agent.getByText("RED SHEET: ENGAGED")).toBeVisible();
  await agent.getByRole("button", { name: "SLOTTED CARDAN GRILLE" }).click();
  await expect(agent.getByText("APERTURE CARD OVERLAY")).toBeVisible();

  // Test Station 5: Redacted Archive Station
  await admin("override", { id: eve.id, nodeId: "NODE-05", reason: "Test Node 05" });
  await expect(agent.getByText("ARCHIVE DOSSIER // DECLASSIFIED PERSONNEL LOG")).toBeVisible();
  await agent.getByRole("button", { name: "SHINE FLASHLIGHT" }).click();
  await expect(agent.getByText("BACKLIGHT: ACTIVE")).toBeVisible();
  await expect(agent.getByText("K. Sharma (K-24)")).toBeVisible();

  // Test Station 6: Dead Drop Handler Station
  await admin("override", { id: eve.id, nodeId: "NODE-06", reason: "Test Node 06" });
  await expect(agent.getByText("HUMINT CONTACT PROTOCOL // DEAD DROP HANDLER")).toBeVisible();
  await agent.getByText("[CLICK TO INSPECT SEALED HANDLER ENVELOPE]").click();
  await expect(agent.getByText("[ENVELOPE UNSEALED // ENTER 4-DIGIT PIN]")).toBeVisible();
  // Click keypad numbers: 8, 3, 9, 1
  await agent.getByRole("button", { name: "8", exact: true }).click();
  await agent.getByRole("button", { name: "3", exact: true }).click();
  await agent.getByRole("button", { name: "9", exact: true }).click();
  await agent.getByRole("button", { name: "1", exact: true }).click();
  await agent.getByRole("button", { name: "Submit answer" }).click();
  await expect(agent.getByText("Node solved. Intel saved.")).toBeVisible();

  // Test Station 7: Rogue Intel Station
  await admin("override", { id: eve.id, nodeId: "NODE-07", reason: "Test Node 07" });
  await expect(agent.getByText("INTERCEPTED INTEL // VERIFICATION PROTOCOL")).toBeVisible();
  await agent.getByRole("button", { name: "View Forensic Intelligence Clues" }).click();
  await expect(agent.getByText("September 26, 2026 is a Saturday, not a Tuesday.")).toBeVisible();
  await agent.getByRole("button", { name: "OPTION B" }).click();
  await agent.getByRole("button", { name: "Submit answer" }).click();
  await expect(agent.getByText("Node solved. Intel saved.")).toBeVisible();

  expect(jsErrors).toEqual([]);
  await context.close();
});
