import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdminAuth, unauthorizedJson, badRequestJson, notFoundJson } from "@/lib/liveq/auth";
import { getSession, getPrivateSnapshot, logSessionEvent } from "@/lib/liveq/db";
import { generateFinalResults } from "@/lib/liveq/engine";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Ctx) {
  try { await requireAdminAuth(); } catch { return unauthorizedJson(); }
  const { id } = await params;
  const c = db();
  if (!c) return Response.json({ error: "Database not configured" }, { status: 503 });

  const session = await getSession(id);
  if (!session) return notFoundJson("Session not found");
  if (session.status === "completed") return badRequestJson("Session is already completed");
  if (session.status === "lobby") return badRequestJson("Session has not started yet");

  const now = new Date().toISOString();
  const { error } = await c
    .from("lq_sessions")
    .update({ status: "completed", completed_at: now, question_deadline: null, results_published: true })
    .eq("id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const snapshot = await getPrivateSnapshot(session.quiz_version_id);
  if (snapshot) await generateFinalResults(id, snapshot);

  await logSessionEvent(id, "quiz_ended_early", { ended_at: now });

  return Response.json({ ok: true });
}
