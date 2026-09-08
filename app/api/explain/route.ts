import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase-server";
import type { ExplainStyle } from "@/lib/types";

// POST /api/explain
// body: { prompt: string, options: string[], answer: number, style: ExplainStyle }
//
// The AI tutor's "explain it differently" feature. Same server-side-only
// pattern as /api/generate-questions — the client sends the question, the
// server holds the ANTHROPIC_API_KEY and returns a fresh explanation angle.
const STYLE_INSTRUCTIONS: Record<ExplainStyle, string> = {
  simple:
    "Explain the correct answer in the simplest possible terms, as if to someone hearing this topic for the first time. Use short sentences and everyday words, no jargon.",
  analogy:
    "Explain the correct answer using a single clear real-world analogy or comparison that makes the underlying concept click.",
  steps:
    "Explain the correct answer as a numbered, step-by-step walkthrough of the reasoning, so the student could reproduce the same process on a similar question.",
  examTrick:
    "Explain the correct answer by pointing out the specific trick, keyword, or trap the question is testing, and how to spot that same pattern on future exam questions.",
};

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { prompt, options, answer, style } = await req.json();

  const instruction = STYLE_INSTRUCTIONS[style as ExplainStyle];
  if (!instruction || !prompt || !Array.isArray(options) || typeof answer !== "number") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const system = `You are a patient TEAS 7 exam tutor for nursing-school applicants. ${instruction}
Keep it to 3-5 sentences. Return ONLY the explanation text, no preamble, no markdown headers.`;

  const userMessage = [
    `Question: ${prompt}`,
    `Options: ${options.map((o: string, i: number) => `${i}. ${o}`).join(" | ")}`,
    `Correct answer index: ${answer} (${options[answer]})`,
  ].join("\n");

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 400,
      system,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text();
    return NextResponse.json({ error: "Anthropic API error", detail: errText }, { status: 502 });
  }

  const data = await anthropicRes.json();
  const textBlock = data.content?.find((b: any) => b.type === "text");
  const explanation = (textBlock?.text || "").trim();

  return NextResponse.json({ explanation });
}
