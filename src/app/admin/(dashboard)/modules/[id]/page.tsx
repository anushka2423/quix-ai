import { adminFetchModule, adminFetchQuestions } from "@/lib/admin-supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import ModuleDetailClient from "../../_components/ModuleDetailClient";

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const moduleId = Number(id);

  const [mod, questions] = await Promise.all([
    adminFetchModule(moduleId),
    adminFetchQuestions(moduleId),
  ]);

  if (!mod) return notFound();

  return (
    <div>
      {/* Breadcrumb */}
      <div
        style={{
          padding: "20px 32px 0",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
        }}
      >
        <Link
          href="/admin"
          style={{ color: "var(--navy)", textDecoration: "none", fontWeight: 500 }}
        >
          Modules
        </Link>
        <span style={{ color: "var(--faint)" }}>›</span>
        <span style={{ color: "var(--ink-2)" }}>{mod.title}</span>
      </div>

      <ModuleDetailClient mod={mod} initialQuestions={questions} />
    </div>
  );
}
