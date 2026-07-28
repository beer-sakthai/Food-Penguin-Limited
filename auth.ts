import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
if (!process.env.SESSION_SECRET) {
  console.warn(
    "⚠️  SESSION_SECRET is not set — using an insecure default. Set SESSION_SECRET in production."
  );
}

const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  const keyBuf = Buffer.from(key, "hex");
  if (keyBuf.length !== derived.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

export type Role = "Admin" | "Manager" | "Staff" | "User";

export interface SessionPayload {
  username: string;
  role: Role;
  exp: number;
}

function sign(data: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("hex");
}

export function createSessionToken(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expectedSig = sign(body);
  const sigBuf = Buffer.from(sig, "hex");
  const expectedBuf = Buffer.from(expectedSig, "hex");
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload: SessionPayload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
