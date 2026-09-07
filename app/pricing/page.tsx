"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

const PLANS = [
  {
    key: "plus" as const,
    name: "Vitals Plus",
    price: "$15/mo",
    features: ["Unlimited AI-generated practice questions", "4-style AI tutor explanations", "Timed practice tests"],
  },
  {
    key: "cohort" as const,
    name: "Vitals Cohort",
    price: "$29/mo",
    features: ["Everything in Plus", "Shared cohort leaderboard", "Priority study plan support"],
  },
];

export default function PricingPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  async function subscribe(plan: "plus" | "cohort") {
    if (!user) {
      window.location.href = "/";
      return;
    }
    setError(null);
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Could not start checkout.");
      }
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <main className="app-shell">
      <div className="brand" style={{ marginBottom: 20 }}>
        <span className="pulse-dot" />
        Vitals
      </div>
      <h1>Pick your plan</h1>
      <p className="text-muted">Cancel anytime. Billing and card details are handled entirely by Stripe.</p>
      {error && (
        <div className="card" style={{ borderColor: "var(--danger)", marginBottom: 16 }}>
          <p className="text-sm" style={{ color: "var(--danger)", margin: 0 }}>
            {error}
          </p>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {PLANS.map((plan) => (
          <div key={plan.key} className="card">
            <h3 style={{ marginTop: 0 }}>{plan.name}</h3>
            <p style={{ fontSize: 28, fontWeight: 800, margin: "4px 0 16px" }}>{plan.price}</p>
            <ul style={{ paddingLeft: 18, color: "var(--text-muted)", fontSize: 14 }}>
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button
              className="btn btn-primary btn-block"
              disabled={loadingPlan === plan.key}
              onClick={() => subscribe(plan.key)}
            >
              {loadingPlan === plan.key ? "Redirecting…" : `Subscribe to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
