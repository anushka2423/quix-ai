import { notFound } from "next/navigation";
import QuizWizard from "../../_components/QuizWizard";

type Props = { params: Promise<{ quizId: string }> };

export default async function EditQuizPage({ params }: Props) {
  const { quizId } = await params;
  if (!quizId) notFound();
  return <QuizWizard quizId={quizId} />;
}