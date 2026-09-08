export const metadata = {
  title: "Free TEAS 7 Study Guide — Vitals",
  description:
    "Free 13-page TEAS 7 study guide: section breakdowns, 18 practice questions with full explanations, and a 4-week study plan.",
};

export default function StudyGuidePage() {
  return (
    <main className="app-shell" style={{ maxWidth: 560 }}>
      <div className="brand" style={{ marginBottom: 24 }}>
        <span className="pulse-dot" />
        Vitals
      </div>

      <div className="card" style={{ textAlign: "center" }}>
        <span className="badge badge-accent">FREE DOWNLOAD</span>
        <h1 style={{ margin: "12px 0 8px" }}>The TEAS 7 Study Guide</h1>
        <p className="text-muted">
          Section breakdowns, 18 practice questions with full explanations, and a 4-week study plan —
          the same foundation the Vitals app builds on.
        </p>

        <a
          href="/downloads/vitals-teas7-study-guide.pdf"
          download
          className="btn btn-primary btn-block"
          style={{ marginTop: 20, textDecoration: "none" }}
        >
          Download the free PDF
        </a>

        <p className="text-sm text-muted" style={{ marginTop: 12 }}>
          No email required. Just the guide.
        </p>
      </div>

      <div className="card" style={{ marginTop: 16, textAlign: "center" }}>
        <h3 style={{ marginTop: 0 }}>Want more than 18 questions?</h3>
        <p className="text-muted text-sm">
          The Vitals app builds on this guide with an adaptive question bank that grows with AI, a tutor
          that re-explains any concept a different way, timed practice tests, a predicted score, and a
          study plan built around your real exam date.
        </p>
        <a href="/" className="btn btn-block" style={{ textDecoration: "none" }}>
          Start free — no credit card required
        </a>
      </div>
    </main>
  );
}
