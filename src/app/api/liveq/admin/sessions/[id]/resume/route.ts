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
  if (session.status !== "paused") return badRequestJson("Session is not paused");

  const remainingSecs = session.question_remaining_secs ?? 10;
  const newDeadline = new Date(Date.now() + remainingSecs * 1000).toISOString();

  const { error } = await c
    .from("lq_sessions")
    .update({ status: "active", question_deadline: newDeadline, question_remaining_secs: null })
    .eq("id", id)
    .eq("status", "paused");

  if (error) return Response.json({ error: error.message }, { status: 500 });

  await logSessionEvent(id, "quiz_resumed", { new_deadline: newDeadline });

  return Response.json({ ok: true, deadline: newDeadline });
}
