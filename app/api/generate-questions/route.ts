import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";

// POST /api/generate-questions
// body: { section: "Reading" | "Math" | "Science" | "English", count?: number }
//
// Server-side only: this is where the real ANTHROPIC_API_KEY lives.
// The client never talks to the Anthropic API directly.
export async function POST(req: NextRequest) {
  const { section, count = 5 } = await req.json();

  if (!["Reading", "Math", "Science", "English"].includes(section)) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  const system = `You write TEAS 7 (Test of Essential Academic Skills) practice questions for the "${section}" section only.
Return ONLY a raw JSON array, no markdown fences, no preamble. Each item must have exactly:
{"prompt": string, "options": [string,string,string,string], "answer": number (0-3 index of correct option), "explanation": string (2-3 sentences explaining WHY the correct answer is right, written to teach the underlying concept)}
Write ${count} new, non-repetitive, realistic TEAS-style questions of medium difficulty for nursing-school applicants.`;

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system,
      messages: [{ role: "user", content: `Generate ${count} ${section} questions now.` }],
    }),
  });

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text();
    return NextResponse.json({ error: "Anthropic API error", detail: errText }, { status: 502 });
  }

  const data = await anthropicRes.json();
  const textBlock = data.content?.find((b: any) => b.type === "text");
  const raw = (textBlock?.text || "[]").replace(/```json|```/g, "").trim();

  let parsed: any[];
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Failed to parse model output" }, { status: 502 });
  }

  const rows = parsed.map((q) => ({
    section,
    prompt: q.prompt,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
    exam: "TEAS7",
    source: "ai" as const,
  }));

  const supabase = createServiceClient();
  const { data: inserted, error } = await supabase.from("questions").insert(rows).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ questions: inserted });
}
