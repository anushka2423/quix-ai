import { notFound } from "next/navigation";
import SessionControlCenter from "../../_components/SessionControlCenter";

type Props = { params: Promise<{ sessionId: string }> };

export default async function SessionPage({ params }: Props) {
  const { sessionId } = await params;
  if (!sessionId) notFound();
  return <SessionControlCenter sessionId={sessionId} />;
}
