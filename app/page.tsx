"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import StudyDashboard from "@/components/StudyDashboard";

function HomeContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authError = searchParams.get("auth_error");
    const urlError = searchParams.get("error_description");
    if (authError) setError(authError);
    else if (urlError) setError(urlError.replace(/\+/g, " "));
  }, [searchParams]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) {
          setError(error.message);
          return;
        }
        if (!data.session) {
          // Only reachable if email confirmation ever gets re-enabled on the project.
          setError("Account created — check your email to confirm before signing in.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message);
          return;
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) return null;

  if (!user) {
    return (
      <div className="app-shell" style={{ maxWidth: 400 }}>
        <div className="card" style={{ textAlign: "center", marginTop: 80 }}>
          <div className="brand" style={{ justifyContent: "center" }}>
            <span className="pulse-dot" />
            Vitals
          </div>
          <p className="text-muted">Check your vitals. Own your exam.</p>

          <div style={{ display: "flex", gap: 8, marginTop: 16, marginBottom: 4 }}>
            <button
              type="button"
              className={`pill ${mode === "signin" ? "active" : ""}`}
              style={{ flex: 1 }}
              onClick={() => setMode("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`pill ${mode === "signup" ? "active" : ""}`}
              style={{ flex: 1 }}
              onClick={() => setMode("signup")}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <input
              className="input"
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="input"
              type="password"
              required
              minLength={6}
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? "…" : mode === "signup" ? "Create account" : "Sign in"}
            </button>
            {error && (
              <p className="text-sm" style={{ color: "var(--danger)" }}>
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="app-shell">
      <div className="brand" style={{ marginBottom: 20 }}>
        <span className="pulse-dot" />
        Vitals
      </div>
      <StudyDashboard userId={user.id} />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
