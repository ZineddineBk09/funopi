import crypto from "node:crypto";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "bored-secret";

const SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

type TokenPayload = {
  username: string;
  exp: number;
};

function encodePayload(payload: TokenPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function sign(payload: string) {
  return crypto
    .createHmac("sha256", ADMIN_SESSION_SECRET)
    .update(payload)
    .digest("base64url");
}

function decodePayload(token: string): TokenPayload | null {
  try {
    return JSON.parse(Buffer.from(token, "base64url").toString());
  } catch (error) {
    console.error("Failed to decode admin token payload:", error);
    return null;
  }
}

export function validateAdminCredentials(username: string, password: string) {
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_USERNAME and ADMIN_PASSWORD must be configured in environment variables."
    );
  }
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function createAdminSessionToken(username: string) {
  const payload: TokenPayload = {
    username,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = encodePayload(payload);
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifyAdminSessionToken(token?: string | null) {
  if (!token) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }
  const expectedSignature = sign(encodedPayload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }
  const payload = decodePayload(encodedPayload);
  if (!payload) return null;
  if (payload.exp * 1000 < Date.now()) {
    return null;
  }
  if (payload.username !== ADMIN_USERNAME) {
    return null;
  }
  return payload;
}

export const ADMIN_SESSION_COOKIE_NAME = SESSION_COOKIE;
export const ADMIN_SESSION_MAX_AGE = SESSION_TTL_SECONDS;

