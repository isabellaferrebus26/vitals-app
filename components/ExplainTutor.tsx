"use client";

import { useState } from "react";
import type { ExplainStyle, Question } from "@/lib/types";

const STYLES: { key: ExplainStyle; label: string }[] = [
  { key: "simple", label: "Explain simply" },
  { key: "analogy", label: "Use an analogy" },
  { key: "steps", label: "Step by step" },
  { key: "examTrick", label: "Exam trick" },
];

export default function ExplainTutor({ question }: { question: Question }) {
  const [active, setActive] = useState<ExplainStyle | null>(null);
  const [loading, setLoading] = useState<ExplainStyle | null>(null);
  const [cache, setCache] = useState<Partial<Record<ExplainStyle, string>>>({});

  async function requestStyle(style: ExplainStyle) {
    setActive(style);
    if (cache[style]) return;

    setLoading(style);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: question.prompt,
          options: question.options,
          answer: question.answer,
          style,
        }),
      });
      const data = await res.json();
      setCache((c) => ({ ...c, [style]: data.explanation || "Couldn't generate an explanation right now." }));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <p className="text-sm text-muted" style={{ marginBottom: 8 }}>
        Still not clicking? Try a different explanation:
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {STYLES.map((s) => (
          <button
            key={s.key}
            className={`pill ${active === s.key ? "active" : ""}`}
            onClick={() => requestStyle(s.key)}
          >
            {loading === s.key ? "Thinking…" : s.label}
          </button>
        ))}
      </div>
      {active && cache[active] && (
        <div className="card" style={{ marginTop: 12, background: "var(--surface-muted)" }}>
          <p style={{ margin: 0 }}>{cache[active]}</p>
        </div>
      )}
    </div>
  );
}
