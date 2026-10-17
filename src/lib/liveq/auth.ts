import { cookies } from "next/headers";

const SESSION_VALUE = "quix_admin_v1";

/** Throws if the request is not authenticated as admin. */
export async function requireAdminAuth(): Promise<void> {
  const store = await cookies();
  if (store.get("admin_session")?.value !== SESSION_VALUE) {
    throw new Error("Not authorised");
  }
}

export function unauthorizedJson() {
  return Response.json({ error: "Not authorised" }, { status: 401 });
}

export function badRequestJson(msg: string) {
  return Response.json({ error: msg }, { status: 400 });
}

export function notFoundJson(msg = "Not found") {
  return Response.json({ error: msg }, { status: 404 });
}
