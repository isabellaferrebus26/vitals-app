export type Section = "Reading" | "Math" | "Science" | "English";

export interface Question {
  id: string;
  section: Section;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  exam: string;
  source: "seed" | "ai";
}

export interface UserProgress {
  question_id: string;
  box: number; // 1-5, Leitner box
  last_answered_at: string | null;
}

export interface StudyPlan {
  exam_date: string | null;
  exam_type: string;
  daily_count: number;
  last_active_date: string | null;
}

export interface Subscription {
  plan: "free" | "plus" | "cohort";
  status: "active" | "canceled" | "past_due" | "inactive";
  current_period_end: string | null;
}

export interface SectionTally {
  correct: number;
  total: number;
}

export interface TestAttempt {
  id: string;
  correct: number;
  total: number;
  by_section: Record<Section, SectionTally>;
  created_at: string;
}

export type ExplainStyle = "simple" | "analogy" | "steps" | "examTrick";
