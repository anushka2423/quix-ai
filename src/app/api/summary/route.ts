import { NextResponse } from "next/server";
import OpenAI from "openai";

const COURSE_URL = "https://maven.com/mahesh-yadav/genaipm";

interface QuestionResult {
  questionText: string;
  difficulty: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  options: { label: string; text: string }[];
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { summary: null, callScript: null, explanations: [], error: "OPENAI_API_KEY not configured" },
      { status: 200 }
    );
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const body = await req.json();
    const { moduleTitle, score, total, results }: {
      moduleTitle: string;
      score: number;
      total: number;
      results: QuestionResult[];
    } = body;

    const pct = Math.round((score / total) * 100);

    const questionsFormatted = results.map((r, i) => {
      const correctText = r.options.find((o) => o.label === r.correctAnswer)?.text ?? "";
      const userText = r.options.find((o) => o.label === r.userAnswer)?.text ?? "Not answered";
      return `Q${i + 1} [${r.isCorrect ? "CORRECT" : "WRONG"}]: ${r.questionText}
  Options: ${r.options.map((o) => `${o.label}) ${o.text}`).join(" | ")}
  Correct: ${r.correctAnswer}) ${correctText}
  User answered: ${r.userAnswer}) ${userText}`;
    }).join("\n\n");

    const weakTopics = results.filter((r) => !r.isCorrect).map((r) => r.questionText);
    const strongTopics = results.filter((r) => r.isCorrect).map((r) => r.questionText);

    const prompt = `
A learner completed the quiz "${moduleTitle}" and scored ${score}/${total} (${pct}%).

Here are all questions with answers:
${questionsFormatted}

Return a JSON object with exactly three fields:

1. "summary": A 2–3 sentence personalized performance summary FOR THE LEARNER. Be honest but encouraging. Name the specific topics they struggled with and where they showed confidence. End with one actionable next step.

2. "explanations": An array of ${results.length} strings, one per question in order. Each explanation should be 2–3 sentences explaining WHY the correct answer is right and briefly why the wrong options are misleading. Be educational and specific to the question content. Write it as if explaining to the learner directly.

3. "callScript": A COMPLETE sales call script FOR THE MARKETING TEAM to use when speaking 1-on-1 with this user. The goal is to sell the Gen AI PM course at ${COURSE_URL}.

Structure the call script EXACTLY like this:

📋 LEAD PROFILE
- Score: ${score}/${total} (${pct}%)
- Module: ${moduleTitle}
- Strong areas: [list topics they got right]
- Weak areas: [list topics they got wrong]

📞 SUGGESTED OPENER
[Write a warm, personalized 2-sentence opener that references their specific result without being pushy]

🎯 PAIN POINTS TO ADDRESS
[3 bullet points — specific gaps from their wrong answers and how those gaps hurt them in real PM roles]

💡 COURSE PITCH (tailored to their gaps)
[4–5 sentences explaining how the Gen AI PM course at ${COURSE_URL} directly covers their weak areas. Be specific — name the modules or concepts from the course that address each gap. Make it feel like the course was built for someone with exactly their profile.]

❓ QUALIFYING QUESTIONS
[3 questions to ask the lead to understand their role, urgency, and budget]

🚀 CLOSING LINE
[One strong, personalized closing sentence to get them to enroll or book a follow-up]

Return ONLY valid JSON, no markdown code blocks.
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);

    return NextResponse.json({
      summary: parsed.summary ?? null,
      callScript: parsed.callScript ?? null,
      explanations: Array.isArray(parsed.explanations) ? parsed.explanations : [],
    });
  } catch (err) {
    console.error("Summary API error:", err);
    return NextResponse.json(
      { summary: null, callScript: null, explanations: [], error: "Failed to generate" },
      { status: 500 }
    );
  }
}
