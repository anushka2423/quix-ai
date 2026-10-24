import { adminModuleQuizzes, adminSchema } from "@/lib/server/admin-data";
import { MODULE_BANK, MODULE_QUIZZES } from "@/lib/bank/module-bank";
import { PageHead, SchemaBanner } from "../_components/ui";
import ModuleQuizzesClient from "./ModuleQuizzesClient";

export const dynamic = "force-dynamic";

export default async function ModuleQuizzesPage() {
  const [data, schema] = await Promise.all([adminModuleQuizzes(), adminSchema()]);

  // Summarise the hardcoded dev modules for the admin read-only view
  const devCourseModules = MODULE_QUIZZES.map((mq) => ({
    name: mq.name,
    description: mq.description,
    position: mq.position,
    questions: MODULE_BANK.filter((q) => q.submoduleName === mq.name).map((q) => ({
      id: q.id,
      question: q.question,
      answer: q.answer,
      difficulty: q.difficulty,
    })),
  }));

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1100 }}>
      <PageHead title="Module quizzes" />
      <p style={{ color: "var(--muted)", margin: "0 0 14px" }}>
        Each Skill Jar course is a module, and each of its lessons has its own questions. A module quiz of 5 takes one question from as many different lessons as it can, so every lesson needs at least one. Add questions that already exist in the bank, or write new ones. Questions written here can be kept out of the exam-weighted practice modes.
      </p>
      <SchemaBanner schema={schema} />
      {data.ready ? (
        <ModuleQuizzesClient data={data} devCourseModules={devCourseModules} />
      ) : (
        <p style={{ background: "#fff4db", color: "#65501f", padding: "10px 14px", borderRadius: 6 }}>
          Module quizzes are not available yet: run <code>supabase/migrations/0013_module_quizzes.sql</code> (after 0012) in your SQL client, then reload this page.
        </p>
      )}
    </div>
  );
}
