import express from "express";
import { getUserByUsername } from "../db";
import { verifyPassword, createSessionToken, verifySessionToken, Role, SessionPayload } from "../auth";

// Session cookie is an HMAC-signed, httpOnly token (see ../auth.ts). Role
// lives only in this signed cookie; the client can no longer set its own
// role via localStorage or a UI dropdown.
export const SESSION_COOKIE = "fp_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h

const PUBLIC_API_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/me",
  "/api/health",
]);

declare global {
  namespace Express {
    interface Request {
      user?: SessionPayload;
    }
  }
}

export function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.path.startsWith("/api/") || PUBLIC_API_PATHS.has(req.path)) {
    return next();
  }
  const session = verifySessionToken(req.cookies?.[SESSION_COOKIE]);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  req.user = session;
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

export const authRouter = express.Router();

authRouter.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  const user = getUserByUsername(username);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  const token = createSessionToken({
    username: user.username,
    role: user.role as Role,
    exp: Date.now() + SESSION_TTL_MS,
  });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS,
  });
  res.json({ username: user.username, role: user.role });
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE);
  res.json({ ok: true });
});

authRouter.get("/me", (req, res) => {
  const session = verifySessionToken(req.cookies?.[SESSION_COOKIE]);
  if (!session) return res.status(401).json({ error: "Not authenticated" });
  res.json({ username: session.username, role: session.role });
});
