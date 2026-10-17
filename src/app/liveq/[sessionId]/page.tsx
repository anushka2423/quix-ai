import ParticipantSession from "./ParticipantSession";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ sessionId: string }> };

export default async function SessionPage({ params }: Props) {
  const { sessionId } = await params;
  return <ParticipantSession sessionId={sessionId} />;
}