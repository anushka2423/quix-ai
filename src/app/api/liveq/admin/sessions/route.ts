import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdminAuth, unauthorizedJson, badRequestJson } from "@/lib/liveq/auth";
import { generateJoinCode } from "@/lib/liveq/codes";
import { logSessionEvent } from "@/lib/liveq/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try { await requireAdminAuth(); } catch { return unauthorizedJson(); }
  const c = db();
  if (!c) return Response.json({ error: "Database not configured" }, { status: 503 });

  const body = await request.json().catch(() => null);
  if (!body) return badRequestJson("Invalid JSON");

  const quizId = body.quiz_id as string | undefined;
  if (!quizId) return badRequestJson("quiz_id is required");

  // Get the latest published version for this quiz
  const { data: quiz } = await c
    .from("lq_quizzes")
    .select("id, status")
    .eq("id", quizId)
    .single();

  if (!quiz) return badRequestJson("Quiz not found");
  if (quiz.status !== "published") return badRequestJson("Quiz must be published before creating a session");

  const { data: version } = await c
    .from("lq_quiz_versions")
    .select("id")
    .eq("quiz_id", quizId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!version) return badRequestJson("No published version found for this quiz");

  // Generate unique join code with collision retry
  let joinCode = "";
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateJoinCode();
    const { data: existing } = await c
      .from("lq_sessions")
      .select("id")
      .eq("join_code", candidate)
      .in("status", ["lobby", "active", "paused"])
      .maybeSingle();
    if (!existing) { joinCode = candidate; break; }
  }
  if (!joinCode) return Response.json({ error: "Failed to generate unique join code" }, { status: 500 });

  const { data: session, error } = await c
    .from("lq_sessions")
    .insert({
      quiz_id: quizId,
      quiz_version_id: version.id,
      join_code: joinCode,
      status: "lobby",
    })
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  await logSessionEvent(session.id, "session_created", { quiz_id: quizId, join_code: joinCode });

  return Response.json({ session }, { status: 201 });
}
