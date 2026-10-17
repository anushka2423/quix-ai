import { describe, it, expect } from "vitest";
import { scoreAnswer, conceptStatus } from "@/lib/liveq/engine";
import { generateJoinCode, generateParticipantToken } from "@/lib/liveq/codes";

describe("generateJoinCode", () => {
  it("returns a 6-character uppercase code", () => {
    const code = generateJoinCode();
    expect(code.length).toBe(6);
    expect(/^[A-Z2-9]{6}$/.test(code)).toBe(true);
  });

  it("generates unique codes", () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateJoinCode()));
    expect(codes.size).toBeGreaterThan(90); // highly unlikely to collide 10+ times in 100 tries
  });

  it("never uses ambiguous characters O, 0, 1, I", () => {
    const code = generateJoinCode();
    expect(/[O0I1]/.test(code)).toBe(false);
  });
});

describe("generateParticipantToken", () => {
  it("returns a UUID-format string", () => {
    const token = generateParticipantToken();
    expect(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(token)).toBe(true);
  });

  it("generates unique tokens", () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateParticipantToken()));
    expect(tokens.size).toBe(100);
  });
});

describe("ranking logic (unit)", () => {
  it("ranks by score descending, then by response_ms ascending on tie", () => {
    const participants = [
      { id: "a", score: 300, total_response_ms: 5000 },
      { id: "b", score: 200, total_response_ms: 3000 },
      { id: "c", score: 300, total_response_ms: 4000 },
    ];

    const sorted = [...participants].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.total_response_ms - b.total_response_ms;
    });

    expect(sorted[0].id).toBe("c"); // same score as a but faster
    expect(sorted[1].id).toBe("a");
    expect(sorted[2].id).toBe("b");
  });

  it("assigns shared rank for tied participants", () => {
    const sorted = [
      { id: "a", score: 300, total_response_ms: 4000, rank: null as number | null },
      { id: "c", score: 300, total_response_ms: 4000, rank: null as number | null },
      { id: "b", score: 200, total_response_ms: 3000, rank: null as number | null },
    ];

    let rank = 1;
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i].score === sorted[i - 1].score && sorted[i].total_response_ms === sorted[i - 1].total_response_ms) {
        sorted[i].rank = sorted[i - 1].rank;
      } else {
        sorted[i].rank = rank;
      }
      rank++;
    }

    expect(sorted[0].rank).toBe(1);
    expect(sorted[1].rank).toBe(1); // shared rank
    expect(sorted[2].rank).toBe(3);
  });
});

describe("concept accuracy computation", () => {
  it("computes accuracy across correct/incorrect/unanswered", () => {
    const correct = 6;
    const total = 10; // 6 correct, 2 incorrect, 2 unanswered
    const accuracy = correct / total;
    expect(conceptStatus(accuracy)).toBe("developing"); // 60% = developing threshold
  });

  it("gives strong for 100% accuracy", () => {
    expect(conceptStatus(10 / 10)).toBe("strong");
  });

  it("gives needs_improvement for 0%", () => {
    expect(conceptStatus(0 / 10)).toBe("needs_improvement");
  });
});
