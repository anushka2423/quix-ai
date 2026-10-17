import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdminAuth, unauthorizedJson, badRequestJson } from "@/lib/liveq/auth";
import type { QuizConfig } from "@/types/liveq";

export const dynamic = "force-dynamic";

const DEFAULT_CONFIG: QuizConfig = {
  timer_secs: 60,
  points_correct: 100,
  points_incorrect: 0,
  points_unanswered: 0,
  allow_late_join: false,
  show_leaderboard_live: true,
  results_released_by_admin: false,
  allow_pause: true,
  allow_early_end: true,
};

export async function GET() {
  try {
    await requireAdminAuth();
  } catch {
    return unauthorizedJson();
  }

  const c = db();
  if (!c) return Response.json({ error: "Database not configured" }, { status: 503 });

  const { data, error } = await c
    .from("lq_quizzes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Augment with session counts
  const quizIds = (data ?? []).map((q) => q.id);
  let sessionCounts: Record<string, number> = {};
  if (quizIds.length > 0) {
    const { data: sessions } = await c
      .from("lq_sessions")
      .select("quiz_id")
      .in("quiz_id", quizIds);
    for (const s of sessions ?? []) {
      sessionCounts[s.quiz_id] = (sessionCounts[s.quiz_id] ?? 0) + 1;
    }
  }

  return Response.json({
    quizzes: (data ?? []).map((q) => ({
      ...q,
      session_count: sessionCounts[q.id] ?? 0,
    })),
  });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth();
  } catch {
    return unauthorizedJson();
  }

  const c = db();
  if (!c) return Response.json({ error: "Database not configured" }, { status: 503 });

  const body = await request.json().catch(() => null);
  if (!body) return badRequestJson("Invalid JSON");

  const title = (body.title as string | undefined)?.trim();
  if (!title) return badRequestJson("Title is required");

  const { data, error } = await c
    .from("lq_quizzes")
    .insert({
      title,
      description: (body.description as string | undefined)?.trim() || null,
      instructions: (body.instructions as string | undefined)?.trim() || null,
      status: "draft",
      config: { ...DEFAULT_CONFIG, ...(body.config ?? {}) },
    })
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ quiz: data }, { status: 201 });
}
