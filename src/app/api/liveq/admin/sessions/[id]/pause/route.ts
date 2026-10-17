import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdminAuth, unauthorizedJson, badRequestJson, notFoundJson } from "@/lib/liveq/auth";
import { getSession, logSessionEvent } from "@/lib/liveq/db";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Ctx) {
  try { await requireAdminAuth(); } catch { return unauthorizedJson(); }
  const { id } = await params;
  const c = db();
  if (!c) return Response.json({ error: "Database not configured" }, { status: 503 });

  const session = await getSession(id);
  if (!session) return notFoundJson("Session not found");
  if (session.status !== "active") return badRequestJson("Session is not active");

  // Calculate remaining time at the moment of pause
  const now = Date.now();
  const deadline = session.question_deadline ? new Date(session.question_deadline).getTime() : now;
  const remainingSecs = Math.max(0, Math.ceil((deadline - now) / 1000));

  const { error } = await c
    .from("lq_sessions")
    .update({ status: "paused", question_remaining_secs: remainingSecs, question_deadline: null })
    .eq("id", id)
    .eq("status", "active");

  if (error) return Response.json({ error: error.message }, { status: 500 });

  await logSessionEvent(id, "quiz_paused", { remaining_secs: remainingSecs });

  return Response.json({ ok: true, remaining_secs: remainingSecs });
}
