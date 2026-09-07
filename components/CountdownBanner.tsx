"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { daysUntil, suggestedDailyPace } from "@/lib/scoring";

export default function CountdownBanner({ userId, dueCount }: { userId: string; dueCount: number }) {
  const supabase = createClient();
  const [examDate, setExamDate] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("study_plans")
        .select("exam_date")
        .eq("user_id", userId)
        .maybeSingle();
      setExamDate(data?.exam_date ?? null);
      setDraft(data?.exam_date ?? "");
      setLoaded(true);
    }
    load();
  }, [userId]);

  async function saveDate(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    const pace = suggestedDailyPace(dueCount, daysUntil(draft));
    await supabase.from("study_plans").upsert({
      user_id: userId,
      exam_date: draft,
      exam_type: "TEAS7",
      daily_count: pace,
      last_active_date: new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString(),
    });
    setExamDate(draft);
    setEditing(false);
  }

  if (!loaded) return null;

  if (!examDate || editing) {
    return (
      <div className="banner">
        <form onSubmit={saveDate} style={{ display: "flex", gap: 8, alignItems: "center", width: "100%" }}>
          <span className="text-sm">When's your exam?</span>
          <input
            type="date"
            className="input"
            style={{ width: "auto" }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </form>
      </div>
    );
  }

  const remaining = daysUntil(examDate);
  const pace = suggestedDailyPace(dueCount, remaining);
  const urgent = remaining !== null && remaining <= 7;

  return (
    <div className={`banner ${urgent ? "banner-urgent" : ""}`}>
      <div>
        {remaining !== null && remaining >= 0 ? (
          <strong>{remaining === 0 ? "Exam is today" : `${remaining} day${remaining === 1 ? "" : "s"} until your exam`}</strong>
        ) : (
          <strong>Exam date passed</strong>
        )}
        <div className="text-sm text-muted">Aim for ~{pace} questions/day to clear your due pile in time.</div>
      </div>
      <button className="btn btn-ghost" onClick={() => setEditing(true)}>
        Edit
      </button>
    </div>
  );
}
