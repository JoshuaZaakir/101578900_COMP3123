import express from "express";
import jwt from "jsonwebtoken";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const demoUser = {
  id: "student-101578900",
  name: "Joshua Zaakir",
  email: "demo@studyboard.dev",
};
const salt = randomBytes(16);
const passwordHash = scryptSync("ReduxJWT10!", salt, 64);
const issuer = "studyboard-api";
const audience = "studyboard-client";

// A factory allows isolated tests with an injected signing secret and token lifetime.
export function createApp({
  secret = process.env.JWT_SECRET || randomBytes(48).toString("hex"),
  tokenLifetime = 900,
} = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "8kb" }));
  app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });

  const requireAuth = (req, res, next) => {
    const match = /^Bearer (\S+)$/i.exec(req.get("Authorization") || "");
    if (!match)
      return res.status(401).json({ message: "A Bearer token is required." });
    try {
      // Decoding alone is not authentication: verify signature, algorithm, issuer,
      // audience and expiry before allowing access to the protected resource.
      req.claims = jwt.verify(match[1], secret, {
        algorithms: ["HS256"],
        issuer,
        audience,
      });
      if (req.claims.sub !== demoUser.id)
        return res.status(401).json({ message: "Unknown token subject." });
      next();
    } catch (error) {
      res
        .status(401)
        .json({
          message:
            error.name === "TokenExpiredError"
              ? "Token expired. Sign in again."
              : "Invalid token. Signature or claims verification failed.",
        });
    }
  };

  app.post("/api/auth/login", (req, res) => {
    const { email, password, shortLived = false } = req.body ?? {};
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof shortLived !== "boolean" ||
      password.length > 128
    ) {
      return res
        .status(400)
        .json({
          message:
            "Email, password and a boolean shortLived option are required.",
        });
    }
    const validPassword = timingSafeEqual(
      passwordHash,
      scryptSync(password, salt, 64),
    );
    if (email.toLowerCase().trim() !== demoUser.email || !validPassword) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }
    const expiresIn = shortLived ? 10 : tokenLifetime;
    const token = jwt.sign({ name: demoUser.name }, secret, {
      algorithm: "HS256",
      subject: demoUser.id,
      issuer,
      audience,
      expiresIn,
    });
    res.json({ token, user: demoUser, expiresIn });
  });

  app.get("/api/auth/me", requireAuth, (_req, res) =>
    res.json({ user: demoUser }),
  );
  app.get("/api/tasks", requireAuth, (_req, res) =>
    res.json({
      tasks: [
        { id: "1", title: "Explore the six Redux concepts", completed: true },
        { id: "2", title: "Verify a JWT on the server", completed: false },
        {
          id: "3",
          title: "Capture screenshots and a demo video",
          completed: false,
        },
      ],
    }),
  );
  app.use("/api", (_req, res) =>
    res.status(404).json({ message: "API route not found." }),
  );

  const dist = fileURLToPath(new URL("../dist/", import.meta.url));
  if (existsSync(path.join(dist, "index.html"))) app.use(express.static(dist));
  app.use((error, _req, res, _next) =>
    res
      .status(error.status || 500)
      .json({
        message:
          error.status === 400
            ? "Invalid JSON request body."
            : "The server could not complete the request.",
      }),
  );
  return app;
}
