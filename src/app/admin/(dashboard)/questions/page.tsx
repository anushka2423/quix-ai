import { adminFetchAllQuestions, adminFetchModules } from "@/lib/admin-supabase";
import QuestionBankClient from "./_components/QuestionBankClient";

export default async function QuestionBankPage() {
  const [modules, questions] = await Promise.all([
    adminFetchModules(),
    adminFetchAllQuestions(),
  ]);
  return <QuestionBankClient modules={modules} questions={questions} />;
}
