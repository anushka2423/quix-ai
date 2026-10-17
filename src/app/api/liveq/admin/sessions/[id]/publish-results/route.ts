import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdminAuth, unauthorizedJson, badRequestJson, notFoundJson } from "@/lib/liveq/auth";
import { logSessionEvent } from "@/lib/liveq/db";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Ctx) {
  try { await requireAdminAuth(); } catch { return unauthorizedJson(); }
  const { id } = await params;
  const c = db();
  if (!c) return Response.json({ error: "Database not configured" }, { status: 503 });

  const { data: session } = await c.from("lq_sessions").select("status").eq("id", id).single();
  if (!session) return notFoundJson("Session not found");
  if (session.status !== "completed") return badRequestJson("Session must be completed before publishing results");

  const { error } = await c.from("lq_sessions").update({ results_published: true }).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  await logSessionEvent(id, "results_published", { published_at: new Date().toISOString() });
  return Response.json({ ok: true });
}
