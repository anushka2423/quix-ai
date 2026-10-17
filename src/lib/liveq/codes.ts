import { randomBytes, randomUUID } from "crypto";

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O, 0, 1, I to avoid confusion

/** Generate a 6-character human-readable join code. */
export function generateJoinCode(): string {
  const bytes = randomBytes(6);
  return Array.from(bytes)
    .map((b) => CHARSET[b % CHARSET.length])
    .join("");
}

/** Generate a secure participant token (UUID v4). */
export function generateParticipantToken(): string {
  return randomUUID();
}
