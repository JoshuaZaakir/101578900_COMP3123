import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";

const output = path.resolve(process.env.EVIDENCE_DIR || "evidence");
const appUrl = process.env.APP_URL || "http://127.0.0.1:5174";
const defaultChrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const executablePath =
  process.env.CHROME_PATH ||
  (existsSync(defaultChrome) ? defaultChrome : undefined);
await fs.mkdir(path.join(output, "screenshots"), { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(executablePath ? { executablePath } : {}),
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  recordVideo: {
    dir: path.join(output, "recording"),
    size: { width: 1440, height: 1000 },
  },
});
const page = await context.newPage();
const runtimeErrors = [];
page.on("pageerror", (error) => runtimeErrors.push(error.message));
page.on("response", (response) => {
  if (response.url().startsWith(appUrl) && response.status() >= 500)
    runtimeErrors.push(`${response.status()} ${response.url()}`);
});
const pause = (ms) => page.waitForTimeout(ms);
async function caption(text) {
  await page.evaluate((text) => {
    let el = document.getElementById("demo-caption");
    if (!el) {
      el = document.createElement("div");
      el.id = "demo-caption";
      document.body.appendChild(el);
    }
    Object.assign(el.style, {
      position: "fixed",
      bottom: "18px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: "100",
      padding: "13px 22px",
      borderRadius: "9px",
      background: "#102924f5",
      color: "#e6edc6",
      boxShadow: "0 4px 20px #0003",
      font: "14px sans-serif",
      maxWidth: "90vw",
      textAlign: "center",
      pointerEvents: "none",
      display: "block",
    });
    el.textContent = text;
  }, text);
  await pause(1800);
}
async function shot(name) {
  await page.evaluate(() => {
    const el = document.getElementById("demo-caption");
    if (el) el.style.display = "none";
  });
  await page.screenshot({
    path: path.join(output, "screenshots", name),
    fullPage: true,
  });
}
try {
  await page.goto(appUrl);
  await page
    .getByRole("heading", { name: "Your study session starts here." })
    .waitFor();
  await page.evaluate(() => document.fonts.ready);
  await shot("01-signed-out.png");
  await caption(
    "Lab Exercise 10 • Joshua Zaakir • 101578900 | React Redux + JWT",
  );
  await pause(2500);
  await caption(
    "JWT authentication: protected data requires a valid Bearer token.",
  );
  await page
    .getByRole("button", { name: /Request protected profile without/ })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "401 Unauthorized" })
    .waitFor();
  await pause(2200);

  await caption("Incorrect credentials are rejected by the real Express API.");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: /Sign in to StudyBoard/ }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Incorrect email or password." })
    .waitFor();
  await pause(1500);
  await page.getByLabel("Password", { exact: true }).fill("ReduxJWT10!");
  await caption(
    "Sign in → signed JWT in Redux memory → authenticated GET /api/tasks.",
  );
  await page.getByRole("button", { name: /Sign in to StudyBoard/ }).click();
  await page
    .getByRole("heading", { name: "Make a little progress." })
    .waitFor();
  await page
    .getByLabel("Explore the six Redux concepts", { exact: true })
    .waitFor();
  assert.equal(await page.locator(".task-list li").count(), 3);
  await pause(2000);
  await shot("02-authenticated-workspace.png");

  await caption(
    "JWT claims include subject, issuer, audience, issued-at time and expiration.",
  );
  await page.getByText("Inspect this session’s token", { exact: true }).click();
  await pause(2200);
  await page.getByText("Inspect this session’s token", { exact: true }).click();
  await page
    .getByRole("button", { name: "Verify my token", exact: true })
    .click();
  await page.getByRole("status").filter({ hasText: "200 OK" }).waitFor();
  await pause(2000);
  await shot("03-verified-jwt.png");
  await caption(
    "Changing a payload without re-signing it breaks verification: 401 Unauthorized.",
  );
  await page
    .getByRole("button", { name: "Test tampered token", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "401 Unauthorized" })
    .waitFor();
  await pause(2200);
  await shot("04-tampered-token-rejected.png");

  const before = await page.locator(".subscription-count strong").innerText();
  await caption(
    "Action + dispatch: adding a task dispatches tasks/added to the store.",
  );
  await page
    .getByRole("textbox", { name: "New task", exact: true })
    .fill("Explain Redux and JWT in my own words");
  await page.getByRole("button", { name: "+ Add task", exact: true }).click();
  assert.equal(await page.locator(".task-list li").count(), 4);
  assert.ok(
    Number(await page.locator(".subscription-count strong").innerText()) >
      Number(before),
  );
  await pause(1600);
  await caption(
    "Reducer + state: toggling a task creates the next immutable state.",
  );
  await page
    .getByLabel("Explain Redux and JWT in my own words", { exact: true })
    .check();
  await pause(1500);
  await page.getByRole("button", { name: "Completed", exact: true }).click();
  assert.equal(await page.locator(".task-list li").count(), 2);
  await pause(1500);
  await page.getByRole("button", { name: "Active", exact: true }).click();
  assert.equal(await page.locator(".task-list li").count(), 2);
  await pause(1200);
  await page.getByRole("button", { name: "All", exact: true }).click();
  await shot("05-redux-task-updates.png");
  await caption(
    "Six concepts: state, store, reducer, action, dispatch and subscribe.",
  );
  await page.locator("#concepts").scrollIntoViewIfNeeded();
  await pause(3500);
  await caption(
    "store.subscribe counts notifications. React Redux updates components from the store.",
  );
  await page.locator("#inspector").scrollIntoViewIfNeeded();
  await pause(3500);
  await shot("06-live-redux-inspector.png");
  await page
    .getByRole("button", {
      name: "Delete Explain Redux and JWT in my own words",
      exact: true,
    })
    .click();
  assert.equal(await page.locator(".task-list li").count(), 3);
  assert.match(
    await page.getByLabel("Redux state", { exact: true }).innerText(),
    /held in memory/,
  );
  assert.ok(
    !(
      await page.getByLabel("Redux state", { exact: true }).innerText()
    ).includes("Explain Redux and JWT in my own words"),
  );

  await page.evaluate(() => window.scrollTo(0, 0));
  await caption(
    "Sign out clears the JWT and task state. Nothing is stored in localStorage.",
  );
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page
    .getByRole("heading", { name: "Your study session starts here." })
    .waitFor();
  const cleared = await page
    .getByLabel("Redux state", { exact: true })
    .innerText();
  assert.match(cleared, /"token": null/);
  assert.match(cleared, /"items": \[\]/);
  assert.equal(await page.evaluate(() => localStorage.length), 0);
  await pause(1600);

  await caption("Expiry test: this session uses a real ten-second JWT.");
  await page.getByLabel("Use a 10-second token to test expiry").check();
  await page.getByRole("button", { name: /Sign in to StudyBoard/ }).click();
  await page
    .getByRole("heading", { name: "Make a little progress." })
    .waitFor();
  await pause(1000);
  await page
    .getByRole("button", { name: "Verify my token", exact: true })
    .click();
  await page.getByRole("status").filter({ hasText: "200 OK" }).waitFor();
  await caption(
    "The server checks expiration; the client also clears the session at expiry.",
  );
  await page
    .getByRole("status")
    .filter({ hasText: "Your token expired." })
    .waitFor({ timeout: 15000 });
  await pause(1800);
  await shot("07-expired-session.png");
  await caption(
    "Verified: JWT login, protected routes, signature rejection, Redux updates and expiry.",
  );
  await pause(2500);

  // Reload establishes that tokens and session task edits were not persisted.
  await page.reload();
  await page
    .getByRole("heading", { name: "Your study session starts here." })
    .waitFor();
  assert.equal(runtimeErrors.length, 0, runtimeErrors.join("\n"));
  const video = page.video();
  await context.close();
  await video.saveAs(path.join(output, "lab10-demo.webm"));
  await video.delete();

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const mobilePage = await mobile.newPage();
  mobilePage.on("pageerror", (error) => runtimeErrors.push(error.message));
  await mobilePage.goto(appUrl);
  await mobilePage
    .getByRole("button", { name: /Sign in to StudyBoard/ })
    .click();
  await mobilePage
    .getByRole("heading", { name: "Make a little progress." })
    .waitFor();
  await mobilePage
    .getByLabel("Explore the six Redux concepts", { exact: true })
    .waitFor();
  assert.ok(
    await mobilePage.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Mobile horizontal overflow",
  );
  await mobilePage.screenshot({
    path: path.join(output, "screenshots", "08-mobile-workspace.png"),
    fullPage: true,
  });
  await mobile.close();
  assert.deepEqual(runtimeErrors, []);
  const report =
    "PASS: missing-token rejection; wrong-password error; JWT login; protected tasks; valid-token verification; tampered-token rejection; Redux add/toggle/filter/delete; subscriber notifications; sign-out clears state; ten-second expiry; refresh clears session; 390px mobile layout; no uncaught runtime errors or local HTTP 5xx responses.\n";
  await fs.writeFile(path.join(output, "browser-verification.txt"), report);
  console.log(report + `Evidence saved to ${output}`);
} finally {
  await browser.close();
}
