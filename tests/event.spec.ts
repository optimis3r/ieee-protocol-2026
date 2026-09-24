import { test, expect } from "@playwright/test";
import fs from "node:fs";
import type { Snapshot } from "../src/lib/event/types";

test.beforeAll(() => {
  fs.rmSync("/tmp/protocol-browser-test", { recursive: true, force: true });
});
test("full event workflow and API authorization", async ({
  page,
  request,
  browser,
}) => {
  const jsErrors: string[] = [];
  page.on("pageerror", (e) => jsErrors.push(e.message));
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
  let snap: Snapshot = await (
    await request.get("/api/event", { headers })
  ).json();
  const rules = {
    ...snap.rules,
    phase: "SUBMISSIONS_OPEN",
    deadline: new Date(Date.now() + 7200000).toISOString(),
  };
  await admin("rules", { rules });
  const n2 = snap.adminNodes![1];
  await admin("node", {
    id: n2.id,
    node: {
      ...n2,
      answers: ["C301"],
      options: ["C301", "C302"],
      enabled: true,
      minSeconds: 0,
    },
  });
  await page.getByRole("button", { name: "Registration", exact: true }).click();
  await page
    .getByLabel("CSV contents")
    .fill(
      "name,roll,phone\nAlice,A1,919123456789\nDuplicate,A1,919123456780\nBob,B1,919123456788",
    );
  await page.getByRole("button", { name: "Validate & preview" }).click();
  await expect(
    page.getByText("Duplicate roll number or phone", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Import validated records" }).click();
  await expect(page.getByRole("status")).toContainText("Saved");
  snap = await (await request.get("/api/event", { headers })).json();
  expect(snap.participants!.length).toBe(2);
  const p = snap.participants![0],
    bob = snap.participants![1];
  expect((await request.get("/api/event")).status()).toBe(401);
  expect((await request.get("/api/participants?format=csv")).status()).toBe(
    410,
  );
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const agent = await context.newPage();
  agent.on("pageerror", (e) => jsErrors.push(e.message));
  await agent.goto(`/login#login=${p.token}`);
  await expect(
    agent.getByText("Present your interaction QR at the desk to check in."),
  ).toBeVisible();
  const denied = await context.request.post("/api/event", {
    data: {
      action: "start",
      nodeId: "NODE-01",
      requestId: crypto.randomUUID(),
    },
  });
  expect(denied.status()).toBe(403);
  const hostile = await context.request.post("/api/event", {
    data: { action: "rules", rules, requestId: crypto.randomUUID() },
  });
  expect(hostile.ok()).toBeFalsy();
  await admin("checkin", { id: p.id, checkedIn: true });
  await admin("override", {
    id: p.id,
    nodeId: "NODE-01",
    reason: "Browser test",
  });
  await expect(
    agent.getByRole("heading", { name: "The Blackout Audio" }),
  ).toBeVisible({ timeout: 10000 });
  await agent.getByLabel("Your answer", { exact: true }).fill("1745");
  await agent
    .getByRole("button", { name: "Submit answer", exact: true })
    .click();
  await expect(
    agent.getByText("Node solved. Intel saved.", { exact: true }),
  ).toBeVisible();
  await agent.reload();
  await expect(
    agent.getByText("Recovered intel: 17:45", { exact: true }),
  ).toBeVisible();
  await agent.screenshot({
    path: "test-results/participant-mobile.png",
    fullPage: true,
  });
  const self: Snapshot = await (await context.request.get("/api/event")).json();
  expect(self.participants).toBeUndefined();
  expect(self.nodes[0]).not.toHaveProperty("answers");
  expect(self.leaderboard).toBeNull();
  await admin("checkin", { id: bob.id, checkedIn: true });
  const bobContext = await browser.newContext();
  await bobContext.request.post("/api/event", {
    data: { action: "login", token: bob.token },
  });
  async function player(
    ctx: typeof context,
    action: string,
    body: Record<string, unknown>,
  ) {
    const res = await ctx.request.post("/api/event", {
      data: { action, requestId: crypto.randomUUID(), ...body },
    });
    expect(res.ok(), await res.text()).toBeTruthy();
    return res.json();
  }
  await player(bobContext, "start", { nodeId: "NODE-01" });
  await player(bobContext, "answer", { nodeId: "NODE-01", answer: "1745" });
  await player(context, "handshake", { peer: bob.socialToken });
  await player(context, "trust_invite", { peer: bob.socialToken });
  const before: Snapshot = await (
    await context.request.get("/api/event")
  ).json();
  const id = before.encounters[0].id;
  await player(context, "trust_choice", { id, choice: "cooperate" });
  const hidden: Snapshot = await (
    await bobContext.request.get("/api/event")
  ).json();
  expect(hidden.encounters[0].choices).toEqual({});
  await player(bobContext, "trust_choice", { id, choice: "cooperate" });
  // Two concurrent retries of one final submission consume a single attempt.
  const retryBody = {
    action: "main",
    requestId: crypto.randomUUID(),
    answers: ["wrong", "wrong", "wrong", "wrong"],
  };
  const retries = await Promise.all([
    bobContext.request.post("/api/event", { data: retryBody }),
    bobContext.request.post("/api/event", { data: retryBody }),
  ]);
  for (const res of retries) expect(res.ok()).toBeTruthy();
  const bobAfterRetry: Snapshot = await (
    await bobContext.request.get("/api/event")
  ).json();
  expect(bobAfterRetry.participant!.main.length).toBe(1);
  expect(bobAfterRetry.participant!.score).toBe(35);
  await agent.getByRole("button", { name: "Main Node", exact: true }).click();
  for (const [label, value] of [
    ["WHO", "K-24"],
    ["WHERE", "C301"],
    ["WHEN", "1745"],
    ["WHAT", "Bypass Protocol Alpha"],
  ])
    await agent.getByLabel(label, { exact: true }).fill(value);
  await agent.getByRole("button", { name: "Submit deduction" }).click();
  await expect(
    agent.getByText("Master Deduction complete. Your results are saved."),
  ).toBeVisible();
  const final: Snapshot = await (
    await context.request.get("/api/event")
  ).json();
  expect(final.participant!.score).toBe(235);
  await admin("broadcast", {
    title: "Final dispatch",
    body: "Return to the operations desk.",
  });
  await expect(
    agent.getByText("Return to the operations desk.", { exact: true }),
  ).toBeVisible({ timeout: 10000 });
  await admin("rules", { rules: { ...rules, leaderboardVisible: true } });
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await page.screenshot({
    path: "test-results/admin-desktop.png",
    fullPage: true,
  });
  await admin("rules", { rules: { ...rules, leaderboardVisible: false } });
  const pub = await (await request.get("/api/event?view=public")).json();
  expect(pub.leaderboard).toBeNull();
  await admin("rotate", { id: bob.id });
  expect((await bobContext.request.get("/api/event")).status()).toBe(401);
  await admin("rules", {
    rules: { ...rules, phase: "EVENT_CLOSED", leaderboardVisible: true },
  });
  await admin("rules", {
    rules: { ...rules, phase: "RESULTS_LOCKED", leaderboardVisible: true },
  });
  expect(
    (
      await request.post("/api/event", {
        headers,
        data: {
          action: "adjust",
          id: p.id,
          delta: 1,
          reason: "late",
          requestId: crypto.randomUUID(),
        },
      })
    ).status(),
  ).toBe(409);
  const exported = await request.get("/api/event?view=export&format=json", {
    headers,
  });
  expect(exported.ok()).toBeTruthy();
  expect(jsErrors).toEqual([]);
  await context.close();
  await bobContext.close();
});
