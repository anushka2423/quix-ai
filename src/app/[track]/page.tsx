import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TRACKS, TRACK_IDS, isTrack } from "@/lib/blueprint";
import { bankMeta, getLevel } from "@/lib/bank";
import type { BankQuestion } from "@/types/quiz";
import TrackClient from "./TrackClient";
import DeveloperTrackClient, { type LevelCounts } from "./DeveloperTrackClient";

// Questions come from the database; refresh the counts every minute
export const revalidate = 60;

export function generateStaticParams() {
  return TRACK_IDS.map((track) => ({ track }));
}

export async function generateMetadata({ params }: { params: Promise<{ track: string }> }): Promise<Metadata> {
  const { track } = await params;
  if (!isTrack(track)) return {};
  const t = TRACKS[track];
  return {
    title: `${t.name} (${t.code}) practice quiz | Agentic AI Institute`,
    description: `Free ${t.short} practice: readiness diagnostic, quick sprints, domain drills and full ${t.items}-question mocks. Every module open.`,
  };
}

export default async function TrackPage({ params }: { params: Promise<{ track: string }> }) {
  const { track } = await params;
  if (!isTrack(track)) notFound();
  const meta = (await bankMeta())[track];
  if (track === "developer") return <DeveloperTrackClient meta={meta} levels={await levelCounts()} />;
  return <TrackClient track={track} meta={meta} />;
}

/** Question counts of the Developer levels, sent to the page without the questions or their keys */
async function levelCounts(): Promise<LevelCounts> {
  const byModule = (bank: BankQuestion[]) => {
    const out: Record<string, number> = {};
    for (const q of bank) if (q.submoduleName) out[q.submoduleName] = (out[q.submoduleName] ?? 0) + 1;
    return out;
  };
  const [one, two] = [await getLevel(1), await getLevel(2)];
  return { total: { 1: one.bank.length, 2: two.bank.length }, modules: { 1: byModule(one.bank), 2: byModule(two.bank) } };
}
