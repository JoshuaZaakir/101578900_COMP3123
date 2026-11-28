import { mkdirSync, writeFileSync } from "node:fs";

const check = (name, condition) =>
  `pm.test(${JSON.stringify(name)}, () => { ${condition} });`;
const item = (
  name,
  method,
  path,
  status,
  body,
  token,
  tests = [],
  pre = [],
) => ({
  name,
  request: {
    method,
    header: [
      { key: "Content-Type", value: "application/json" },
      ...(token ? [{ key: "Authorization", value: `Bearer ${token}` }] : []),
    ],
    url: `{{baseUrl}}${path}`,
    description: `${name}. Expected HTTP ${status}. See README.md for the API contract.`,
    ...(body
      ? {
          body: {
            mode: "raw",
            raw: JSON.stringify(body),
            options: { raw: { language: "json" } },
          },
        }
      : {}),
  },
  event: [
    ...(pre.length
      ? [
          {
            listen: "prerequest",
            script: { type: "text/javascript", exec: pre },
          },
        ]
      : []),
    {
      listen: "test",
      script: {
        type: "text/javascript",
        exec: [
          check(`HTTP ${status}`, `pm.response.to.have.status(${status});`),
          ...tests,
        ],
      },
    },
  ],
});
const credentials = { email: "demo@studyboard.dev", password: "ReduxJWT10!" };
const collection = {
  info: {
    name: "StudyBoard — Lab Exercise 10",
    description:
      "Local runnable API contract: valid login, invalid credentials, protected resources and JWT tampering. Demo credentials are intentionally public. No remote workspace is required.",
    schema:
      "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    { key: "baseUrl", value: "http://127.0.0.1:3010/api" },
    { key: "token", value: "" },
    { key: "tampered", value: "" },
  ],
  item: [
    item(
      "Profile requires authentication",
      "GET",
      "/auth/me",
      401,
      null,
      null,
      [
        check(
          "Useful missing-token error",
          'pm.expect(pm.response.json().message).to.include("Bearer");',
        ),
      ],
    ),
    item("Tasks require authentication", "GET", "/tasks", 401),
    item("Reject malformed login input", "POST", "/auth/login", 400, {
      email: credentials.email,
    }),
    item("Reject wrong password", "POST", "/auth/login", 401, {
      ...credentials,
      password: "wrong",
    }),
    item("Issue signed JWT", "POST", "/auth/login", 200, credentials, null, [
      check(
        "Three token parts",
        'pm.expect(pm.response.json().token.split(".")).to.have.lengthOf(3);',
      ),
      check(
        "Fifteen minute lifetime",
        "pm.expect(pm.response.json().expiresIn).to.equal(900);",
      ),
      check(
        "No password in returned user",
        'pm.expect(pm.response.json().user).not.to.have.property("password");',
      ),
      'pm.collectionVariables.set("token", pm.response.json().token);',
    ]),
    item("Read protected profile", "GET", "/auth/me", 200, null, "{{token}}", [
      check(
        "Correct user",
        'pm.expect(pm.response.json().user.email).to.equal("demo@studyboard.dev");',
      ),
    ]),
    item("Read protected tasks", "GET", "/tasks", 200, null, "{{token}}", [
      check(
        "Three seed tasks",
        "pm.expect(pm.response.json().tasks).to.have.lengthOf(3);",
      ),
      check(
        "Task shape",
        'pm.response.json().tasks.forEach(task => { pm.expect(task).to.have.all.keys("id", "title", "completed"); });',
      ),
      check(
        "No caching",
        'pm.expect(pm.response.headers.get("Cache-Control")).to.equal("no-store");',
      ),
    ]),
    item(
      "Reject tampered JWT",
      "GET",
      "/auth/me",
      401,
      null,
      "{{tampered}}",
      [
        check(
          "Signature verification error",
          'pm.expect(pm.response.json().message).to.include("verification failed");',
        ),
      ],
      [
        'const parts = pm.collectionVariables.get("token").split(".");',
        'parts[1] = "eyJzdWIiOiJpbnRydWRlciJ9"; // {"sub":"intruder"}, with original signature',
        'pm.collectionVariables.set("tampered", parts.join("."));',
      ],
    ),
    item("Reject malformed JWT", "GET", "/auth/me", 401, null, "not.a.jwt"),
    item(
      "Issue short-lived token",
      "POST",
      "/auth/login",
      200,
      { ...credentials, shortLived: true },
      null,
      [
        check(
          "Ten second lifetime",
          "pm.expect(pm.response.json().expiresIn).to.equal(10);",
        ),
      ],
    ),
    item("Unknown API route", "GET", "/unknown", 404),
  ],
};
mkdirSync("postman", { recursive: true });
writeFileSync(
  "postman/StudyBoard.postman_collection.json",
  JSON.stringify(collection, null, 2) + "\n",
);
console.log("Saved runnable Postman collection.");
