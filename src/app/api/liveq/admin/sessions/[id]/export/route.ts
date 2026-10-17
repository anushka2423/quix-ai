import { NextRequest } from "next/server";
import { requireAdminAuth, unauthorizedJson, notFoundJson } from "@/lib/liveq/auth";
import { getSession, getAllParticipantResults, getSessionParticipants } from "@/lib/liveq/db";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function escapeCsv(val: string | number | null | undefined): string {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  try { await requireAdminAuth(); } catch { return unauthorizedJson(); }
  const { id } = await params;

  const [session, participants, results] = await Promise.all([
    getSession(id),
    getSessionParticipants(id),
    getAllParticipantResults(id),
  ]);

  if (!session) return notFoundJson("Session not found");

  const participantMap = new Map(participants.map((p) => [p.id, p]));

  const headers = ["Rank", "Display Name", "Score", "Correct", "Incorrect", "Unanswered", "Accuracy %"];
  const rows = results.map((r) => [
    r.rank ?? "",
    participantMap.get(r.participant_id)?.display_name ?? "Unknown",
    r.score,
    r.correct_count,
    r.incorrect_count,
    r.unanswered_count,
    Math.round(r.accuracy * 100),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");
  const filename = `session-${id.slice(0, 8)}-results.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
