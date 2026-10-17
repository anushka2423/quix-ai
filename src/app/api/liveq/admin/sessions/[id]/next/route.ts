import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdminAuth, unauthorizedJson, notFoundJson } from "@/lib/liveq/auth";
import { advanceToNextQuestion } from "@/lib/liveq/engine";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Ctx) {
  try { await requireAdminAuth(); } catch { return unauthorizedJson(); }
  const { id } = await params;
  const c = db();
  if (!c) return Response.json({ error: "Database not configured" }, { status: 503 });

  const result = await advanceToNextQuestion(id);
  if (!result.ok) {
    if (result.error === "Session not found") return notFoundJson("Session not found");
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ ok: true, done: result.done });
}
