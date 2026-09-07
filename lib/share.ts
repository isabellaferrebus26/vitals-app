import type { Section, TestAttempt } from "./types";

const SECTION_ORDER: Section[] = ["Reading", "Math", "Science", "English"];
const SECTION_ICON: Record<Section, string> = {
  Reading: "📖",
  Math: "🔢",
  Science: "🔬",
  English: "✏️",
};

/**
 * Renders a Wordle-style shareable summary of a completed test attempt.
 * Each section gets one row of squares — filled (🟩) for questions answered
 * correctly, empty (⬜) for the rest — approximating a "guess grid" without
 * needing per-question order, which the aggregate by_section tally doesn't carry.
 */
export function buildShareCard(attempt: Pick<TestAttempt, "correct" | "total" | "by_section">): string {
  const pct = Math.round((attempt.correct / attempt.total) * 100);
  const lines = [`Vitals — TEAS Practice ${attempt.correct}/${attempt.total} (${pct}%)`, ""];

  for (const section of SECTION_ORDER) {
    const tally = attempt.by_section[section];
    if (!tally || tally.total === 0) continue;
    const filled = "🟩".repeat(tally.correct);
    const empty = "⬜".repeat(tally.total - tally.correct);
    lines.push(`${SECTION_ICON[section]} ${filled}${empty}`);
  }

  lines.push("", "vitalsprep.com");
  return lines.join("\n");
}
