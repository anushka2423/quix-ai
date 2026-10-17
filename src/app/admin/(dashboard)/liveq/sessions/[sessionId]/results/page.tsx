import { notFound } from "next/navigation";
import Link from "next/link";
import SessionResults from "../../../_components/SessionResults";

type Props = { params: Promise<{ sessionId: string }> };

export default async function ResultsPage({ params }: Props) {
  const { sessionId } = await params;
  if (!sessionId) notFound();
  return <SessionResults sessionId={sessionId} />;
}