import type { TestAttempt } from "./types";

const MAX_BOX = 5;

/**
 * Predicted TEAS composite score (0-100), blended from two signals:
 *  - long-run mastery: average Leitner box across every question the user has seen
 *  - recent performance: accuracy on the last 3 timed test attempts
 * Recent attempts are weighted more heavily once they exist, since they reflect
 * exam-like conditions rather than untimed drilling.
 */
export function predictedScore(boxes: Record<string, number>, attempts: TestAttempt[]): number | null {
  const boxValues = Object.values(boxes);
  const hasBoxes = boxValues.length > 0;
  const recent = attempts.slice(0, 3);
  const hasAttempts = recent.length > 0;

  if (!hasBoxes && !hasAttempts) return null;

  const masteryScore = hasBoxes
    ? (boxValues.reduce((sum, b) => sum + b, 0) / boxValues.length / MAX_BOX) * 100
    : null;

  const recentAccuracy = hasAttempts
    ? (recent.reduce((sum, a) => sum + a.correct / a.total, 0) / recent.length) * 100
    : null;

  if (masteryScore !== null && recentAccuracy !== null) {
    return Math.round(masteryScore * 0.4 + recentAccuracy * 0.6);
  }
  return Math.round((masteryScore ?? recentAccuracy)!);
}

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Suggested questions/day so the user's total "due" pile (anything not yet
 * mastered — box < MAX_BOX) gets at least one pass before the exam date.
 */
export function suggestedDailyPace(dueCount: number, daysRemaining: number | null): number {
  if (daysRemaining === null || daysRemaining <= 0) return dueCount;
  return Math.max(5, Math.ceil(dueCount / daysRemaining));
}
