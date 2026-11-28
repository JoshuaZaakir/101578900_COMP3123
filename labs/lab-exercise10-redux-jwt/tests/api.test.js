import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { createApp } from "../server/app.js";

const secret = "test-only-secret-never-used-by-the-running-app";
let server, base, token;
before(async () => {
  server = createApp({ secret }).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((resolve) => server.close(resolve)));

const request = (route, tokenValue, options = {}) =>
  fetch(base + route, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(tokenValue ? { Authorization: `Bearer ${tokenValue}` } : {}),
    },
  });
const sign = (claims = {}, options = {}) =>
  jwt.sign(claims, secret, {
    algorithm: "HS256",
    subject: "student-101578900",
    issuer: "studyboard-api",
    audience: "studyboard-client",
    expiresIn: 900,
    ...options,
  });

test("protected profile and tasks require a Bearer token", async () => {
  for (const route of ["/api/auth/me", "/api/tasks"])
    assert.equal((await request(route)).status, 401);
});
test("login validates request shape and rejects wrong credentials", async () => {
  for (const [body, status] of [
    [{}, 400],
    [{ email: "demo@studyboard.dev", password: "bad" }, 401],
    [{ email: "wrong@example.com", password: "ReduxJWT10!" }, 401],
    [
      {
        email: "demo@studyboard.dev",
        password: "ReduxJWT10!",
        shortLived: "yes",
      },
      400,
    ],
  ]) {
    assert.equal(
      (
        await request("/api/auth/login", null, {
          method: "POST",
          body: JSON.stringify(body),
        })
      ).status,
      status,
    );
  }
});
test("valid login issues verifiable expiring token without password or secret", async () => {
  const response = await request("/api/auth/login", null, {
    method: "POST",
    body: JSON.stringify({
      email: "demo@studyboard.dev",
      password: "ReduxJWT10!",
    }),
  });
  assert.equal(response.status, 200);
  const data = await response.json();
  token = data.token;
  const claims = jwt.verify(token, secret, {
    algorithms: ["HS256"],
    issuer: "studyboard-api",
    audience: "studyboard-client",
  });
  assert.equal(claims.sub, "student-101578900");
  assert.equal(claims.exp - claims.iat, 900);
  assert.equal(data.user.password, undefined);
  assert.equal(claims.password, undefined);
  assert.equal(JSON.stringify(data).includes(secret), false);
});
test("verified token grants profile and seeded task access", async () => {
  const profile = await request("/api/auth/me", token);
  assert.equal(profile.status, 200);
  assert.equal((await profile.json()).user.email, "demo@studyboard.dev");
  const response = await request("/api/tasks", token);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).tasks.length, 3);
  assert.equal(response.headers.get("cache-control"), "no-store");
});
test("tampered payload cannot authenticate with the original signature", async () => {
  const parts = token.split(".");
  parts[1] = Buffer.from(
    JSON.stringify({ ...jwt.decode(token), sub: "intruder" }),
  ).toString("base64url");
  assert.equal((await request("/api/auth/me", parts.join("."))).status, 401);
});
test("expired, wrong issuer/audience/subject, wrong algorithm and malformed tokens are rejected", async () => {
  for (const candidate of [
    sign({}, { expiresIn: -1 }),
    sign({}, { issuer: "wrong" }),
    sign({}, { audience: "wrong" }),
    sign({}, { subject: "intruder" }),
    sign({}, { algorithm: "HS384" }),
    "not.a.jwt",
    jwt.sign({}, "wrong-secret"),
  ]) {
    assert.equal((await request("/api/auth/me", candidate)).status, 401);
  }
});
test("short-lived demonstration tokens really expire on the API", async () => {
  const response = await request("/api/auth/login", null, {
    method: "POST",
    body: JSON.stringify({
      email: "demo@studyboard.dev",
      password: "ReduxJWT10!",
      shortLived: true,
    }),
  });
  const data = await response.json();
  assert.equal(data.expiresIn, 10);
  assert.equal(jwt.decode(data.token).exp - jwt.decode(data.token).iat, 10);
  // Separate 1-second app avoids waiting ten seconds in this regression test.
  const shortServer = createApp({ secret, tokenLifetime: 1 }).listen(
    0,
    "127.0.0.1",
  );
  await new Promise((resolve) => shortServer.once("listening", resolve));
  try {
    const shortBase = `http://127.0.0.1:${shortServer.address().port}`;
    const login = await fetch(`${shortBase}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "demo@studyboard.dev",
        password: "ReduxJWT10!",
      }),
    });
    const { token: shortToken } = await login.json();
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const expired = await fetch(`${shortBase}/api/tasks`, {
      headers: { Authorization: `Bearer ${shortToken}` },
    });
    assert.equal(expired.status, 401);
    assert.match((await expired.json()).message, /expired/);
  } finally {
    await new Promise((resolve) => shortServer.close(resolve));
  }
});
test("malformed JSON and unknown routes return useful API errors", async () => {
  assert.equal(
    (await request("/api/auth/login", null, { method: "POST", body: "{" }))
      .status,
    400,
  );
  assert.equal((await request("/api/unknown")).status, 404);
});
