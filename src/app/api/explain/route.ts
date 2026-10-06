import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ explanation: null });
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const { question, options, correctAnswer, userAnswer } = await req.json();
    const correctText = options.find((o: { label: string }) => o.label === correctAnswer)?.text ?? "";

    const prompt = `Quiz question: "${question}"
Options: ${options.map((o: { label: string; text: string }) => `${o.label}) ${o.text}`).join(" | ")}
Correct answer: ${correctAnswer}) ${correctText}
User selected: ${userAnswer}

Write 2 sentences explaining WHY ${correctAnswer} is the correct answer and what makes it better than the other options. Be direct and educational. Do not start with "The correct answer is".`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 120,
      temperature: 0.5,
    });
    const explanation = completion.choices[0]?.message?.content?.trim() ?? null;
    return NextResponse.json({ explanation });
  } catch {
    return NextResponse.json({ explanation: null });
  }
}
