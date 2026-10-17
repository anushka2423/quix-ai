import { NextRequest } from "next/server";
import { tick } from "@/lib/liveq/engine";

export const dynamic = "force-dynamic";

/** Called by clients (polling) and optionally a cron job. Advances quiz if deadline passed. */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session");
  if (!sessionId) return Response.json({ error: "session param required" }, { status: 400 });

  const session = await tick(sessionId);
  if (!session) return Response.json({ error: "Session not found or DB not configured" }, { status: 404 });

  return Response.json({ status: session.status, question_index: session.current_question_index });
}
