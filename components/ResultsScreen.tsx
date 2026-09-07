"use client";

import { useState } from "react";
import type { Section, SectionTally } from "@/lib/types";
import { buildShareCard } from "@/lib/share";

export default function ResultsScreen({
  correct,
  total,
  bySection,
  predicted,
  onRestart,
}: {
  correct: number;
  total: number;
  bySection: Record<Section, SectionTally>;
  predicted: number | null;
  onRestart: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const pct = Math.round((correct / total) * 100);
  const card = buildShareCard({ correct, total, by_section: bySection });

  async function copy() {
    await navigator.clipboard.writeText(card);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Test complete</h2>
      <div className="stat-grid">
        <div className="stat-tile">
          <div className="value">
            {correct}/{total}
          </div>
          <div className="label">Score ({pct}%)</div>
        </div>
        {predicted !== null && (
          <div className="stat-tile">
            <div className="value">{predicted}</div>
            <div className="label">Predicted composite</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        {(Object.keys(bySection) as Section[]).map((sec) => {
          const t = bySection[sec];
          if (!t || t.total === 0) return null;
          const secPct = Math.round((t.correct / t.total) * 100);
          return (
            <div key={sec} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span className="text-sm">{sec}</span>
                <span className="text-sm text-muted">
                  {t.correct}/{t.total}
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${secPct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 20 }}>
        <p className="text-sm text-muted">Share your result:</p>
        <div className="share-grid">{card}</div>
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button className="btn" onClick={copy}>
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
          <button className="btn btn-primary" onClick={onRestart}>
            Back to practice
          </button>
        </div>
      </div>
    </div>
  );
}
