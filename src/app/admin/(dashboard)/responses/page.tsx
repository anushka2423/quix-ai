import { adminFetchResponses } from "@/lib/admin-supabase";
import ResponsesClient from "./_components/ResponsesClient";

export default async function ResponsesPage() {
  const responses = await adminFetchResponses();
  return <ResponsesClient responses={responses} />;
}
