import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { getSessionByCode, logSessionEvent } from "@/lib/liveq/db";
import { generateParticipantToken } from "@/lib/liveq/codes";
import { badRequestJson } from "@/lib/liveq/auth";

export const dynamic = "force-dynamic";

const NAME_MAX = 32;
const NAME_MIN = 1;

export async function POST(request: NextRequest) {
  const c = db();
  if (!c) return Response.json({ error: "Database not configured" }, { status: 503 });

  const body = await request.json().catch(() => null);
  if (!body) return badRequestJson("Invalid JSON");

  const joinCode = ((body.join_code as string | undefined) ?? "").trim().toUpperCase();
  const displayName = ((body.display_name as string | undefined) ?? "").trim();

  if (!joinCode) return badRequestJson("Join code is required");
  if (displayName.length < NAME_MIN) return badRequestJson("Display name is required");
  if (displayName.length > NAME_MAX) return badRequestJson(`Display name must be ${NAME_MAX} characters or fewer`);

  const session = await getSessionByCode(joinCode);
  if (!session) return Response.json({ error: "Invalid or expired join code" }, { status: 404 });

  // Late-join policy
  if (session.status === "active" || session.status === "paused") {
    const { data: snap } = await c
      .from("lq_quiz_versions")
      .select("snapshot")
      .eq("id", session.quiz_version_id)
      .single();
    const config = (snap?.snapshot as { config?: { allow_late_join?: boolean } })?.config;
    if (!config?.allow_late_join) {
      return Response.json({ error: "This quiz has already started and does not allow late joining" }, { status: 409 });
    }
  }

  // Check for existing participant with same name in this session
  const { data: existing } = await c
    .from("lq_participants")
    .select("id, token")
    .eq("session_id", session.id)
    .eq("display_name", displayName)
    .maybeSingle();

  if (existing) {
    // Return the existing token so the participant can rejoin (page refresh recovery)
    return Response.json({ participant_id: existing.id, token: existing.token, session_id: session.id, display_name: displayName });
  }

  const token = generateParticipantToken();
  const { data: participant, error } = await c
    .from("lq_participants")
    .insert({ session_id: session.id, display_name: displayName, token })
    .select("id, token")
    .single();

  if (error) {
    if (error.code === "23505") return Response.json({ error: "That display name is already taken in this session" }, { status: 409 });
    return Response.json({ error: error.message }, { status: 500 });
  }

  await logSessionEvent(session.id, "participant_joined", { display_name: displayName });

  return Response.json({ participant_id: participant.id, token: participant.token, session_id: session.id, display_name: displayName }, { status: 201 });
}
