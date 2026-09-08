import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase-server";
import { STATIC_EXPLANATIONS } from "@/lib/explanations";
import type { ExplainStyle } from "@/lib/types";

// POST /api/explain
// body: { prompt: string, style: ExplainStyle }
//
// The AI tutor's "explain it differently" feature. Serves hand-written
// explanations from a static lookup (see lib/explanations.ts) instead of
// calling the Anthropic API — keeps this feature working at zero cost.
// Only the 18 seed questions are covered; AI-generated questions get a
// friendly fallback message instead of an explanation.
export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { prompt, style } = await req.json();

  const styles = STATIC_EXPLANATIONS[prompt as string];
  if (!styles) {
    return NextResponse.json({
      explanation: "A different-style explanation isn't available for this question yet.",
    });
  }

  const explanation = styles[style as ExplainStyle];
  if (!explanation) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  return NextResponse.json({ explanation });
}
