import type { LQParticipant } from "@/types/liveq";

// Module-level caches — shared within a single serverless instance.
// Cross-instance skew is acceptable for leaderboards (within TTL).

const LEADERBOARD_TTL_MS = 3_000;
const TOUCH_DEBOUNCE_MS = 10_000;

interface CachedParticipants {
  participants: LQParticipant[];
  fetchedAt: number;
}

const leaderboardCache = new Map<string, CachedParticipants>();
const lastTouchMap = new Map<string, number>();

export function getCachedParticipants(sessionId: string): LQParticipant[] | null {
  const entry = leaderboardCache.get(sessionId);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > LEADERBOARD_TTL_MS) {
    leaderboardCache.delete(sessionId);
    return null;
  }
  return entry.participants;
}

export function setCachedParticipants(sessionId: string, participants: LQParticipant[]): void {
  leaderboardCache.set(sessionId, { participants, fetchedAt: Date.now() });
}

export function invalidateLeaderboardCache(sessionId: string): void {
  leaderboardCache.delete(sessionId);
}

/** Returns true if we should skip the DB touch (updated recently enough). */
export function shouldSkipTouch(participantId: string): boolean {
  const last = lastTouchMap.get(participantId);
  if (!last) return false;
  return Date.now() - last < TOUCH_DEBOUNCE_MS;
}

export function recordTouch(participantId: string): void {
  lastTouchMap.set(participantId, Date.now());
}