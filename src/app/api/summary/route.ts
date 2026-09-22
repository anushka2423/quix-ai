import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface QuestionResult {
  questionText: string;
  difficulty: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { summary: null, callScript: null, error: "OPENAI_API_KEY not configured" },
      { status: 200 }
    );
  }

  try {
    const body = await req.json();
    const {
      moduleTitle,
      score,
      total,
      results,
    }: {
      moduleTitle: string;
      score: number;
      total: number;
      results: QuestionResult[];
    } = body;

    const pct = Math.round((score / total) * 100);

    const wrongOnes = results
      .filter((r) => !r.isCorrect)
      .map((r) => `- "${r.questionText}" (correct: ${r.correctAnswer}, answered: ${r.userAnswer})`)
      .join("\n");

    const correctOnes = results
      .filter((r) => r.isCorrect)
      .map((r) => `- "${r.questionText}"`)
      .join("\n");

    const prompt = `
A learner completed the quiz "${moduleTitle}" and scored ${score}/${total} (${pct}%).

Questions they got RIGHT:
${correctOnes || "None"}

Questions they got WRONG:
${wrongOnes || "None"}

Return a JSON object with exactly two fields:

1. "summary": A 2-3 sentence personalized performance summary written FOR THE LEARNER. Be honest but encouraging. Name the specific topics they struggled with and where they showed confidence. End with one concrete next step.

2. "callScript": A short internal call script FOR THE MARKETING TEAM to use when they get on a 1-on-1 call with this user. Format it as:
- Score: ${score}/${total} (${pct}%)
- Strong areas: [list topics they got right]
- Weak areas: [list topics they got wrong]
- Talking points: 3 bullet points the team can use to pitch the Gen AI PM course, referencing the specific gaps this user has
- Suggested opener: One natural sentence to start the call that references their result

Keep the call script concise and actionable. Write it as internal notes, not as something the user will read.

Return ONLY valid JSON, no markdown.
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);

    return NextResponse.json({
      summary: parsed.summary ?? null,
      callScript: parsed.callScript ?? null,
    });
  } catch (err) {
    console.error("Summary API error:", err);
    return NextResponse.json(
      { summary: null, callScript: null, error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
