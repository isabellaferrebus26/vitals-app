"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Question, Section, SectionTally, TestAttempt } from "@/lib/types";
import { predictedScore } from "@/lib/scoring";
import CountdownBanner from "@/components/CountdownBanner";
import ExplainTutor from "@/components/ExplainTutor";
import ResultsScreen from "@/components/ResultsScreen";

const SECTIONS: Section[] = ["Reading", "Math", "Science", "English"];
const MAX_BOX = 5;
const TEST_LENGTH = 10;
const SECONDS_PER_QUESTION = 45;

type Mode = "menu" | "practice" | "test" | "results";

function emptyTally(): Record<Section, SectionTally> {
  return {
    Reading: { correct: 0, total: 0 },
    Math: { correct: 0, total: 0 },
    Science: { correct: 0, total: 0 },
    English: { correct: 0, total: 0 },
  };
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function StudyDashboard({ userId }: { userId: string }) {
  const supabase = createClient();

  const [bank, setBank] = useState<Question[]>([]);
  const [boxes, setBoxes] = useState<Record<string, number>>({});
  const [seenBoxes, setSeenBoxes] = useState<Record<string, number>>({});
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<Mode>("menu");
  const [activeSection, setActiveSection] = useState<Section | "All">("All");
  const [generating, setGenerating] = useState(false);

  // Practice mode state
  const [current, setCurrent] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  // Timed test mode state
  const [testQueue, setTestQueue] = useState<Question[]>([]);
  const [testIndex, setTestIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [lastResult, setLastResult] = useState<{ correct: number; total: number; bySection: Record<Section, SectionTally> } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function load() {
      const { data: questions } = await supabase.from("questions").select("*").eq("exam", "TEAS7");

      const { data: progress } = await supabase
        .from("user_progress")
        .select("question_id, box")
        .eq("user_id", userId);

      const { data: history } = await supabase
        .from("test_attempts")
        .select("id, correct, total, by_section, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      const seen: Record<string, number> = {};
      (progress || []).forEach((p) => (seen[p.question_id] = p.box));

      const boxMap: Record<string, number> = { ...seen };
      (questions || []).forEach((q) => {
        if (!(q.id in boxMap)) boxMap[q.id] = 1;
      });

      setBank(questions || []);
      setBoxes(boxMap);
      setSeenBoxes(seen);
      setAttempts(history || []);
      setLoaded(true);
    }
    load();
  }, [userId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Auto-submit when the clock runs out, using whatever was answered so far.
  useEffect(() => {
    if (mode === "test" && timeLeft === 0) {
      finishTest(testAnswers);
    }
  }, [timeLeft, mode]);

  const dueCount = useMemo(() => Object.values(boxes).filter((b) => b < MAX_BOX).length, [boxes]);
  const predicted = useMemo(() => predictedScore(seenBoxes, attempts), [seenBoxes, attempts]);

  const pool = useMemo(() => {
    const filtered = activeSection === "All" ? bank : bank.filter((q) => q.section === activeSection);
    return [...filtered].sort((a, b) => (boxes[a.id] || 1) - (boxes[b.id] || 1));
  }, [activeSection, bank, boxes]);

  function pickNext() {
    if (pool.length === 0) return;
    const lowest = boxes[pool[0].id] || 1;
    const due = pool.filter((q) => (boxes[q.id] || 1) === lowest);
    setCurrent(due[Math.floor(Math.random() * due.length)]);
    setSelected(null);
    setRevealed(false);
  }

  function startPractice(section: Section | "All") {
    setActiveSection(section);
    setMode("practice");
    // pickNext reads `pool`, which depends on activeSection — compute it inline instead of waiting a render.
    const filtered = section === "All" ? bank : bank.filter((q) => q.section === section);
    const sorted = [...filtered].sort((a, b) => (boxes[a.id] || 1) - (boxes[b.id] || 1));
    if (sorted.length === 0) return;
    const lowest = boxes[sorted[0].id] || 1;
    const due = sorted.filter((q) => (boxes[q.id] || 1) === lowest);
    setCurrent(due[Math.floor(Math.random() * due.length)]);
    setSelected(null);
    setRevealed(false);
  }

  async function answer(i: number) {
    if (revealed || !current) return;
    setSelected(i);
    setRevealed(true);
    const correct = i === current.answer;
    const nextBox = correct ? Math.min(MAX_BOX, (boxes[current.id] || 1) + 1) : 1;

    setBoxes((b) => ({ ...b, [current.id]: nextBox }));
    setSeenBoxes((b) => ({ ...b, [current.id]: nextBox }));

    await supabase.from("user_progress").upsert({
      user_id: userId,
      question_id: current.id,
      box: nextBox,
      last_answered_at: new Date().toISOString(),
    });
  }

  async function generateMore(section: Section) {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, count: 5 }),
      });
      const { questions } = await res.json();
      setBank((b) => [...b, ...(questions || [])]);
      setBoxes((b) => {
        const next = { ...b };
        (questions || []).forEach((q: Question) => (next[q.id] = 1));
        return next;
      });
    } finally {
      setGenerating(false);
    }
  }

  function startTest(section: Section | "All") {
    const source = section === "All" ? bank : bank.filter((q) => q.section === section);
    const queue = shuffle(source).slice(0, TEST_LENGTH);
    if (queue.length === 0) return;

    setTestQueue(queue);
    setTestIndex(0);
    setTestAnswers({});
    setTimeLeft(queue.length * SECONDS_PER_QUESTION);
    setMode("test");

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function selectTestAnswer(i: number) {
    const q = testQueue[testIndex];
    const nextAnswers = { ...testAnswers, [q.id]: i };
    setTestAnswers(nextAnswers);

    if (testIndex + 1 < testQueue.length) {
      setTestIndex(testIndex + 1);
    } else {
      finishTest(nextAnswers);
    }
  }

  async function finishTest(finalAnswers: Record<string, number>) {
    if (timerRef.current) clearInterval(timerRef.current);

    const bySection = emptyTally();
    let correctCount = 0;

    for (const q of testQueue) {
      bySection[q.section].total += 1;
      const given = finalAnswers[q.id];
      if (given === q.answer) {
        bySection[q.section].correct += 1;
        correctCount += 1;
      }
    }

    const result = { correct: correctCount, total: testQueue.length, bySection };
    setLastResult(result);

    // Fold test answers into the same Leitner progress used by practice mode.
    const updatedBoxes = { ...boxes };
    const updatedSeenBoxes = { ...seenBoxes };
    const upserts = testQueue
      .filter((q) => q.id in finalAnswers)
      .map((q) => {
        const correct = finalAnswers[q.id] === q.answer;
        const nextBox = correct ? Math.min(MAX_BOX, (boxes[q.id] || 1) + 1) : 1;
        updatedBoxes[q.id] = nextBox;
        updatedSeenBoxes[q.id] = nextBox;
        return {
          user_id: userId,
          question_id: q.id,
          box: nextBox,
          last_answered_at: new Date().toISOString(),
        };
      });

    setBoxes(updatedBoxes);
    setSeenBoxes(updatedSeenBoxes);
    if (upserts.length > 0) {
      await supabase.from("user_progress").upsert(upserts);
    }

    const { data: inserted } = await supabase
      .from("test_attempts")
      .insert({
        user_id: userId,
        correct: result.correct,
        total: result.total,
        by_section: result.bySection,
      })
      .select()
      .single();

    if (inserted) setAttempts((a) => [inserted, ...a].slice(0, 5));
    setMode("results");
  }

  function backToMenu() {
    setMode("menu");
    setCurrent(null);
    setLastResult(null);
  }

  if (!loaded) return <div className="text-muted">Loading your progress…</div>;

  const timerCritical = timeLeft <= 30;

  return (
    <div>
      <CountdownBanner userId={userId} dueCount={dueCount} />

      {mode === "menu" && (
        <div>
          <div className="stat-grid" style={{ marginBottom: 20 }}>
            <div className="stat-tile">
              <div className="value">{predicted !== null ? predicted : "—"}</div>
              <div className="label">Predicted score</div>
            </div>
            <div className="stat-tile">
              <div className="value">{dueCount}</div>
              <div className="label">Questions due</div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Practice</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="pill" onClick={() => startPractice("All")}>
                Mixed review
              </button>
              {SECTIONS.map((sec) => (
                <button key={sec} className="pill" onClick={() => startPractice(sec)}>
                  {sec}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Timed test</h3>
            <p className="text-sm text-muted">
              {TEST_LENGTH} questions, {SECONDS_PER_QUESTION}s each — answers lock in as you go, results at the end.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="pill" onClick={() => startTest("All")}>
                Mixed test
              </button>
              {SECTIONS.map((sec) => (
                <button key={sec} className="pill" onClick={() => startTest(sec)}>
                  {sec}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Grow the question bank</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SECTIONS.map((sec) => (
                <button key={sec} className="btn" disabled={generating} onClick={() => generateMore(sec)}>
                  {generating ? "Generating…" : `+5 ${sec}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {mode === "practice" && current && (
        <div className="card">
          <button className="btn btn-ghost" style={{ marginBottom: 12 }} onClick={backToMenu}>
            ← Back
          </button>
          <span className="badge badge-accent">{current.section}</span>
          <p style={{ fontSize: 17, marginTop: 12 }}>{current.prompt}</p>
          {current.options.map((opt, i) => {
            let cls = "option-btn";
            if (revealed && i === current.answer) cls += " correct";
            else if (revealed && i === selected) cls += " incorrect";
            return (
              <button key={i} className={cls} disabled={revealed} onClick={() => answer(i)}>
                {opt}
              </button>
            );
          })}
          {revealed && (
            <div style={{ marginTop: 8 }}>
              <p>
                <strong>{selected === current.answer ? "Correct" : "Not quite"}</strong>
              </p>
              <p className="text-muted">{current.explanation}</p>
              <ExplainTutor question={current} />
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={pickNext}>
                Next question
              </button>
            </div>
          )}
        </div>
      )}

      {mode === "test" && testQueue[testIndex] && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="text-sm text-muted">
              Question {testIndex + 1} of {testQueue.length}
            </span>
            <span className={`timer ${timerCritical ? "timer-critical" : ""}`}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </span>
          </div>
          <div className="progress-track" style={{ marginBottom: 16 }}>
            <div className="progress-fill" style={{ width: `${((testIndex + 1) / testQueue.length) * 100}%` }} />
          </div>
          <span className="badge badge-accent">{testQueue[testIndex].section}</span>
          <p style={{ fontSize: 17, marginTop: 12 }}>{testQueue[testIndex].prompt}</p>
          {testQueue[testIndex].options.map((opt, i) => (
            <button key={i} className="option-btn" onClick={() => selectTestAnswer(i)}>
              {opt}
            </button>
          ))}
        </div>
      )}

      {mode === "results" && lastResult && (
        <ResultsScreen
          correct={lastResult.correct}
          total={lastResult.total}
          bySection={lastResult.bySection}
          predicted={predicted}
          onRestart={backToMenu}
        />
      )}
    </div>
  );
}
