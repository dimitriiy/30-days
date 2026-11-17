import crypto from "node:crypto";

export const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const HEADER = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");

function signingKey(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must be at least 32 characters");
  return secret;
}

export function signToken(userId: number, ttlMs = TOKEN_TTL_MS): string {
  const payload = Buffer.from(JSON.stringify({ sub: String(userId), exp: Math.floor((Date.now() + ttlMs) / 1000) })).toString("base64url");
  const data = `${HEADER}.${payload}`;
  return `${data}.${crypto.createHmac("sha256", signingKey()).update(data).digest("base64url")}`;
}

export function verifyToken(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  if (header !== HEADER || !/^[A-Za-z0-9_-]+$/.test(payload) || !/^[A-Za-z0-9_-]{43}$/.test(signature)) return null;
  const expected = crypto.createHmac("sha256", signingKey()).update(`${header}.${payload}`).digest();
  const received = Buffer.from(signature, "base64url");
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return null;
  try {
    const claims: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!claims || typeof claims !== "object" || !("sub" in claims) || !("exp" in claims)) return null;
    const { sub, exp } = claims;
    const id = Number(sub);
    return typeof sub === "string" && /^\d+$/.test(sub) && Number.isSafeInteger(id) && id > 0 &&
      typeof exp === "number" && Number.isInteger(exp) && exp > Math.floor(Date.now() / 1000) ? id : null;
  } catch {
    return null;
  }
}
