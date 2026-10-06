import { adminFetchModules } from "@/lib/admin-supabase";
import AdminClient from "./_components/AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const modules = await adminFetchModules();
  return <AdminClient initialModules={modules} />;
}
